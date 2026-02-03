import { addDays } from 'date-fns';
import { u as useSupabaseClient } from './useSupabaseClient-DxYTVa8G.mjs';

const useDues = () => {
  const supabase = useSupabaseClient();
  const getWeekNumber = (date = /* @__PURE__ */ new Date()) => {
    const firstDayOfYear = new Date(date.getFullYear(), 0, 1);
    const pastDaysOfYear = (date.getTime() - firstDayOfYear.getTime()) / 864e5;
    return Math.ceil((pastDaysOfYear + firstDayOfYear.getDay() + 1) / 7);
  };
  const getWeekStartDate = (week, year) => {
    const jan1 = new Date(year, 0, 1);
    const dayOfWeek = jan1.getDay();
    const daysToMonday = dayOfWeek === 0 ? 1 : dayOfWeek === 1 ? 0 : 8 - dayOfWeek;
    const firstMonday = new Date(jan1);
    firstMonday.setDate(jan1.getDate() + daysToMonday);
    const targetMonday = addDays(firstMonday, (week - 1) * 7);
    return targetMonday.toISOString().split("T")[0];
  };
  const getCurrentWeekStart = () => {
    const now = /* @__PURE__ */ new Date();
    return getWeekStartDate(getWeekNumber(now), now.getFullYear());
  };
  const getOfficersWithWeeklyStatus = async (week, year) => {
    const w = week ?? getWeekNumber();
    const y = year ?? (/* @__PURE__ */ new Date()).getFullYear();
    const weekStart = getWeekStartDate(w, y);
    const [officersRes, paymentsRes] = await Promise.all([
      supabase.from("officers").select("*").eq("is_active", true).order("full_name"),
      supabase.from("payments").select("*").eq("week_start", weekStart)
    ]);
    const officers = officersRes.data ?? [];
    const payments = paymentsRes.data ?? [];
    const paidSet = new Map(payments.map((p) => [p.officer_id, p]));
    return officers.map((officer) => {
      const p = paidSet.get(officer.id);
      return {
        officer,
        paidThisWeek: !!p,
        amount: p?.amount,
        paidAt: p?.paid_at,
        paymentId: p?.id,
        payment: p ? { id: p.id, amount: p.amount, week_start: p.week_start, payment_method: p.payment_method, notes: p.notes } : void 0
      };
    });
  };
  const getCurrentDues = async (week, year) => {
    const currentWeek = week ?? getWeekNumber();
    const currentYear = year ?? (/* @__PURE__ */ new Date()).getFullYear();
    const weekStart = getWeekStartDate(currentWeek, currentYear);
    const { data, error } = await supabase.from("payments").select(`*, officer:officers(full_name, email, monthly_dues)`).eq("week_start", weekStart).order("paid_at", { ascending: false });
    return { data, error };
  };
  const getRecentPayments = async (limit = 10) => {
    const { data, error } = await supabase.from("payments").select(`*, officer:officers(full_name, email, monthly_dues)`).order("paid_at", { ascending: false }).limit(limit);
    return { data, error };
  };
  const recordPayment = async (payment) => {
    const week = payment.week_number ?? getWeekNumber();
    const year = payment.year ?? (/* @__PURE__ */ new Date()).getFullYear();
    const weekStart = getWeekStartDate(week, year);
    const { data, error } = await supabase.from("payments").insert([{
      officer_id: payment.officer_id,
      amount: payment.amount,
      week_start: weekStart,
      payment_method: payment.payment_method ?? "cash",
      notes: payment.notes ?? null
    }]).select(`*, officer:officers(full_name, email)`).single();
    return { data, error };
  };
  const updatePayment = async (paymentId, updates) => {
    const { data, error } = await supabase.from("payments").update(updates).eq("id", paymentId).select(`*, officer:officers(full_name, email)`).single();
    return { data, error };
  };
  const deletePayment = async (paymentId) => {
    const { error } = await supabase.from("payments").delete().eq("id", paymentId);
    return { error };
  };
  const getPaymentReport = async (year) => {
    const currentYear = year ?? (/* @__PURE__ */ new Date()).getFullYear();
    const currentWeek = getWeekNumber();
    const { data: officers } = await supabase.from("officers").select("*");
    const { data: allPayments } = await supabase.from("payments").select("*");
    const list = officers ?? [];
    const payments = (allPayments ?? []).filter((p) => new Date(p.week_start).getFullYear() === currentYear);
    const report = list.map((officer) => {
      const officerPayments = payments.filter((p) => p.officer_id === officer.id);
      const totalPaid = officerPayments.reduce((s, p) => s + Number(p.amount), 0);
      const weekNumbers = officerPayments.map((p) => getWeekNumber(new Date(p.week_start)));
      const lastPayment = weekNumbers.length ? Math.max(...weekNumbers) : 0;
      let status = "no_payments";
      if (officerPayments.length > 0) {
        status = currentWeek - lastPayment <= 1 ? "up_to_date" : "behind";
      }
      return { officer, total_paid: totalPaid, weeks_paid: officerPayments.length, last_payment: lastPayment, status };
    });
    return { data: report, error: null };
  };
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
    getPaymentReport
  };
};

export { useDues as u };
//# sourceMappingURL=useDues-DE7IVH5r.mjs.map
