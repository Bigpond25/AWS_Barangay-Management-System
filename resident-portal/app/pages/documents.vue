<template>
  <div>
    <div class="flex items-center justify-between mb-6">
      <h2 class="text-2xl font-bold text-gray-900">Document Requests</h2>
      <el-button type="primary" @click="showNewDocumentDialog = true">
        <Icon name="heroicons:plus" class="w-4 h-4 mr-2" />
        New Request
      </el-button>
    </div>

    <el-card>
      <el-table :data="allDocuments" style="width: 100%">
        <el-table-column prop="type" label="Document Type" />
        <el-table-column
          prop="trackingNo"
          label="Tracking Number"
          width="180"
        />
        <el-table-column prop="date" label="Date Requested" width="150" />
        <el-table-column prop="status" label="Status" width="150">
          <template #default="scope">
            <el-tag :type="getStatusType(scope.row.status)" size="small">
              {{ scope.row.status }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column label="Actions" width="150">
          <template #default="scope">
            <el-button-group>
              <el-button size="small" type="text">
                <Icon name="heroicons:eye" class="w-4 h-4" />
              </el-button>
              <el-button
                v-if="scope.row.status === 'Ready for Pickup'"
                size="small"
                type="text"
              >
                <Icon name="heroicons:arrow-down-tray" class="w-4 h-4" />
              </el-button>
            </el-button-group>
          </template>
        </el-table-column>
      </el-table>
    </el-card>

    <el-dialog
      v-model="showNewDocumentDialog"
      title="New Document Request"
      width="500px"
    >
      <el-form :model="newDocumentForm" label-width="120px">
        <el-form-item label="Document Type">
          <el-select
            v-model="newDocumentForm.type"
            placeholder="Select document type"
            style="width: 100%"
          >
            <el-option label="Barangay Clearance" value="Barangay Clearance" />
            <el-option
              label="Certificate of Indigency"
              value="Certificate of Indigency"
            />
            <el-option label="Business Permit" value="Business Permit" />
            <el-option
              label="Residency Certificate"
              value="Residency Certificate"
            />
          </el-select>
        </el-form-item>
        <el-form-item label="Purpose">
          <el-input
            v-model="newDocumentForm.purpose"
            type="textarea"
            :rows="3"
            placeholder="Enter purpose..."
          />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="showNewDocumentDialog = false">Cancel</el-button>
        <el-button type="primary" @click="submitDocumentRequest"
          >Submit Request</el-button
        >
      </template>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
const showNewDocumentDialog = ref(false);

const newDocumentForm = reactive({
  type: '',
  purpose: ''
})

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

const submitDocumentRequest = () => {
  // Handle document request submission
  console.log('Document request:', newDocumentForm)
  showNewDocumentDialog.value = false
  // Reset form
  Object.assign(newDocumentForm, {
    type: '',
    purpose: ''
  })
}
</script>