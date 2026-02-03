import { defineComponent, ref, computed, unref, useSSRContext } from 'vue';
import { ssrRenderAttrs, ssrRenderList, ssrRenderAttr, ssrIncludeBooleanAttr, ssrLooseContain, ssrLooseEqual, ssrInterpolate, ssrRenderClass } from 'vue/server-renderer';
import { u as useDues } from './useDues-DE7IVH5r.mjs';
import 'date-fns';
import './useSupabaseClient-DxYTVa8G.mjs';
import './server.mjs';
import '../nitro/nitro.mjs';
import 'node:http';
import 'node:https';
import 'node:events';
import 'node:buffer';
import 'node:fs';
import 'node:path';
import 'node:crypto';
import 'node:url';
import '../routes/renderer.mjs';
import 'vue-bundle-renderer/runtime';
import 'unhead/server';
import 'devalue';
import 'unhead/utils';
import 'vue-router';
import '@supabase/ssr';

const _sfc_main = /* @__PURE__ */ defineComponent({
  __name: "reports",
  __ssrInlineRender: true,
  setup(__props) {
    useDues();
    const currentYear = (/* @__PURE__ */ new Date()).getFullYear();
    const years = Array.from({ length: 5 }, (_, i) => currentYear - i);
    const year = ref(currentYear);
    const statusFilter = ref("all");
    const data = ref([]);
    const loading = ref(true);
    const filtered = computed(() => {
      if (statusFilter.value === "all") return data.value;
      return data.value.filter((r) => r.status === statusFilter.value);
    });
    const summary = computed(() => ({
      total: data.value.reduce((s, r) => s + r.total_paid, 0).toFixed(2),
      upToDate: data.value.filter((r) => r.status === "up_to_date").length,
      behind: data.value.filter((r) => r.status === "behind").length,
      noPayments: data.value.filter((r) => r.status === "no_payments").length
    }));
    const statusLabel = (s) => ({ up_to_date: "Up to date", behind: "Behind", no_payments: "No payments" })[s] ?? s;
    return (_ctx, _push, _parent, _attrs) => {
      _push(`<div${ssrRenderAttrs(_attrs)}><header class="mb-6"><h1 class="font-display font-bold text-3xl text-slate-800">Reports</h1><p class="text-slate-600 mt-1">Payment status by officer</p></header><div class="card p-4 mb-6 flex flex-wrap gap-4 items-end"><div><label class="block text-xs font-medium text-slate-500 mb-1">Year</label><select class="input-base py-2 w-28"><!--[-->`);
      ssrRenderList(unref(years), (y) => {
        _push(`<option${ssrRenderAttr("value", y)}${ssrIncludeBooleanAttr(Array.isArray(unref(year)) ? ssrLooseContain(unref(year), y) : ssrLooseEqual(unref(year), y)) ? " selected" : ""}>${ssrInterpolate(y)}</option>`);
      });
      _push(`<!--]--></select></div><div><label class="block text-xs font-medium text-slate-500 mb-1">Status</label><select class="input-base py-2 w-36"><option value="all"${ssrIncludeBooleanAttr(Array.isArray(unref(statusFilter)) ? ssrLooseContain(unref(statusFilter), "all") : ssrLooseEqual(unref(statusFilter), "all")) ? " selected" : ""}>All</option><option value="up_to_date"${ssrIncludeBooleanAttr(Array.isArray(unref(statusFilter)) ? ssrLooseContain(unref(statusFilter), "up_to_date") : ssrLooseEqual(unref(statusFilter), "up_to_date")) ? " selected" : ""}>Up to date</option><option value="behind"${ssrIncludeBooleanAttr(Array.isArray(unref(statusFilter)) ? ssrLooseContain(unref(statusFilter), "behind") : ssrLooseEqual(unref(statusFilter), "behind")) ? " selected" : ""}>Behind</option><option value="no_payments"${ssrIncludeBooleanAttr(Array.isArray(unref(statusFilter)) ? ssrLooseContain(unref(statusFilter), "no_payments") : ssrLooseEqual(unref(statusFilter), "no_payments")) ? " selected" : ""}>No payments</option></select></div><button type="button" class="btn-secondary py-2">Refresh</button><button type="button" class="btn-primary py-2">Export CSV</button></div><div class="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6"><div class="card p-4"><p class="text-sm text-slate-500">Total</p><p class="text-xl font-bold text-accent-600">$${ssrInterpolate(unref(summary).total)}</p></div><div class="card p-4"><p class="text-sm text-slate-500">Up to date</p><p class="text-xl font-bold text-accent-600">${ssrInterpolate(unref(summary).upToDate)}</p></div><div class="card p-4"><p class="text-sm text-slate-500">Behind</p><p class="text-xl font-bold text-amber-600">${ssrInterpolate(unref(summary).behind)}</p></div><div class="card p-4"><p class="text-sm text-slate-500">No payments</p><p class="text-xl font-bold text-red-600">${ssrInterpolate(unref(summary).noPayments)}</p></div></div><div class="card overflow-hidden">`);
      if (unref(loading)) {
        _push(`<div class="p-12 text-center"><div class="animate-spin w-10 h-10 border-2 border-accent-500 border-t-transparent rounded-full mx-auto"></div></div>`);
      } else if (unref(filtered).length === 0) {
        _push(`<div class="p-12 text-center text-slate-500"> No data </div>`);
      } else {
        _push(`<div class="overflow-x-auto"><table class="min-w-full"><thead class="bg-slate-50 border-b border-slate-100"><tr><th class="px-4 py-3 text-left text-xs font-semibold text-slate-500 uppercase">Officer</th><th class="px-4 py-3 text-left text-xs font-semibold text-slate-500 uppercase">Total</th><th class="px-4 py-3 text-left text-xs font-semibold text-slate-500 uppercase">Weeks</th><th class="px-4 py-3 text-left text-xs font-semibold text-slate-500 uppercase">Last</th><th class="px-4 py-3 text-left text-xs font-semibold text-slate-500 uppercase">Status</th></tr></thead><tbody class="divide-y divide-slate-100"><!--[-->`);
        ssrRenderList(unref(filtered), (r) => {
          _push(`<tr class="hover:bg-slate-50/50"><td class="px-4 py-3"><p class="font-medium text-slate-800">${ssrInterpolate(r.officer.full_name)}</p><p class="text-sm text-slate-500">${ssrInterpolate(r.officer.email)}</p></td><td class="px-4 py-3 font-semibold text-slate-800">$${ssrInterpolate(r.total_paid)}</td><td class="px-4 py-3 text-slate-600">${ssrInterpolate(r.weeks_paid)}</td><td class="px-4 py-3 text-slate-600">${ssrInterpolate(r.last_payment ? `Week ${r.last_payment}` : "—")}</td><td class="px-4 py-3"><span class="${ssrRenderClass([{
            "bg-accent-100 text-accent-800": r.status === "up_to_date",
            "bg-amber-100 text-amber-800": r.status === "behind",
            "bg-red-100 text-red-800": r.status === "no_payments"
          }, "px-2 py-0.5 rounded-full text-xs font-semibold"])}">${ssrInterpolate(statusLabel(r.status))}</span></td></tr>`);
        });
        _push(`<!--]--></tbody></table></div>`);
      }
      _push(`</div></div>`);
    };
  }
});
const _sfc_setup = _sfc_main.setup;
_sfc_main.setup = (props, ctx) => {
  const ssrContext = useSSRContext();
  (ssrContext.modules || (ssrContext.modules = /* @__PURE__ */ new Set())).add("pages/reports.vue");
  return _sfc_setup ? _sfc_setup(props, ctx) : void 0;
};

export { _sfc_main as default };
//# sourceMappingURL=reports-Dh0_2Pj6.mjs.map
