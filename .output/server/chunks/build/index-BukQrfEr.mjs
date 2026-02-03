import { _ as __nuxt_component_0 } from './nuxt-link-CLZ_2xfO.mjs';
import { _ as __nuxt_component_1 } from './PaymentEditModal-DyKcQVEv.mjs';
import { defineComponent, ref, unref, withCtx, createVNode, createTextVNode, useSSRContext } from 'vue';
import { ssrRenderAttrs, ssrInterpolate, ssrRenderComponent, ssrRenderList, ssrRenderClass } from 'vue/server-renderer';
import { u as useDues } from './useDues-DE7IVH5r.mjs';
import { u as useOfficers } from './useOfficers-DNs0Ja1_.mjs';
import '../nitro/nitro.mjs';
import 'node:http';
import 'node:https';
import 'node:events';
import 'node:buffer';
import 'node:fs';
import 'node:path';
import 'node:crypto';
import 'node:url';
import './server.mjs';
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
  __name: "index",
  __ssrInlineRender: true,
  setup(__props) {
    const { getOfficersWithWeeklyStatus, getRecentPayments } = useDues();
    useOfficers();
    const currentWeek = ref(0);
    const totalThisWeek = ref(0);
    const paidCount = ref(0);
    const officersCount = ref(0);
    const officersWithStatus = ref([]);
    const recentPayments = ref([]);
    const loading = ref(true);
    const editingPayment = ref(null);
    const handlePaymentEdited = () => {
      editingPayment.value = null;
      const load = async () => {
        const [statusData, { data: payments }] = await Promise.all([
          getOfficersWithWeeklyStatus(),
          getRecentPayments(5)
        ]);
        officersWithStatus.value = statusData;
        recentPayments.value = payments ?? [];
        paidCount.value = statusData.filter((s) => s.paidThisWeek).length;
        totalThisWeek.value = statusData.filter((s) => s.paidThisWeek && s.amount).reduce((sum, s) => sum + Number(s.amount), 0).toFixed(2);
      };
      load();
    };
    const formatWeekRange = () => {
      const now = /* @__PURE__ */ new Date();
      const mon = new Date(now);
      mon.setDate(now.getDate() - now.getDay() + (now.getDay() === 0 ? -6 : 1));
      const sun = new Date(mon);
      sun.setDate(mon.getDate() + 6);
      return `${mon.toLocaleDateString("en-US", { month: "short", day: "numeric" })} – ${sun.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}`;
    };
    const formatDate = (d) => {
      if (!d) return "-";
      return new Date(d).toLocaleDateString("en-US", { month: "short", day: "numeric", hour: "2-digit", minute: "2-digit" });
    };
    return (_ctx, _push, _parent, _attrs) => {
      const _component_NuxtLink = __nuxt_component_0;
      const _component_PaymentEditModal = __nuxt_component_1;
      _push(`<div${ssrRenderAttrs(_attrs)}><header class="mb-6 md:mb-8"><h1 class="font-display font-bold text-2xl md:text-3xl text-slate-800">Dashboard</h1><p class="text-slate-600 mt-1 text-sm">Week ${ssrInterpolate(unref(currentWeek))} • ${ssrInterpolate(formatWeekRange())}</p></header><div class="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4 mb-6 md:mb-8"><div class="card p-4 md:p-5"><p class="text-xs md:text-sm font-medium text-slate-500">This Week</p><p class="text-xl md:text-2xl font-bold text-slate-800 mt-0.5">$${ssrInterpolate(unref(totalThisWeek))}</p></div><div class="card p-4 md:p-5"><p class="text-xs md:text-sm font-medium text-slate-500">Collected</p><p class="text-xl md:text-2xl font-bold text-accent-600 mt-0.5">${ssrInterpolate(unref(paidCount))}/${ssrInterpolate(unref(officersCount))}</p></div><div class="card p-4 md:p-5"><p class="text-xs md:text-sm font-medium text-slate-500">Pending</p><p class="text-xl md:text-2xl font-bold text-amber-600 mt-0.5">${ssrInterpolate(unref(officersCount) - unref(paidCount))}</p></div><div class="card p-4 md:p-5">`);
      _push(ssrRenderComponent(_component_NuxtLink, {
        to: "/collect",
        class: "block"
      }, {
        default: withCtx((_, _push2, _parent2, _scopeId) => {
          if (_push2) {
            _push2(`<p class="text-xs md:text-sm font-medium text-slate-500"${_scopeId}>Quick action</p><p class="text-base md:text-lg font-bold text-accent-600 mt-0.5"${_scopeId}>Record payment →</p>`);
          } else {
            return [
              createVNode("p", { class: "text-xs md:text-sm font-medium text-slate-500" }, "Quick action"),
              createVNode("p", { class: "text-base md:text-lg font-bold text-accent-600 mt-0.5" }, "Record payment →")
            ];
          }
        }),
        _: 1
      }, _parent));
      _push(`</div></div><div class="grid lg:grid-cols-3 gap-6"><div class="lg:col-span-2 card"><div class="p-4 border-b border-slate-100 flex items-center justify-between"><h2 class="font-semibold text-slate-800">Collect This Week</h2>`);
      _push(ssrRenderComponent(_component_NuxtLink, {
        to: "/collect",
        class: "btn-primary text-sm py-2 px-3"
      }, {
        default: withCtx((_, _push2, _parent2, _scopeId) => {
          if (_push2) {
            _push2(`Quick Collect`);
          } else {
            return [
              createTextVNode("Quick Collect")
            ];
          }
        }),
        _: 1
      }, _parent));
      _push(`</div><div class="max-h-[340px] md:max-h-[380px] overflow-y-auto">`);
      if (unref(loading)) {
        _push(`<div class="p-8 text-center"><div class="animate-spin w-8 h-8 border-2 border-accent-500 border-t-transparent rounded-full mx-auto"></div></div>`);
      } else if (unref(officersWithStatus).length === 0) {
        _push(`<div class="p-8 text-center text-slate-500"> No officers yet. Add officers first. </div>`);
      } else {
        _push(`<div class="divide-y divide-slate-100"><!--[-->`);
        ssrRenderList(unref(officersWithStatus), (item) => {
          _push(`<div class="flex items-center justify-between px-4 py-3 hover:bg-slate-50/50 transition"><div class="flex items-center gap-3"><div class="${ssrRenderClass([item.paidThisWeek ? "bg-accent-500" : "bg-amber-400", "w-3 h-3 rounded-full shrink-0"])}"></div><div><p class="font-medium text-slate-800">${ssrInterpolate(item.officer.full_name)}</p><p class="text-sm text-slate-500">${ssrInterpolate(item.officer.role)}</p></div></div><div class="flex items-center gap-3">`);
          if (item.paidThisWeek) {
            _push(`<span class="text-sm font-semibold text-accent-600"> $${ssrInterpolate(item.amount ?? 0)} ✓ </span>`);
          } else {
            _push(ssrRenderComponent(_component_NuxtLink, {
              to: `/collect?officer=${item.officer.id}`,
              class: "btn-primary text-sm py-1.5 px-3"
            }, {
              default: withCtx((_, _push2, _parent2, _scopeId) => {
                if (_push2) {
                  _push2(` Collect `);
                } else {
                  return [
                    createTextVNode(" Collect ")
                  ];
                }
              }),
              _: 2
            }, _parent));
          }
          _push(`</div></div>`);
        });
        _push(`<!--]--></div>`);
      }
      _push(`</div></div><div class="card"><div class="p-4 border-b border-slate-100"><h2 class="font-semibold text-slate-800">Recent Payments</h2></div><div class="p-4 space-y-3 max-h-[340px] md:max-h-[380px] overflow-y-auto">`);
      if (unref(loading)) {
        _push(`<div class="text-center py-6"><div class="animate-spin w-6 h-6 border-2 border-accent-500 border-t-transparent rounded-full mx-auto"></div></div>`);
      } else if (unref(recentPayments).length === 0) {
        _push(`<div class="text-center py-6 text-slate-500 text-sm"> No payments yet </div>`);
      } else {
        _push(`<!--[-->`);
        ssrRenderList(unref(recentPayments), (p) => {
          _push(`<div class="flex justify-between items-center p-3 rounded-xl bg-accent-50 border border-accent-100 group"><div><p class="font-medium text-slate-800">${ssrInterpolate(p.officer?.full_name || "Unknown")}</p><p class="text-xs text-slate-500">${ssrInterpolate(formatDate(p.paid_at))}</p></div><div class="flex items-center gap-2"><span class="font-bold text-accent-700">$${ssrInterpolate(p.amount)}</span><button type="button" class="opacity-0 group-hover:opacity-100 md:opacity-70 p-1.5 rounded-lg hover:bg-accent-100 text-slate-500 hover:text-accent-600 transition" aria-label="Edit payment"><svg xmlns="http://www.w3.org/2000/svg" class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z"></path></svg></button></div></div>`);
        });
        _push(`<!--]-->`);
      }
      _push(`</div></div></div>`);
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
  (ssrContext.modules || (ssrContext.modules = /* @__PURE__ */ new Set())).add("pages/index.vue");
  return _sfc_setup ? _sfc_setup(props, ctx) : void 0;
};

export { _sfc_main as default };
//# sourceMappingURL=index-BukQrfEr.mjs.map
