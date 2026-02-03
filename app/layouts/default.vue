<template>
  <div class="min-h-screen bg-slate-50">
    <!-- Top header: desktop only -->
    <header class="hidden md:block sticky top-0 z-40 bg-white/95 backdrop-blur-sm border-b border-slate-100">
      <div class="max-w-6xl mx-auto px-4 sm:px-6">
        <div class="flex items-center justify-between h-14">
          <NuxtLink to="/" class="flex items-center gap-2">
            <span class="font-display font-bold text-lg text-slate-800">Church Dues</span>
          </NuxtLink>
          <nav class="flex items-center gap-1">
            <NuxtLink
              v-for="item in nav"
              :key="item.href"
              :to="item.href"
              class="px-3 py-2 rounded-lg text-sm font-medium transition-colors"
              :class="isActive(item.href) ? 'bg-accent-500/15 text-accent-700' : 'text-slate-600 hover:bg-slate-100 hover:text-slate-800'"
            >
              {{ item.label }}
            </NuxtLink>
          </nav>
        </div>
      </div>
    </header>

    <!-- Main content: extra padding bottom on mobile for bottom nav -->
    <main class="max-w-6xl mx-auto px-4 sm:px-6 py-4 md:py-6 pb-24 md:pb-8">
      <slot />
    </main>

    <!-- Bottom navigation: mobile only -->
    <nav class="md:hidden fixed bottom-0 left-0 right-0 z-50 bg-white/95 backdrop-blur-sm border-t border-slate-200 pb-safe">
      <div class="flex items-center justify-around h-16 px-2">
        <NuxtLink
          v-for="item in nav"
          :key="item.href"
          :to="item.href"
          class="flex flex-col items-center justify-center flex-1 py-2 min-w-0 gap-0.5"
          :class="isActive(item.href) ? 'text-accent-600' : 'text-slate-400'"
        >
          <!-- Home -->
          <svg v-if="item.icon === 'home'" xmlns="http://www.w3.org/2000/svg" class="w-6 h-6 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="1.5">
            <path stroke-linecap="round" stroke-linejoin="round" d="m2.25 12 8.954-8.955c.44-.439 1.152-.439 1.591 0L21.75 12M4.5 9.75v10.125c0 .621.504 1.125 1.125 1.125H9.75v-4.875c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125V21h4.125c.621 0 1.125-.504 1.125-1.125V9.75M8.25 21h8.25" />
          </svg>
          <!-- Collect / Wallet -->
          <svg v-else-if="item.icon === 'collect'" xmlns="http://www.w3.org/2000/svg" class="w-6 h-6 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="1.5">
            <path stroke-linecap="round" stroke-linejoin="round" d="M21 12a2.25 2.25 0 0 0-2.25-2.25H15a3 3 0 1 1-6 0H5.25A2.25 2.25 0 0 0 3 12m18 0v6a2.25 2.25 0 0 1-2.25 2.25H5.25A2.25 2.25 0 0 1 3 18v-6m18 0V9M3 12V9m18 0a2.25 2.25 0 0 0-2.25-2.25H5.25A2.25 2.25 0 0 0 3 9m18 0V6a2.25 2.25 0 0 0-2.25-2.25H5.25A2.25 2.25 0 0 0 3 6v3" />
          </svg>
          <!-- Officers / Users -->
          <svg v-else-if="item.icon === 'officers'" xmlns="http://www.w3.org/2000/svg" class="w-6 h-6 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="1.5">
            <path stroke-linecap="round" stroke-linejoin="round" d="M15 19.128a9.38 9.38 0 0 0 2.625.372 9.337 9.337 0 0 0 4.121-.952 4.125 4.125 0 0 0-7.533-2.493M15 19.128v-.003c0-1.113-.285-2.16-.786-3.07M15 19.128v.106A12.318 12.318 0 0 1 8.624 21c-2.331 0-4.512-.645-6.374-1.766l-.001-.109a6.375 6.375 0 0 1 11.964-3.07M12 6.375a3.375 3.375 0 1 1-6.75 0 3.375 3.375 0 0 1 6.75 0Zm8.25 2.25a2.625 2.625 0 1 1-5.25 0 2.625 2.625 0 0 1 5.25 0Z" />
          </svg>
          <!-- Reports / Chart -->
          <svg v-else-if="item.icon === 'reports'" xmlns="http://www.w3.org/2000/svg" class="w-6 h-6 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="1.5">
            <path stroke-linecap="round" stroke-linejoin="round" d="M3 13.125C3 12.504 3.504 12 4.125 12h2.25c.621 0 1.125.504 1.125 1.125v6.75C7.5 20.496 6.996 21 6.375 21h-2.25A1.125 1.125 0 0 1 3 19.875v-6.75ZM9.75 8.625c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125v11.25c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 0 1-1.125-1.125V8.625ZM16.5 4.125c0-.621.504-1.125 1.125-1.125h2.25C20.496 3 21 3.504 21 4.125v15.75c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 0 1-1.125-1.125V4.125Z" />
          </svg>
          <span class="text-xs font-medium truncate max-w-full px-1">{{ item.label }}</span>
        </NuxtLink>
      </div>
    </nav>

    <AppToast />
  </div>
</template>

<script setup lang="ts">
const route = useRoute()
const nav = [
  { href: '/', label: 'Home', icon: 'home' },
  { href: '/collect', label: 'Collect', icon: 'collect' },
  { href: '/officers', label: 'Officers', icon: 'officers' },
  { href: '/reports', label: 'Reports', icon: 'reports' },
]

const isActive = (href: string) => {
  if (href === '/') return route.path === '/'
  return route.path.startsWith(href)
}
</script>
