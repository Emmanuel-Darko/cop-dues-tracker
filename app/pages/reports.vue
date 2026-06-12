<template>
  <div>
    <header
      class="mb-6 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4"
    >
      <div>
        <h1 class="font-display font-bold text-3xl text-slate-800">Reports</h1>
        <p class="text-slate-500 mt-1 text-sm">
          {{ year }} collections overview
        </p>
      </div>
      <!-- Export dropdown -->
      <div class="relative" ref="exportRef">
        <button
          type="button"
          @click="exportOpen = !exportOpen"
          class="btn-primary flex items-center gap-2 w-full sm:w-auto justify-center"
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
              d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"
            />
          </svg>
          Export
          <svg
            class="w-3.5 h-3.5 transition-transform"
            :class="exportOpen ? 'rotate-180' : ''"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              stroke-width="2"
              d="M19 9l-7 7-7-7"
            />
          </svg>
        </button>
        <Transition
          enter-from-class="opacity-0 -translate-y-2"
          enter-active-class="transition duration-150"
          leave-to-class="opacity-0 -translate-y-2"
          leave-active-class="transition duration-100"
        >
          <div
            v-if="exportOpen"
            class="absolute right-0 top-12 z-20 bg-white border border-slate-200 rounded-2xl shadow-xl overflow-hidden w-56"
          >
            <button
              v-for="opt in exportOptions"
              :key="opt.key"
              type="button"
              @click="runExport(opt.key)"
              :disabled="opt.key === 'pdf' && pdfGenerating"
              class="w-full flex items-start gap-3 px-4 py-3 hover:bg-slate-50 transition text-left disabled:opacity-50 disabled:cursor-wait"
            >
              <span class="text-accent-500 mt-0.5 shrink-0">
                <svg
                  v-if="opt.key === 'pdf' && pdfGenerating"
                  class="w-4 h-4 animate-spin"
                  fill="none"
                  viewBox="0 0 24 24"
                >
                  <circle
                    class="opacity-25"
                    cx="12"
                    cy="12"
                    r="10"
                    stroke="currentColor"
                    stroke-width="4"
                  />
                  <path
                    class="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
                  />
                </svg>
                <span v-else v-html="opt.icon"></span>
              </span>
              <span>
                <p class="text-sm font-semibold text-slate-800">
                  {{
                    opt.key === "pdf" && pdfGenerating
                      ? "Generating…"
                      : opt.label
                  }}
                </p>
                <p class="text-xs text-slate-500">{{ opt.desc }}</p>
              </span>
            </button>
          </div>
        </Transition>
      </div>
    </header>

    <!-- Controls -->
    <div class="card p-4 mb-6 flex flex-wrap gap-4 items-end">
      <div>
        <label class="block text-xs font-medium text-slate-500 mb-1"
          >Year</label
        >
        <select v-model="year" @change="generate" class="input-base py-2 w-28">
          <option v-for="y in years" :key="y" :value="y">{{ y }}</option>
        </select>
      </div>
      <div>
        <label class="block text-xs font-medium text-slate-500 mb-1"
          >Status filter</label
        >
        <select v-model="statusFilter" class="input-base py-2 w-40">
          <option value="all">All officers</option>
          <option value="up_to_date">Up to date</option>
          <option value="behind">Behind</option>
          <option value="no_payments">No payments</option>
        </select>
      </div>
      <div>
        <label class="block text-xs font-medium text-slate-500 mb-1"
          >Search</label
        >
        <input
          v-model="search"
          type="text"
          placeholder="Name…"
          class="input-base py-2 w-40"
        />
      </div>
      <button type="button" @click="generate" class="btn-secondary py-2">
        ↺ Refresh
      </button>
    </div>

    <!-- KPI cards -->
    <div class="grid grid-cols-2 lg:grid-cols-4 gap-3 md:gap-4 mb-6">
      <div class="card p-4 md:p-5">
        <p
          class="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-1"
        >
          Total Collected
        </p>
        <p class="text-2xl font-bold text-slate-800">
          GH₵ {{ fmt(analytics.totalCollected) }}
        </p>
        <p class="text-xs text-slate-500 mt-1">
          {{ analytics.totalPayments }} payments
        </p>
      </div>
      <div class="card p-4 md:p-5">
        <p
          class="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-1"
        >
          Avg / Week
        </p>
        <p class="text-2xl font-bold text-slate-800">
          GH₵ {{ fmt(analytics.avgPerWeek) }}
        </p>
        <p class="text-xs text-slate-500 mt-1">
          {{ analytics.weeksWithData }} active weeks
        </p>
      </div>
      <div class="card p-4 md:p-5">
        <p
          class="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-1"
        >
          Best Month
        </p>
        <p class="text-2xl font-bold text-accent-600">
          {{ analytics.bestMonth?.label ?? "—" }}
        </p>
        <p class="text-xs text-slate-500 mt-1">
          GH₵ {{ fmt(analytics.bestMonth?.total ?? 0) }} collected
        </p>
      </div>
      <div class="card p-4 md:p-5">
        <p
          class="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-1"
        >
          Compliance
        </p>
        <p class="text-2xl font-bold text-emerald-600">
          {{ summary.upToDate }}
        </p>
        <div class="flex items-center gap-3 mt-1">
          <span class="text-xs text-amber-600"
            >{{ summary.behind }} behind</span
          >
          <span class="text-xs text-red-500"
            >{{ summary.noPayments }} none</span
          >
        </div>
      </div>
    </div>

    <!-- Charts row -->
    <div class="grid lg:grid-cols-3 gap-6 mb-6">
      <!-- Monthly bar chart (2/3) -->
      <div class="lg:col-span-2 card p-5">
        <h2 class="font-semibold text-slate-800 mb-4 text-sm">
          Monthly Collections — {{ year }}
        </h2>
        <div v-if="analyticsLoading" class="shimmer h-40 rounded-xl"></div>
        <div v-else-if="analytics.monthly?.length">
          <svg
            :viewBox="`0 0 ${barChartW} ${barChartH}`"
            class="w-full"
            preserveAspectRatio="xMidYMid meet"
          >
            <!-- horizontal grid -->
            <line
              v-for="g in 4"
              :key="g"
              x1="40"
              :y1="barChartH - 24 - (g / 4) * (barChartH - 40)"
              :x2="barChartW - 8"
              :y2="barChartH - 24 - (g / 4) * (barChartH - 40)"
              stroke="#f1f5f9"
              stroke-width="1"
            />
            <!-- Y labels -->
            <text
              v-for="g in 4"
              :key="`yl${g}`"
              x="36"
              :y="barChartH - 24 - (g / 4) * (barChartH - 40) + 4"
              text-anchor="end"
              font-size="9"
              fill="#94a3b8"
            >
              GH₵ {{ Math.round((maxMonthly * g) / 4) }}
            </text>
            <!-- Bars -->
            <g v-for="(m, i) in analytics.monthly" :key="m.month">
              <rect
                :x="40 + i * barSlotW + barPad"
                :y="barChartH - 24 - barHeight(m.total)"
                :width="barW"
                :height="barHeight(m.total)"
                :fill="m.month === currentMonth ? '#7c6fcd' : '#ddd6fe'"
                rx="3"
              />
              <text
                :x="40 + i * barSlotW + barPad + barW / 2"
                :y="barChartH - 8"
                text-anchor="middle"
                font-size="9"
                fill="#94a3b8"
              >
                {{ m.label }}
              </text>
              <text
                v-if="m.total > 0"
                :x="40 + i * barSlotW + barPad + barW / 2"
                :y="barChartH - 24 - barHeight(m.total) - 3"
                text-anchor="middle"
                font-size="8"
                :fill="m.month === currentMonth ? '#7c6fcd' : '#a78bfa'"
              >
                GH₵ {{ Math.round(m.total) }}
              </text>
            </g>
          </svg>
        </div>
        <p v-else class="text-slate-400 text-sm text-center py-10">
          No payment data for {{ year }}
        </p>
      </div>

      <!-- Payment method donut (1/3) -->
      <div class="card p-5">
        <h2 class="font-semibold text-slate-800 mb-4 text-sm">
          Payment Methods
        </h2>
        <div v-if="analyticsLoading" class="shimmer h-40 rounded-xl"></div>
        <div v-else-if="analytics.byMethod?.length">
          <!-- Donut SVG -->
          <svg viewBox="0 0 120 120" class="w-36 h-36 mx-auto -rotate-90">
            <circle
              cx="60"
              cy="60"
              r="44"
              fill="none"
              stroke="#f1f5f9"
              stroke-width="16"
            />
            <circle
              v-for="(seg, i) in donutSegments"
              :key="i"
              cx="60"
              cy="60"
              r="44"
              fill="none"
              :stroke="seg.color"
              stroke-width="16"
              :stroke-dasharray="`${seg.dash} ${seg.gap}`"
              :stroke-dashoffset="seg.offset"
            />
          </svg>
          <!-- Legend -->
          <div class="mt-4 space-y-2">
            <div
              v-for="(m, i) in analytics.byMethod"
              :key="m.method"
              class="flex items-center justify-between text-xs"
            >
              <div class="flex items-center gap-2">
                <span
                  class="w-2.5 h-2.5 rounded-full shrink-0"
                  :style="{ background: methodColors[i % methodColors.length] }"
                ></span>
                <span class="text-slate-600 font-medium">{{ m.label }}</span>
              </div>
              <div class="text-right">
                <span class="font-bold text-slate-800"
                  >GH₵ {{ fmt(m.total) }}</span
                >
                <span class="text-slate-400 ml-1">({{ m.count }})</span>
              </div>
            </div>
          </div>
        </div>
        <p v-else class="text-slate-400 text-sm text-center py-10">No data</p>
      </div>
    </div>

    <!-- Officer breakdown table -->
    <div class="card overflow-hidden">
      <div
        class="p-4 border-b border-slate-100 flex items-center justify-between"
      >
        <h2 class="font-semibold text-slate-800">Officer Breakdown</h2>
        <p class="text-xs text-slate-400">
          {{ filtered.length }} of {{ data.length }} officers
        </p>
      </div>
      <div v-if="loading" class="p-6 space-y-3">
        <div v-for="n in 6" :key="n" class="shimmer h-12 rounded-xl"></div>
      </div>
      <div
        v-else-if="filtered.length === 0"
        class="p-12 text-center text-slate-400 text-sm"
      >
        No officers match your filters.
      </div>
      <div v-else class="overflow-x-auto">
        <table class="min-w-full">
          <thead class="bg-slate-50 border-b border-slate-100">
            <tr>
              <th
                class="px-4 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wide"
              >
                Officer
              </th>
              <th
                class="px-4 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wide hidden sm:table-cell"
              >
                Role
              </th>
              <th
                class="px-4 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wide"
              >
                Total Paid
              </th>
              <th
                class="px-4 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wide hidden md:table-cell"
              >
                Progress
              </th>
              <th
                class="px-4 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wide hidden lg:table-cell"
              >
                Weeks
              </th>
              <th
                class="px-4 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wide hidden lg:table-cell"
              >
                Last Week
              </th>
              <th
                class="px-4 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wide"
              >
                Status
              </th>
            </tr>
          </thead>
          <tbody class="divide-y divide-slate-50">
            <tr
              v-for="r in filtered"
              :key="r.officer.id"
              class="hover:bg-slate-50/50 transition"
            >
              <td class="px-4 py-3">
                <div class="flex items-center gap-2.5">
                  <div
                    class="w-7 h-7 rounded-full bg-accent-100 text-accent-700 flex items-center justify-center text-xs font-bold shrink-0"
                  >
                    {{ r.officer.full_name[0] }}
                  </div>
                  <div>
                    <p class="font-medium text-slate-800 text-sm">
                      {{ r.officer.full_name }}
                    </p>
                    <p class="text-xs text-slate-400 hidden sm:block">
                      {{ r.officer.email || "—" }}
                    </p>
                  </div>
                </div>
              </td>
              <td class="px-4 py-3 hidden sm:table-cell">
                <span
                  class="px-2 py-0.5 rounded-full text-xs font-medium bg-slate-100 text-slate-600"
                >
                  {{ r.officer.role || "—" }}
                </span>
              </td>
              <td class="px-4 py-3 font-bold text-slate-800">
                GH₵ {{ fmt(r.total_paid) }}
              </td>
              <td class="px-4 py-3 hidden md:table-cell w-32">
                <div class="h-1.5 bg-slate-100 rounded-full overflow-hidden">
                  <div
                    class="h-full rounded-full transition-all duration-500"
                    :class="
                      r.status === 'up_to_date'
                        ? 'bg-emerald-500'
                        : r.status === 'behind'
                          ? 'bg-amber-400'
                          : 'bg-red-400'
                    "
                    :style="{
                      width: `${Math.min((r.weeks_paid / weeksElapsed) * 100, 100)}%`,
                    }"
                  />
                </div>
                <p class="text-[10px] text-slate-400 mt-1">
                  {{ r.weeks_paid }}/{{ weeksElapsed }} wks
                </p>
              </td>
              <td class="px-4 py-3 text-slate-600 text-sm hidden lg:table-cell">
                {{ r.weeks_paid }}
              </td>
              <td class="px-4 py-3 text-slate-600 text-sm hidden lg:table-cell">
                {{ r.last_payment ? `Wk ${r.last_payment}` : "—" }}
              </td>
              <td class="px-4 py-3">
                <span
                  class="px-2.5 py-1 rounded-full text-xs font-semibold whitespace-nowrap"
                  :class="{
                    'bg-emerald-100 text-emerald-800':
                      r.status === 'up_to_date',
                    'bg-amber-100 text-amber-800': r.status === 'behind',
                    'bg-red-100 text-red-700': r.status === 'no_payments',
                  }"
                >
                  {{ statusLabel(r.status) }}
                </span>
              </td>
            </tr>
          </tbody>
          <tfoot
            v-if="filtered.length > 0"
            class="border-t-2 border-slate-100 bg-slate-50"
          >
            <tr>
              <td
                class="px-4 py-3 text-xs font-semibold text-slate-500"
                colspan="2"
              >
                Totals
              </td>
              <td class="px-4 py-3 font-bold text-slate-800">
                GH₵ {{ fmt(filteredTotal) }}
              </td>
              <td colspan="4"></td>
            </tr>
          </tfoot>
        </table>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
const { getPaymentReport, getAnalytics, getAllPaymentsForYear } = useDues();
const toast = useToast();

const currentYear = new Date().getFullYear();
const currentMonth = new Date().getMonth();
const currentWeekOfYear = Math.ceil(
  (new Date().getTime() - new Date(currentYear, 0, 1).getTime()) /
    (7 * 86400000),
);

const years = Array.from({ length: 5 }, (_, i) => currentYear - i);
const year = ref(currentYear);
const statusFilter = ref("all");
const search = ref("");
const data = ref<any[]>([]);
const loading = ref(true);
const analyticsLoading = ref(true);
const exportOpen = ref(false);
const exportRef = ref<HTMLElement | null>(null);

interface Analytics {
  monthly?: any[];
  byMethod?: any[];
  totalCollected: number;
  totalPayments: number;
  weeksWithData: number;
  avgPerWeek: number;
  bestMonth?: { label: string; total: number };
}
const analytics = ref<Analytics>({
  totalCollected: 0,
  totalPayments: 0,
  weeksWithData: 0,
  avgPerWeek: 0,
});

/* Bar chart dimensions */
const barChartW = 560;
const barChartH = 160;
const barSlotW = (barChartW - 48) / 12;
const barPad = 4;
const barW = barSlotW - barPad * 2;

const maxMonthly = computed(() =>
  Math.max(...(analytics.value.monthly ?? []).map((m) => m.total), 1),
);
const barHeight = (v: number) => (v / maxMonthly.value) * (barChartH - 40);
const weeksElapsed = computed(() =>
  year.value < currentYear ? 52 : currentWeekOfYear,
);

/* Donut chart */
const methodColors = ["#7c6fcd", "#a78bfa", "#c4b5fd", "#ddd6fe", "#ede9fe"];
const CIRC = 2 * Math.PI * 44; // circumference of r=44

const donutSegments = computed(() => {
  const methods = analytics.value.byMethod ?? [];
  const total = methods.reduce((s, m) => s + m.total, 0) || 1;
  let offset = 0;
  return methods.map((m, i) => {
    const pct = m.total / total;
    const dash = pct * CIRC;
    const seg = {
      dash,
      gap: CIRC - dash,
      offset: -offset,
      color: methodColors[i % methodColors.length],
    };
    offset += dash;
    return seg;
  });
});

/* Table */
const filtered = computed(() => {
  let rows = data.value;
  if (statusFilter.value !== "all")
    rows = rows.filter((r) => r.status === statusFilter.value);
  const q = search.value.trim().toLowerCase();
  if (q)
    rows = rows.filter((r) => r.officer.full_name.toLowerCase().includes(q));
  return rows;
});

const filteredTotal = computed(() =>
  filtered.value.reduce((s, r) => s + r.total_paid, 0),
);

const summary = computed(() => ({
  total: data.value.reduce((s, r) => s + r.total_paid, 0).toFixed(2),
  upToDate: data.value.filter((r) => r.status === "up_to_date").length,
  behind: data.value.filter((r) => r.status === "behind").length,
  noPayments: data.value.filter((r) => r.status === "no_payments").length,
}));

const fmt = (n: number) => Number(n ?? 0).toFixed(2);
const statusLabel = (s: string) =>
  ({ up_to_date: "Up to date", behind: "Behind", no_payments: "No payments" })[
    s
  ] ?? s;

const generate = async () => {
  loading.value = true;
  analyticsLoading.value = true;
  const [reportRes, analyticsRes] = await Promise.all([
    getPaymentReport(year.value),
    getAnalytics(year.value),
  ]);
  data.value = reportRes.data ?? [];
  analytics.value = analyticsRes.data ?? analytics.value;
  loading.value = false;
  analyticsLoading.value = false;
};

/* ── Exports ── */
const exportOptions = [
  {
    key: "pdf",
    label: "PDF Report",
    desc: "Printable summary report",
    icon: '<svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-3-3v6m-7 4h14a2 2 0 002-2V7a2 2 0 00-2-2h-3.586a1 1 0 01-.707-.293L11.293 3.293A1 1 0 0010.586 3H5a2 2 0 00-2 2v14a2 2 0 002 2z"/></svg>',
  },
  {
    key: "summary_csv",
    label: "Summary CSV",
    desc: "One row per officer",
    icon: '<svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"/></svg>',
  },
  {
    key: "detailed_csv",
    label: "Detailed CSV",
    desc: "One row per payment",
    icon: '<svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6h16M4 10h16M4 14h16M4 18h16"/></svg>',
  },
  {
    key: "json",
    label: "JSON Export",
    desc: "Full structured data",
    icon: '<svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4"/></svg>',
  },
];

const pdfGenerating = ref(false);

const runExport = async (key: string) => {
  if (key === "pdf") {
    await exportPDF();
    exportOpen.value = false;
    return;
  }
  exportOpen.value = false;
  if (key === "summary_csv") exportSummaryCSV();
  else if (key === "detailed_csv") await exportDetailedCSV();
  else if (key === "json") await exportJSON();
};

const exportSummaryCSV = () => {
  const headers = [
    "Name",
    "Role",
    "Email",
    "Total Paid (GH₵)",
    "Weeks Paid",
    "Last Week",
    "Status",
  ];
  const rows = filtered.value.map((r) => [
    r.officer.full_name,
    r.officer.role ?? "",
    r.officer.email ?? "",
    fmt(r.total_paid),
    r.weeks_paid,
    r.last_payment ? `Week ${r.last_payment}` : "",
    statusLabel(r.status),
  ]);
  downloadCSV([headers, ...rows], `dues-summary-${year.value}`);
};

const exportDetailedCSV = async () => {
  const { data: payments } = await getAllPaymentsForYear(year.value);
  const headers = [
    "Officer",
    "Role",
    "Email",
    "Week Start",
    "Week #",
    "Amount (GH₵)",
    "Method",
    "Paid At",
    "Notes",
  ];
  const weekNum = (d: string) => {
    const date = new Date(d);
    const jan1 = new Date(date.getFullYear(), 0, 1);
    return Math.ceil(
      ((date.getTime() - jan1.getTime()) / 86400000 + jan1.getDay() + 1) / 7,
    );
  };
  const rows = (payments ?? []).map((p) => [
    p.officer?.full_name ?? "",
    p.officer?.role ?? "",
    p.officer?.email ?? "",
    p.week_start,
    weekNum(p.week_start),
    fmt(Number(p.amount)),
    p.payment_method ?? "cash",
    p.paid_at ? new Date(p.paid_at).toLocaleString("en-US") : "",
    p.notes ?? "",
  ]);
  downloadCSV([headers, ...rows], `dues-detailed-${year.value}`);
};

const exportPDF = async () => {
  if (pdfGenerating.value) return;
  pdfGenerating.value = true;
  try {
    const [{ default: jsPDF }, autoTableModule] = await Promise.all([
      import("jspdf"),
      import("jspdf-autotable"),
    ]);
    const autoTable = autoTableModule.default;

    const doc = new jsPDF({ unit: "mm", format: "a4" });
    const pageW = doc.internal.pageSize.getWidth();
    const margin = 14;
    const accent: [number, number, number] = [74, 138, 104]; // brand accent green
    const slateDark: [number, number, number] = [51, 65, 85];
    const slateMid: [number, number, number] = [100, 116, 139];
    const slateLight: [number, number, number] = [241, 245, 249];

    /* ── Header ── */
    doc.setFont("helvetica", "bold");
    doc.setFontSize(20);
    doc.setTextColor(...slateDark);
    doc.text("Church Dues Report", margin, 20);

    doc.setFont("helvetica", "normal");
    doc.setFontSize(10);
    doc.setTextColor(...slateMid);
    doc.text(
      `Year ${year.value}  ·  Generated ${new Date().toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" })}`,
      margin,
      27,
    );

    doc.setDrawColor(...accent);
    doc.setLineWidth(0.8);
    doc.line(margin, 31, pageW - margin, 31);

    /* ── Summary cards ── */
    const cardY = 38;
    const cardH = 22;
    const gap = 4;
    const cardW = (pageW - margin * 2 - gap * 3) / 4;
    const cards = [
      {
        label: "TOTAL COLLECTED",
        value: `GH₵ ${fmt(analytics.value.totalCollected)}`,
      },
      { label: "AVG / WEEK", value: `GH₵ ${fmt(analytics.value.avgPerWeek)}` },
      {
        label: "BEST MONTH",
        value: `${analytics.value.bestMonth?.label ?? "—"}`,
      },
      { label: "PAYMENTS", value: `${analytics.value.totalPayments}` },
    ];
    cards.forEach((c, i) => {
      const x = margin + i * (cardW + gap);
      doc.setFillColor(...slateLight);
      doc.roundedRect(x, cardY, cardW, cardH, 2, 2, "F");
      doc.setFont("helvetica", "normal");
      doc.setFontSize(7.5);
      doc.setTextColor(...slateMid);
      doc.text(c.label, x + 3, cardY + 7);
      doc.setFont("helvetica", "bold");
      doc.setFontSize(13);
      doc.setTextColor(...slateDark);
      doc.text(c.value, x + 3, cardY + 16);
    });

    /* ── Compliance strip ── */
    const compY = cardY + cardH + 8;
    doc.setFont("helvetica", "bold");
    doc.setFontSize(11);
    doc.setTextColor(...slateDark);
    doc.text("Compliance", margin, compY);
    doc.setFont("helvetica", "normal");
    doc.setFontSize(9.5);
    doc.setTextColor(34, 139, 87);
    doc.text(`● Up to date: ${summary.value.upToDate}`, margin, compY + 6);
    doc.setTextColor(217, 119, 6);
    doc.text(`● Behind: ${summary.value.behind}`, margin + 48, compY + 6);
    doc.setTextColor(220, 38, 38);
    doc.text(
      `● No payments: ${summary.value.noPayments}`,
      margin + 90,
      compY + 6,
    );

    /* ── Monthly collections table ── */
    let y = compY + 14;
    doc.setFont("helvetica", "bold");
    doc.setFontSize(12);
    doc.setTextColor(...slateDark);
    doc.text("Monthly Collections", margin, y);
    y += 3;

    const maxMonth = Math.max(
      ...(analytics.value.monthly ?? []).map((m) => m.total),
      1,
    );
    autoTable(doc, {
      startY: y,
      margin: { left: margin, right: margin },
      head: [["Month", "Total (GH₵)", "Payments", "Trend"]],
      body: (analytics.value.monthly ?? []).map((m) => [
        m.label,
        fmt(m.total),
        String(m.count),
        "",
      ]),
      theme: "plain",
      styles: {
        fontSize: 8.5,
        textColor: slateDark,
        cellPadding: { top: 1.6, bottom: 1.6, left: 2, right: 2 },
      },
      headStyles: {
        fillColor: accent,
        textColor: [255, 255, 255],
        fontStyle: "bold",
        fontSize: 8.5,
      },
      alternateRowStyles: { fillColor: slateLight },
      columnStyles: {
        0: { cellWidth: 28 },
        1: { cellWidth: 28, halign: "right" },
        2: { cellWidth: 28, halign: "right" },
        3: { cellWidth: "auto" },
      },
      didDrawCell: (data) => {
        if (data.section === "body" && data.column.index === 3) {
          const m = (analytics.value.monthly ?? [])[data.row.index];
          const pct = m ? m.total / maxMonth : 0;
          const barMaxW = data.cell.width - 4;
          const barW = Math.max(pct * barMaxW, m?.total > 0 ? 1.2 : 0);
          const barH = 2.6;
          const by = data.cell.y + (data.cell.height - barH) / 2;
          doc.setFillColor(...accent);
          if (barW > 0)
            doc.roundedRect(data.cell.x + 2, by, barW, barH, 1, 1, "F");
        }
      },
    });

    /* ── Payment methods table ── */
    y = (doc as any).lastAutoTable.finalY + 10;
    if (y > 250) {
      doc.addPage();
      y = 20;
    }
    doc.setFont("helvetica", "bold");
    doc.setFontSize(12);
    doc.setTextColor(...slateDark);
    doc.text("Payment Methods", margin, y);
    y += 3;

    const methodTotal =
      (analytics.value.byMethod ?? []).reduce((s, m) => s + m.total, 0) || 1;
    autoTable(doc, {
      startY: y,
      margin: { left: margin, right: margin },
      head: [["Method", "Total (GH₵)", "Payments", "% of Total"]],
      body: (analytics.value.byMethod ?? []).map((m) => [
        m.label,
        fmt(m.total),
        String(m.count),
        `${Math.round((m.total / methodTotal) * 100)}%`,
      ]),
      theme: "plain",
      styles: {
        fontSize: 8.5,
        textColor: slateDark,
        cellPadding: { top: 1.6, bottom: 1.6, left: 2, right: 2 },
      },
      headStyles: {
        fillColor: accent,
        textColor: [255, 255, 255],
        fontStyle: "bold",
        fontSize: 8.5,
      },
      alternateRowStyles: { fillColor: slateLight },
      columnStyles: {
        1: { halign: "right" },
        2: { halign: "right" },
        3: { halign: "right" },
      },
    });

    /* ── Officer breakdown table ── */
    y = (doc as any).lastAutoTable.finalY + 10;
    if (y > 250) {
      doc.addPage();
      y = 20;
    }
    doc.setFont("helvetica", "bold");
    doc.setFontSize(12);
    doc.setTextColor(...slateDark);
    doc.text("Officer Breakdown", margin, y);
    y += 3;

    autoTable(doc, {
      startY: y,
      margin: { left: margin, right: margin },
      head: [
        [
          "Name",
          "Role",
          "Total Paid (GH₵)",
          "Weeks Paid",
          "Last Week",
          "Status",
        ],
      ],
      body: filtered.value.map((r) => [
        r.officer.full_name,
        r.officer.role ?? "—",
        fmt(r.total_paid),
        `${r.weeks_paid}/${weeksElapsed.value}`,
        r.last_payment ? `Week ${r.last_payment}` : "—",
        statusLabel(r.status),
      ]),
      theme: "plain",
      styles: {
        fontSize: 8.5,
        textColor: slateDark,
        cellPadding: { top: 1.6, bottom: 1.6, left: 2, right: 2 },
      },
      headStyles: {
        fillColor: accent,
        textColor: [255, 255, 255],
        fontStyle: "bold",
        fontSize: 8.5,
      },
      alternateRowStyles: { fillColor: slateLight },
      columnStyles: {
        2: { halign: "right" },
        3: { halign: "right" },
        4: { halign: "right" },
      },
      didParseCell: (data) => {
        if (data.section === "body" && data.column.index === 5) {
          const status = filtered.value[data.row.index]?.status;
          if (status === "up_to_date")
            data.cell.styles.textColor = [22, 101, 52];
          else if (status === "behind")
            data.cell.styles.textColor = [180, 83, 9];
          else data.cell.styles.textColor = [185, 28, 28];
          data.cell.styles.fontStyle = "bold";
        }
      },
      foot: [["Totals", "", `GH₵ ${fmt(filteredTotal.value)}`, "", "", ""]],
      footStyles: {
        fillColor: slateLight,
        textColor: slateDark,
        fontStyle: "bold",
        fontSize: 8.5,
      },
      didDrawPage: () => {
        const pageCount = doc.getNumberOfPages();
        doc.setFont("helvetica", "normal");
        doc.setFontSize(8);
        doc.setTextColor(...slateMid);
        doc.text(
          `Page ${doc.getCurrentPageInfo().pageNumber} of ${pageCount}`,
          pageW - margin,
          doc.internal.pageSize.getHeight() - 8,
          { align: "right" },
        );
        doc.text(
          "Church Dues Tracker",
          margin,
          doc.internal.pageSize.getHeight() - 8,
        );
      },
    });

    doc.save(`dues-report-${year.value}.pdf`);
    toast.success("PDF report downloaded");
  } catch (e: any) {
    toast.error(e?.message || "Failed to generate PDF");
  } finally {
    pdfGenerating.value = false;
  }
};

const exportJSON = async () => {
  const { data: payments } = await getAllPaymentsForYear(year.value);
  const payload = {
    exportedAt: new Date().toISOString(),
    year: year.value,
    summary: {
      totalCollected: analytics.value.totalCollected,
      totalPayments: analytics.value.totalPayments,
      avgPerWeek: analytics.value.avgPerWeek,
      officerBreakdown: filtered.value,
    },
    monthly: analytics.value.monthly,
    byMethod: analytics.value.byMethod,
    payments: (payments ?? []).map((p) => ({
      id: p.id,
      officer: p.officer?.full_name,
      role: p.officer?.role,
      weekStart: p.week_start,
      amount: Number(p.amount),
      method: p.payment_method ?? "cash",
      paidAt: p.paid_at,
      notes: p.notes,
    })),
  };
  const blob = new Blob([JSON.stringify(payload, null, 2)], {
    type: "application/json",
  });
  const a = document.createElement("a");
  a.href = URL.createObjectURL(blob);
  a.download = `dues-export-${year.value}.json`;
  a.click();
  URL.revokeObjectURL(a.href);
};

const downloadCSV = (rows: (string | number)[][], name: string) => {
  const csv = rows
    .map((row) =>
      row.map((c) => `"${String(c ?? "").replace(/"/g, '""')}"`).join(","),
    )
    .join("\n");
  const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
  const a = document.createElement("a");
  a.href = URL.createObjectURL(blob);
  a.download = `${name}.csv`;
  a.click();
  URL.revokeObjectURL(a.href);
};

// Close export dropdown on outside click
onMounted(() => {
  document.addEventListener("click", (e) => {
    if (exportRef.value && !exportRef.value.contains(e.target as Node)) {
      exportOpen.value = false;
    }
  });
  generate();
});
</script>
