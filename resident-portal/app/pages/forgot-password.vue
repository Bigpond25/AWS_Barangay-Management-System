<template>
  <div
    class="min-h-screen bg-gradient-to-br from-blue-50 via-white to-blue-50 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8"
  >
    <div class="max-w-md w-full space-y-8">
      <!-- Header Section -->
      <div class="text-center">
        <div class="flex justify-center items-center mb-2">
          <div
            class="w-24 h-24 bg-primary-600 rounded-xl flex items-center justify-center"
          >
            <NuxtImg
              src="/img/sanMiguelLogo.jpg"
              class="rounded-lg"
            />
          </div>
        </div>
        <h1 class="text-2xl font-bold text-gray-900 mb-2">Barangay Portal</h1>
        <p class="text-sm text-gray-600">West Triangle</p>
      </div>

      <!-- Main Card -->
      <el-card class="shadow-xl border-0" :body-style="{ padding: '2rem' }">
        <!-- Step 1: Email Input -->
        <div v-if="currentStep === 'email'" class="space-y-6">
          <div class="text-center mb-6">
            <div
              class="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4"
            >
              <Icon name="heroicons:key" class="w-8 h-8 text-red-600" />
            </div>
            <h2 class="text-2xl font-bold text-gray-900 mb-2">
              Forgot Password?
            </h2>
            <p class="text-gray-600 text-sm">
              No worries! Enter your email address and we'll send you a link to
              reset your password.
            </p>
          </div>

          <el-form
            ref="emailFormRef"
            :model="emailForm"
            :rules="emailRules"
            @submit.prevent="sendResetEmail"
            size="large"
          >
            <el-form-item prop="email" class="w-full">
              <div class="relative w-full">
                <el-input
                  v-model="emailForm.email"
                  type="email"
                  placeholder="Enter your email address"
                  :prefix-icon="Message"
                  size="large"
                  class="h-12 w-full"
                  :disabled="isLoading"
                />
              </div>
            </el-form-item>

            <el-form-item class="mb-6">
              <el-button
                type="primary"
                size="large"
                class="w-full h-12 text-base font-medium"
                @click="sendResetEmail"
                :loading="isLoading"
                :disabled="!emailForm.email"
              >
                <Icon
                  v-if="!isLoading"
                  name="heroicons:paper-airplane"
                  class="w-5 h-5 mr-2"
                />
                {{ isLoading ? "Sending..." : "Send Reset Link" }}
              </el-button>
            </el-form-item>
          </el-form>

          <!-- Alternative Options -->
          <div class="space-y-4">
            <div class="relative">
              <div class="absolute inset-0 flex items-center">
                <div class="w-full border-t border-gray-300" />
              </div>
              <div class="relative flex justify-center text-sm">
                <span class="px-2 bg-white text-gray-500">Or</span>
              </div>
            </div>

            <div class="grid grid-cols-2 gap-3">
              <el-button
                @click="showContactOptions = true"
                size="large"
                class="h-11"
              >
                <Icon name="heroicons:phone" class="w-4 h-4 mr-2" />
                Call Support
              </el-button>
              <el-button
                @click="showWalkInInfo = true"
                size="large"
                class="h-11"
              >
                <Icon name="heroicons:building-office" class="w-4 h-4 mr-2" />
                Visit Office
              </el-button>
            </div>
          </div>
        </div>

        <!-- Step 2: Email Sent Confirmation -->
        <div v-else-if="currentStep === 'sent'" class="text-center space-y-6">
          <div
            class="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6"
          >
            <Icon
              name="heroicons:check-circle"
              class="w-12 h-12 text-green-600"
            />
          </div>

          <div>
            <h2 class="text-2xl font-bold text-gray-900 mb-4">
              Check Your Email
            </h2>
            <p class="text-gray-600 mb-2">
              We've sent a password reset link to:
            </p>
            <p class="font-semibold text-blue-600 mb-4">
              {{ emailForm.email }}
            </p>
            <p class="text-sm text-gray-500">
              The link will expire in 15 minutes for security purposes.
            </p>
          </div>

          <div class="bg-blue-50 rounded-lg p-4">
            <div class="flex items-start">
              <Icon
                name="heroicons:information-circle"
                class="w-5 h-5 text-blue-600 mr-3 mt-0.5 flex-shrink-0"
              />
              <div class="text-sm text-blue-800">
                <p class="font-medium mb-1">Didn't receive the email?</p>
                <ul class="space-y-1 text-blue-700">
                  <li>• Check your spam or junk folder</li>
                  <li>• Make sure you entered the correct email address</li>
                  <li>
                    • Wait a few minutes as emails may take time to arrive
                  </li>
                </ul>
              </div>
            </div>
          </div>

          <div class="space-y-3">
            <!-- Resend Button -->
            <el-button
              type="primary"
              size="large"
              class="w-full h-12"
              @click="resendEmail"
              :disabled="resendCooldown > 0 || isResending"
            >
              <span class="flex items-center justify-center w-full">
                <Icon
                  v-if="!isResending"
                  name="heroicons:arrow-path"
                  class="w-5 h-5 mr-2"
                />
                <svg
                  v-else
                  class="animate-spin h-5 w-5 mr-2 text-white"
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
                  ></circle>
                  <path
                    class="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 
             5.291A7.962 7.962 0 014 12H0c0 
             3.042 1.135 5.824 3 7.938l3-2.647z"
                  ></path>
                </svg>

                {{
                  resendCooldown > 0
                    ? `Resend in ${resendCooldown}s`
                    : isResending
                    ? "Sending..."
                    : "Resend Email"
                }}
              </span>
            </el-button>
          </div>

          <el-button
            type="primary"
            size="large"
            class="w-full h-12"
            @click="currentStep = 'email'"
          >
            <span class="flex items-center justify-center w-full">
              <Icon name="heroicons:arrow-left" class="w-5 h-5 mr-2" />
              Try Different Email
            </span>
          </el-button>
        </div>

        <!-- Step 3: Reset Password Form -->
        <div v-else-if="currentStep === 'reset'" class="space-y-6">
          <div class="text-center mb-6">
            <div
              class="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4"
            >
              <Icon
                name="heroicons:lock-closed"
                class="w-8 h-8 text-blue-600"
              />
            </div>
            <h2 class="text-2xl font-bold text-gray-900 mb-2">
              Reset Password
            </h2>
            <p class="text-gray-600 text-sm">
              Enter your new password below. Make sure it's strong and secure.
            </p>
          </div>

          <el-form
            ref="resetFormRef"
            :model="resetForm"
            :rules="resetRules"
            @submit.prevent="resetPassword"
            size="large"
          >
            <el-form-item prop="newPassword">
              <el-input
                v-model="resetForm.newPassword"
                type="password"
                placeholder="Enter new password"
                :prefix-icon="Lock"
                size="large"
                class="h-12"
                show-password
                :disabled="isLoading"
              />
            </el-form-item>

            <el-form-item prop="confirmPassword">
              <el-input
                v-model="resetForm.confirmPassword"
                type="password"
                placeholder="Confirm new password"
                :prefix-icon="Lock"
                size="large"
                class="h-12"
                show-password
                :disabled="isLoading"
              />
            </el-form-item>

            <!-- Password Strength Indicator -->
            <div class="mb-6">
              <div class="flex items-center justify-between mb-2">
                <span class="text-sm font-medium text-gray-700"
                  >Password Strength</span
                >
                <span
                  :class="passwordStrengthClass"
                  class="text-sm font-medium"
                >
                  {{ passwordStrengthText }}
                </span>
              </div>
              <div class="w-full bg-gray-200 rounded-full h-2">
                <div
                  :class="passwordStrengthBarClass"
                  class="h-2 rounded-full transition-all duration-300"
                  :style="{ width: passwordStrengthWidth }"
                ></div>
              </div>

              <!-- Password Requirements -->
              <div class="mt-3 space-y-1">
                <div class="flex items-center text-xs">
                  <Icon
                    :name="
                      passwordChecks.length
                        ? 'heroicons:check-circle'
                        : 'heroicons:x-circle'
                    "
                    :class="
                      passwordChecks.length ? 'text-green-500' : 'text-gray-400'
                    "
                    class="w-4 h-4 mr-2"
                  />
                  <span
                    :class="
                      passwordChecks.length ? 'text-green-700' : 'text-gray-500'
                    "
                  >
                    At least 8 characters
                  </span>
                </div>
                <div class="flex items-center text-xs">
                  <Icon
                    :name="
                      passwordChecks.uppercase
                        ? 'heroicons:check-circle'
                        : 'heroicons:x-circle'
                    "
                    :class="
                      passwordChecks.uppercase
                        ? 'text-green-500'
                        : 'text-gray-400'
                    "
                    class="w-4 h-4 mr-2"
                  />
                  <span
                    :class="
                      passwordChecks.uppercase
                        ? 'text-green-700'
                        : 'text-gray-500'
                    "
                  >
                    One uppercase letter
                  </span>
                </div>
                <div class="flex items-center text-xs">
                  <Icon
                    :name="
                      passwordChecks.lowercase
                        ? 'heroicons:check-circle'
                        : 'heroicons:x-circle'
                    "
                    :class="
                      passwordChecks.lowercase
                        ? 'text-green-500'
                        : 'text-gray-400'
                    "
                    class="w-4 h-4 mr-2"
                  />
                  <span
                    :class="
                      passwordChecks.lowercase
                        ? 'text-green-700'
                        : 'text-gray-500'
                    "
                  >
                    One lowercase letter
                  </span>
                </div>
                <div class="flex items-center text-xs">
                  <Icon
                    :name="
                      passwordChecks.number
                        ? 'heroicons:check-circle'
                        : 'heroicons:x-circle'
                    "
                    :class="
                      passwordChecks.number ? 'text-green-500' : 'text-gray-400'
                    "
                    class="w-4 h-4 mr-2"
                  />
                  <span
                    :class="
                      passwordChecks.number ? 'text-green-700' : 'text-gray-500'
                    "
                  >
                    One number
                  </span>
                </div>
              </div>
            </div>

            <el-form-item class="mb-6">
              <el-button
                type="primary"
                size="large"
                class="w-full h-12 text-base font-medium"
                @click="resetPassword"
                :loading="isLoading"
                :disabled="!isPasswordValid"
              >
                <Icon
                  v-if="!isLoading"
                  name="heroicons:check"
                  class="w-5 h-5 mr-2"
                />
                {{ isLoading ? "Resetting..." : "Reset Password" }}
              </el-button>
            </el-form-item>
          </el-form>
        </div>

        <!-- Step 4: Success -->
        <div
          v-else-if="currentStep === 'success'"
          class="text-center space-y-6"
        >
          <div
            class="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6"
          >
            <Icon
              name="heroicons:check-badge"
              class="w-12 h-12 text-green-600"
            />
          </div>

          <div>
            <h2 class="text-2xl font-bold text-gray-900 mb-4">
              Password Reset Successfully!
            </h2>
            <p class="text-gray-600 mb-6">
              Your password has been changed successfully. You can now sign in
              with your new password.
            </p>
          </div>

          <el-button
            type="primary"
            size="large"
            class="w-full h-12 text-base font-medium"
            @click="navigateToLogin"
          >
            <Icon
              name="heroicons:arrow-right-on-rectangle"
              class="w-5 h-5 mr-2"
            />
            Sign In Now
          </el-button>
        </div>

        <!-- Back to Login Link -->
        <div
          v-if="currentStep !== 'success'"
          class="text-center mt-6 pt-6 border-t border-gray-200"
        >
          <p class="text-gray-600 text-sm">
            Remember your password?
            <NuxtLink
              to="/"
              class="text-primary-600 hover:text-primary-800 font-medium"
            >
              Back to Sign In
            </NuxtLink>
          </p>
        </div>
      </el-card>

      <!-- Contact Support Dialog -->
      <el-dialog
        v-model="showContactOptions"
        title="Contact Support"
        width="90%"
        style="max-width: 400px"
      >
        <div class="space-y-4">
          <div class="text-center mb-4">
            <Icon
              name="heroicons:phone"
              class="w-12 h-12 text-blue-600 mx-auto mb-3"
            />
            <p class="text-gray-600 text-sm">
              Need help? Contact our support team
            </p>
          </div>

          <div class="space-y-3">
            <div class="flex items-center p-3 bg-gray-50 rounded-lg">
              <Icon name="heroicons:phone" class="w-5 h-5 text-gray-600 mr-3" />
              <div>
                <p class="font-medium text-gray-900">Phone Support</p>
                <p class="text-sm text-gray-600">(02) 8123-4567</p>
                <p class="text-xs text-gray-500">Mon-Fri, 8:00 AM - 5:00 PM</p>
              </div>
            </div>

            <div class="flex items-center p-3 bg-gray-50 rounded-lg">
              <Icon
                name="heroicons:device-phone-mobile"
                class="w-5 h-5 text-gray-600 mr-3"
              />
              <div>
                <p class="font-medium text-gray-900">Mobile/SMS</p>
                <p class="text-sm text-gray-600">+63 917 123 4567</p>
                <p class="text-xs text-gray-500">24/7 SMS Support</p>
              </div>
            </div>

            <div class="flex items-center p-3 bg-gray-50 rounded-lg">
              <Icon
                name="heroicons:envelope"
                class="w-5 h-5 text-gray-600 mr-3"
              />
              <div>
                <p class="font-medium text-gray-900">Email Support</p>
                <p class="text-sm text-gray-600">
                  support@barangaysanantonio.gov.ph
                </p>
                <p class="text-xs text-gray-500">Response within 24 hours</p>
              </div>
            </div>
          </div>
        </div>
        <template #footer>
          <el-button @click="showContactOptions = false" size="large"
            >Close</el-button
          >
        </template>
      </el-dialog>

      <!-- Walk-in Information Dialog -->
      <el-dialog
        v-model="showWalkInInfo"
        title="Visit Barangay Office"
        width="90%"
        style="max-width: 400px"
      >
        <div class="space-y-4">
          <div class="text-center mb-4">
            <Icon
              name="heroicons:building-office"
              class="w-12 h-12 text-blue-600 mx-auto mb-3"
            />
            <p class="text-gray-600 text-sm">
              Visit us for in-person assistance
            </p>
          </div>

          <div class="space-y-3">
            <div class="p-3 bg-gray-50 rounded-lg">
              <div class="flex items-start">
                <Icon
                  name="heroicons:map-pin"
                  class="w-5 h-5 text-gray-600 mr-3 mt-0.5"
                />
                <div>
                  <p class="font-medium text-gray-900 mb-1">Address</p>
                  <p class="text-sm text-gray-600">
                    Barangay San Antonio Hall<br />
                    123 Municipal Road<br />
                    San Antonio, Quezon City
                  </p>
                </div>
              </div>
            </div>

            <div class="p-3 bg-gray-50 rounded-lg">
              <div class="flex items-start">
                <Icon
                  name="heroicons:clock"
                  class="w-5 h-5 text-gray-600 mr-3 mt-0.5"
                />
                <div>
                  <p class="font-medium text-gray-900 mb-1">Office Hours</p>
                  <p class="text-sm text-gray-600">
                    Monday - Friday: 8:00 AM - 5:00 PM<br />
                    Saturday: 8:00 AM - 12:00 PM<br />
                    Sunday: Closed
                  </p>
                </div>
              </div>
            </div>

            <div class="p-3 bg-blue-50 rounded-lg">
              <div class="flex items-start">
                <Icon
                  name="heroicons:identification"
                  class="w-5 h-5 text-blue-600 mr-3 mt-0.5"
                />
                <div>
                  <p class="font-medium text-blue-900 mb-1">Bring Valid ID</p>
                  <p class="text-sm text-blue-700">
                    Please bring a government-issued ID and proof of residency
                    for account recovery.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
        <template #footer>
          <el-button @click="showWalkInInfo = false" size="large"
            >Close</el-button
          >
        </template>
      </el-dialog>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive, computed, onMounted, onUnmounted } from "vue";
import { Message, Lock } from "@element-plus/icons-vue";

definePageMeta({
  layout: "guest",
});

// Reactive data
const currentStep = ref("email"); // 'email', 'sent', 'reset', 'success'
const isLoading = ref(false);
const isResending = ref(false);
const resendCooldown = ref(0);
const showContactOptions = ref(false);
const showWalkInInfo = ref(false);

// Form refs
const emailFormRef = ref();
const resetFormRef = ref();

// Form data
const emailForm = reactive({
  email: "",
});

const resetForm = reactive({
  newPassword: "",
  confirmPassword: "",
});

// Validation rules
const emailRules = reactive({
  email: [
    { required: true, message: "Email address is required", trigger: "blur" },
    {
      type: "email",
      message: "Please enter a valid email address",
      trigger: "blur",
    },
  ],
});

const resetRules = reactive({
  newPassword: [
    { required: true, message: "New password is required", trigger: "blur" },
    {
      min: 8,
      message: "Password must be at least 8 characters",
      trigger: "blur",
    },
  ],
  confirmPassword: [
    {
      required: true,
      message: "Please confirm your password",
      trigger: "blur",
    },
    {
      validator: (rule, value, callback) => {
        if (value !== resetForm.newPassword) {
          callback(new Error("Passwords do not match"));
        } else {
          callback();
        }
      },
      trigger: "blur",
    },
  ],
});

// Computed properties
const passwordChecks = computed(() => {
  const password = resetForm.newPassword;
  return {
    length: password.length >= 8,
    uppercase: /[A-Z]/.test(password),
    lowercase: /[a-z]/.test(password),
    number: /\d/.test(password),
  };
});

const passwordStrength = computed(() => {
  const checks = Object.values(passwordChecks.value).filter(Boolean).length;
  return checks;
});

const passwordStrengthText = computed(() => {
  switch (passwordStrength.value) {
    case 0:
    case 1:
      return "Weak";
    case 2:
      return "Fair";
    case 3:
      return "Good";
    case 4:
      return "Strong";
    default:
      return "Weak";
  }
});

const passwordStrengthClass = computed(() => {
  switch (passwordStrength.value) {
    case 0:
    case 1:
      return "text-red-600";
    case 2:
      return "text-orange-600";
    case 3:
      return "text-yellow-600";
    case 4:
      return "text-green-600";
    default:
      return "text-gray-400";
  }
});

const passwordStrengthBarClass = computed(() => {
  switch (passwordStrength.value) {
    case 0:
    case 1:
      return "bg-red-500";
    case 2:
      return "bg-orange-500";
    case 3:
      return "bg-yellow-500";
    case 4:
      return "bg-green-500";
    default:
      return "bg-gray-300";
  }
});

const passwordStrengthWidth = computed(() => {
  return `${(passwordStrength.value / 4) * 100}%`;
});

const isPasswordValid = computed(() => {
  return (
    Object.values(passwordChecks.value).every(Boolean) &&
    resetForm.newPassword === resetForm.confirmPassword
  );
});

// Methods
const sendResetEmail = async () => {
  try {
    await emailFormRef.value.validate();
    isLoading.value = true;

    // Simulate API call
    await new Promise((resolve) => setTimeout(resolve, 2000));

    isLoading.value = false;
    currentStep.value = "sent";
    startResendCooldown();

    ElMessage.success("Reset email sent successfully!");
  } catch (error) {
    isLoading.value = false;
    ElMessage.error("Please enter a valid email address");
  }
};

const resendEmail = async () => {
  isResending.value = true;

  // Simulate API call
  await new Promise((resolve) => setTimeout(resolve, 1500));

  isResending.value = false;
  startResendCooldown();
  ElMessage.success("Reset email resent successfully!");
};

const resetPassword = async () => {
  try {
    await resetFormRef.value.validate();
    isLoading.value = true;

    // Simulate API call
    await new Promise((resolve) => setTimeout(resolve, 2000));

    isLoading.value = false;
    currentStep.value = "success";
    ElMessage.success("Password reset successfully!");
  } catch (error) {
    isLoading.value = false;
    ElMessage.error("Please fill in all fields correctly");
  }
};

const startResendCooldown = () => {
  resendCooldown.value = 60;
  const interval = setInterval(() => {
    resendCooldown.value--;
    if (resendCooldown.value <= 0) {
      clearInterval(interval);
    }
  }, 1000);
};

const navigateToLogin = () => {
  // Navigate to login page
  // navigateTo('/login')
  ElMessage.info("Redirecting to login page...");
};

// Check for reset token in URL on mount
onMounted(() => {
  const route = useRoute();
  if (route.query.token) {
    currentStep.value = "reset";
  }
});

// Meta tags
useHead({
  title: "Forgot Password - Barangay Resident Portal",
  meta: [
    {
      name: "description",
      content: "Reset your password for Barangay San Antonio resident portal",
    },
  ],
});
</script>

<style scoped>
.el-card {
  border-radius: 16px;
  border: none;
  box-shadow: 0 10px 25px -5px rgba(0, 0, 0, 0.1),
    0 10px 10px -5px rgba(0, 0, 0, 0.04);
}

.el-input {
  border-radius: 8px;
}

.el-input.is-disabled .el-input__inner {
  color: #a0aec0;
  cursor: not-allowed;
}

.el-button {
  border-radius: 8px;
  font-weight: 500;
}

.el-button:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.el-button--primary {
  background: linear-gradient(135deg, #4f46e5 0%, #7c3aed 100%);
  border: none;
  box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
  transition: all 0.2s ease;
}

.el-button--primary:hover:not(:disabled) {
  transform: translateY(-1px);
  box-shadow: 0 6px 12px -2px rgba(0, 0, 0, 0.15);
}

.el-button--primary.is-loading {
  background: linear-gradient(135deg, #4f46e5 0%, #7c3aed 100%);
}

.el-dialog {
  border-radius: 12px;
  border: none;
  box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1),
    0 10px 10px -5px rgba(0, 0, 0, 0.04);
}

.el-dialog__header {
  border-bottom: 1px solid #e5e7eb;
  padding: 1.5rem 1.5rem 1rem;
}

.el-dialog__body {
  padding: 1.5rem;
}

/* Custom animations */
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.3s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}

/* Loading state */
.el-button.is-loading .el-icon-loading {
  margin-right: 0.5rem;
}

/* Responsive adjustments */
@media (max-width: 640px) {
  .el-card {
    margin: 0 1rem;
  }

  .el-dialog {
    margin: 1rem;
  }
}

/* Focus styles for accessibility */
.el-input:focus-within,
.el-button:focus {
  outline: 2px solid #4f46e5;
  outline-offset: 2px;
}

/* High contrast mode support */
@media (prefers-contrast: high) {
  .el-card {
    border: 2px solid #000;
  }

  .el-button {
    border: 2px solid;
  }
}

/* Reduced motion support */
@media (prefers-reduced-motion: reduce) {
  * {
    animation-duration: 0.01ms !important;
    animation-iteration-count: 1 !important;
    transition-duration: 0.01ms !important;
  }

  .el-button--primary:hover:not(:disabled) {
    transform: none;
  }
}

/* Custom password strength bar */
.password-strength-bar {
  height: 0.5rem;
  border-radius: 0.25rem;
  transition: all 0.3s ease;
}

/* Success state styling */
.success-animation {
  animation: bounce 0.6s ease-in-out;
}

@keyframes bounce {
  0%,
  20%,
  53%,
  80%,
  100% {
    animation-timing-function: cubic-bezier(0.215, 0.61, 0.355, 1);
    transform: translate3d(0, 0, 0);
  }
  40%,
  43% {
    animation-timing-function: cubic-bezier(0.755, 0.05, 0.855, 0.06);
    transform: translate3d(0, -8px, 0);
  }
  70% {
    animation-timing-function: cubic-bezier(0.755, 0.05, 0.855, 0.06);
    transform: translate3d(0, -4px, 0);
  }
  90% {
    transform: translate3d(0, -1px, 0);
  }
}
</style>
