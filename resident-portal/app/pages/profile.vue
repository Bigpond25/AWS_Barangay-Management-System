<template>
  <div>
    <h2 class="text-2xl font-bold text-gray-900 mb-6">My Profile</h2>

    <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
      <div class="lg:col-span-1">
        <el-card>
          <div class="text-center">
            <el-avatar
              :size="120"
              :src="resident.avatar"
              :icon="UserFilled"
              class="mb-4"
            />
            <h3 class="text-xl font-semibold text-gray-900">
              {{ resident.name }}
            </h3>
            <p class="text-gray-600">{{ resident.residentId }}</p>
            <el-button type="primary" class="mt-4">
              <Icon name="heroicons:pencil" class="w-4 h-4 mr-2" />
              Edit Profile
            </el-button>
          </div>
        </el-card>
      </div>

      <div class="lg:col-span-2">
        <el-card>
          <template #header>
            <h3 class="text-lg font-semibold">Personal Information</h3>
          </template>

          <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1"
                >Full Name</label
              >
              <p class="text-gray-900">{{ resident.name }}</p>
            </div>
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1"
                >Resident ID</label
              >
              <p class="text-gray-900">{{ resident.residentId }}</p>
            </div>
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1"
                >Household ID</label
              >
              <p class="text-gray-900">{{ resident.householdId }}</p>
            </div>
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1"
                >Address</label
              >
              <p class="text-gray-900">{{ resident.address }}</p>
            </div>
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1"
                >Phone Number</label
              >
              <p class="text-gray-900">{{ resident.phone }}</p>
            </div>
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1"
                >Email Address</label
              >
              <p class="text-gray-900">{{ resident.email }}</p>
            </div>
          </div>
        </el-card>
      </div>
    </div>
  </div>
</template>

<script setup>
// UserFilled
import { UserFilled } from '@element-plus/icons-vue'

// Resident data
const resident = ref({
  name: 'Juan Dela Cruz',
  firstName: 'Juan',
  residentId: 'RES-2024-0156',
  householdId: 'HH-2024-001',
  address: 'Block 5 Lot 12, Barangay San Antonio',
  phone: '+63 912 345 6789',
  email: 'juan.delacruz@email.com',
  avatar: ''
})
</script>
