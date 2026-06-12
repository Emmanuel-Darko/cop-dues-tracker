<template>
  <div>
    <header
      class="mb-6 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4"
    >
      <div>
        <h1 class="font-display font-bold text-3xl text-slate-800">Officers</h1>
        <p class="text-slate-500 mt-1 text-sm">
          {{ filtered.length }} of {{ officers.length }} members
        </p>
      </div>
      <button
        type="button"
        @click="openAdd"
        class="btn-primary w-full sm:w-auto text-center"
      >
        + Add Officer
      </button>
    </header>

    <!-- Search & filter bar -->
    <div class="card p-4 mb-4 flex flex-wrap gap-3 items-end">
      <div class="flex-1 min-w-[180px]">
        <label class="block text-xs font-medium text-slate-500 mb-1"
          >Search</label
        >
        <div class="relative">
          <svg
            class="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              stroke-width="2"
              d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
            />
          </svg>
          <input
            v-model="search"
            type="text"
            placeholder="Name, email, phone…"
            class="input-base pl-9 py-2"
          />
          <button
            v-if="search"
            @click="search = ''"
            class="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
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
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </button>
        </div>
      </div>
      <div>
        <label class="block text-xs font-medium text-slate-500 mb-1"
          >Role</label
        >
        <select v-model="roleFilter" class="input-base py-2 w-36">
          <option value="">All roles</option>
          <option v-for="r in availableRoles" :key="r" :value="r">
            {{ r }}
          </option>
        </select>
      </div>
      <div>
        <label class="block text-xs font-medium text-slate-500 mb-1"
          >Status</label
        >
        <select v-model="activeFilter" class="input-base py-2 w-32">
          <option value="active">Active only</option>
          <option value="all">All members</option>
          <option value="inactive">Inactive</option>
        </select>
      </div>
      <div>
        <label class="block text-xs font-medium text-slate-500 mb-1"
          >Sort by</label
        >
        <select v-model="sortBy" class="input-base py-2 w-36">
          <option value="name">Name (A–Z)</option>
          <option value="name_desc">Name (Z–A)</option>
          <option value="dues_desc">Dues (high–low)</option>
          <option value="dues_asc">Dues (low–high)</option>
          <option value="role">Role</option>
        </select>
      </div>
    </div>

    <!-- Table -->
    <div class="card overflow-hidden">
      <div v-if="loading" class="p-6 space-y-3">
        <div v-for="n in 6" :key="n" class="shimmer h-14 rounded-xl"></div>
      </div>
      <div v-else-if="filtered.length === 0" class="p-14 text-center">
        <svg
          class="w-12 h-12 mx-auto text-slate-300 mb-3"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            stroke-linecap="round"
            stroke-linejoin="round"
            stroke-width="1.5"
            d="M15 19.128a9.38 9.38 0 002.625.372 9.337 9.337 0 004.121-.952 4.125 4.125 0 00-7.533-2.493M15 19.128v-.003c0-1.113-.285-2.16-.786-3.07M15 19.128v.106A12.318 12.318 0 018.624 21c-2.331 0-4.512-.645-6.374-1.766l-.001-.109a6.375 6.375 0 0111.964-3.07M12 6.375a3.375 3.375 0 11-6.75 0 3.375 3.375 0 016.75 0zm8.25 2.25a2.625 2.625 0 11-5.25 0 2.625 2.625 0 015.25 0z"
          />
        </svg>
        <p class="text-slate-500 font-medium">
          {{
            search || roleFilter
              ? "No officers match your filters."
              : "No officers yet. Add your first officer."
          }}
        </p>
        <button
          v-if="search || roleFilter"
          @click="
            search = '';
            roleFilter = '';
          "
          class="mt-3 text-accent-600 text-sm font-medium hover:underline"
        >
          Clear filters
        </button>
      </div>
      <div v-else class="overflow-x-auto">
        <table class="min-w-full">
          <thead class="bg-slate-50 border-b border-slate-100">
            <tr>
              <th
                class="px-4 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wide"
              >
                Name
              </th>
              <th
                class="px-4 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wide"
              >
                Role
              </th>
              <th
                class="px-4 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wide hidden sm:table-cell"
              >
                Monthly Dues
              </th>
              <th
                class="px-4 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wide hidden md:table-cell"
              >
                Contact
              </th>
              <th
                class="px-4 py-3 text-right text-xs font-semibold text-slate-500 uppercase tracking-wide"
              >
                Actions
              </th>
            </tr>
          </thead>
          <tbody class="divide-y divide-slate-50">
            <tr
              v-for="o in filtered"
              :key="o.id"
              class="hover:bg-slate-50/60 transition group"
            >
              <td class="px-4 py-3">
                <div class="flex items-center gap-3">
                  <div
                    class="w-8 h-8 rounded-full bg-accent-100 text-accent-700 flex items-center justify-center text-sm font-bold shrink-0"
                  >
                    {{ o.full_name[0] }}
                  </div>
                  <div>
                    <p
                      class="font-medium text-slate-800 text-sm flex items-center gap-2"
                    >
                      {{ o.full_name }}
                      <span
                        v-if="!o.is_active"
                        class="px-1.5 py-0.5 rounded-full text-[10px] font-semibold bg-rose-100 text-rose-600"
                      >
                        Inactive
                      </span>
                    </p>
                  </div>
                </div>
              </td>
              <td class="px-4 py-3">
                <span
                  class="px-2 py-0.5 rounded-full text-xs font-medium bg-slate-100 text-slate-700"
                >
                  {{ o.role }}
                </span>
              </td>
              <td class="px-4 py-3 hidden sm:table-cell">
                <span class="font-semibold text-slate-800 text-sm"
                  >GH₵ {{ o.monthly_dues ?? 0 }}</span
                >
                <span class="text-slate-400 text-xs">/mo</span>
              </td>
              <td class="px-4 py-3 hidden md:table-cell text-sm text-slate-500">
                {{ o.email || o.phone || "—" }}
              </td>
              <td class="px-4 py-3 text-right">
                <div
                  class="flex items-center justify-end gap-1 opacity-70 group-hover:opacity-100 transition"
                >
                  <NuxtLink
                    :to="`/collect?officer=${o.id}`"
                    class="text-xs px-2 py-1 rounded-lg text-accent-600 hover:bg-accent-50 font-medium transition"
                  >
                    Collect
                  </NuxtLink>
                  <button
                    type="button"
                    @click="edit(o)"
                    class="text-xs px-2 py-1 rounded-lg text-slate-600 hover:bg-slate-100 font-medium transition"
                  >
                    Edit
                  </button>
                  <button
                    type="button"
                    @click="confirmDelete(o)"
                    class="text-xs px-2 py-1 rounded-lg text-red-500 hover:bg-red-50 font-medium transition"
                  >
                    Delete
                  </button>
                </div>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>

    <OfficerModal
      v-if="modalOpen"
      :officer="editing"
      @close="closeModal"
      @saved="handleSaved"
    />

    <!-- Custom delete confirm dialog -->
    <Teleport to="body">
      <div
        v-if="deletingOfficer"
        class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm"
        @click.self="deletingOfficer = null"
      >
        <div class="card w-full max-w-sm p-6 shadow-2xl" @click.stop>
          <div class="flex items-center gap-3 mb-4">
            <div
              class="w-10 h-10 rounded-full bg-red-100 flex items-center justify-center shrink-0"
            >
              <svg
                class="w-5 h-5 text-red-600"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  stroke-width="2"
                  d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.962-.833-2.732 0L4.082 16.5c-.77.833.192 2.5 1.732 2.5z"
                />
              </svg>
            </div>
            <div>
              <h3 class="font-display font-semibold text-slate-800">
                Delete officer?
              </h3>
              <p class="text-sm text-slate-500 mt-0.5">
                This will also remove all their payment history.
              </p>
            </div>
          </div>
          <p
            class="text-sm font-medium text-slate-700 bg-slate-50 rounded-xl px-3 py-2 mb-5"
          >
            {{ deletingOfficer.full_name }}
          </p>
          <div class="flex gap-3">
            <button
              type="button"
              @click="deletingOfficer = null"
              class="btn-secondary flex-1"
            >
              Cancel
            </button>
            <button
              type="button"
              @click="doDelete"
              :disabled="deleting"
              class="flex-1 px-4 py-2.5 rounded-xl font-semibold bg-red-500 text-white hover:bg-red-600 transition disabled:opacity-50"
            >
              {{ deleting ? "Deleting…" : "Delete" }}
            </button>
          </div>
        </div>
      </div>
    </Teleport>
  </div>
</template>

<script setup lang="ts">
const { getOfficers, deleteOfficer } = useOfficers();
const toast = useToast();

const officers = ref<any[]>([]);
const loading = ref(true);
const modalOpen = ref(false);
const editing = ref<any>(null);
const deletingOfficer = ref<any>(null);
const deleting = ref(false);

const search = ref("");
const roleFilter = ref("");
const activeFilter = ref<"active" | "all" | "inactive">("active");
const sortBy = ref("name");

const availableRoles = computed(() => {
  const roles = [...new Set(officers.value.map((o) => o.role).filter(Boolean))];
  return roles.sort();
});

const filtered = computed(() => {
  let list = officers.value;

  // Active filter
  if (activeFilter.value === "active")
    list = list.filter((o) => o.is_active !== false);
  else if (activeFilter.value === "inactive")
    list = list.filter((o) => o.is_active === false);

  // Role filter
  if (roleFilter.value) list = list.filter((o) => o.role === roleFilter.value);

  // Search
  const q = search.value.trim().toLowerCase();
  if (q)
    list = list.filter(
      (o) =>
        o.full_name.toLowerCase().includes(q) ||
        (o.email ?? "").toLowerCase().includes(q) ||
        (o.phone ?? "").toLowerCase().includes(q),
    );

  // Sort
  return [...list].sort((a, b) => {
    if (sortBy.value === "name") return a.full_name.localeCompare(b.full_name);
    if (sortBy.value === "name_desc")
      return b.full_name.localeCompare(a.full_name);
    if (sortBy.value === "dues_desc")
      return (b.monthly_dues ?? 0) - (a.monthly_dues ?? 0);
    if (sortBy.value === "dues_asc")
      return (a.monthly_dues ?? 0) - (b.monthly_dues ?? 0);
    if (sortBy.value === "role")
      return (a.role ?? "").localeCompare(b.role ?? "");
    return 0;
  });
});

const openAdd = () => {
  editing.value = null;
  modalOpen.value = true;
};
const edit = (o: any) => {
  editing.value = { ...o };
  modalOpen.value = true;
};
const closeModal = () => {
  modalOpen.value = false;
  editing.value = null;
};
const handleSaved = () => {
  closeModal();
  load();
  toast.success("Officer saved");
};

const confirmDelete = (o: any) => {
  deletingOfficer.value = o;
};

const doDelete = async () => {
  if (!deletingOfficer.value) return;
  deleting.value = true;
  const { error } = await deleteOfficer(deletingOfficer.value.id);
  deleting.value = false;
  if (error) {
    toast.error(error.message || "Delete failed");
    return;
  }
  toast.success("Officer removed");
  deletingOfficer.value = null;
  await load();
};

const load = async () => {
  loading.value = true;
  const { data } = await getOfficers();
  officers.value = data ?? [];
  loading.value = false;
};

onMounted(load);
</script>
