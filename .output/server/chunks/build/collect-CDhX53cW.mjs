import { _ as __nuxt_component_1 } from './PaymentEditModal-DyKcQVEv.mjs';
import { defineComponent, ref, computed, watch, unref, useSSRContext } from 'vue';
import { ssrRenderAttrs, ssrRenderList, ssrRenderAttr, ssrIncludeBooleanAttr, ssrLooseContain, ssrLooseEqual, ssrInterpolate, ssrRenderClass, ssrRenderTeleport, ssrRenderComponent } from 'vue/server-renderer';
import { a as useRoute } from './server.mjs';
import { u as useDues } from './useDues-DE7IVH5r.mjs';
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
import 'date-fns';
import './useSupabaseClient-DxYTVa8G.mjs';

const _sfc_main = /* @__PURE__ */ defineComponent({
  __name: "collect",
  __ssrInlineRender: true,
  setup(__props) {
    useRoute();
    const { getWeekNumber, getWeekStartDate, getOfficersWithWeeklyStatus } = useDues();
    const currentWeek = getWeekNumber();
    const currentYear = (/* @__PURE__ */ new Date()).getFullYear();
    const selectedWeek = ref(currentWeek);
    const selectedYear = ref(currentYear);
    const officersWithStatus = ref([]);
    const search = ref("");
    const loading = ref(true);
    const submitting = ref(null);
    const customOfficer = ref(null);
    const customAmount = ref(0);
    ref(null);
    const editingPayment = ref(null);
    const yearOptions = computed(() => {
      const y = currentYear;
      return Array.from({ length: 11 }, (_, i) => y - 5 + i);
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
      return officersWithStatus.value.filter(
        (o) => o.officer.full_name.toLowerCase().includes(q)
      );
    });
    const defaultAmount = (officer) => Number(officer.monthly_dues) > 0 ? officer.monthly_dues : 10;
    const quickAmounts = (officer) => {
      const def = defaultAmount(officer);
      const set = new Set([5, 10, 20, 50, def].sort((a, b) => a - b));
      return Array.from(set).slice(0, 4);
    };
    const handlePaymentEdited = () => {
      editingPayment.value = null;
      load();
    };
    const load = async () => {
      officersWithStatus.value = await getOfficersWithWeeklyStatus(selectedWeek.value, selectedYear.value);
    };
    watch([selectedWeek, selectedYear], load);
    return (_ctx, _push, _parent, _attrs) => {
      const _component_PaymentEditModal = __nuxt_component_1;
      _push(`<div${ssrRenderAttrs(_attrs)}><header class="mb-6"><h1 class="font-display font-bold text-2xl md:text-3xl text-slate-800">Quick Collect</h1><p class="text-slate-600 mt-1 text-sm md:text-base">Tap to record — pay current or future weeks</p></header><div class="flex flex-wrap items-center gap-3 mb-6"><div><label class="block text-xs font-medium text-slate-500 mb-0.5">Year</label><select class="input-base py-2 w-auto min-w-[90px]"><!--[-->`);
      ssrRenderList(unref(yearOptions), (y) => {
        _push(`<option${ssrRenderAttr("value", y)}${ssrIncludeBooleanAttr(Array.isArray(unref(selectedYear)) ? ssrLooseContain(unref(selectedYear), y) : ssrLooseEqual(unref(selectedYear), y)) ? " selected" : ""}>${ssrInterpolate(y)}</option>`);
      });
      _push(`<!--]--></select></div><div><label class="block text-xs font-medium text-slate-500 mb-0.5">Week</label><select class="input-base py-2 w-auto min-w-[140px]"><!--[-->`);
      ssrRenderList(unref(weekOptions), (w) => {
        _push(`<option${ssrRenderAttr("value", w.value)}${ssrIncludeBooleanAttr(Array.isArray(unref(selectedWeek)) ? ssrLooseContain(unref(selectedWeek), w.value) : ssrLooseEqual(unref(selectedWeek), w.value)) ? " selected" : ""}>${ssrInterpolate(w.label)}</option>`);
      });
      _push(`<!--]--></select></div><span class="text-sm text-slate-500 self-end pb-2">${ssrInterpolate(unref(weekLabel))}</span></div><div class="mb-6"><input${ssrRenderAttr("value", unref(search))} type="search" placeholder="Search by name..." class="input-base"></div>`);
      if (unref(loading)) {
        _push(`<div class="flex justify-center py-16"><div class="animate-spin w-10 h-10 border-2 border-accent-500 border-t-transparent rounded-full"></div></div>`);
      } else if (unref(filteredOfficers).length === 0) {
        _push(`<div class="card p-12 text-center text-slate-500"> No officers found. Add officers first or clear your search. </div>`);
      } else {
        _push(`<div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4"><!--[-->`);
        ssrRenderList(unref(filteredOfficers), (item) => {
          _push(`<div class="${ssrRenderClass([item.paidThisWeek ? "ring-2 ring-accent-400" : "", "card overflow-hidden transition hover:shadow-card-hover"])}"><div class="p-4"><div class="flex items-start justify-between gap-3"><div class="min-w-0 flex-1"><p class="font-semibold text-slate-800 truncate">${ssrInterpolate(item.officer.full_name)}</p><p class="text-sm text-slate-500">${ssrInterpolate(item.officer.role)}</p></div><div class="${ssrRenderClass([item.paidThisWeek ? "bg-accent-500" : "bg-amber-400", "w-2.5 h-2.5 rounded-full shrink-0 mt-1.5"])}"></div></div>`);
          if (item.paidThisWeek) {
            _push(`<div class="mt-4 pt-4 border-t border-slate-100 flex items-center justify-between"><p class="text-sm text-accent-600 font-semibold">Paid $${ssrInterpolate(item.amount ?? 0)}</p><button type="button" class="text-xs text-slate-500 hover:text-accent-600 font-medium"> Edit </button></div>`);
          } else {
            _push(`<div class="mt-4 flex flex-col gap-2"><div class="flex gap-2 flex-wrap"><!--[-->`);
            ssrRenderList(quickAmounts(item.officer), (amt) => {
              _push(`<button type="button"${ssrIncludeBooleanAttr(unref(submitting) === item.officer.id) ? " disabled" : ""} class="${ssrRenderClass([amt === defaultAmount(item.officer) ? "bg-accent-500 text-white hover:bg-accent-600" : "bg-slate-100 text-slate-700 hover:bg-slate-200", "flex-1 min-w-[60px] py-2 px-3 rounded-lg font-semibold text-sm transition"])}"> $${ssrInterpolate(amt)}</button>`);
            });
            _push(`<!--]--></div><button type="button" class="w-full py-2 text-sm text-slate-600 hover:text-slate-800 font-medium"> Custom amount </button></div>`);
          }
          _push(`</div></div>`);
        });
        _push(`<!--]--></div>`);
      }
      ssrRenderTeleport(_push, (_push2) => {
        if (unref(customOfficer)) {
          _push2(`<div class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm"><div class="card w-full max-w-sm p-6 shadow-2xl"><h3 class="font-display font-semibold text-lg text-slate-800 mb-4">${ssrInterpolate(unref(customOfficer).full_name)} — Custom amount </h3><p class="text-xs text-slate-500 mb-2">Week ${ssrInterpolate(unref(selectedWeek))}, ${ssrInterpolate(unref(selectedYear))}</p><input${ssrRenderAttr("value", unref(customAmount))} type="number" step="0.01" min="0" placeholder="0.00" class="input-base mb-4"><div class="flex gap-3"><button type="button" class="btn-primary flex-1"> Record $${ssrInterpolate(unref(customAmount) || 0)}</button><button type="button" class="btn-secondary">Cancel</button></div></div></div>`);
        } else {
          _push2(`<!---->`);
        }
      }, "body", false, _parent);
      if (unref(editingPayment)) {
        _push(ssrRenderComponent(_component_PaymentEditModal, {
          payment: unref(editingPayment),
          onClose: ($event) => editingPayment.value = null,
          onSaved: handlePaymentEdited
        }, null, _parent));
      } else {
        _push(`<!---->`);
      }
      _push(`</div>`);
    };
  }
});
const _sfc_setup = _sfc_main.setup;
_sfc_main.setup = (props, ctx) => {
  const ssrContext = useSSRContext();
  (ssrContext.modules || (ssrContext.modules = /* @__PURE__ */ new Set())).add("pages/collect.vue");
  return _sfc_setup ? _sfc_setup(props, ctx) : void 0;
};

export { _sfc_main as default };
//# sourceMappingURL=collect-CDhX53cW.mjs.map
