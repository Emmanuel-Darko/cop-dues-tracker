<template>
  <div>
    <header class="mb-6 md:mb-8">
      <h1 class="font-display font-bold text-2xl md:text-3xl text-slate-800">Dashboard</h1>
      <p class="text-slate-600 mt-1 text-sm">Week {{ currentWeek }} • {{ formatWeekRange() }}</p>
    </header>

    <div class="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4 mb-6 md:mb-8">
      <div class="card p-4 md:p-5">
        <p class="text-xs md:text-sm font-medium text-slate-500">This Week</p>
        <p class="text-xl md:text-2xl font-bold text-slate-800 mt-0.5">${{ totalThisWeek }}</p>
      </div>
      <div class="card p-4 md:p-5">
        <p class="text-xs md:text-sm font-medium text-slate-500">Collected</p>
        <p class="text-xl md:text-2xl font-bold text-accent-600 mt-0.5">{{ paidCount }}/{{ officersCount }}</p>
      </div>
      <div class="card p-4 md:p-5">
        <p class="text-xs md:text-sm font-medium text-slate-500">Pending</p>
        <p class="text-xl md:text-2xl font-bold text-amber-600 mt-0.5">{{ officersCount - paidCount }}</p>
      </div>
      <div class="card p-4 md:p-5">
        <NuxtLink to="/collect" class="block">
          <p class="text-xs md:text-sm font-medium text-slate-500">Quick action</p>
          <p class="text-base md:text-lg font-bold text-accent-600 mt-0.5">Record payment →</p>
        </NuxtLink>
      </div>
    </div>

    <div class="grid lg:grid-cols-3 gap-6">
      <div class="lg:col-span-2 card">
        <div class="p-4 border-b border-slate-100 flex items-center justify-between">
          <h2 class="font-semibold text-slate-800">Collect This Week</h2>
          <NuxtLink to="/collect" class="btn-primary text-sm py-2 px-3">Quick Collect</NuxtLink>
        </div>
        <div class="max-h-[340px] md:max-h-[380px] overflow-y-auto">
          <div v-if="loading" class="p-4 space-y-3">
            <div v-for="n in 5" :key="n" class="shimmer h-12"></div>
          </div>
          <div v-else-if="officersWithStatus.length === 0" class="p-8 text-center text-slate-500">
            No officers yet. Add officers first.
          </div>
          <div v-else class="divide-y divide-slate-100">
            <div
              v-for="item in officersWithStatus"
              :key="item.officer.id"
              class="flex items-center justify-between px-4 py-3 hover:bg-slate-50/50 transition"
            >
              <div class="flex items-center gap-3">
                <div
                  class="w-3 h-3 rounded-full shrink-0"
                  :class="item.paidThisWeek ? 'bg-accent-500' : 'bg-amber-400'"
                />
                <div>
                  <p class="font-medium text-slate-800">{{ item.officer.full_name }}</p>
                  <p class="text-sm text-slate-500">{{ item.officer.role }}</p>
                </div>
              </div>
              <div class="flex items-center gap-3">
                <span v-if="item.paidThisWeek" class="text-sm font-semibold text-accent-600">
                  ${{ item.amount ?? 0 }} ✓
                </span>
                <NuxtLink
                  v-else
                  :to="`/collect?officer=${item.officer.id}`"
                  class="btn-primary text-sm py-1.5 px-3"
                >
                  Collect
                </NuxtLink>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div class="card">
        <div class="p-4 border-b border-slate-100">
          <h2 class="font-semibold text-slate-800">Recent Payments</h2>
        </div>
        <div class="p-4 space-y-3 max-h-[340px] md:max-h-[380px] overflow-y-auto">
          <div v-if="loading" class="space-y-3">
            <div v-for="n in 4" :key="n" class="shimmer h-16"></div>
          </div>
          <div v-else-if="recentPayments.length === 0" class="text-center py-6 text-slate-500 text-sm">
            No payments yet
          </div>
          <div
            v-else
            v-for="p in recentPayments"
            :key="p.id"
            class="flex justify-between items-center p-3 rounded-xl bg-accent-50 border border-accent-100 group"
          >
            <div>
              <p class="font-medium text-slate-800">{{ p.officer?.full_name || 'Unknown' }}</p>
              <p class="text-xs text-slate-500">{{ formatDate(p.paid_at) }}</p>
            </div>
            <div class="flex items-center gap-2">
              <span class="font-bold text-accent-700">${{ p.amount }}</span>
              <button
                type="button"
                @click="openEditPayment(p)"
                class="opacity-0 group-hover:opacity-100 md:opacity-70 p-1.5 rounded-lg hover:bg-accent-100 text-slate-500 hover:text-accent-600 transition"
                aria-label="Edit payment"
              >
                <svg xmlns="http://www.w3.org/2000/svg" class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                </svg>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>

    <PaymentEditModal
      v-if="editingPayment"
      :payment="editingPayment"
      @close="editingPayment = null"
      @saved="handlePaymentEdited"
    />
  </div>
</template>

<script setup lang="ts">
const { getWeekNumber, getOfficersWithWeeklyStatus, getRecentPayments } = useDues()
const { getOfficers } = useOfficers()
const currentWeek = ref(0)
const totalThisWeek = ref(0)
const paidCount = ref(0)
const officersCount = ref(0)
const officersWithStatus = ref<any[]>([])
const recentPayments = ref<any[]>([])
const loading = ref(true)
const editingPayment = ref<any>(null)

onMounted(async () => {
  currentWeek.value = getWeekNumber()
  const [statusData, { data: payments }, { data: officers }] = await Promise.all([
    getOfficersWithWeeklyStatus(),
    getRecentPayments(5),
    getOfficers(),
  ])
  officersWithStatus.value = statusData
  recentPayments.value = payments ?? []
  officersCount.value = officers?.length ?? 0
  paidCount.value = statusData.filter((s) => s.paidThisWeek).length
  totalThisWeek.value = statusData
    .filter((s) => s.paidThisWeek && s.amount)
    .reduce((sum, s) => sum + Number(s.amount), 0)
    .toFixed(2)
  loading.value = false
})

const openEditPayment = (p: any) => {
  editingPayment.value = {
    id: p.id,
    amount: p.amount,
    week_start: p.week_start,
    payment_method: p.payment_method,
    notes: p.notes,
    officer: p.officer,
  }
}

const handlePaymentEdited = () => {
  editingPayment.value = null
  const load = async () => {
    const [statusData, { data: payments }] = await Promise.all([
      getOfficersWithWeeklyStatus(),
      getRecentPayments(5),
    ])
    officersWithStatus.value = statusData
    recentPayments.value = payments ?? []
    paidCount.value = statusData.filter((s) => s.paidThisWeek).length
    totalThisWeek.value = statusData
      .filter((s) => s.paidThisWeek && s.amount)
      .reduce((sum, s) => sum + Number(s.amount), 0)
      .toFixed(2)
  }
  load()
}

const formatWeekRange = () => {
  const now = new Date()
  const mon = new Date(now)
  mon.setDate(now.getDate() - now.getDay() + (now.getDay() === 0 ? -6 : 1))
  const sun = new Date(mon)
  sun.setDate(mon.getDate() + 6)
  return `${mon.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })} – ${sun.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}`
}

const formatDate = (d?: string) => {
  if (!d) return '-'
  return new Date(d).toLocaleDateString('en-US', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })
}
</script>
