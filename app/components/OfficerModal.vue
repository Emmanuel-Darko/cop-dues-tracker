<template>
  <Teleport to="body">
    <div
      class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50"
      @click.self="$emit('close')"
    >
      <div class="card w-full max-w-md p-6" @click.stop>
        <h2 class="font-display font-bold text-xl text-slate-800 mb-5">
          {{ officer?.id ? "Edit Officer" : "Add Officer" }}
        </h2>
        <form @submit.prevent="save" class="space-y-4">
          <div>
            <label class="block text-sm font-medium text-slate-700 mb-1"
              >Full name *</label
            >
            <input
              v-model="form.full_name"
              type="text"
              required
              class="input-base"
              placeholder="John Doe"
            />
          </div>
          <div>
            <label class="block text-sm font-medium text-slate-700 mb-1"
              >Role</label
            >
            <select v-model="form.role" class="input-base">
              <option value="Elder">Elder</option>
              <option value="Deacon">Deacon</option>
              <option value="Deaconess">Deaconess</option>
            </select>
          </div>
          <div>
            <label class="block text-sm font-medium text-slate-700 mb-1"
              >Email</label
            >
            <input
              v-model="form.email"
              type="email"
              class="input-base"
              placeholder="john@example.com"
            />
          </div>
          <div>
            <label class="block text-sm font-medium text-slate-700 mb-1"
              >Phone</label
            >
            <input
              v-model="form.phone"
              type="tel"
              class="input-base"
              placeholder="+1234567890"
            />
          </div>
          <div>
            <label class="block text-sm font-medium text-slate-700 mb-1"
              >Monthly dues (GH₵)</label
            >
            <input
              v-model.number="form.monthly_dues"
              type="number"
              step="0.01"
              min="0"
              class="input-base"
            />
          </div>
          <div v-if="officer?.id" class="flex items-center gap-2">
            <input
              id="active"
              v-model="form.is_active"
              type="checkbox"
              class="rounded border-slate-300"
            />
            <label for="active" class="text-sm text-slate-700">Active</label>
          </div>
          <div class="flex gap-3 pt-2">
            <button type="submit" :disabled="saving" class="btn-primary flex-1">
              {{ saving ? "Saving..." : "Save" }}
            </button>
            <button type="button" @click="$emit('close')" class="btn-secondary">
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  </Teleport>
</template>

<script setup lang="ts">
import type { Officer } from "~/composables/useOfficers";

const props = defineProps<{ officer: Officer | null }>();
const emit = defineEmits<{ close: []; saved: [] }>();
const { addOfficer, updateOfficer } = useOfficers();
const saving = ref(false);
const OFFICER_ROLES = ["Elder", "Deacon", "Deaconess"] as const;
const form = ref({
  full_name: "",
  role: "Deacon" as (typeof OFFICER_ROLES)[number],
  email: "",
  phone: "",
  monthly_dues: 0,
  is_active: true,
});

watch(
  () => props.officer,
  (o) => {
    if (o) {
      form.value = {
        full_name: o.full_name ?? "",
        role: OFFICER_ROLES.includes((o.role || "") as any) ? o.role : "Deacon",
        email: o.email ?? "",
        phone: o.phone ?? "",
        monthly_dues: o.monthly_dues ?? 0,
        is_active: o.is_active ?? true,
      };
    } else {
      form.value = {
        full_name: "",
        role: "Deacon",
        email: "",
        phone: "",
        monthly_dues: 0,
        is_active: true,
      };
    }
  },
  { immediate: true },
);

const save = async () => {
  saving.value = true;
  const payload = {
    full_name: form.value.full_name,
    role: form.value.role,
    email: form.value.email || null,
    phone: form.value.phone || null,
    monthly_dues: form.value.monthly_dues,
    is_active: form.value.is_active,
  };
  if (props.officer?.id) {
    const { error } = await updateOfficer(props.officer.id, payload);
    if (!error) emit("saved");
    saving.value = false;
  } else {
    const { error } = await addOfficer(payload);
    if (!error) emit("saved");
    saving.value = false;
  }
};
</script>
