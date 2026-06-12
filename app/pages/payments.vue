<template>
  <div>
    <div
      class="mb-6 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4"
    >
      <div>
        <h1 class="font-display font-bold text-2xl md:text-3xl text-slate-800">
          Record Payment
        </h1>
        <p class="text-slate-500 mt-1 text-sm">
          Manual entry — any week, any year
        </p>
      </div>
      <NuxtLink to="/collect" class="btn-primary w-full sm:w-auto text-center">
        ⚡ Quick Collect
      </NuxtLink>
    </div>

    <div class="grid lg:grid-cols-3 gap-6">
      <!-- Form -->
      <div class="lg:col-span-2 card p-6">
        <form @submit.prevent="submit" class="space-y-5">
          <!-- Officer -->
          <div>
            <label class="block text-sm font-medium text-slate-700 mb-1.5"
              >Officer</label
            >
            <select
              v-model="form.officer_id"
              required
              class="input-base"
              @change="onOfficerChange"
            >
              <option value="">Select officer…</option>
              <option v-for="o in officers" :key="o.id" :value="o.id">
                {{ o.full_name }} — GH₵ {{ o.monthly_dues ?? 0 }}/mo
              </option>
            </select>
          </div>

          <!-- Amount + quick-fill pills -->
          <div>
            <label class="block text-sm font-medium text-slate-700 mb-1.5"
              >Amount (GH₵)</label
            >
            <input
              v-model.number="form.amount"
              type="number"
              step="0.01"
              min="0"
              required
              class="input-base"
            />
            <div v-if="quickAmounts.length" class="flex gap-2 mt-2 flex-wrap">
              <button
                v-for="amt in quickAmounts"
                :key="amt"
                type="button"
                @click="form.amount = amt"
                class="px-3 py-1 rounded-lg text-xs font-semibold transition"
                :class="
                  form.amount === amt
                    ? 'bg-accent-500 text-white'
                    : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                "
              >
                GH₵ {{ amt }}
              </button>
            </div>
          </div>

          <!-- Week + Year -->
          <div class="grid sm:grid-cols-2 gap-4">
            <div>
              <label class="block text-sm font-medium text-slate-700 mb-1.5"
                >Year</label
              >
              <select v-model.number="form.year" class="input-base">
                <option v-for="y in yearOptions" :key="y" :value="y">
                  {{ y }}
                </option>
              </select>
            </div>
            <div>
              <label class="block text-sm font-medium text-slate-700 mb-1.5"
                >Week</label
              >
              <select v-model.number="form.week_number" class="input-base">
                <option
                  v-for="w in weekOptions"
                  :key="w.value"
                  :value="w.value"
                >
                  {{ w.label }}
                </option>
              </select>
            </div>
          </div>

          <!-- Week date range preview -->
          <p class="text-xs text-slate-500 -mt-2 pl-1">
            📅 {{ weekDateRange }}
          </p>

          <!-- Method -->
          <div>
            <label class="block text-sm font-medium text-slate-700 mb-1.5"
              >Payment Method</label
            >
            <div class="grid grid-cols-2 sm:grid-cols-4 gap-2">
              <button
                v-for="m in methods"
                :key="m.value"
                type="button"
                @click="form.payment_method = m.value"
                class="px-3 py-2.5 rounded-xl border text-xs font-semibold transition flex flex-col items-center gap-1"
                :class="
                  form.payment_method === m.value
                    ? 'border-accent-500 bg-accent-50 text-accent-700'
                    : 'border-slate-200 text-slate-600 hover:border-slate-300 hover:bg-slate-50'
                "
              >
                <span class="text-base leading-none">{{ m.icon }}</span>
                {{ m.label }}
              </button>
            </div>
          </div>

          <!-- Notes -->
          <div>
            <label class="block text-sm font-medium text-slate-700 mb-1.5"
              >Notes
              <span class="text-slate-400 font-normal">(optional)</span></label
            >
            <textarea
              v-model="form.notes"
              rows="2"
              class="input-base resize-none"
              placeholder="e.g. Paid in advance, bounced cheque replaced…"
            />
          </div>

          <!-- Submit -->
          <button
            type="submit"
            :disabled="submitting || !form.officer_id || form.amount <= 0"
            class="btn-primary w-full py-3 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {{
              submitting
                ? "Recording…"
                : `Record GH₵ ${form.amount || 0} payment`
            }}
          </button>
        </form>
      </div>

      <!-- Recent payments -->
      <div class="card flex flex-col">
        <div
          class="p-4 border-b border-slate-100 flex items-center justify-between"
        >
          <h3 class="font-semibold text-slate-800 text-sm">Recent Payments</h3>
          <span class="text-xs text-slate-400">{{ recent.length }} shown</span>
        </div>
        <div
          class="flex-1 divide-y divide-slate-50 overflow-y-auto max-h-[480px]"
        >
          <div v-if="recentLoading" class="p-4 space-y-3">
            <div v-for="n in 4" :key="n" class="shimmer h-14 rounded-xl"></div>
          </div>
          <div
            v-else-if="recent.length === 0"
            class="p-8 text-center text-slate-400 text-sm"
          >
            No payments yet
          </div>
          <div
            v-else
            v-for="p in recent"
            :key="p.id"
            class="flex justify-between items-center px-4 py-3 hover:bg-slate-50/60 transition group"
          >
            <div class="min-w-0">
              <p class="font-medium text-slate-800 text-sm truncate">
                {{ p.officer?.full_name }}
              </p>
              <p class="text-xs text-slate-400">
                Wk {{ getWeekFromDate(p.week_start) }} ·
                {{ methodLabel(p.payment_method) }}
              </p>
            </div>
            <div class="flex items-center gap-2 shrink-0">
              <span class="font-bold text-accent-700 text-sm"
                >GH₵ {{ p.amount }}</span
              >
              <button
                type="button"
                @click="openEditPayment(p)"
                class="opacity-0 group-hover:opacity-100 transition p-1.5 rounded-lg hover:bg-accent-100 text-slate-400 hover:text-accent-600"
                title="Edit"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  class="w-3.5 h-3.5"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    stroke-width="2"
                    d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z"
                  />
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
const { getWeekNumber, getWeekStartDate, recordPayment, getRecentPayments } =
  useDues();
const { getOfficers } = useOfficers();
const toast = useToast();

const currentWeek = getWeekNumber();
const currentYear = new Date().getFullYear();

const form = ref({
  officer_id: "",
  amount: 0,
  week_number: currentWeek,
  year: currentYear,
  payment_method: "cash",
  notes: "",
});

const officers = ref<any[]>([]);
const recent = ref<any[]>([]);
const submitting = ref(false);
const recentLoading = ref(true);
const editingPayment = ref<any>(null);

const methods = [
  { value: "cash", label: "Cash", icon: "💵" },
  { value: "mobile_money", label: "Mobile Money", icon: "📱" },
  { value: "bank_transfer", label: "Bank Transfer", icon: "🏦" },
  { value: "check", label: "Check", icon: "📝" },
];

const yearOptions = computed(() =>
  Array.from({ length: 26 }, (_, i) => 2010 + i),
);

const weekOptions = computed(() => {
  const y = form.value.year;
  return Array.from({ length: 52 }, (_, i) => {
    const w = i + 1;
    let label = `Week ${w}`;
    if (y === currentYear) {
      if (w === currentWeek) label += " (current)";
      else if (w > currentWeek) label += " (future)";
    }
    return { value: w, label };
  });
});

const weekDateRange = computed(() => {
  const ws = getWeekStartDate(form.value.week_number, form.value.year);
  const d = new Date(ws);
  const end = new Date(d);
  end.setDate(end.getDate() + 6);
  return `${d.toLocaleDateString("en-US", { month: "short", day: "numeric" })} – ${end.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}`;
});

const selectedOfficer = computed(() =>
  officers.value.find((o) => o.id === form.value.officer_id),
);

const quickAmounts = computed(() => {
  const o = selectedOfficer.value;
  if (!o) return [];
  const def = Number(o.monthly_dues) || 10;
  return [...new Set([5, 10, 20, 50, def].sort((a, b) => a - b))].slice(0, 4);
});

const onOfficerChange = () => {
  const o = selectedOfficer.value;
  if (o && Number(o.monthly_dues) > 0)
    form.value.amount = Number(o.monthly_dues);
};

const getWeekFromDate = (dateStr: string) => {
  if (!dateStr) return "?";
  return getWeekNumber(new Date(dateStr));
};

const methodLabel = (m?: string) =>
  methods.find((x) => x.value === m)?.label ?? m ?? "Cash";

const loadRecent = async () => {
  recentLoading.value = true;
  const { data } = await getRecentPayments(10);
  recent.value = data ?? [];
  recentLoading.value = false;
};

const openEditPayment = (p: any) => {
  editingPayment.value = {
    id: p.id,
    amount: p.amount,
    week_start: p.week_start,
    payment_method: p.payment_method,
    notes: p.notes,
    officer: p.officer,
  };
};

const handlePaymentEdited = () => {
  editingPayment.value = null;
  loadRecent();
};

onMounted(async () => {
  const [officersRes] = await Promise.all([getOfficers(), loadRecent()]);
  officers.value = officersRes.data ?? [];
});

const submit = async () => {
  submitting.value = true;
  const { error } = await recordPayment(form.value);
  submitting.value = false;
  if (error) {
    toast.error(error.message || "Failed to record");
    return;
  }
  toast.success(`Payment of GH₵ ${form.value.amount} recorded`);
  form.value = {
    officer_id: "",
    amount: 0,
    week_number: currentWeek,
    year: currentYear,
    payment_method: "cash",
    notes: "",
  };
  await loadRecent();
};
</script>
