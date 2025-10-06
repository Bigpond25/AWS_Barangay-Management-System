<template>
  <div>
    <div class="flex items-center justify-between mb-6">
      <h2 class="text-2xl font-bold text-gray-900">Help Desk Tickets</h2>
      <el-button type="primary" @click="showNewTicketDialog = true">
        <Icon name="heroicons:plus" class="w-4 h-4 mr-2" />
        New Ticket
      </el-button>
    </div>

    <el-card>
      <el-table :data="allHelpDeskTickets" style="width: 100%">
        <el-table-column prop="type" label="Type" width="120">
          <template #default="scope">
            <el-tag :type="getTicketTypeColor(scope.row.type)" size="small">
              {{ scope.row.type }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="subject" label="Subject" />
        <el-table-column prop="date" label="Date" width="180" />
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

    <!-- New Ticket Dialog -->
    <el-dialog
      v-model="showNewTicketDialog"
      title="New Help Desk Ticket"
      width="500px"
    >
      <el-form :model="newTicketForm" label-width="120px">
        <el-form-item label="Ticket Type">
          <el-select
            v-model="newTicketForm.type"
            placeholder="Select ticket type"
            style="width: 100%"
          >
            <el-option label="Appointment" value="Appointment" />
            <el-option label="Complaint" value="Complaint" />
            <el-option label="Suggestion" value="Suggestion" />
            <el-option label="Inquiry" value="Inquiry" />
          </el-select>
        </el-form-item>
        <el-form-item label="Subject">
          <el-input
            v-model="newTicketForm.subject"
            placeholder="Enter subject..."
          />
        </el-form-item>
        <el-form-item label="Description">
          <el-input
            v-model="newTicketForm.description"
            type="textarea"
            :rows="4"
            placeholder="Enter description..."
          />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="showNewTicketDialog = false">Cancel</el-button>
        <el-button type="primary" @click="submitTicket"
          >Submit Ticket</el-button
        >
      </template>
    </el-dialog>
  </div>
</template>
<script setup lang="ts">
const showNewTicketDialog = ref(false);

const newTicketForm = reactive({
  type: "",
  subject: "",
  description: "",
});

const submitTicket = () => {
  // Handle ticket submission
  console.log("New ticket:", newTicketForm);
  showNewTicketDialog.value = false;
  // Reset form
  Object.assign(newTicketForm, {
    type: "",
    subject: "",
    description: "",
  });
};

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

// All help desk tickets
const allHelpDeskTickets = ref([
  ...helpDeskTickets.value,
  {
    id: 4,
    type: 'Inquiry',
    subject: 'Barangay ID Requirements',
    status: 'Resolved',
    date: '2024-09-15'
  },
  {
    id: 5,
    type: 'Appointment',
    subject: 'Captain Meeting Request',
    status: 'Pending',
    date: '2024-09-12'
  }
])

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
</script>
