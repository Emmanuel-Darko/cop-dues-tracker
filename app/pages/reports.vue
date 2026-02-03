<template>
  <div>
    <header class="mb-6">
      <h1 class="font-display font-bold text-3xl text-slate-800">Reports</h1>
      <p class="text-slate-600 mt-1">Payment status by officer</p>
    </header>

    <div class="card p-4 mb-6 flex flex-wrap gap-4 items-end">
      <div>
        <label class="block text-xs font-medium text-slate-500 mb-1">Year</label>
        <select v-model="year" @change="generate" class="input-base py-2 w-28">
          <option v-for="y in years" :key="y" :value="y">{{ y }}</option>
        </select>
      </div>
      <div>
        <label class="block text-xs font-medium text-slate-500 mb-1">Status</label>
        <select v-model="statusFilter" @change="generate" class="input-base py-2 w-36">
          <option value="all">All</option>
          <option value="up_to_date">Up to date</option>
          <option value="behind">Behind</option>
          <option value="no_payments">No payments</option>
        </select>
      </div>
      <button type="button" @click="generate" class="btn-secondary py-2">Refresh</button>
      <button type="button" @click="exportCsv" class="btn-primary py-2">Export CSV</button>
    </div>

    <div class="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
      <div class="card p-4">
        <p class="text-sm text-slate-500">Total</p>
        <p class="text-xl font-bold text-accent-600">${{ summary.total }}</p>
      </div>
      <div class="card p-4">
        <p class="text-sm text-slate-500">Up to date</p>
        <p class="text-xl font-bold text-accent-600">{{ summary.upToDate }}</p>
      </div>
      <div class="card p-4">
        <p class="text-sm text-slate-500">Behind</p>
        <p class="text-xl font-bold text-amber-600">{{ summary.behind }}</p>
      </div>
      <div class="card p-4">
        <p class="text-sm text-slate-500">No payments</p>
        <p class="text-xl font-bold text-red-600">{{ summary.noPayments }}</p>
      </div>
    </div>

    <div class="card overflow-hidden">
      <div v-if="loading" class="p-6 space-y-3">
        <div v-for="n in 6" :key="n" class="shimmer h-12"></div>
      </div>
      <div v-else-if="filtered.length === 0" class="p-12 text-center text-slate-500">
        No data
      </div>
      <div v-else class="overflow-x-auto">
        <table class="min-w-full">
          <thead class="bg-slate-50 border-b border-slate-100">
            <tr>
              <th class="px-4 py-3 text-left text-xs font-semibold text-slate-500 uppercase">Officer</th>
              <th class="px-4 py-3 text-left text-xs font-semibold text-slate-500 uppercase">Total</th>
              <th class="px-4 py-3 text-left text-xs font-semibold text-slate-500 uppercase">Weeks</th>
              <th class="px-4 py-3 text-left text-xs font-semibold text-slate-500 uppercase">Last</th>
              <th class="px-4 py-3 text-left text-xs font-semibold text-slate-500 uppercase">Status</th>
            </tr>
          </thead>
          <tbody class="divide-y divide-slate-100">
            <tr v-for="r in filtered" :key="r.officer.id" class="hover:bg-slate-50/50">
              <td class="px-4 py-3">
                <p class="font-medium text-slate-800">{{ r.officer.full_name }}</p>
                <p class="text-sm text-slate-500">{{ r.officer.email }}</p>
              </td>
              <td class="px-4 py-3 font-semibold text-slate-800">${{ r.total_paid }}</td>
              <td class="px-4 py-3 text-slate-600">{{ r.weeks_paid }}</td>
              <td class="px-4 py-3 text-slate-600">{{ r.last_payment ? `Week ${r.last_payment}` : '—' }}</td>
              <td class="px-4 py-3">
                <span
                  class="px-2 py-0.5 rounded-full text-xs font-semibold whitespace-nowrap"
                  :class="{
                    'bg-accent-100 text-accent-800': r.status === 'up_to_date',
                    'bg-amber-100 text-amber-800': r.status === 'behind',
                    'bg-red-100 text-red-800': r.status === 'no_payments',
                  }"
                >
                  {{ statusLabel(r.status) }}
                </span>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
const { getPaymentReport } = useDues()
const currentYear = new Date().getFullYear()
const years = Array.from({ length: 5 }, (_, i) => currentYear - i)
const year = ref(currentYear)
const statusFilter = ref('all')
const data = ref<any[]>([])
const loading = ref(true)

const filtered = computed(() => {
  if (statusFilter.value === 'all') return data.value
  return data.value.filter((r) => r.status === statusFilter.value)
})

const summary = computed(() => ({
  total: data.value.reduce((s, r) => s + r.total_paid, 0).toFixed(2),
  upToDate: data.value.filter((r) => r.status === 'up_to_date').length,
  behind: data.value.filter((r) => r.status === 'behind').length,
  noPayments: data.value.filter((r) => r.status === 'no_payments').length,
}))

const statusLabel = (s: string) =>
  ({ up_to_date: 'Up to date', behind: 'Behind', no_payments: 'No payments' }[s] ?? s)

const generate = async () => {
  loading.value = true
  const { data: res } = await getPaymentReport(year.value)
  data.value = res ?? []
  loading.value = false
}

const exportCsv = () => {
  const headers = ['Name', 'Email', 'Total Paid', 'Weeks', 'Last Payment', 'Status']
  const rows = filtered.value.map((r) => [
    r.officer.full_name,
    r.officer.email ?? '',
    r.total_paid,
    r.weeks_paid,
    r.last_payment ? `Week ${r.last_payment}` : '',
    statusLabel(r.status),
  ])
  const csv = [headers.join(','), ...rows.map((row) => row.join(','))].join('\n')
  const blob = new Blob([csv], { type: 'text/csv' })
  const a = document.createElement('a')
  a.href = URL.createObjectURL(blob)
  a.download = `dues-report-${year.value}.csv`
  a.click()
  URL.revokeObjectURL(a.href)
}

onMounted(generate)
</script>
