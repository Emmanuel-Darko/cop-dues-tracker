<template>
  <div>
    <div class="mb-6 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
      <div>
        <h1 class="font-display font-bold text-2xl md:text-3xl text-slate-800">Record Payment</h1>
        <p class="text-slate-600 mt-1 text-sm">Manual entry — any week, any year</p>
      </div>
      <NuxtLink to="/collect" class="btn-primary w-full sm:w-auto text-center">Go to Quick Collect</NuxtLink>
    </div>

    <div class="grid lg:grid-cols-3 gap-6">
      <div class="lg:col-span-2 card p-6">
        <form @submit.prevent="submit" class="space-y-5">
          <div>
            <label class="block text-sm font-medium text-slate-700 mb-1.5">Officer</label>
            <select v-model="form.officer_id" required class="input-base">
              <option value="">Select officer</option>
              <option v-for="o in officers" :key="o.id" :value="o.id">
                {{ o.full_name }} — ${{ o.monthly_dues ?? 0 }}/mo
              </option>
            </select>
          </div>
          <div class="grid sm:grid-cols-2 gap-4">
            <div>
              <label class="block text-sm font-medium text-slate-700 mb-1.5">Amount</label>
              <input v-model.number="form.amount" type="number" step="0.01" min="0" required class="input-base" />
            </div>
            <div>
              <label class="block text-sm font-medium text-slate-700 mb-1.5">Method</label>
              <select v-model="form.payment_method" class="input-base">
                <option value="cash">Cash</option>
                <option value="mobile_money">Mobile Money</option>
                <option value="bank_transfer">Bank Transfer</option>
              </select>
            </div>
          </div>
          <div class="grid sm:grid-cols-2 gap-4">
            <div>
              <label class="block text-sm font-medium text-slate-700 mb-1.5">Week (1–52)</label>
              <input v-model.number="form.week_number" type="number" min="1" max="52" class="input-base" />
            </div>
            <div>
              <label class="block text-sm font-medium text-slate-700 mb-1.5">Year (any)</label>
              <input v-model.number="form.year" type="number" min="2015" max="2035" class="input-base" />
            </div>
          </div>
          <div>
            <label class="block text-sm font-medium text-slate-700 mb-1.5">Notes</label>
            <textarea v-model="form.notes" rows="2" class="input-base" placeholder="Optional"></textarea>
          </div>
          <button type="submit" :disabled="submitting" class="btn-primary w-full py-3">
            {{ submitting ? 'Recording...' : 'Record Payment' }}
          </button>
        </form>
      </div>
      <div class="card p-6">
        <h3 class="font-semibold text-slate-800 mb-4">Recent</h3>
        <div v-if="recentLoading" class="space-y-3">
          <div v-for="n in 4" :key="n" class="shimmer h-16"></div>
        </div>
        <div v-else-if="recent.length === 0" class="text-slate-500 text-sm">No payments yet</div>
        <div v-else class="space-y-3">
          <div
            v-for="p in recent"
            :key="p.id"
            class="p-3 rounded-xl bg-accent-50 border border-accent-100 flex justify-between items-center group"
          >
            <div>
              <p class="font-medium text-slate-800">{{ p.officer?.full_name }}</p>
              <p class="text-xs text-slate-500">W{{ getWeekFromDate(p.week_start) }}</p>
            </div>
            <div class="flex items-center gap-2">
              <span class="font-semibold text-accent-600">${{ p.amount }}</span>
              <button
                type="button"
                @click="openEditPayment(p)"
                class="opacity-0 group-hover:opacity-100 md:opacity-70 p-1.5 rounded-lg hover:bg-accent-100 text-slate-500 hover:text-accent-600 transition"
                aria-label="Edit"
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
const { getWeekNumber, recordPayment, getRecentPayments } = useDues()
const { getOfficers } = useOfficers()
const toast = useToast()
const week = getWeekNumber()
const year = new Date().getFullYear()
const form = ref({
  officer_id: '',
  amount: 10,
  week_number: week,
  year,
  payment_method: 'cash',
  notes: '',
})
const officers = ref<any[]>([])
const recent = ref<any[]>([])
const submitting = ref(false)
const recentLoading = ref(true)
const editingPayment = ref<any>(null)

const getWeekFromDate = (dateStr: string) => {
  if (!dateStr) return '?'
  return getWeekNumber(new Date(dateStr))
}

const loadRecent = async () => {
  recentLoading.value = true
  const { data } = await getRecentPayments(8)
  recent.value = data ?? []
  recentLoading.value = false
}

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
  loadRecent()
}

onMounted(async () => {
  const [officersRes, _] = await Promise.all([getOfficers(), loadRecent()])
  officers.value = officersRes.data ?? []
})

const submit = async () => {
  submitting.value = true
  const { error } = await recordPayment(form.value)
  submitting.value = false
  if (error) {
    toast.error(error.message || 'Failed to record')
    return
  }
  toast.success('Payment recorded')
  form.value = { ...form.value, officer_id: '', amount: 10 }
  await loadRecent()
}
</script>
