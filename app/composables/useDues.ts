import { addDays } from 'date-fns'

export interface Payment {
  id?: string
  officer_id: string
  amount: number
  week_start: string
  paid_at?: string
  payment_method?: string
  notes?: string
  officer?: { full_name: string; role?: string; email?: string; monthly_dues?: number }
}

export interface OfficerWithStatus {
  officer: { id: string; full_name: string; role?: string; email?: string; monthly_dues?: number }
  paidThisWeek: boolean
  amount?: number
  paidAt?: string
  paymentId?: string
  payment?: { id: string; amount: number; week_start: string; payment_method?: string; notes?: string }
}

export interface PaymentReport {
  officer: { id: string; full_name: string; role?: string; email?: string }
  total_paid: number
  weeks_paid: number
  last_payment: number
  status: 'up_to_date' | 'behind' | 'no_payments'
}

export interface MonthlyTotal {
  month: number       // 0-11
  label: string       // 'Jan', 'Feb', …
  total: number
  count: number
}

export interface MethodBreakdown {
  method: string
  label: string
  total: number
  count: number
}

export interface WeeklyTick {
  week: number
  weekStart: string
  label: string
  total: number
  count: number
}

export const useDues = () => {
  const supabase = useSupabaseClient()

  /* ── Week helpers ── */
  const getWeekNumber = (date: Date = new Date()) => {
    const firstDayOfYear = new Date(date.getFullYear(), 0, 1)
    const pastDaysOfYear = (date.getTime() - firstDayOfYear.getTime()) / 86400000
    return Math.ceil((pastDaysOfYear + firstDayOfYear.getDay() + 1) / 7)
  }

  const getWeekStartDate = (week: number, year: number): string => {
    const jan1 = new Date(year, 0, 1)
    const dayOfWeek = jan1.getDay()
    const daysToMonday = dayOfWeek === 0 ? 1 : dayOfWeek === 1 ? 0 : 8 - dayOfWeek
    const firstMonday = new Date(jan1)
    firstMonday.setDate(jan1.getDate() + daysToMonday)
    const targetMonday = addDays(firstMonday, (week - 1) * 7)
    return targetMonday.toISOString().split('T')[0]
  }

  const getCurrentWeekStart = () => {
    const now = new Date()
    return getWeekStartDate(getWeekNumber(now), now.getFullYear())
  }

  /* ── Core queries ── */
  const getOfficersWithWeeklyStatus = async (week?: number, year?: number) => {
    const w = week ?? getWeekNumber()
    const y = year ?? new Date().getFullYear()
    const weekStart = getWeekStartDate(w, y)

    const [officersRes, paymentsRes] = await Promise.all([
      supabase.from('officers').select('*').eq('is_active', true).order('full_name'),
      supabase.from('payments').select('*').eq('week_start', weekStart),
    ])

    const officers = officersRes.data ?? []
    const payments = paymentsRes.data ?? []
    const paidSet = new Map(payments.map((p) => [p.officer_id, p]))

    return officers.map((officer) => {
      const p = paidSet.get(officer.id)
      return {
        officer,
        paidThisWeek: !!p,
        amount: p?.amount,
        paidAt: p?.paid_at,
        paymentId: p?.id,
        payment: p ? { id: p.id, amount: p.amount, week_start: p.week_start, payment_method: p.payment_method, notes: p.notes } : undefined,
      }
    }) as OfficerWithStatus[]
  }

  const getCurrentDues = async (week?: number, year?: number) => {
    const currentWeek = week ?? getWeekNumber()
    const currentYear = year ?? new Date().getFullYear()
    const weekStart = getWeekStartDate(currentWeek, currentYear)
    const { data, error } = await supabase
      .from('payments')
      .select(`*, officer:officers(full_name, role, email, monthly_dues)`)
      .eq('week_start', weekStart)
      .order('paid_at', { ascending: false })
    return { data, error }
  }

  const getRecentPayments = async (limit = 10) => {
    const { data, error } = await supabase
      .from('payments')
      .select(`*, officer:officers(full_name, role, email, monthly_dues)`)
      .order('paid_at', { ascending: false })
      .limit(limit)
    return { data, error }
  }

  const recordPayment = async (payment: {
    officer_id: string
    amount: number
    week_number?: number
    year?: number
    payment_method?: string
    notes?: string
  }) => {
    const week = payment.week_number ?? getWeekNumber()
    const year = payment.year ?? new Date().getFullYear()
    const weekStart = getWeekStartDate(week, year)
    const { data, error } = await supabase
      .from('payments')
      .insert([{
        officer_id: payment.officer_id,
        amount: payment.amount,
        week_start: weekStart,
        payment_method: payment.payment_method ?? 'cash',
        notes: payment.notes ?? null,
      }])
      .select(`*, officer:officers(full_name, role, email)`)
      .single()
    return { data, error }
  }

  const updatePayment = async (
    paymentId: string,
    updates: { amount?: number; week_start?: string; notes?: string; payment_method?: string }
  ) => {
    const { data, error } = await supabase
      .from('payments')
      .update(updates)
      .eq('id', paymentId)
      .select(`*, officer:officers(full_name, role, email)`)
      .single()
    return { data, error }
  }

  const deletePayment = async (paymentId: string) => {
    const { error } = await supabase.from('payments').delete().eq('id', paymentId)
    return { error }
  }

  const getPaymentReport = async (year?: number) => {
    const now = new Date()
    const currentYear = now.getFullYear()
    const selectedYear = year ?? currentYear
    const currentWeek = getWeekNumber(now)
    const { data: officers } = await supabase.from('officers').select('*')
    const { data: allPayments } = await supabase.from('payments').select('*')
    const list = officers ?? []
    const payments = (allPayments ?? []).filter((p) => new Date(p.week_start).getFullYear() === selectedYear)

    const report: PaymentReport[] = list.map((officer) => {
      const officerPayments = payments.filter((p) => p.officer_id === officer.id)
      const totalPaid = officerPayments.reduce((s, p) => s + Number(p.amount), 0)
      const weekNumbers = officerPayments.map((p) => getWeekNumber(new Date(p.week_start)))
      const lastPayment = weekNumbers.length ? Math.max(...weekNumbers) : 0
      let status: PaymentReport['status'] = 'no_payments'
      if (officerPayments.length > 0) {
        if (selectedYear < currentYear) {
          status = lastPayment >= 52 ? 'up_to_date' : 'behind'
        } else if (selectedYear > currentYear) {
          status = 'up_to_date'
        } else {
          status = currentWeek - lastPayment <= 1 ? 'up_to_date' : 'behind'
        }
      }
      return { officer, total_paid: totalPaid, weeks_paid: officerPayments.length, last_payment: lastPayment, status }
    })
    return { data: report, error: null }
  }

  /* ── Analytics ── */
  const getAnalytics = async (year?: number) => {
    const selectedYear = year ?? new Date().getFullYear()
    const { data: payments } = await supabase
      .from('payments')
      .select(`*, officer:officers(full_name, role)`)
      .order('week_start')

    const all = payments ?? []
    const yearPayments = all.filter((p) => new Date(p.week_start).getFullYear() === selectedYear)

    const MONTH_LABELS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']

    // Monthly totals
    const monthMap = new Map<number, { total: number; count: number }>()
    for (let m = 0; m < 12; m++) monthMap.set(m, { total: 0, count: 0 })
    yearPayments.forEach((p) => {
      const m = new Date(p.week_start).getMonth()
      const cur = monthMap.get(m)!
      cur.total += Number(p.amount)
      cur.count += 1
    })
    const monthly: MonthlyTotal[] = Array.from(monthMap.entries()).map(([month, v]) => ({
      month, label: MONTH_LABELS[month], ...v,
    }))

    // Payment method breakdown
    const methodMap = new Map<string, { total: number; count: number }>()
    yearPayments.forEach((p) => {
      const m = p.payment_method ?? 'cash'
      const cur = methodMap.get(m) ?? { total: 0, count: 0 }
      cur.total += Number(p.amount)
      cur.count += 1
      methodMap.set(m, cur)
    })
    const METHOD_LABELS: Record<string, string> = {
      cash: 'Cash', mobile_money: 'Mobile Money', bank_transfer: 'Bank Transfer', check: 'Check',
    }
    const byMethod: MethodBreakdown[] = Array.from(methodMap.entries())
      .map(([method, v]) => ({ method, label: METHOD_LABELS[method] ?? method, ...v }))
      .sort((a, b) => b.total - a.total)

    // Summary
    const totalCollected = yearPayments.reduce((s, p) => s + Number(p.amount), 0)
    const totalPayments = yearPayments.length
    const weeksWithData = new Set(yearPayments.map((p) => p.week_start)).size
    const avgPerWeek = weeksWithData > 0 ? totalCollected / weeksWithData : 0
    const bestMonth = monthly.reduce((best, m) => m.total > best.total ? m : best, monthly[0])

    return {
      data: { monthly, byMethod, totalCollected, totalPayments, weeksWithData, avgPerWeek, bestMonth },
      error: null,
    }
  }

  /* ── Weekly trend (last N weeks) ── */
  const getWeeklyTrend = async (numWeeks = 8) => {
    const now = new Date()
    const ticks: WeeklyTick[] = []
    for (let i = numWeeks - 1; i >= 0; i--) {
      const d = new Date(now)
      d.setDate(d.getDate() - i * 7)
      const w = getWeekNumber(d)
      const y = d.getFullYear()
      const ws = getWeekStartDate(w, y)
      ticks.push({
        week: w, weekStart: ws,
        label: d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
        total: 0, count: 0,
      })
    }

    const starts = ticks.map((t) => t.weekStart)
    const { data: payments } = await supabase
      .from('payments')
      .select('amount, week_start')
      .in('week_start', starts)

    const payMap = new Map<string, { total: number; count: number }>()
      ; (payments ?? []).forEach((p) => {
        const cur = payMap.get(p.week_start) ?? { total: 0, count: 0 }
        cur.total += Number(p.amount)
        cur.count += 1
        payMap.set(p.week_start, cur)
      })
    ticks.forEach((t) => {
      const v = payMap.get(t.weekStart)
      if (v) { t.total = v.total; t.count = v.count }
    })

    return { data: ticks, error: null }
  }

  /* ── All payments for detailed export ── */
  const getAllPaymentsForYear = async (year?: number) => {
    const selectedYear = year ?? new Date().getFullYear()
    const { data, error } = await supabase
      .from('payments')
      .select(`*, officer:officers(full_name, role, email, phone, monthly_dues)`)
      .order('week_start', { ascending: false })
    const filtered = (data ?? []).filter((p) => new Date(p.week_start).getFullYear() === selectedYear)
    return { data: filtered, error }
  }

  return {
    getWeekNumber,
    getWeekStartDate,
    getCurrentWeekStart,
    getOfficersWithWeeklyStatus,
    getCurrentDues,
    getRecentPayments,
    recordPayment,
    updatePayment,
    deletePayment,
    getPaymentReport,
    getAnalytics,
    getWeeklyTrend,
    getAllPaymentsForYear,
  }
}