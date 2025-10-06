<template>
  <div class="bg-white shadow-sm border-b border-gray-200">
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <div class="flex justify-between items-center h-16">
        <!-- Logo & Brand -->
        <div class="flex items-center space-x-4">
          <div class="flex items-center space-x-3">
            <div class="w-12 h-12">
              <NuxtImg src="/img/sanMiguelLogo.jpg" class="rounded-lg" />
            </div>
            <div>
              <h1 class="text-xl font-bold text-gray-900">
                {{ $t("app.title") }}
              </h1>
              <p class="text-xs text-gray-500">
                {{ $t("app.barangay") }}
              </p>
            </div>
          </div>
        </div>

        <!-- Top Menu Items -->
        <el-menu
          mode="horizontal"
          :default-active="route.path"
          :router="true"
          :ellipsis="false"
          class="hidden md:flex items-center space-x-8"
        >
          <el-menu-item
            v-for="item in topMenuItems"
            :key="item.name"
            :index="item.path"
            class="flex items-center space-x-2"
          >
            <Icon :name="item.icon" class="w-5 h-5" />
            <span>{{ $t(`menu.${item.name}`) }}</span>
          </el-menu-item>
        </el-menu>

        <!-- User Profile & Notifications -->
        <div class="flex items-center space-x-4">
          <el-badge :value="5" class="item">
            <el-button circle>
              <Icon name="heroicons:bell" class="w-5 h-5" />
            </el-button>
          </el-badge>

          <el-dropdown trigger="click">
            <div class="flex items-center space-x-2 cursor-pointer">
              <el-avatar
                :size="36"
                :src="resident.avatar || ''"
                :icon="UserFilled"
              />
              <div class="hidden md:block text-left">
                <p class="text-sm font-medium text-gray-900">
                  {{ resident.name }}
                </p>
                <p class="text-xs text-gray-500">{{ resident.residentId }}</p>
              </div>
              <Icon
                name="heroicons:chevron-down"
                class="w-4 h-4 text-gray-400"
              />
            </div>
            <template #dropdown>
              <el-dropdown-menu>
                <el-dropdown-item>
                  <Icon name="heroicons:user" class="w-4 h-4 mr-2" />
                  {{ $t("user.myProfile") }}
                </el-dropdown-item>
                <el-dropdown-item>
                  <Icon name="heroicons:cog-6-tooth" class="w-4 h-4 mr-2" />
                  {{ $t("user.settings") }}
                </el-dropdown-item>
                <el-dropdown-item>
                  <LanguageSelector />
                </el-dropdown-item>
                <el-dropdown-item divided @click="router.push('/')">
                  <Icon
                    name="heroicons:arrow-right-on-rectangle"
                    class="w-4 h-4 mr-2"
                  />
                  {{ $t("user.signOut") }}
                </el-dropdown-item>
              </el-dropdown-menu>
            </template>
          </el-dropdown>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { UserFilled } from "@element-plus/icons-vue";

const route = useRoute();
const router = useRouter();

// Menu structure (no labels needed, handled by i18n)
const topMenuItems = ref([
  { name: "dashboard", icon: "heroicons:home", path: "/dashboard" },
  { name: "documents", icon: "heroicons:document-text", path: "/documents" },
  {
    name: "helpdesk",
    icon: "heroicons:chat-bubble-left-ellipsis",
    path: "/help-desk",
  },
  { name: "profile", icon: "heroicons:user", path: "/profile" },
]);

// Resident (sample data)
const resident = reactive({
  name: "Juan Dela Cruz",
  firstName: "Juan",
  residentId: "RES-2024-0156",
  householdId: "HH-2024-001",
  address: "Block 5 Lot 12, Barangay San Antonio",
  phone: "+63 912 345 6789",
  email: "juan.delacruz@email.com",
  avatar: "",
});
</script>
