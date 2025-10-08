// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  compatibilityDate: "2025-07-15",
  devtools: { enabled: true },

  modules: [
    "@nuxt/icon",
    "@nuxt/image",
    "@nuxt/test-utils",
    "@nuxt/eslint",
    "@element-plus/nuxt",
    "@nuxtjs/tailwindcss",
    "@nuxtjs/i18n",
  ],
  i18n: {
    baseUrl: process.env.APP_URL,
    strategy: "no_prefix", // 🚫 No language prefix in URLs
    detectBrowserLanguage: {
      useCookie: true,
      cookieKey: "i18n_redirected",
      redirectOn: "all", // or 'all' if you want to detect on every page
    },
    defaultLocale: "tl",
    locales: [
      { code: "en", name: "English", file: "en.json", language: "en-US" },
      { code: "tl", name: "Tagalog", file: "tl.json", language: "tl-PH" },
    ],
    lazy: true,
    bundle: {
      optimizeTranslationDirective: false,
    },
  },
  css: [
    "element-plus/dist/index.css",
    "element-plus/theme-chalk/dark/css-vars.css", // if using dark mode
    "@/assets/scss/theme.scss",
    "@/assets/css/tailwind.css",
  ],
});
