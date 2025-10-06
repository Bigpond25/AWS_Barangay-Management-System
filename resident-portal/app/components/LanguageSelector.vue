<template>
  <el-select
    v-model="locale"
    aria-label="Change language"
    placeholder="Select language"
    style="width: 120px;"
  >
    <el-option
      v-for="locale in locales"
      :key="locale.code"
      :label="locale.name"
      :value="locale.code"
      @click="setLocale(locale.code)"
    />
  </el-select>
</template>

<script setup>
const { locales, setLocale } = useI18n();
const Cookie = useCookie("i18n_redirected");

const locale = ref(Cookie.value || "en");
</script>

