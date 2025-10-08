<template>
  <div class="min-h-screen">
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div
        class="bg-gradient-to-br from-primary-50 via-white to-primary-50 py-12 px-4 sm:px-6 lg:px-8"
      >
        <div class="max-w-4xl mx-auto">
          <!-- Header -->
          <div class="text-center mb-8">
            <div class="flex justify-center items-center mb-6">
              <div
                class="w-16 h-16 bg-primary-600 rounded-xl flex items-center justify-center mr-4"
              >
                <Icon
                  name="heroicons:home-modern"
                  class="w-10 h-10 text-white"
                />
              </div>
              <div class="text-left">
                <h1 class="text-3xl font-bold text-gray-900">
                  Barangay Portal
                </h1>
                <p class="text-gray-600">West Triangle Registration</p>
              </div>
            </div>
            <h2 class="text-2xl font-bold text-gray-900 mb-2">
              Create Your Resident Account
            </h2>
            <p class="text-gray-600">
              Join our digital barangay community and access services online
            </p>
          </div>

          <!-- Registration Form -->
          <el-card class="shadow-xl">
            <el-form
              ref="registrationFormRef"
              :model="registrationForm"
              :rules="formRules"
              label-width="140px"
              size="large"
              class="space-y-6"
            >
              <!-- Steps Progress -->
              <div class="mb-8">
                <el-steps
                  :active="currentStep"
                  finish-status="success"
                  align-center
                >
                  <el-step title="Personal Info" icon="el-icon-user" />
                  <el-step title="Contact Details" icon="el-icon-message" />
                  <el-step title="Address Info" icon="el-icon-location" />
                  <el-step title="Account Setup" icon="el-icon-setting" />
                </el-steps>
              </div>

              <!-- Step 1: Personal Information -->
              <div v-show="currentStep === 0" class="space-y-6">
                <div class="bg-primary-50 rounded-lg p-4 mb-6">
                  <h3
                    class="text-lg font-semibold text-primary-900 flex items-center mb-2"
                  >
                    <Icon name="heroicons:user" class="w-5 h-5 mr-2" />
                    Personal Information
                  </h3>
                  <p class="text-primary-700 text-sm">
                    Please provide your basic personal details
                  </p>
                </div>

                <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <el-form-item label="First Name" prop="firstName">
                    <el-input
                      v-model="registrationForm.firstName"
                      placeholder="Enter your first name"
                      :prefix-icon="User"
                    />
                  </el-form-item>

                  <el-form-item label="Last Name" prop="lastName">
                    <el-input
                      v-model="registrationForm.lastName"
                      placeholder="Enter your last name"
                      :prefix-icon="User"
                    />
                  </el-form-item>

                  <el-form-item label="Middle Name" prop="middleName">
                    <el-input
                      v-model="registrationForm.middleName"
                      placeholder="Enter your middle name (optional)"
                    />
                  </el-form-item>

                  <el-form-item label="Suffix" prop="suffix">
                    <el-select
                      v-model="registrationForm.suffix"
                      placeholder="Select suffix (optional)"
                      clearable
                    >
                      <el-option label="Jr." value="Jr." />
                      <el-option label="Sr." value="Sr." />
                      <el-option label="II" value="II" />
                      <el-option label="III" value="III" />
                      <el-option label="IV" value="IV" />
                    </el-select>
                  </el-form-item>

                  <el-form-item label="Date of Birth" prop="dateOfBirth">
                    <el-date-picker
                      v-model="registrationForm.dateOfBirth"
                      type="date"
                      placeholder="Select date of birth"
                      style="width: 100%"
                      :disabled-date="disabledDate"
                    />
                  </el-form-item>

                  <el-form-item label="Gender" prop="gender">
                    <el-select
                      v-model="registrationForm.gender"
                      placeholder="Select gender"
                    >
                      <el-option label="Male" value="Male" />
                      <el-option label="Female" value="Female" />
                      <el-option label="Prefer not to say" value="Other" />
                    </el-select>
                  </el-form-item>

                  <el-form-item label="Civil Status" prop="civilStatus">
                    <el-select
                      v-model="registrationForm.civilStatus"
                      placeholder="Select civil status"
                    >
                      <el-option label="Single" value="Single" />
                      <el-option label="Married" value="Married" />
                      <el-option label="Divorced" value="Divorced" />
                      <el-option label="Widowed" value="Widowed" />
                      <el-option label="Separated" value="Separated" />
                    </el-select>
                  </el-form-item>

                  <el-form-item label="Occupation" prop="occupation">
                    <el-input
                      v-model="registrationForm.occupation"
                      placeholder="Enter your occupation"
                    />
                  </el-form-item>
                </div>
              </div>

              <!-- Step 2: Contact Details -->
              <div v-show="currentStep === 1" class="space-y-6">
                <div class="bg-green-50 rounded-lg p-4 mb-6">
                  <h3
                    class="text-lg font-semibold text-green-900 flex items-center mb-2"
                  >
                    <Icon name="heroicons:phone" class="w-5 h-5 mr-2" />
                    Contact Information
                  </h3>
                  <p class="text-green-700 text-sm">
                    We'll use this information to contact you about your
                    requests
                  </p>
                </div>

                <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <el-form-item label="Mobile Number" prop="mobileNumber">
                    <el-input
                      v-model="registrationForm.mobileNumber"
                      placeholder="+63 9XX XXX XXXX"
                      :prefix-icon="Phone"
                    />
                  </el-form-item>

                  <el-form-item label="Landline" prop="landlineNumber">
                    <el-input
                      v-model="registrationForm.landlineNumber"
                      placeholder="(02) XXXX XXXX (optional)"
                    />
                  </el-form-item>

                  <el-form-item
                    label="Email Address"
                    prop="email"
                    class="md:col-span-2"
                  >
                    <el-input
                      v-model="registrationForm.email"
                      placeholder="Enter your email address"
                      :prefix-icon="Message"
                      type="email"
                    />
                  </el-form-item>

                  <el-form-item
                    label="Emergency Contact"
                    prop="emergencyContactName"
                  >
                    <el-input
                      v-model="registrationForm.emergencyContactName"
                      placeholder="Full name of emergency contact"
                    />
                  </el-form-item>

                  <el-form-item
                    label="Emergency Contact #"
                    prop="emergencyContactNumber"
                  >
                    <el-input
                      v-model="registrationForm.emergencyContactNumber"
                      placeholder="+63 9XX XXX XXXX"
                    />
                  </el-form-item>

                  <el-form-item
                    label="Relationship"
                    prop="emergencyContactRelationship"
                    class="md:col-span-2"
                  >
                    <el-select
                      v-model="registrationForm.emergencyContactRelationship"
                      placeholder="Relationship to emergency contact"
                    >
                      <el-option label="Spouse" value="Spouse" />
                      <el-option label="Parent" value="Parent" />
                      <el-option label="Child" value="Child" />
                      <el-option label="Sibling" value="Sibling" />
                      <el-option label="Relative" value="Relative" />
                      <el-option label="Friend" value="Friend" />
                      <el-option label="Other" value="Other" />
                    </el-select>
                  </el-form-item>
                </div>
              </div>

              <!-- Step 3: Address Information -->
              <div v-show="currentStep === 2" class="space-y-6">
                <div class="bg-purple-50 rounded-lg p-4 mb-6">
                  <h3
                    class="text-lg font-semibold text-purple-900 flex items-center mb-2"
                  >
                    <Icon name="heroicons:map-pin" class="w-5 h-5 mr-2" />
                    Address Information
                  </h3>
                  <p class="text-purple-700 text-sm">
                    Please provide your complete address within the barangay
                  </p>
                </div>

                <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <el-form-item label="House/Unit #" prop="houseNumber">
                    <el-input
                      v-model="registrationForm.houseNumber"
                      placeholder="e.g., 123, Unit 4B"
                    />
                  </el-form-item>

                  <el-form-item label="Block/Lot" prop="blockLot">
                    <el-input
                      v-model="registrationForm.blockLot"
                      placeholder="e.g., Block 5 Lot 12"
                    />
                  </el-form-item>

                  <el-form-item label="Street/Road" prop="street">
                    <el-input
                      v-model="registrationForm.street"
                      placeholder="Enter street name"
                    />
                  </el-form-item>

                  <el-form-item label="Purok/Zone" prop="purok">
                    <el-select
                      v-model="registrationForm.purok"
                      placeholder="Select purok/zone"
                    >
                      <el-option label="Purok 1" value="Purok 1" />
                      <el-option label="Purok 2" value="Purok 2" />
                      <el-option label="Purok 3" value="Purok 3" />
                      <el-option label="Purok 4" value="Purok 4" />
                      <el-option label="Purok 5" value="Purok 5" />
                      <el-option label="Zone A" value="Zone A" />
                      <el-option label="Zone B" value="Zone B" />
                      <el-option label="Zone C" value="Zone C" />
                    </el-select>
                  </el-form-item>

                  <el-form-item label="Barangay" prop="barangay">
                    <el-input
                      v-model="registrationForm.barangay"
                      placeholder="Barangay San Antonio"
                      readonly
                    />
                  </el-form-item>

                  <el-form-item label="City/Municipality" prop="city">
                    <el-input
                      v-model="registrationForm.city"
                      placeholder="Enter city/municipality"
                    />
                  </el-form-item>

                  <el-form-item label="Province" prop="province">
                    <el-input
                      v-model="registrationForm.province"
                      placeholder="Enter province"
                    />
                  </el-form-item>

                  <el-form-item label="ZIP Code" prop="zipCode">
                    <el-input
                      v-model="registrationForm.zipCode"
                      placeholder="Enter ZIP code"
                    />
                  </el-form-item>
                </div>

                <!-- Household Information -->
                <div class="mt-8 pt-6 border-t border-gray-200">
                  <h4 class="text-md font-semibold text-gray-900 mb-4">
                    Household Information
                  </h4>
                  <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <el-form-item
                      label="Household Status"
                      prop="householdStatus"
                    >
                      <el-select
                        v-model="registrationForm.householdStatus"
                        placeholder="Select household status"
                      >
                        <el-option label="Head of Household" value="Head" />
                        <el-option label="Spouse" value="Spouse" />
                        <el-option label="Child" value="Child" />
                        <el-option label="Parent" value="Parent" />
                        <el-option label="Sibling" value="Sibling" />
                        <el-option label="Other Relative" value="Relative" />
                        <el-option label="Boarder/Tenant" value="Boarder" />
                      </el-select>
                    </el-form-item>

                    <el-form-item
                      label="Years of Residency"
                      prop="yearsOfResidency"
                    >
                      <el-input-number
                        v-model="registrationForm.yearsOfResidency"
                        :min="0"
                        :max="100"
                        style="width: 100%"
                        placeholder="Years living in the barangay"
                      />
                    </el-form-item>
                  </div>
                </div>
              </div>

              <!-- Step 4: Account Setup -->
              <div v-show="currentStep === 3" class="space-y-6">
                <div class="bg-orange-50 rounded-lg p-4 mb-6">
                  <h3
                    class="text-lg font-semibold text-orange-900 flex items-center mb-2"
                  >
                    <Icon name="heroicons:cog-6-tooth" class="w-5 h-5 mr-2" />
                    Account Setup
                  </h3>
                  <p class="text-orange-700 text-sm">
                    Create your login credentials and set preferences
                  </p>
                </div>

                <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <el-form-item
                    label="Username"
                    prop="username"
                    class="md:col-span-2"
                  >
                    <el-input
                      v-model="registrationForm.username"
                      placeholder="Choose a unique username"
                      :prefix-icon="User"
                    />
                    <div class="text-xs text-gray-500 mt-1">
                      Username must be 4-20 characters, alphanumeric and
                      underscores only
                    </div>
                  </el-form-item>

                  <el-form-item label="Password" prop="password">
                    <el-input
                      v-model="registrationForm.password"
                      type="password"
                      placeholder="Create a strong password"
                      :prefix-icon="Lock"
                      show-password
                    />
                  </el-form-item>

                  <el-form-item label="Confirm Password" prop="confirmPassword">
                    <el-input
                      v-model="registrationForm.confirmPassword"
                      type="password"
                      placeholder="Confirm your password"
                      :prefix-icon="Lock"
                      show-password
                    />
                  </el-form-item>
                </div>

                <!-- Password Requirements -->
                <el-alert
                  title="Password Requirements"
                  type="info"
                  :closable="false"
                  class="mb-4"
                >
                  <ul class="text-sm mt-2 space-y-1">
                    <li class="flex items-center">
                      <Icon
                        :name="
                          passwordChecks.length
                            ? 'heroicons:check-circle'
                            : 'heroicons:x-circle'
                        "
                        :class="
                          passwordChecks.length
                            ? 'text-green-500'
                            : 'text-red-500'
                        "
                        class="w-4 h-4 mr-2"
                      />
                      At least 8 characters long
                    </li>
                    <li class="flex items-center">
                      <Icon
                        :name="
                          passwordChecks.uppercase
                            ? 'heroicons:check-circle'
                            : 'heroicons:x-circle'
                        "
                        :class="
                          passwordChecks.uppercase
                            ? 'text-green-500'
                            : 'text-red-500'
                        "
                        class="w-4 h-4 mr-2"
                      />
                      Contains uppercase letter
                    </li>
                    <li class="flex items-center">
                      <Icon
                        :name="
                          passwordChecks.lowercase
                            ? 'heroicons:check-circle'
                            : 'heroicons:x-circle'
                        "
                        :class="
                          passwordChecks.lowercase
                            ? 'text-green-500'
                            : 'text-red-500'
                        "
                        class="w-4 h-4 mr-2"
                      />
                      Contains lowercase letter
                    </li>
                    <li class="flex items-center">
                      <Icon
                        :name="
                          passwordChecks.number
                            ? 'heroicons:check-circle'
                            : 'heroicons:x-circle'
                        "
                        :class="
                          passwordChecks.number
                            ? 'text-green-500'
                            : 'text-red-500'
                        "
                        class="w-4 h-4 mr-2"
                      />
                      Contains at least one number
                    </li>
                  </ul>
                </el-alert>

                <!-- Terms and Conditions -->
                <el-form-item prop="agreeToTerms" class="mt-6">
                  <el-checkbox
                    v-model="registrationForm.agreeToTerms"
                    size="large"
                  >
                    <span class="text-sm">
                      I agree to the
                      <el-button
                        type="text"
                        size="small"
                        @click="showTermsDialog = true"
                      >
                        Terms and Conditions
                      </el-button>
                      and
                      <el-button
                        type="text"
                        size="small"
                        @click="showPrivacyDialog = true"
                      >
                        Privacy Policy
                      </el-button>
                    </span>
                  </el-checkbox>
                </el-form-item>

                <el-form-item prop="agreeToDataProcessing">
                  <el-checkbox
                    v-model="registrationForm.agreeToDataProcessing"
                    size="large"
                  >
                    <span class="text-sm">
                      I consent to the processing of my personal data for
                      barangay services and communications
                    </span>
                  </el-checkbox>
                </el-form-item>
              </div>

              <!-- Navigation Buttons -->
              <div
                class="flex justify-between items-center mt-8 pt-6 border-t border-gray-200"
              >
                <el-button
                  v-if="currentStep > 0"
                  @click="currentStep--"
                  size="large"
                  class="px-8"
                >
                  <Icon name="heroicons:arrow-left" class="w-4 h-4 mr-2" />
                  Previous
                </el-button>
                <div v-else></div>

                <div class="flex space-x-4">
                  <el-button
                    v-if="currentStep < 3"
                    type="primary"
                    @click="nextStep"
                    size="large"
                    class="px-8"
                  >
                    Next Step
                    <Icon name="heroicons:arrow-right" class="w-4 h-4 ml-2" />
                  </el-button>

                  <el-button
                    v-else
                    type="success"
                    @click="submitRegistration"
                    size="large"
                    class="px-8"
                    :loading="isSubmitting"
                  >
                    <Icon name="heroicons:check" class="w-4 h-4 mr-2" />
                    Complete Registration
                  </el-button>
                </div>
              </div>
            </el-form>
          </el-card>

          <!-- Already have account -->
          <div class="text-center mt-8">
            <p class="text-gray-600">
              Already have an account?
              <NuxtLink
                to="/"
                class="text-primary-600 hover:text-primary-800 font-medium"
              >
                Sign in here
              </NuxtLink>
            </p>
          </div>
        </div>

        <!-- Terms and Conditions Dialog -->
        <el-dialog
          v-model="showTermsDialog"
          title="Terms and Conditions"
          width="80%"
          max-width="800px"
        >
          <div class="text-sm space-y-4">
            <p><strong>1. Acceptance of Terms</strong></p>
            <p>
              By registering for the Barangay San Antonio resident portal, you
              agree to comply with and be bound by these terms and conditions.
            </p>

            <p><strong>2. User Responsibilities</strong></p>
            <p>
              You are responsible for maintaining the confidentiality of your
              account credentials and for all activities that occur under your
              account.
            </p>

            <p><strong>3. Accurate Information</strong></p>
            <p>
              You agree to provide accurate, current, and complete information
              during registration and to update such information as necessary.
            </p>

            <p><strong>4. Permitted Use</strong></p>
            <p>
              The portal is intended solely for legitimate barangay services and
              communications. Misuse may result in account termination.
            </p>

            <p><strong>5. Privacy and Data Protection</strong></p>
            <p>
              Your personal information will be handled in accordance with our
              Privacy Policy and applicable data protection laws.
            </p>
          </div>
          <template #footer>
            <el-button @click="showTermsDialog = false">Close</el-button>
          </template>
        </el-dialog>

        <!-- Privacy Policy Dialog -->
        <el-dialog
          v-model="showPrivacyDialog"
          title="Privacy Policy"
          width="80%"
          max-width="800px"
        >
          <div class="text-sm space-y-4">
            <p><strong>Data Collection</strong></p>
            <p>
              We collect personal information necessary to provide barangay
              services and maintain accurate resident records.
            </p>

            <p><strong>Data Use</strong></p>
            <p>
              Your information is used to process service requests, communicate
              important updates, and maintain community records.
            </p>

            <p><strong>Data Sharing</strong></p>
            <p>
              Information may be shared with relevant government agencies as
              required by law or for service provision.
            </p>

            <p><strong>Data Security</strong></p>
            <p>
              We implement appropriate security measures to protect your
              personal information from unauthorized access or disclosure.
            </p>

            <p><strong>Your Rights</strong></p>
            <p>
              You have the right to access, correct, or request deletion of your
              personal data in accordance with applicable laws.
            </p>
          </div>
          <template #footer>
            <el-button @click="showPrivacyDialog = false">Close</el-button>
          </template>
        </el-dialog>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive, computed, watch } from "vue";
import { User, Phone, Message, Lock } from "@element-plus/icons-vue";

definePageMeta({
  layout: "guest",
});

// Reactive data
const currentStep = ref(0);
const isSubmitting = ref(false);
const showTermsDialog = ref(false);
const showPrivacyDialog = ref(false);
const registrationFormRef = ref();

// Registration form data
const registrationForm = reactive({
  // Personal Information
  firstName: "",
  lastName: "",
  middleName: "",
  suffix: "",
  dateOfBirth: "",
  gender: "",
  civilStatus: "",
  occupation: "",

  // Contact Information
  mobileNumber: "",
  landlineNumber: "",
  email: "",
  emergencyContactName: "",
  emergencyContactNumber: "",
  emergencyContactRelationship: "",

  // Address Information
  houseNumber: "",
  blockLot: "",
  street: "",
  purok: "",
  barangay: "Barangay San Antonio",
  city: "",
  province: "",
  zipCode: "",
  householdStatus: "",
  yearsOfResidency: 0,

  // Account Setup
  username: "",
  password: "",
  confirmPassword: "",
  agreeToTerms: false,
  agreeToDataProcessing: false,
});

// Form validation rules
const formRules = reactive({
  firstName: [
    { required: true, message: "First name is required", trigger: "blur" },
    {
      min: 2,
      max: 50,
      message: "Length should be 2 to 50 characters",
      trigger: "blur",
    },
  ],
  lastName: [
    { required: true, message: "Last name is required", trigger: "blur" },
    {
      min: 2,
      max: 50,
      message: "Length should be 2 to 50 characters",
      trigger: "blur",
    },
  ],
  dateOfBirth: [
    { required: true, message: "Date of birth is required", trigger: "change" },
  ],
  gender: [
    { required: true, message: "Gender is required", trigger: "change" },
  ],
  civilStatus: [
    { required: true, message: "Civil status is required", trigger: "change" },
  ],
  mobileNumber: [
    { required: true, message: "Mobile number is required", trigger: "blur" },
    {
      pattern: /^(?:\+639\d{9}|09\d{9})$/,
      message: "Please enter a valid Philippine mobile number",
      trigger: "blur",
    },
  ],
  email: [
    { required: true, message: "Email is required", trigger: "blur" },
    {
      type: "email",
      message: "Please enter a valid email address",
      trigger: "blur",
    },
  ],
  houseNumber: [
    {
      required: true,
      message: "House/Unit number is required",
      trigger: "blur",
    },
  ],
  street: [{ required: true, message: "Street is required", trigger: "blur" }],
  purok: [
    { required: true, message: "Purok/Zone is required", trigger: "change" },
  ],
  city: [
    {
      required: true,
      message: "City/Municipality is required",
      trigger: "blur",
    },
  ],
  province: [
    { required: true, message: "Province is required", trigger: "blur" },
  ],
  zipCode: [
    { required: true, message: "ZIP code is required", trigger: "blur" },
    {
      pattern: /^\d{4}$/,
      message: "ZIP code must be 4 digits",
      trigger: "blur",
    },
  ],
  householdStatus: [
    {
      required: true,
      message: "Household status is required",
      trigger: "change",
    },
  ],
  username: [
    { required: true, message: "Username is required", trigger: "blur" },
    {
      min: 4,
      max: 20,
      message: "Username must be 4-20 characters",
      trigger: "blur",
    },
    {
      pattern: /^[a-zA-Z0-9_]+$/,
      message: "Username can only contain letters, numbers, and underscores",
      trigger: "blur",
    },
  ],
  password: [
    { required: true, message: "Password is required", trigger: "blur" },
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
        if (value !== registrationForm.password) {
          callback(new Error("Passwords do not match"));
        } else {
          callback();
        }
      },
      trigger: "blur",
    },
  ],
  agreeToTerms: [
    {
      validator: (rule, value, callback) => {
        if (!value) {
          callback(new Error("You must agree to the terms and conditions"));
        } else {
          callback();
        }
      },
      trigger: "change",
    },
  ],
  agreeToDataProcessing: [
    {
      validator: (rule, value, callback) => {
        if (!value) {
          callback(new Error("You must consent to data processing"));
        } else {
          callback();
        }
      },
      trigger: "change",
    },
  ],
});

// Password strength checker
const passwordChecks = computed(() => {
  const password = registrationForm.password;
  return {
    length: password.length >= 8,
    uppercase: /[A-Z]/.test(password),
    lowercase: /[a-z]/.test(password),
    number: /\d/.test(password),
  };
});

// Methods
const disabledDate = (time) => {
  // Disable future dates and dates older than 100 years
  const now = new Date();
  const hundredYearsAgo = new Date(
    now.getFullYear() - 100,
    now.getMonth(),
    now.getDate()
  );
  return (
    time.getTime() > now.getTime() || time.getTime() < hundredYearsAgo.getTime()
  );
};

const nextStep = async () => {
  // Validate current step before proceeding
  const fieldsToValidate = getStepFields(currentStep.value);

  try {
    await registrationFormRef.value.validateField(fieldsToValidate);
    if (currentStep.value < 3) {
      currentStep.value++;
    }
  } catch (error) {
    console.log("Validation failed:", error);
  }
};

const getStepFields = (step) => {
  switch (step) {
    case 0:
      return ["firstName", "lastName", "dateOfBirth", "gender", "civilStatus"];
    case 1:
      return ["mobileNumber", "email"];
    case 2:
      return [
        "houseNumber",
        "street",
        "purok",
        "city",
        "province",
        "zipCode",
        "householdStatus",
      ];
    case 3:
      return [
        "username",
        "password",
        "confirmPassword",
        "agreeToTerms",
        "agreeToDataProcessing",
      ];
    default:
      return [];
  }
};

const submitRegistration = async () => {
  try {
    await registrationFormRef.value.validate();
    isSubmitting.value = true;

    // Simulate API call
    setTimeout(() => {
      isSubmitting.value = false;
      ElMessage.success("Registration completed successfully!");
      // Redirect to login or dashboard
      // navigateTo('/login')
    }, 2000);
  } catch (error) {
    ElMessage.error("Please fill in all required fields correctly");
    console.log("Registration failed:", error);
  }
};

// Meta tags
useHead({
  title: "Register - Barangay Resident Portal",
  meta: [
    {
      name: "description",
      content:
        "Register for Barangay San Antonio resident portal to access digital services",
    },
  ],
});
</script>

<style scoped>
.el-card {
  border-radius: 16px;
  border: none;
}

.el-form-item {
  margin-bottom: 24px;
}

.el-step__title {
  font-size: 14px;
}

.el-input,
.el-select,
.el-date-picker {
  width: 100%;
}

.el-steps {
  margin-bottom: 2rem;
}

.el-alert {
  border-radius: 8px;
}

.el-checkbox {
  display: flex;
  align-items: flex-start;
  line-height: 1.5;
}

.el-checkbox__label {
  line-height: 1.5;
}

.el-button {
  border-radius: 8px;
}

/* Custom step styling */
.el-steps--horizontal .el-step__line {
  background: #e4e7ed;
}

.el-steps--horizontal .el-step__head.is-finish {
  background: #67c23a;
  border-color: #67c23a;
  color: white;
}

.el-steps--horizontal .el-step__head.is-process {
  background: #409eff;
  border-color: #409eff;
  color: white;
}

/* Form styling */
.registration-step-header {
  background: linear-gradient(135deg, #f8fafc 0%, #e2e8f0 100%);
  border-radius: 12px;
  padding: 1.5rem;
  margin-bottom: 2rem;
  border: 1px solid #e2e8f0;
}

/* Responsive adjustments */
@media (max-width: 768px) {
  .el-form-item__label {
    font-size: 14px;
  }

  .el-steps {
    margin-bottom: 1rem;
  }

  .registration-step-header {
    padding: 1rem;
    margin-bottom: 1rem;
  }

  .grid.md\\:grid-cols-2 {
    grid-template-columns: 1fr;
  }
}

/* Loading state */
.el-button.is-loading {
  pointer-events: none;
}

/* Custom focus states */
.el-input__inner:focus,
.el-textarea__inner:focus,
.el-select .el-input__inner:focus {
  border-color: #409eff;
  box-shadow: 0 0 0 3px rgba(64, 158, 255, 0.1);
}

/* Password strength indicators */
.password-requirements li {
  transition: color 0.3s ease;
}

/* Animation for step transitions */
.step-content {
  animation: fadeIn 0.3s ease-in-out;
}

@keyframes fadeIn {
  from {
    opacity: 0;
    transform: translateY(10px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

/* Success message styling */
.registration-success {
  text-align: center;
  padding: 2rem;
  background: linear-gradient(135deg, #f0f9ff 0%, #e0f2fe 100%);
  border-radius: 12px;
  border: 1px solid #0ea5e9;
}

.success-icon {
  width: 4rem;
  height: 4rem;
  background: #10b981;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  margin: 0 auto 1rem;
  color: white;
}

/* Error states */
.el-form-item.is-error .el-input__inner,
.el-form-item.is-error .el-textarea__inner {
  border-color: #f56565;
}

.el-form-item__error {
  color: #f56565;
  font-size: 12px;
  line-height: 1;
  padding-top: 4px;
}

/* Mobile responsiveness for buttons */
@media (max-width: 640px) {
  .mobile-button-stack {
    flex-direction: column;
    gap: 0.5rem;
  }

  .mobile-button-stack .el-button {
    width: 100%;
    margin: 0;
  }
}

/* Custom dialog styling */
.el-dialog {
  border-radius: 12px;
  max-height: 80vh;
  overflow-y: auto;
}

.el-dialog__header {
  border-bottom: 1px solid #e4e7ed;
  padding: 1.5rem 1.5rem 1rem;
}

.el-dialog__body {
  padding: 1.5rem;
  color: #606266;
  line-height: 1.6;
}

/* Form progress indicator */
.form-progress {
  position: sticky;
  top: 0;
  background: white;
  z-index: 10;
  padding: 1rem 0;
  border-bottom: 1px solid #e4e7ed;
  margin-bottom: 2rem;
}

/* Smooth transitions */
* {
  transition: all 0.2s ease;
}

/* Focus styles for accessibility */
.el-button:focus,
.el-input:focus,
.el-select:focus,
.el-checkbox:focus {
  outline: 2px solid #409eff;
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
}
</style>
