<template>
  <div>
    <header class="mb-6 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
      <div>
        <h1 class="font-display font-bold text-3xl text-slate-800">Officers</h1>
        <p class="text-slate-600 mt-1">{{ officers.length }} members</p>
      </div>
      <button type="button" @click="openAdd" class="btn-primary">
        + Add Officer
      </button>
    </header>

    <div class="card overflow-hidden">
      <div v-if="loading" class="p-6 space-y-3">
        <div v-for="n in 6" :key="n" class="shimmer h-12"></div>
      </div>
      <div v-else-if="officers.length === 0" class="p-12 text-center text-slate-500">
        No officers yet. Add your first officer to start tracking dues.
      </div>
      <div v-else class="overflow-x-auto">
        <table class="min-w-full">
          <thead class="bg-slate-50 border-b border-slate-100">
            <tr>
              <th class="px-4 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">Name</th>
              <th class="px-4 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">Role</th>
              <th class="px-4 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider hidden sm:table-cell">Dues</th>
              <th class="px-4 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider hidden md:table-cell">Contact</th>
              <th class="px-4 py-3 text-right text-xs font-semibold text-slate-500 uppercase tracking-wider">Actions</th>
            </tr>
          </thead>
          <tbody class="divide-y divide-slate-100">
            <tr v-for="o in officers" :key="o.id" class="hover:bg-slate-50/50">
              <td class="px-4 py-3">
                <p class="font-medium text-slate-800 flex items-center gap-2">
                  {{ o.full_name }}
                  <span
                    v-if="!o.is_active"
                    class="ml-2 px-2 py-0.5 rounded-full text-xs font-semibold bg-rose-100 text-rose-600"
                  >
                    Inactive
                  </span>
                </p>
              </td>
              <td class="px-4 py-3">
                <span class="px-2 py-0.5 rounded-full text-xs font-medium bg-slate-100 text-slate-700">{{ o.role }}</span>
              </td>
              <td class="px-4 py-3 hidden sm:table-cell">
                <span class="font-semibold text-slate-800">${{ o.monthly_dues ?? 0 }}</span>
                <span class="text-slate-500 text-sm">/mo</span>
              </td>
              <td class="px-4 py-3 hidden md:table-cell text-sm text-slate-600">
                {{ o.email || o.phone || '—' }}
              </td>
              <td class="px-4 py-3 text-right">
                <button type="button" @click="edit(o)" class="text-accent-600 hover:text-accent-500 font-medium text-sm mr-3">Edit</button>
                <button type="button" @click="confirmDelete(o)" class="text-red-600 hover:text-red-500 font-medium text-sm">Delete</button>
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
  </div>
</template>

<script setup lang="ts">
const { getOfficers, deleteOfficer } = useOfficers()
const toast = useToast()
const officers = ref<any[]>([])
const loading = ref(true)
const modalOpen = ref(false)
const editing = ref<any>(null)

const openAdd = () => {
  editing.value = null
  modalOpen.value = true
}

const edit = (o: any) => {
  editing.value = { ...o }
  modalOpen.value = true
}

const closeModal = () => {
  modalOpen.value = false
  editing.value = null
}

const handleSaved = () => {
  closeModal()
  load()
  toast.success('Officer saved')
}

const confirmDelete = async (o: any) => {
  if (!confirm(`Delete ${o.full_name}?`)) return
  const { error } = await deleteOfficer(o.id)
  if (error) {
    toast.error(error.message || 'Delete failed')
    return
  }
  toast.success('Officer removed')
  await load()
}

const load = async () => {
  loading.value = true
  const { data } = await getOfficers()
  officers.value = data ?? []
  loading.value = false
}

onMounted(load)
</script>
