<template>
  <Teleport to="body">
    <div class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm" @click.self="$emit('close')">
      <div class="card w-full max-w-sm p-6 shadow-2xl" @click.stop>
        <h3 class="font-display font-semibold text-lg text-slate-800 mb-4">Edit Payment</h3>
        <p class="text-sm text-slate-600 mb-4">{{ payment?.officer?.full_name }}</p>
        <form @submit.prevent="save" class="space-y-4">
          <div>
            <label class="block text-xs font-medium text-slate-500 mb-1.5">Amount</label>
            <input v-model.number="amount" type="number" step="0.01" min="0" required class="input-base" />
          </div>
          <div>
            <label class="block text-xs font-medium text-slate-500 mb-1.5">Week</label>
            <select v-model="selectedWeek" class="input-base">
              <option v-for="w in weekOptions" :key="w.value" :value="w.value">
                {{ w.label }}
              </option>
            </select>
          </div>
          <div>
            <label class="block text-xs font-medium text-slate-500 mb-1.5">Year (past or future)</label>
            <select v-model.number="selectedYear" class="input-base">
              <option v-for="y in yearOptions" :key="y" :value="y">{{ y }}</option>
            </select>
          </div>
          <div>
            <label class="block text-xs font-medium text-slate-500 mb-1.5">Method</label>
            <select v-model="paymentMethod" class="input-base">
              <option value="cash">Cash</option>
              <option value="mobile_money">Mobile Money</option>
              <option value="bank_transfer">Bank Transfer</option>
            </select>
          </div>
          <div>
            <label class="block text-xs font-medium text-slate-500 mb-1.5">Notes</label>
            <textarea v-model="notes" rows="2" class="input-base" placeholder="Optional"></textarea>
          </div>
          <div class="flex gap-3 pt-2">
            <button type="submit" :disabled="saving" class="btn-primary flex-1">
              {{ saving ? 'Saving...' : 'Save' }}
            </button>
            <button type="button" @click="$emit('close')" class="btn-secondary">Cancel</button>
          </div>
        </form>
      </div>
    </div>
  </Teleport>
</template>

<script setup lang="ts">
const props = defineProps<{
  payment: {
    id: string
    amount: number
    week_start: string
    payment_method?: string
    notes?: string
    officer?: { full_name: string }
  } | null
}>()
const emit = defineEmits<{ close: []; saved: [] }>()
const { getWeekNumber, getWeekStartDate, updatePayment } = useDues()
const toast = useToast()
const saving = ref(false)
const amount = ref(0)
const selectedWeek = ref(1)
const selectedYear = ref(new Date().getFullYear())
const paymentMethod = ref('cash')
const notes = ref('')

const currentYear = new Date().getFullYear()
const yearOptions = Array.from({ length: 30 }, (_, i) => 2010 + i)

const weekOptions = computed(() => {
  const cur = getWeekNumber()
  const opts = []
  for (let w = 1; w <= 52; w++) {
    const label = selectedYear.value === currentYear
      ? (w === cur ? `Week ${w} (current)` : w > cur ? `Week ${w} (future)` : `Week ${w}`)
      : `Week ${w}`
    opts.push({ value: w, label })
  }
  return opts
})

watch(
  () => props.payment,
  (p) => {
    if (p) {
      amount.value = Number(p.amount)
      const d = new Date(p.week_start)
      selectedWeek.value = getWeekNumber(d)
      selectedYear.value = d.getFullYear()
      paymentMethod.value = p.payment_method ?? 'cash'
      notes.value = p.notes ?? ''
    }
  },
  { immediate: true }
)

const save = async () => {
  if (!props.payment) return
  saving.value = true
  const weekStart = getWeekStartDate(selectedWeek.value, selectedYear.value)
  const { error } = await updatePayment(props.payment.id, {
    amount: amount.value,
    week_start: weekStart,
    payment_method: paymentMethod.value,
    notes: notes.value || undefined,
  })
  saving.value = false
  if (error) {
    toast.error(error.message || 'Update failed')
    return
  }
  toast.success('Payment updated')
  emit('saved')
}
</script>
