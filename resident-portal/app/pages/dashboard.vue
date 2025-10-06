<template>
  <div class="min-h-screen bg-gray-50">
    <!-- Main Content -->
    
      <!-- Dashboard Content -->
      <div v-if="activeMenu === 'dashboard'">
        <!-- Welcome Section -->
        <div class="bg-gradient-to-r from-primary-600 to-primary-800 rounded-xl p-8 text-white mb-8">
          <div class="flex items-center justify-between">
            <div>
              <h2 class="text-3xl font-bold mb-2">Welcome back, {{ resident.firstName }}!</h2>
              <p class="text-primary-100 mb-1">Resident ID: {{ resident.residentId }}</p>
              <p class="text-primary-100">Household: {{ resident.householdId }}</p>
            </div>
            <div class="hidden md:block">
              <Icon name="heroicons:home-modern" class="w-24 h-24 text-primary-200 opacity-50" />
            </div>
          </div>
        </div>

        <!-- Quick Stats Cards -->
        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <el-card v-for="stat in quickStats" :key="stat.title" class="text-center hover:shadow-lg transition-shadow">
            <div class="flex items-center justify-center mb-4">
              <div :class="`w-16 h-16 rounded-full flex items-center justify-center ${stat.bgColor}`">
                <Icon :name="stat.icon" :class="`w-8 h-8 ${stat.iconColor}`" />
              </div>
            </div>
            <h3 class="text-2xl font-bold text-gray-900 mb-2">{{ stat.value }}</h3>
            <p class="text-gray-600">{{ stat.title }}</p>
          </el-card>
        </div>

        <!-- Main Dashboard Grid -->
        <div class="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <!-- Recent Documents -->
          <div class="lg:col-span-2">
            <el-card>
              <template #header>
                <div class="flex items-center justify-between">
                  <h3 class="text-lg font-semibold text-gray-900 flex items-center">
                    <Icon name="heroicons:document-text" class="w-5 h-5 mr-2 text-primary-600" />
                    Recent Documents
                  </h3>
                  <el-button type="primary" size="small" @click="router.push('/documents')">
                    View All
                  </el-button>
                </div>
              </template>
              
              <div class="space-y-4">
                <div v-for="doc in recentDocuments" :key="doc.id" 
                     class="flex items-center justify-between p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
                  <div class="flex items-center space-x-4">
                    <div class="w-12 h-12 bg-primary-100 rounded-lg flex items-center justify-center">
                      <Icon name="heroicons:document" class="w-6 h-6 text-primary-600" />
                    </div>
                    <div>
                      <h4 class="font-medium text-gray-900">{{ doc.type }}</h4>
                      <p class="text-sm text-gray-600">{{ doc.trackingNo }}</p>
                      <p class="text-xs text-gray-500">{{ doc.date }}</p>
                    </div>
                  </div>
                  <div class="text-right">
                    <el-tag :type="getStatusType(doc.status)" size="small">
                      {{ doc.status }}
                    </el-tag>
                  </div>
                </div>
              </div>
            </el-card>
          </div>

          <!-- Announcements -->
          <div>
            <el-card>
              <template #header>
                <h3 class="text-lg font-semibold text-gray-900 flex items-center">
                  <Icon name="heroicons:megaphone" class="w-5 h-5 mr-2 text-primary-600" />
                  Announcements
                </h3>
              </template>
              
              <div class="space-y-4">
                <div v-for="announcement in announcements" :key="announcement.id"
                     class="border-l-4 border-primary-500 pl-4 py-2">
                  <h4 class="font-medium text-gray-900 text-sm">{{ announcement.title }}</h4>
                  <p class="text-xs text-primary-600 mb-1">{{ announcement.date }}</p>
                  <p class="text-xs text-gray-600">{{ announcement.content }}</p>
                </div>
              </div>
            </el-card>
          </div>
        </div>

        <!-- Help Desk Tickets -->
        <div class="mt-8">
          <el-card>
            <template #header>
              <div class="flex items-center justify-between">
                <h3 class="text-lg font-semibold text-gray-900 flex items-center">
                  <Icon name="heroicons:chat-bubble-left-ellipsis" class="w-5 h-5 mr-2 text-primary-600" />
                  Recent Help Desk Tickets
                </h3>
                <el-button type="primary" size="small" @click="router.push('/help-desk')">
                  View All Tickets
                </el-button>
              </div>
            </template>
            
            <el-table :data="helpDeskTickets" style="width: 100%">
              <el-table-column prop="type" label="Type" width="120">
                <template #default="scope">
                  <el-tag :type="getTicketTypeColor(scope.row.type)" size="small">
                    {{ scope.row.type }}
                  </el-tag>
                </template>
              </el-table-column>
              <el-table-column prop="subject" label="Subject" />
              <el-table-column prop="date" label="Date" width="150" />
              <el-table-column prop="status" label="Status" width="150">
                <template #default="scope">
                  <el-tag :type="getStatusType(scope.row.status)" size="small">
                    {{ scope.row.status }}
                  </el-tag>
                </template>
              </el-table-column>
              <el-table-column label="Actions" width="100">
                <template #default="scope">
                  <el-button size="small" type="text">
                    <Icon name="heroicons:eye" class="w-4 h-4" />
                  </el-button>
                </template>
              </el-table-column>
            </el-table>
          </el-card>
        </div>
      </div>
  </div>
</template>

<script setup>
import { ref, reactive } from 'vue'

// Reactive data
const activeMenu = ref('dashboard')
const router = useRouter()


// Resident data
const resident = reactive({
  name: 'Juan Dela Cruz',
  firstName: 'Juan',
  residentId: 'RES-2024-0156',
  householdId: 'HH-2024-001',
  address: 'Block 5 Lot 12, Barangay San Antonio',
  phone: '+63 912 345 6789',
  email: 'juan.delacruz@email.com',
  avatar: ''
})

// Quick stats data
const quickStats = ref([
  {
    title: 'Pending Documents',
    value: '3',
    icon: 'heroicons:document-text',
    bgColor: 'bg-orange-100',
    iconColor: 'text-orange-600'
  },
  {
    title: 'Active Tickets',
    value: '2',
    icon: 'heroicons:ticket',
    bgColor: 'bg-blue-100',
    iconColor: 'text-blue-600'
  },
  {
    title: 'Completed Requests',
    value: '12',
    icon: 'heroicons:check-circle',
    bgColor: 'bg-green-100',
    iconColor: 'text-green-600'
  },
  {
    title: 'Notifications',
    value: '5',
    icon: 'heroicons:bell',
    bgColor: 'bg-red-100',
    iconColor: 'text-red-600'
  }
])

// Recent documents
const recentDocuments = ref([
  {
    id: 1,
    type: 'Barangay Clearance',
    status: 'Ready for Pickup',
    date: '2024-09-25',
    trackingNo: 'BC-2024-0234'
  },
  {
    id: 2,
    type: 'Certificate of Indigency',
    status: 'Processing',
    date: '2024-09-24',
    trackingNo: 'CI-2024-0189'
  },
  {
    id: 3,
    type: 'Business Permit',
    status: 'Under Review',
    date: '2024-09-22',
    trackingNo: 'BP-2024-0067'
  }
])

// All documents for documents page
const allDocuments = ref([
  ...recentDocuments.value,
  {
    id: 4,
    type: 'Residency Certificate',
    status: 'Approved',
    date: '2024-09-20',
    trackingNo: 'RC-2024-0112'
  },
  {
    id: 5,
    type: 'Barangay Clearance',
    status: 'Processing',
    date: '2024-09-18',
    trackingNo: 'BC-2024-0201'
  }
])

// Help desk tickets
const helpDeskTickets = ref([
  {
    id: 1,
    type: 'Appointment',
    subject: 'Medical Certificate Request',
    status: 'Confirmed',
    date: '2024-09-30 10:00 AM'
  },
  {
    id: 2,
    type: 'Complaint',
    subject: 'Noise Complaint - Neighbor',
    status: 'Under Investigation',
    date: '2024-09-23'
  },
  {
    id: 3,
    type: 'Suggestion',
    subject: 'Street Lighting Improvement',
    status: 'Acknowledged',
    date: '2024-09-20'
  }
])



// Announcements
const announcements = ref([
  {
    id: 1,
    title: 'Barangay Assembly Meeting',
    date: 'October 5, 2024',
    content: 'Monthly community meeting scheduled...'
  },
  {
    id: 2,
    title: 'Medical Mission',
    date: 'October 12, 2024',
    content: 'Free medical checkup and consultation...'
  },
  {
    id: 3,
    title: 'Street Cleaning Drive',
    date: 'October 15, 2024',
    content: 'Community participation requested...'
  }
])

// Forms
const newDocumentForm = reactive({
  type: '',
  purpose: ''
})


// Methods
const getStatusType = (status) => {
  switch (status.toLowerCase()) {
    case 'ready for pickup':
    case 'approved':
    case 'confirmed':
    case 'resolved':
      return 'success'
    case 'processing':
    case 'acknowledged':
      return 'info'
    case 'under review':
    case 'under investigation':
    case 'pending':
      return 'warning'
    case 'rejected':
    case 'cancelled':
      return 'danger'
    default:
      return 'info'
  }
}

const getTicketTypeColor = (type) => {
  switch (type.toLowerCase()) {
    case 'appointment':
      return 'success'
    case 'complaint':
      return 'danger'
    case 'suggestion':
      return 'info'
    case 'inquiry':
      return 'warning'
    default:
      return 'info'
  }
}

// Meta tags for Nuxt.js
useHead({
  title: 'Barangay Resident Portal - Dashboard',
  meta: [
    {
      name: 'description',
      content: 'Barangay resident portal dashboard for document requests and services'
    }
  ]
})
</script>

<style scoped>
.el-card {
  border-radius: 12px;
}

.el-button {
  border-radius: 8px;
}

.el-tag {
  border-radius: 6px;
}

.el-table {
  border-radius: 8px;
}
</style>