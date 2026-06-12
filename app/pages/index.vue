<template>
  <div>
    <header
      class="mb-6 md:mb-8 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3"
    >
      <div>
        <h1 class="font-display font-bold text-2xl md:text-3xl text-slate-800">
          Dashboard
        </h1>
        <p class="text-slate-500 mt-1 text-sm">
          Week {{ currentWeek }} &nbsp;·&nbsp; {{ formatWeekRange() }}
        </p>
      </div>
      <NuxtLink to="/collect" class="btn-primary w-full sm:w-auto text-center">
        + Record Payment
      </NuxtLink>
    </header>

    <!-- KPI cards -->
    <div class="grid grid-cols-2 lg:grid-cols-4 gap-3 md:gap-4 mb-6">
      <div class="card p-4 md:p-5">
        <p class="text-xs font-semibold text-slate-500 uppercase tracking-wide">
          This Week
        </p>
        <p class="text-2xl md:text-3xl font-bold text-slate-800 mt-1">
          GH₵ {{ totalThisWeek }}
        </p>
        <p
          v-if="weekDelta !== null"
          class="text-xs mt-1.5 font-medium"
          :class="weekDelta >= 0 ? 'text-emerald-600' : 'text-amber-600'"
        >
          {{ weekDelta >= 0 ? "▲" : "▼" }} GH₵
          {{ Math.abs(weekDelta).toFixed(2) }}
          vs last week
        </p>
      </div>

      <div class="card p-4 md:p-5">
        <p class="text-xs font-semibold text-slate-500 uppercase tracking-wide">
          Collected
        </p>
        <p class="text-2xl md:text-3xl font-bold text-accent-600 mt-1">
          {{ paidCount
          }}<span class="text-slate-400 text-lg font-normal"
            >/{{ officersCount }}</span
          >
        </p>
        <!-- Progress bar -->
        <div class="mt-2.5 h-1.5 bg-slate-100 rounded-full overflow-hidden">
          <div
            class="h-full bg-accent-500 rounded-full transition-all duration-700"
            :style="{
              width:
                officersCount > 0
                  ? `${(paidCount / officersCount) * 100}%`
                  : '0%',
            }"
          />
        </div>
        <p class="text-xs text-slate-500 mt-1">
          {{
            officersCount > 0
              ? Math.round((paidCount / officersCount) * 100)
              : 0
          }}% paid
        </p>
      </div>

      <div class="card p-4 md:p-5">
        <p class="text-xs font-semibold text-slate-500 uppercase tracking-wide">
          Pending
        </p>
        <p class="text-2xl md:text-3xl font-bold text-amber-600 mt-1">
          {{ officersCount - paidCount }}
        </p>
        <p class="text-xs text-slate-500 mt-1.5">officers outstanding</p>
      </div>

      <div class="card p-4 md:p-5">
        <p class="text-xs font-semibold text-slate-500 uppercase tracking-wide">
          This Month
        </p>
        <p class="text-2xl md:text-3xl font-bold text-slate-800 mt-1">
          GH₵ {{ monthTotal }}
        </p>
        <p class="text-xs text-slate-500 mt-1.5">
          {{ monthPaymentCount }} payments
        </p>
      </div>
    </div>

    <!-- Sparkline + officers list -->
    <div class="grid lg:grid-cols-3 gap-6 mb-6">
      <!-- Officers status list (2/3 width) -->
      <div class="lg:col-span-2 card">
        <div
          class="p-4 border-b border-slate-100 flex items-center justify-between"
        >
          <h2 class="font-semibold text-slate-800">This Week's Status</h2>
          <div class="flex items-center gap-2">
            <input
              v-model="search"
              type="text"
              placeholder="Search…"
              class="border border-slate-200 rounded-lg px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-accent-500/30 focus:border-accent-400 transition w-36"
            />
            <NuxtLink
              to="/collect"
              class="btn-primary text-sm py-2 px-3 shrink-0"
              >Collect</NuxtLink
            >
          </div>
        </div>
        <div class="max-h-[380px] overflow-y-auto">
          <div v-if="loading" class="p-4 space-y-3">
            <div v-for="n in 5" :key="n" class="shimmer h-12 rounded-xl"></div>
          </div>
          <div
            v-else-if="filteredOfficers.length === 0"
            class="p-8 text-center text-slate-500 text-sm"
          >
            {{
              search
                ? "No officers match your search."
                : "No officers yet. Add officers first."
            }}
          </div>
          <div v-else class="divide-y divide-slate-50">
            <div
              v-for="item in filteredOfficers"
              :key="item.officer.id"
              class="flex items-center justify-between px-4 py-3 hover:bg-slate-50/60 transition group"
            >
              <div class="flex items-center gap-3 min-w-0">
                <div
                  class="w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold shrink-0"
                  :class="
                    item.paidThisWeek
                      ? 'bg-accent-100 text-accent-700'
                      : 'bg-amber-100 text-amber-700'
                  "
                >
                  {{ item.officer.full_name[0] }}
                </div>
                <div class="min-w-0">
                  <p class="font-medium text-slate-800 truncate text-sm">
                    {{ item.officer.full_name }}
                  </p>
                  <p class="text-xs text-slate-400">{{ item.officer.role }}</p>
                </div>
              </div>
              <div class="flex items-center gap-2 shrink-0">
                <span
                  v-if="item.paidThisWeek"
                  class="flex items-center gap-1.5 text-sm font-semibold text-accent-600"
                >
                  <svg
                    class="w-3.5 h-3.5 text-accent-500"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      stroke-linecap="round"
                      stroke-linejoin="round"
                      stroke-width="2.5"
                      d="M5 13l4 4L19 7"
                    />
                  </svg>
                  GH₵ {{ item.amount ?? 0 }}
                </span>
                <NuxtLink
                  v-else
                  :to="`/collect?officer=${item.officer.id}`"
                  class="text-xs font-semibold px-2.5 py-1.5 rounded-lg bg-accent-500 text-white hover:bg-accent-600 transition"
                >
                  Collect
                </NuxtLink>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Right column: sparkline + recent -->
      <div class="space-y-4">
        <!-- 8-week sparkline -->
        <div class="card p-4">
          <div class="flex items-center justify-between mb-3">
            <h3 class="font-semibold text-slate-800 text-sm">8-Week Trend</h3>
            <span class="text-xs text-slate-400">Weekly collections</span>
          </div>
          <div v-if="trendLoading" class="shimmer h-20 rounded-lg"></div>
          <div v-else-if="weeklyTrend.length">
            <svg viewBox="0 0 240 64" class="w-full" preserveAspectRatio="none">
              <!-- Grid lines -->
              <line
                x1="0"
                y1="48"
                x2="240"
                y2="48"
                stroke="#f1f5f9"
                stroke-width="1"
              />
              <line
                x1="0"
                y1="24"
                x2="240"
                y2="24"
                stroke="#f1f5f9"
                stroke-width="1"
              />
              <!-- Area fill -->
              <path :d="sparklineFill" fill="url(#sparkGrad)" />
              <!-- Line -->
              <path
                :d="sparklinePath"
                fill="none"
                stroke="#7c6fcd"
                stroke-width="2"
                stroke-linejoin="round"
                stroke-linecap="round"
              />
              <!-- Dots -->
              <circle
                v-for="(pt, i) in sparklinePoints"
                :key="i"
                :cx="pt.x"
                :cy="pt.y"
                r="2.5"
                fill="#7c6fcd"
              />
              <defs>
                <linearGradient id="sparkGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stop-color="#7c6fcd" stop-opacity="0.18" />
                  <stop offset="100%" stop-color="#7c6fcd" stop-opacity="0" />
                </linearGradient>
              </defs>
            </svg>
            <!-- Labels -->
            <div class="flex justify-between mt-1">
              <span
                v-for="(t, i) in weeklyTrend"
                :key="i"
                class="text-[9px] text-slate-400 text-center flex-1"
              >
                {{ t.label.split(" ")[1] }}
              </span>
            </div>
          </div>
        </div>

        <!-- Recent payments -->
        <div class="card">
          <div class="p-4 border-b border-slate-100">
            <h3 class="font-semibold text-slate-800 text-sm">
              Recent Payments
            </h3>
          </div>
          <div class="divide-y divide-slate-50 max-h-[260px] overflow-y-auto">
            <div v-if="loading" class="p-4 space-y-3">
              <div
                v-for="n in 3"
                :key="n"
                class="shimmer h-12 rounded-xl"
              ></div>
            </div>
            <div
              v-else-if="recentPayments.length === 0"
              class="p-6 text-center text-slate-500 text-sm"
            >
              No payments yet
            </div>
            <div
              v-else
              v-for="p in recentPayments"
              :key="p.id"
              class="flex justify-between items-center px-4 py-3 hover:bg-slate-50/60 transition group"
            >
              <div class="min-w-0">
                <p class="font-medium text-slate-800 text-sm truncate">
                  {{ p.officer?.full_name || "Unknown" }}
                </p>
                <p class="text-xs text-slate-400">
                  {{ formatDate(p.paid_at) }}
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
const {
  getWeekNumber,
  getOfficersWithWeeklyStatus,
  getRecentPayments,
  getWeeklyTrend,
} = useDues();
const { getOfficers } = useOfficers();

const currentWeek = ref(0);
const totalThisWeek = ref("0.00");
const monthTotal = ref("0.00");
const monthPaymentCount = ref(0);
const paidCount = ref(0);
const officersCount = ref(0);
const officersWithStatus = ref<any[]>([]);
const recentPayments = ref<any[]>([]);
const weeklyTrend = ref<any[]>([]);
const loading = ref(true);
const trendLoading = ref(true);
const editingPayment = ref<any>(null);
const search = ref("");
const weekDelta = ref<number | null>(null);

const filteredOfficers = computed(() => {
  const q = search.value.trim().toLowerCase();
  if (!q) return officersWithStatus.value;
  return officersWithStatus.value.filter((o) =>
    o.officer.full_name.toLowerCase().includes(q),
  );
});

/* Sparkline geometry */
const sparklinePoints = computed(() => {
  if (!weeklyTrend.value.length) return [];
  const vals = weeklyTrend.value.map((t) => t.total);
  const maxVal = Math.max(...vals, 1);
  const W = 240,
    H = 56,
    PAD = 6;
  return vals.map((v, i) => ({
    x:
      vals.length === 1 ? W / 2 : PAD + (i / (vals.length - 1)) * (W - PAD * 2),
    y: H - PAD - (v / maxVal) * (H - PAD * 2),
  }));
});

const sparklinePath = computed(() => {
  const pts = sparklinePoints.value;
  if (!pts.length) return "";
  return pts
    .map((p, i) => `${i === 0 ? "M" : "L"}${p.x.toFixed(1)},${p.y.toFixed(1)}`)
    .join(" ");
});

const sparklineFill = computed(() => {
  const pts = sparklinePoints.value;
  if (!pts.length) return "";
  const line = pts
    .map((p, i) => `${i === 0 ? "M" : "L"}${p.x.toFixed(1)},${p.y.toFixed(1)}`)
    .join(" ");
  const last = pts[pts.length - 1];
  const first = pts[0];
  return `${line} L${last.x.toFixed(1)},64 L${first.x.toFixed(1)},64 Z`;
});

onMounted(async () => {
  currentWeek.value = getWeekNumber();
  const now = new Date();

  const [statusData, { data: payments }, { data: officers }] =
    await Promise.all([
      getOfficersWithWeeklyStatus(),
      getRecentPayments(6),
      getOfficers(),
    ]);

  officersWithStatus.value = statusData;
  recentPayments.value = payments ?? [];
  officersCount.value = officers?.length ?? 0;
  paidCount.value = statusData.filter((s) => s.paidThisWeek).length;
  totalThisWeek.value = statusData
    .filter((s) => s.paidThisWeek && s.amount)
    .reduce((sum, s) => sum + Number(s.amount), 0)
    .toFixed(2);

  // Month total from recent payments
  const thisMonth = now.getMonth();
  const thisYear = now.getFullYear();
  const monthPays = (payments ?? []).filter((p) => {
    const d = new Date(p.paid_at ?? p.week_start);
    return d.getMonth() === thisMonth && d.getFullYear() === thisYear;
  });
  monthTotal.value = monthPays
    .reduce((s, p) => s + Number(p.amount), 0)
    .toFixed(2);
  monthPaymentCount.value = monthPays.length;

  loading.value = false;

  // Load trend async
  const { data: trend } = await getWeeklyTrend(8);
  weeklyTrend.value = trend ?? [];

  // Week delta: this week vs last week
  if (trend && trend.length >= 2) {
    const thisW = trend[trend.length - 1].total;
    const lastW = trend[trend.length - 2].total;
    weekDelta.value = thisW - lastW;
  }
  trendLoading.value = false;
});

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
  refresh();
};

const refresh = async () => {
  const [statusData, { data: payments }] = await Promise.all([
    getOfficersWithWeeklyStatus(),
    getRecentPayments(6),
  ]);
  officersWithStatus.value = statusData;
  recentPayments.value = payments ?? [];
  paidCount.value = statusData.filter((s) => s.paidThisWeek).length;
  totalThisWeek.value = statusData
    .filter((s) => s.paidThisWeek && s.amount)
    .reduce((sum, s) => sum + Number(s.amount), 0)
    .toFixed(2);
};

const formatWeekRange = () => {
  const now = new Date();
  const mon = new Date(now);
  mon.setDate(now.getDate() - now.getDay() + (now.getDay() === 0 ? -6 : 1));
  const sun = new Date(mon);
  sun.setDate(mon.getDate() + 6);
  return `${mon.toLocaleDateString("en-US", { month: "short", day: "numeric" })} – ${sun.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}`;
};

const formatDate = (d?: string) => {
  if (!d) return "-";
  return new Date(d).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
};
</script>
