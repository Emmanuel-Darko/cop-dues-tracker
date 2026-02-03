// nuxt.config.ts
export default defineNuxtConfig({
  srcDir: 'app',
  modules: ['@nuxtjs/supabase', '@nuxtjs/tailwindcss'],
  supabase: {
    redirect: false
  },
  css: ['~/assets/css/main.css'],
  devServer: {
    port: 3002,
    host: '0.0.0.0'
  },
  app: {
    head: {
      viewport: 'width=device-width, initial-scale=1, viewport-fit=cover',
    },
  },
})