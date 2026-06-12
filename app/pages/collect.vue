<template>
  <div>
    <header class="mb-6">
      <h1 class="font-display font-bold text-2xl md:text-3xl text-slate-800">
        Quick Collect
      </h1>
      <p class="text-slate-600 mt-1 text-sm md:text-base">
        Tap to record — pay current or future weeks
      </p>
    </header>

    <!-- Week & Year selector: full year flexible -->
    <div class="flex flex-wrap items-center gap-3 mb-6">
      <div>
        <label class="block text-xs font-medium text-slate-500 mb-0.5"
          >Year</label
        >
        <select
          v-model="selectedYear"
          class="input-base py-2 w-auto min-w-[90px]"
        >
          <option v-for="y in yearOptions" :key="y" :value="y">{{ y }}</option>
        </select>
      </div>
      <div>
        <label class="block text-xs font-medium text-slate-500 mb-0.5"
          >Week</label
        >
        <select
          v-model="selectedWeek"
          class="input-base py-2 w-auto min-w-[140px]"
        >
          <option v-for="w in weekOptions" :key="w.value" :value="w.value">
            {{ w.label }}
          </option>
        </select>
      </div>
      <span class="text-sm text-slate-500 self-end pb-2">{{ weekLabel }}</span>
    </div>

    <div class="mb-6">
      <input
        v-model="search"
        type="search"
        placeholder="Search by name..."
        class="input-base"
      />
    </div>

    <div
      v-if="loading"
      class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4"
    >
      <div v-for="n in 6" :key="n" class="shimmer h-32"></div>
    </div>

    <div
      v-else-if="filteredOfficers.length === 0"
      class="card p-12 text-center text-slate-500"
    >
      No officers found. Add officers first or clear your search.
    </div>

    <div v-else class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
      <div
        v-for="item in filteredOfficers"
        :key="item.officer.id"
        class="card overflow-hidden transition hover:shadow-card-hover shadow-lg"
        :class="[
          item.paidThisWeek
            ? 'ring-2 ring-accent-400 bg-accent-50/30'
            : 'bg-white border-2 border-slate-200',
        ]"
      >
        <div class="p-4">
          <div class="flex items-start justify-between gap-3">
            <div class="min-w-0 flex-1">
              <p class="font-semibold text-slate-800 truncate">
                {{ item.officer.full_name }}
              </p>
              <p class="text-sm text-slate-500">{{ item.officer.role }}</p>
            </div>
            <div
              class="w-2.5 h-2.5 rounded-full shrink-0 mt-1.5"
              :class="item.paidThisWeek ? 'bg-accent-500' : 'bg-amber-400'"
            />
          </div>

          <div
            v-if="item.paidThisWeek"
            class="mt-4 pt-4 border-t border-slate-100 flex items-center justify-between"
          >
            <p class="text-sm text-accent-600 font-semibold">
              Paid GH₵ {{ item.amount ?? 0 }}
            </p>
            <div class="flex items-center gap-3 text-xs">
              <button
                type="button"
                @click="openEditPayment(item)"
                class="text-slate-500 hover:text-accent-600 font-medium"
              >
                Edit
              </button>
              <button
                type="button"
                @click="removePayment(item)"
                class="text-slate-500 hover:text-red-600 font-medium"
              >
                Remove
              </button>
            </div>
          </div>

          <div v-else class="mt-4 flex flex-col gap-2">
            <div class="flex gap-2 flex-wrap">
              <button
                v-for="amt in quickAmounts(item.officer)"
                :key="amt"
                type="button"
                @click="recordWithAmount(item.officer.id, amt)"
                :disabled="submitting === item.officer.id"
                class="flex-1 min-w-[60px] py-2 px-3 rounded-lg font-semibold text-sm transition"
                :class="
                  amt === defaultAmount(item.officer)
                    ? 'bg-accent-500 text-white hover:bg-accent-600'
                    : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                "
              >
                GH₵ {{ amt }}
              </button>
            </div>
            <div class="grid grid-cols-2 gap-2">
              <button
                type="button"
                @click="openCustomAmount(item.officer)"
                class="py-2 text-sm text-slate-600 hover:text-slate-800 font-medium bg-slate-50 hover:bg-slate-100 rounded-lg transition"
              >
                Custom
              </button>
              <button
                type="button"
                @click="openRangePayment(item.officer)"
                class="py-2 text-sm text-purple-600 hover:text-purple-800 font-medium bg-purple-50 hover:bg-purple-100 rounded-lg transition flex items-center justify-center gap-1"
              >
                <svg
                  class="w-4 h-4"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    stroke-width="2"
                    d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
                  />
                </svg>
                Range
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Custom amount modal -->
    <Teleport to="body">
      <div
        v-if="customOfficer"
        class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm"
        @click.self="customOfficer = null"
      >
        <div class="card w-full max-w-sm p-6 shadow-2xl" @click.stop>
          <h3 class="font-display font-semibold text-lg text-slate-800 mb-4">
            {{ customOfficer.full_name }} — Custom amount
          </h3>
          <p class="text-xs text-slate-500 mb-2">
            Week {{ selectedWeek }}, {{ selectedYear }}
          </p>
          <input
            ref="customInputRef"
            v-model.number="customAmount"
            type="number"
            step="0.01"
            min="0"
            placeholder="0.00"
            class="input-base mb-4"
            @keyup.enter="submitCustomAmount"
          />
          <div class="flex gap-3">
            <button
              type="button"
              @click="submitCustomAmount"
              class="btn-primary flex-1"
            >
              Record GH₵ {{ customAmount || 0 }}
            </button>
            <button
              type="button"
              @click="customOfficer = null"
              class="btn-secondary"
            >
              Cancel
            </button>
          </div>
        </div>
      </div>
    </Teleport>

    <!-- Range payment modal -->
    <Teleport to="body">
      <div
        v-if="rangeOfficer"
        class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm overflow-y-auto"
        @click.self="closeRangeModal"
      >
        <div class="card w-full max-w-lg p-6 shadow-2xl my-8" @click.stop>
          <div class="flex items-start justify-between mb-4">
            <div>
              <h3 class="font-display font-semibold text-lg text-slate-800">
                Pay Multiple Weeks
              </h3>
              <p class="text-sm text-slate-600 mt-1">
                {{ rangeOfficer.full_name }}
              </p>
            </div>
            <button
              @click="closeRangeModal"
              class="text-slate-400 hover:text-slate-600"
            >
              <svg
                class="w-5 h-5"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  stroke-width="2"
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            </button>
          </div>

          <div class="space-y-4">
            <!-- Starting week/year -->
            <div class="grid grid-cols-2 gap-3">
              <div>
                <label class="block text-xs font-medium text-slate-500 mb-1.5"
                  >Start Year</label
                >
                <select v-model.number="rangeStartYear" class="input-base py-2">
                  <option v-for="y in yearOptions" :key="y" :value="y">
                    {{ y }}
                  </option>
                </select>
              </div>
              <div>
                <label class="block text-xs font-medium text-slate-500 mb-1.5"
                  >Start Week</label
                >
                <select v-model.number="rangeStartWeek" class="input-base py-2">
                  <option v-for="w in 52" :key="w" :value="w">
                    Week {{ w }}
                    <span v-if="rangeStartYear === currentYear">
                      {{
                        w === getWeekNumber()
                          ? " (current)"
                          : w > getWeekNumber()
                            ? " (future)"
                            : ""
                      }}
                    </span>
                  </option>
                </select>
              </div>
            </div>

            <!-- Ending week/year -->
            <div class="grid grid-cols-2 gap-3">
              <div>
                <label class="block text-xs font-medium text-slate-500 mb-1.5"
                  >End Year</label
                >
                <select v-model.number="rangeEndYear" class="input-base py-2">
                  <option v-for="y in yearOptions" :key="y" :value="y">
                    {{ y }}
                  </option>
                </select>
              </div>
              <div>
                <label class="block text-xs font-medium text-slate-500 mb-1.5"
                  >End Week</label
                >
                <select v-model.number="rangeEndWeek" class="input-base py-2">
                  <option v-for="w in availableEndWeeks" :key="w" :value="w">
                    Week {{ w }}
                    <span v-if="rangeEndYear === currentYear">
                      {{
                        w === getWeekNumber()
                          ? " (current)"
                          : w > getWeekNumber()
                            ? " (future)"
                            : ""
                      }}
                    </span>
                  </option>
                </select>
              </div>
            </div>

            <!-- Amount per week -->
            <div>
              <label class="block text-xs font-medium text-slate-500 mb-1.5"
                >Amount per Week (GH₵)</label
              >
              <input
                v-model.number="rangeAmountPerWeek"
                type="number"
                step="0.01"
                min="0"
                placeholder="20.00"
                class="input-base"
              />
            </div>

            <!-- Payment method -->
            <div>
              <label class="block text-xs font-medium text-slate-500 mb-1.5"
                >Payment Method</label
              >
              <select v-model="rangePaymentMethod" class="input-base">
                <option value="cash">Cash</option>
                <option value="mobile_money">Mobile Money</option>
                <option value="bank_transfer">Bank Transfer</option>
                <option value="check">Check</option>
              </select>
            </div>

            <!-- Notes -->
            <div>
              <label class="block text-xs font-medium text-slate-500 mb-1.5"
                >Notes (Optional)</label
              >
              <textarea
                v-model="rangeNotes"
                rows="2"
                class="input-base"
                placeholder="e.g., Paid in advance for travel"
              ></textarea>
            </div>

            <!-- Summary card -->
            <div
              class="bg-gradient-to-br from-purple-50 to-indigo-50 border border-purple-200 rounded-lg p-4"
            >
              <div class="flex items-center justify-between mb-2">
                <span class="text-sm font-medium text-slate-700"
                  >Number of weeks:</span
                >
                <span class="text-lg font-bold text-slate-900">{{
                  rangeWeeksCount
                }}</span>
              </div>
              <div
                class="flex items-center justify-between pt-2 border-t border-purple-200"
              >
                <span class="text-sm font-medium text-slate-700"
                  >Total amount:</span
                >
                <span class="text-2xl font-bold text-purple-900"
                  >GH₵ {{ rangeTotalAmount }}</span
                >
              </div>
              <p class="text-xs text-slate-600 mt-2">
                {{ rangeWeeksCount }} weeks × GH₵
                {{ rangeAmountPerWeek.toFixed(2) }}
                per week
              </p>
              <p v-if="rangeWeeksCount > 0" class="text-xs text-slate-500 mt-1">
                {{ formatRangeDates() }}
              </p>
            </div>
          </div>

          <div class="flex gap-3 mt-6">
            <button
              type="button"
              @click="closeRangeModal"
              class="btn-secondary flex-1"
            >
              Cancel
            </button>
            <button
              type="button"
              @click="submitRangePayment"
              :disabled="
                rangeWeeksCount === 0 ||
                rangeAmountPerWeek <= 0 ||
                submittingRange
              "
              class="btn-primary flex-1 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {{
                submittingRange
                  ? "Recording..."
                  : `Record GH₵ ${rangeTotalAmount}`
              }}
            </button>
          </div>
        </div>
      </div>
    </Teleport>

    <PaymentEditModal
      v-if="editingPayment"
      :payment="editingPayment"
      @close="editingPayment = null"
      @saved="handlePaymentEdited"
    />
  </div>
</template>

<script setup lang="ts">
const route = useRoute();
const {
  getWeekNumber,
  getWeekStartDate,
  getOfficersWithWeeklyStatus,
  recordPayment,
  deletePayment,
} = useDues();
const toast = useToast();
const currentWeek = getWeekNumber();
const currentYear = new Date().getFullYear();
const selectedWeek = ref(currentWeek);
const selectedYear = ref(currentYear);
const officersWithStatus = ref<any[]>([]);
const search = ref("");
const loading = ref(true);
const submitting = ref<string | null>(null);
const customOfficer = ref<any>(null);
const customAmount = ref<number>(0);
const customInputRef = ref<HTMLInputElement | null>(null);
const editingPayment = ref<any>(null);

// Range payment state
const rangeOfficer = ref<any>(null);
const rangeStartYear = ref(currentYear);
const rangeStartWeek = ref(currentWeek);
const rangeEndYear = ref(currentYear);
const rangeEndWeek = ref(currentWeek + 3);
const rangeAmountPerWeek = ref<number>(0);
const rangePaymentMethod = ref("cash");
const rangeNotes = ref("");
const submittingRange = ref(false);

const yearOptions = computed(() => {
  return Array.from({ length: 26 }, (_, i) => 2010 + i);
});

const weekOptions = computed(() => {
  const cur = currentWeek;
  const y = selectedYear.value;
  const isCurrentYear = y === currentYear;
  const opts = [];
  for (let w = 1; w <= 52; w++) {
    let label = `Week ${w}`;
    if (isCurrentYear) {
      if (w === cur) label += " (current)";
      else if (w > cur) label += " (future)";
    }
    opts.push({ value: w, label });
  }
  return opts;
});

const weekLabel = computed(() => {
  const ws = getWeekStartDate(selectedWeek.value, selectedYear.value);
  const d = new Date(ws);
  const end = new Date(d);
  end.setDate(end.getDate() + 6);
  return `${d.toLocaleDateString("en-US", { month: "short" })} ${d.getDate()} – ${end.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}`;
});

const filteredOfficers = computed(() => {
  const q = search.value.trim().toLowerCase();
  if (!q) return officersWithStatus.value;
  return officersWithStatus.value.filter((o) =>
    o.officer.full_name.toLowerCase().includes(q),
  );
});

const availableEndWeeks = computed(() => {
  // If same year, limit to weeks >= start week
  if (rangeEndYear.value === rangeStartYear.value) {
    return Array.from(
      { length: 52 - rangeStartWeek.value + 1 },
      (_, i) => rangeStartWeek.value + i,
    );
  }
  // If different year, all weeks available
  return Array.from({ length: 52 }, (_, i) => i + 1);
});

const rangeWeeksCount = computed(() => {
  const start = rangeStartYear.value * 52 + rangeStartWeek.value;
  const end = rangeEndYear.value * 52 + rangeEndWeek.value;
  return Math.max(0, end - start + 1);
});

const rangeTotalAmount = computed(() => {
  return (rangeWeeksCount.value * rangeAmountPerWeek.value).toFixed(2);
});

const defaultAmount = (officer: any) =>
  Number(officer.monthly_dues) > 0 ? officer.monthly_dues : 10;

const quickAmounts = (officer: any) => {
  const def = defaultAmount(officer);
  const set = new Set([5, 10, 20, 50, def].sort((a, b) => a - b));
  return Array.from(set).slice(0, 4);
};

const formatRangeDates = () => {
  const startDate = new Date(
    getWeekStartDate(rangeStartWeek.value, rangeStartYear.value),
  );
  const endWeekStart = getWeekStartDate(rangeEndWeek.value, rangeEndYear.value);
  const endDate = new Date(endWeekStart);
  endDate.setDate(endDate.getDate() + 6); // End of week

  const formatDate = (d: Date) =>
    d.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  return `${formatDate(startDate)} → ${formatDate(endDate)}`;
};

const recordWithAmount = async (officerId: string, amount: number) => {
  submitting.value = officerId;
  const { error } = await recordPayment({
    officer_id: officerId,
    amount,
    week_number: selectedWeek.value,
    year: selectedYear.value,
  });
  submitting.value = null;
  if (error) {
    toast.error(error.message || "Failed to record payment");
    return;
  }
  toast.success("Payment recorded");
  await load();
};

const openCustomAmount = (officer: any) => {
  customOfficer.value = officer;
  customAmount.value = defaultAmount(officer);
  nextTick(() => customInputRef.value?.focus());
};

const submitCustomAmount = async () => {
  if (!customOfficer.value) return;
  const amt = Number(customAmount.value) || 0;
  if (amt <= 0) {
    toast.error("Enter a valid amount");
    return;
  }
  await recordWithAmount(customOfficer.value.id, amt);
  customOfficer.value = null;
};

const openRangePayment = (officer: any) => {
  rangeOfficer.value = officer;
  rangeStartYear.value = selectedYear.value;
  rangeStartWeek.value = selectedWeek.value;
  rangeEndYear.value = selectedYear.value;
  rangeEndWeek.value = Math.min(selectedWeek.value + 3, 52);
  rangeAmountPerWeek.value = defaultAmount(officer);
  rangePaymentMethod.value = "cash";
  rangeNotes.value = "";
};

const closeRangeModal = () => {
  rangeOfficer.value = null;
  submittingRange.value = false;
};

const submitRangePayment = async () => {
  if (
    !rangeOfficer.value ||
    rangeWeeksCount.value === 0 ||
    rangeAmountPerWeek.value <= 0
  ) {
    toast.error("Invalid range or amount");
    return;
  }

  submittingRange.value = true;
  let successCount = 0;
  let errorCount = 0;

  // Generate all week/year combinations in the range
  const payments = [];
  let currentYear = rangeStartYear.value;
  let currentWeek = rangeStartWeek.value;
  const endYear = rangeEndYear.value;
  const endWeek = rangeEndWeek.value;

  while (
    currentYear < endYear ||
    (currentYear === endYear && currentWeek <= endWeek)
  ) {
    payments.push({
      week: currentWeek,
      year: currentYear,
    });

    currentWeek++;
    if (currentWeek > 52) {
      currentWeek = 1;
      currentYear++;
    }
  }

  // Record each payment
  for (const { week, year } of payments) {
    const { error } = await recordPayment({
      officer_id: rangeOfficer.value.id,
      amount: rangeAmountPerWeek.value,
      week_number: week,
      year: year,
      payment_method: rangePaymentMethod.value,
      notes:
        rangeNotes.value ||
        `Bulk payment: weeks ${rangeStartWeek.value}-${rangeEndWeek.value} (${rangeStartYear.value}${rangeStartYear.value !== rangeEndYear.value ? `-${rangeEndYear.value}` : ""})`,
    });

    if (error) {
      errorCount++;
    } else {
      successCount++;
    }
  }

  submittingRange.value = false;

  if (errorCount > 0) {
    toast.error(`Recorded ${successCount} payments, ${errorCount} failed`);
  } else {
    toast.success(
      `Successfully recorded ${successCount} weeks (GH₵ ${rangeTotalAmount.value})`,
    );
  }

  closeRangeModal();
  await load();
};

const openEditPayment = (item: any) => {
  if (!item.payment) return;
  editingPayment.value = {
    ...item.payment,
    officer: item.officer,
  };
};

const handlePaymentEdited = () => {
  editingPayment.value = null;
  load();
};

const removePayment = async (item: any) => {
  if (!item.paymentId) return;
  if (!confirm(`Remove payment for ${item.officer.full_name}?`)) return;
  const { error } = await deletePayment(item.paymentId);
  if (error) {
    toast.error(error.message || "Failed to remove payment");
    return;
  }
  toast.success("Payment removed");
  load();
};

const load = async () => {
  officersWithStatus.value = await getOfficersWithWeeklyStatus(
    selectedWeek.value,
    selectedYear.value,
  );
};

watch([selectedWeek, selectedYear], load);

// Watch for year changes in range modal to adjust end week if needed
watch([rangeStartYear, rangeStartWeek], () => {
  if (
    rangeEndYear.value === rangeStartYear.value &&
    rangeEndWeek.value < rangeStartWeek.value
  ) {
    rangeEndWeek.value = rangeStartWeek.value;
  }
});

onMounted(async () => {
  await load();
  loading.value = false;
  const officerId = route.query.officer as string;
  if (officerId) {
    const item = officersWithStatus.value.find(
      (o) => o.officer.id === officerId,
    );
    if (item && !item.paidThisWeek) {
      openCustomAmount(item.officer);
    }
  }
});
</script>
