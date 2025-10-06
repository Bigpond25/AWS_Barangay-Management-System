<script setup lang="ts">
import { ref, watch, onMounted, onUnmounted, computed } from "vue";
import { useRouter } from "vue-router";

// nuxtlayout
definePageMeta({
  layout: "guest",
});

// hypothetical auth composable
// const { login, isLoading, error: authError } = useAuth()

const router = useRouter();

const formData = ref({
  login: "",
  password: "",
  rememberMe: false,
});

const error = ref("");
const showPassword = ref(false);

// watch(authError, (val) => {
//   if (val) error.value = val
// })

watch(error, (val) => {
  console.log("Error state changed:", val);
});

onMounted(() => {
  console.log("LoginPage mounted");
});
onUnmounted(() => {
  console.log("LoginPage unmounted");
});

const handleSubmit = async () => {
  error.value = "";

  if (!formData.value.login.trim()) {
    error.value = "Email or username is required";
    return;
  }
  if (!formData.value.password.trim()) {
    error.value = "Password is required";
    return;
  }

  try {
    // await login(formData.value);
    router.push("/dashboard");
  } catch (err: any) {
    if (err.message?.includes("Network")) {
      error.value =
        "Unable to connect to the server. Please check your internet connection and try again.";
    } else if (
      err.message?.includes("Unauthorized") ||
      err.message?.includes("Invalid credentials")
    ) {
      error.value =
        "Invalid email/username or password. Please check your credentials and try again.";
    } else if (err.message?.includes("Account is deactivated")) {
      error.value =
        "Your account has been deactivated. Please contact the administrator.";
    } else if (err.message?.includes("validation")) {
      error.value = "Please check your email/username and password format.";
    } else {
      error.value = err.message || "Login failed. Please try again.";
    }
  }
};

const togglePasswordVisibility = () => {
  showPassword.value = !showPassword.value;
};

const isEmailInput = computed(() => formData.value.login.includes("@"));
</script>

<template>
  <div class="min-h-screen flex items-center justify-center relative">
    <!-- Background -->
    <div
      class="absolute inset-0 bg-cover bg-center bg-no-repeat bg-fixed bg-blue-500"
      style="background-image: url('/img/background.png')"
    ></div>

    <div class="relative z-10 w-full max-w-md">
      <!-- Logo / Header -->
      <div class="text-center mb-8">
        <div
          class="mx-auto w-24 h-24 rounded-full flex items-center justify-center mb-4 shadow-lg overflow-hidden"
        >
          <NuxtImg
            src="/img/sanMiguelLogo.jpg"
            width="200"
            height="200"
            class="rounded-lg"
          />
        </div>

        <h1 class="text-3xl font-bold text-gray-800 mb-2">
          {{ $t("app.barangay") }}
        </h1>
        <p class="text-gray-600 text-lg">{{ $t("app.title") }}</p>
        <div class="w-16 h-px bg-gray-400 mx-auto mt-4"></div>
      </div>

      <!-- Login Form -->
      <div
        class="bg-white rounded-2xl shadow-2xl p-8 backdrop-blur-sm bg-opacity-95"
      >
        <!-- <div class="flex justify-end">
          <LanguageSelector />
        </div> -->

        <h2 class="text-2xl font-semibold text-gray-800 mb-6 text-center">
          {{ $t("auth.signIn") }}
        </h2>

        <!-- Error Message -->
        <div
          v-if="error || authError"
          class="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg flex items-center space-x-3"
        >
          <Icon
            name="lucide:alert-circle"
            class="h-5 w-5 text-red-600 flex-shrink-0"
          />
          <div class="flex-1">
            <p class="text-red-600 text-sm font-bold">
              {{ $t("errors.loginFailed") }}
            </p>
            <p class="text-red-600 text-sm">{{ error || authError }}</p>
          </div>
        </div>

        <form @submit.prevent="handleSubmit" class="space-y-6">
          <!-- Email/Username Field -->
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-2">
              {{ $t("auth.emailOrUsername") }}
            </label>
            <input
              type="text"
              v-model="formData.login"
              class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
              :placeholder="$t('auth.enterEmailOrUsername')"
              required
              autocomplete="username"
            />
            <p v-if="formData.login" class="text-xs text-gray-500 mt-1">
              {{
                isEmailInput
                  ? $t("auth.loggingInWithEmail")
                  : $t("auth.loggingInWithUsername")
              }}
            </p>
          </div>

          <!-- Password Field -->
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-2">
              {{ $t("auth.password") }}
            </label>
            <div class="relative">
              <input
                :type="showPassword ? 'text' : 'password'"
                v-model="formData.password"
                class="w-full px-4 py-3 pr-12 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                :placeholder="$t('auth.enterPassword')"
                required
                autocomplete="current-password"
              />
              <button
                type="button"
                @click="togglePasswordVisibility"
                class="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600"
                :aria-label="showPassword ? $t('auth.hidePassword') : $t('auth.showPassword')"
              >
                <component :is="showPassword ? EyeOff : Eye" class="h-5 w-5" />
              </button>
            </div>
          </div>

          <!-- Remember Me and Forgot Password -->
          <div class="flex items-center justify-between">
            <div class="flex items-center">
              <input
                id="rememberMe"
                type="checkbox"
                v-model="formData.rememberMe"
                class="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                :aria-label="$t('auth.rememberMe')"
              />
              <label for="rememberMe" class="ml-2 block text-sm text-gray-700">
                {{ $t("auth.rememberMe") }}
              </label>
            </div>
            <NuxtLink
              to="/forgot-password"
              class="text-sm text-blue-600 hover:text-blue-800 transition-colors"
            >
              {{ $t("auth.forgotPassword") }}?
            </NuxtLink>
          </div>

          <!-- Login Button -->
          <button
            type="submit"
            :disabled="isLoading"
            class="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white font-medium py-3 px-4 rounded-lg transition-colors duration-200 shadow-md hover:shadow-lg disabled:cursor-not-allowed"
          >
            <span v-if="isLoading" class="flex items-center justify-center">
              <svg
                class="animate-spin -ml-1 mr-3 h-5 w-5 text-white"
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
              >
                <circle
                  class="opacity-25"
                  cx="12"
                  cy="12"
                  r="10"
                  stroke="currentColor"
                  stroke-width="4"
                />
                <path
                  class="opacity-75"
                  fill="currentColor"
                  d="M4 12a8 8 0 018-8V0C5.373 0 
               0 5.373 0 12h4zm2 5.291A7.962 
               7.962 0 014 12H0c0 3.042 1.135 
               5.824 3 7.938l3-2.647z"
                />
              </svg>
              {{ $t("auth.signingIn") }}
            </span>
            <span v-else>{{ $t("auth.signIn") }}</span>
          </button>

          <!-- Divider -->
          <div class="relative">
            <div class="absolute inset-0 flex items-center">
              <div class="w-full border-t border-gray-300"></div>
            </div>
            <div class="relative flex justify-center text-sm">
              <span class="px-2 bg-white text-gray-500">
                {{ $t("auth.or") }}
              </span>
            </div>
          </div>

          <!-- Create Account Button -->
          <NuxtLink
            to="/register"
            class="w-full bg-white hover:bg-gray-50 text-blue-600 font-medium py-3 px-4 rounded-lg border border-blue-600 transition-colors duration-200 text-center block"
          >
            {{ $t("auth.createAccount") }}
          </NuxtLink>
        </form>

        <div class="mt-6 text-center">
          <p class="text-xs text-gray-500">
            {{ $t("help.trouble") }}
          </p>
        </div>
      </div>

      <!-- Footer -->
      <div class="text-center mt-6">
        <p class="text-sm text-gray-600">
          {{ $t("app.copyright") }}
        </p>
      </div>
    </div>
  </div>
</template>

