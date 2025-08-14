# 🏘️ **AWS Barangay Resident Portal Implementation Plan**

## 📋 **PROJECT OVERVIEW**

### **System Architecture**
- **Admin Portal**: `admin.barangay.com` (existing frontend)
- **Resident Portal**: `resident.barangay.com` (new separate frontend)
- **Shared Backend**: Laravel API with role-based access control
- **Domain Structure**: Subdomain routing for portal separation

---

## 🎯 **IMPLEMENTATION PHASES**

### **PHASE 1: Backend Preparation & Resident User System**

#### **1.1 Resident User Authentication Extension**
```php
// Backend Extensions Required

// 1. New User Roles & Permissions
ROLES:
- RESIDENT (new role with limited permissions)
- PENDING_RESIDENT (for verification workflow)

PERMISSIONS:
- view-own-profile
- edit-own-profile  
- create-own-appointments
- view-own-documents
- submit-own-requests
- view-own-tickets
```

#### **1.2 API Route Extensions**
```php
// Add to backend/routes/api.php

// Resident Registration (Public)
Route::prefix('resident')->group(function () {
    Route::post('/register', [ResidentAuthController::class, 'register']);
    Route::post('/verify-email', [ResidentAuthController::class, 'verifyEmail']);
    Route::post('/resend-verification', [ResidentAuthController::class, 'resendVerification']);
});

// Resident Self-Service Routes (Authenticated)
Route::middleware(['auth:sanctum', 'role:resident'])->prefix('resident')->group(function () {
    // Profile Management
    Route::get('/profile', [ResidentProfileController::class, 'show']);
    Route::put('/profile', [ResidentProfileController::class, 'update']);
    Route::post('/profile/documents', [ResidentProfileController::class, 'uploadDocuments']);
    
    // Service Requests
    Route::prefix('services')->group(function () {
        Route::get('/available', [ResidentServicesController::class, 'getAvailable']);
        Route::post('/request', [ResidentServicesController::class, 'request']);
        Route::get('/requests', [ResidentServicesController::class, 'getMyRequests']);
        Route::get('/requests/{id}', [ResidentServicesController::class, 'getRequest']);
    });
    
    // Appointments (Self-Service)
    Route::prefix('appointments')->group(function () {
        Route::get('/', [ResidentAppointmentController::class, 'getMyAppointments']);
        Route::post('/', [ResidentAppointmentController::class, 'create']);
        Route::put('/{id}', [ResidentAppointmentController::class, 'update']);
        Route::delete('/{id}', [ResidentAppointmentController::class, 'cancel']);
    });
    
    // Help Desk (Own tickets only)
    Route::prefix('help-desk')->group(function () {
        Route::get('/', [ResidentHelpDeskController::class, 'getMyTickets']);
        Route::post('/complaints', [ResidentHelpDeskController::class, 'createComplaint']);
        Route::post('/suggestions', [ResidentHelpDeskController::class, 'createSuggestion']);
    });
});
```

#### **1.3 Database Schema Extensions**
```sql
-- Extend users table for resident verification
ALTER TABLE users ADD COLUMN verification_status ENUM('pending', 'verified', 'rejected') DEFAULT 'pending';
ALTER TABLE users ADD COLUMN verification_documents JSON NULL;
ALTER TABLE users ADD COLUMN verified_at TIMESTAMP NULL;
ALTER TABLE users ADD COLUMN verified_by UUID NULL;
ALTER TABLE users ADD COLUMN rejection_reason TEXT NULL;

-- Resident profile submissions table
CREATE TABLE resident_profile_submissions (
    id UUID PRIMARY KEY,
    user_id UUID REFERENCES users(id),
    submission_data JSON NOT NULL,
    status ENUM('pending', 'approved', 'rejected') DEFAULT 'pending',
    reviewed_by UUID NULL REFERENCES users(id),
    reviewed_at TIMESTAMP NULL,
    rejection_reason TEXT NULL,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

-- Add foreign key for verification
ALTER TABLE users ADD FOREIGN KEY (verified_by) REFERENCES users(id);
```

---

### **PHASE 2: Resident Portal Frontend Development**

#### **2.1 Project Structure**
```
resident-portal/
├── package.json
├── vite.config.ts
├── tailwind.config.js
├── src/
│   ├── main.tsx
│   ├── App.tsx
│   ├── components/
│   │   ├── auth/
│   │   │   ├── LoginForm.tsx
│   │   │   ├── RegisterForm.tsx
│   │   │   └── EmailVerification.tsx
│   │   ├── profile/
│   │   │   ├── ProfileForm.tsx
│   │   │   ├── DocumentUpload.tsx
│   │   │   └── VerificationStatus.tsx
│   │   ├── services/
│   │   │   ├── ServiceCatalog.tsx
│   │   │   ├── ServiceRequest.tsx
│   │   │   └── RequestTracker.tsx
│   │   ├── appointments/
│   │   │   ├── AppointmentBooking.tsx
│   │   │   ├── AppointmentList.tsx
│   │   │   └── AppointmentDetails.tsx
│   │   ├── help-desk/
│   │   │   ├── ComplaintForm.tsx
│   │   │   ├── SuggestionForm.tsx
│   │   │   └── TicketHistory.tsx
│   │   └── shared/
│   │       ├── Layout.tsx
│   │       ├── Navigation.tsx
│   │       └── ProtectedRoute.tsx
│   ├── services/
│   │   ├── api/
│   │   │   ├── auth.service.ts
│   │   │   ├── profile.service.ts
│   │   │   ├── services.service.ts
│   │   │   ├── appointments.service.ts
│   │   │   └── helpdesk.service.ts
│   │   └── types/
│   │       ├── auth.types.ts
│   │       ├── profile.types.ts
│   │       └── services.types.ts
│   ├── contexts/
│   │   ├── AuthContext.tsx
│   │   └── NotificationContext.tsx
│   ├── hooks/
│   │   ├── useAuth.ts
│   │   ├── useProfile.ts
│   │   └── useServices.ts
│   └── utils/
│       ├── api.ts
│       ├── validation.ts
│       └── constants.ts
```

#### **2.2 Core Features Implementation**

##### **Registration & Authentication**
```typescript
// services/api/auth.service.ts
export class ResidentAuthService extends BaseApiService {
  async register(data: ResidentRegistrationData): Promise<RegistrationResponse> {
    return this.request('/resident/register', RegistrationResponseSchema, {
      method: 'POST',
      data
    });
  }

  async verifyEmail(token: string): Promise<void> {
    return this.request('/resident/verify-email', z.any(), {
      method: 'POST',
      data: { token }
    });
  }

  async login(credentials: LoginCredentials): Promise<LoginResponse> {
    return this.request('/auth/login', LoginResponseSchema, {
      method: 'POST',
      data: credentials
    });
  }
}

// types/auth.types.ts
export const ResidentRegistrationDataSchema = z.object({
  // Personal Information
  first_name: z.string().min(1, 'First name is required'),
  last_name: z.string().min(1, 'Last name is required'),
  middle_name: z.string().optional(),
  email: z.string().email('Valid email is required'),
  phone: z.string().min(1, 'Phone number is required'),
  
  // Account Information
  username: z.string().min(3, 'Username must be at least 3 characters'),
  password: z.string().min(8, 'Password must be at least 8 characters'),
  password_confirmation: z.string(),
  
  // Address Information
  street_address: z.string().min(1, 'Street address is required'),
  purok: z.string().optional(),
  barangay: z.string().min(1, 'Barangay is required'),
  municipality: z.string().min(1, 'Municipality is required'),
  province: z.string().min(1, 'Province is required'),
  
  // Profile Submission
  birth_date: z.string(),
  civil_status: z.enum(['SINGLE', 'MARRIED', 'DIVORCED', 'WIDOWED', 'SEPARATED', 'LIVE_IN']),
  occupation: z.string().optional(),
  
  // Document Upload References
  document_uploads: z.array(z.string()).optional(),
  
  // Consent
  terms_accepted: z.boolean().refine(val => val === true, 'You must accept the terms'),
  privacy_consent: z.boolean().refine(val => val === true, 'Privacy consent is required')
}).refine(data => data.password === data.password_confirmation, {
  message: "Passwords don't match",
  path: ["password_confirmation"]
});
```

##### **Profile Management**
```typescript
// components/profile/ProfileForm.tsx
export const ProfileForm: React.FC = () => {
  const { data: profile, isLoading } = useResidentProfile();
  const { mutate: updateProfile } = useUpdateProfile();
  const { mutate: uploadDocument } = useDocumentUpload();

  const form = useForm<ResidentProfileData>({
    resolver: zodResolver(ResidentProfileDataSchema),
    defaultValues: profile
  });

  const onSubmit = (data: ResidentProfileData) => {
    updateProfile(data);
  };

  return (
    <div className="max-w-4xl mx-auto p-6">
      <div className="bg-white shadow-lg rounded-lg">
        <div className="p-6 border-b">
          <h2 className="text-2xl font-bold text-gray-900">My Profile</h2>
          <p className="text-gray-600">Update your personal information</p>
        </div>
        
        <form onSubmit={form.handleSubmit(onSubmit)} className="p-6 space-y-6">
          {/* Personal Information Section */}
          <ProfileSection title="Personal Information">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField name="first_name" label="First Name" required />
              <FormField name="last_name" label="Last Name" required />
              <FormField name="middle_name" label="Middle Name" />
              <FormField name="birth_date" label="Birth Date" type="date" required />
            </div>
          </ProfileSection>

          {/* Contact Information Section */}
          <ProfileSection title="Contact Information">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField name="email" label="Email" type="email" required />
              <FormField name="phone" label="Phone Number" required />
            </div>
          </ProfileSection>

          {/* Address Information Section */}
          <ProfileSection title="Address Information">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField name="street_address" label="Street Address" required />
              <FormField name="purok" label="Purok/Sitio" />
              <FormField name="barangay" label="Barangay" required />
              <FormField name="municipality" label="Municipality" required />
              <FormField name="province" label="Province" required />
            </div>
          </ProfileSection>

          {/* Document Upload Section */}
          <ProfileSection title="Supporting Documents">
            <DocumentUpload onUpload={uploadDocument} />
          </ProfileSection>

          <div className="flex justify-end space-x-4">
            <Button type="button" variant="outline" onClick={() => form.reset()}>
              Cancel
            </Button>
            <Button type="submit" disabled={form.formState.isSubmitting}>
              {form.formState.isSubmitting ? 'Saving...' : 'Save Changes'}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};
```

---

### **PHASE 3: Admin Verification Workflow**

#### **3.1 Admin Dashboard Extensions**
```typescript
// Admin portal additions for resident verification

// components/residents/PendingVerifications.tsx
export const PendingVerifications: React.FC = () => {
  const { data: pendingResidents } = usePendingResidents();
  const { mutate: approveResident } = useApproveResident();
  const { mutate: rejectResident } = useRejectResident();

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">Pending Resident Verifications</h2>
        <div className="flex space-x-2">
          <Badge variant="yellow">{pendingResidents?.length || 0} Pending</Badge>
        </div>
      </div>

      <div className="bg-white shadow rounded-lg">
        <div className="divide-y divide-gray-200">
          {pendingResidents?.map(resident => (
            <ResidentVerificationCard
              key={resident.id}
              resident={resident}
              onApprove={() => approveResident(resident.id)}
              onReject={(reason) => rejectResident({ id: resident.id, reason })}
            />
          ))}
        </div>
      </div>
    </div>
  );
};

// components/residents/ResidentVerificationCard.tsx
export const ResidentVerificationCard: React.FC<{
  resident: PendingResident;
  onApprove: () => void;
  onReject: (reason: string) => void;
}> = ({ resident, onApprove, onReject }) => {
  const [showRejectModal, setShowRejectModal] = useState(false);
  const [rejectReason, setRejectReason] = useState('');

  return (
    <div className="p-6">
      <div className="flex justify-between items-start">
        <div className="flex-1">
          <div className="flex items-center space-x-3">
            <div className="w-12 h-12 bg-gray-300 rounded-full flex items-center justify-center">
              <User className="w-6 h-6 text-gray-600" />
            </div>
            <div>
              <h3 className="text-lg font-medium text-gray-900">
                {resident.first_name} {resident.last_name}
              </h3>
              <p className="text-sm text-gray-500">{resident.email}</p>
              <p className="text-sm text-gray-500">
                Submitted: {new Date(resident.created_at).toLocaleDateString()}
              </p>
            </div>
          </div>

          <div className="mt-4 grid grid-cols-2 gap-4">
            <div>
              <h4 className="font-medium text-gray-900">Contact Information</h4>
              <p className="text-sm text-gray-600">Phone: {resident.phone}</p>
              <p className="text-sm text-gray-600">Email: {resident.email}</p>
            </div>
            <div>
              <h4 className="font-medium text-gray-900">Address</h4>
              <p className="text-sm text-gray-600">
                {resident.street_address}, {resident.barangay}
              </p>
              <p className="text-sm text-gray-600">
                {resident.municipality}, {resident.province}
              </p>
            </div>
          </div>

          {resident.verification_documents && (
            <div className="mt-4">
              <h4 className="font-medium text-gray-900">Submitted Documents</h4>
              <div className="mt-2 space-y-2">
                {resident.verification_documents.map((doc, index) => (
                  <DocumentPreview key={index} document={doc} />
                ))}
              </div>
            </div>
          )}
        </div>

        <div className="ml-6 flex flex-col space-y-2">
          <Button
            onClick={onApprove}
            className="bg-green-600 hover:bg-green-700 text-white"
          >
            <Check className="w-4 h-4 mr-2" />
            Approve
          </Button>
          <Button
            onClick={() => setShowRejectModal(true)}
            variant="outline"
            className="text-red-600 border-red-600 hover:bg-red-50"
          >
            <X className="w-4 h-4 mr-2" />
            Reject
          </Button>
        </div>
      </div>

      {/* Rejection Modal */}
      {showRejectModal && (
        <RejectModal
          onConfirm={(reason) => {
            onReject(reason);
            setShowRejectModal(false);
          }}
          onCancel={() => setShowRejectModal(false)}
        />
      )}
    </div>
  );
};
```

---

### **PHASE 4: Service Request System**

#### **4.1 Available Services Catalog**
```typescript
// services/api/services.service.ts
export class ResidentServicesService extends BaseApiService {
  async getAvailableServices(): Promise<ServiceCatalog[]> {
    return this.request('/resident/services/available', z.array(ServiceCatalogSchema));
  }

  async requestService(request: ServiceRequestData): Promise<ServiceRequest> {
    return this.request('/resident/services/request', ServiceRequestSchema, {
      method: 'POST',
      data: request
    });
  }

  async getMyRequests(): Promise<ServiceRequest[]> {
    return this.request('/resident/services/requests', z.array(ServiceRequestSchema));
  }

  async getRequestStatus(id: string): Promise<ServiceRequestStatus> {
    return this.request(`/resident/services/requests/${id}`, ServiceRequestStatusSchema);
  }
}

// types/services.types.ts
export const ServiceCatalogSchema = z.object({
  id: z.string(),
  name: z.string(),
  description: z.string(),
  category: z.enum(['CERTIFICATE', 'CLEARANCE', 'PERMIT', 'REGISTRATION']),
  required_documents: z.array(z.string()),
  processing_time: z.string(),
  fee: z.number().optional(),
  requirements: z.array(z.string()),
  available: z.boolean()
});

export const ServiceRequestDataSchema = z.object({
  service_id: z.string(),
  purpose: z.string(),
  additional_notes: z.string().optional(),
  supporting_documents: z.array(z.string()),
  urgency: z.enum(['NORMAL', 'URGENT']).default('NORMAL')
});
```

#### **4.2 Service Request Interface**
```typescript
// components/services/ServiceCatalog.tsx
export const ServiceCatalog: React.FC = () => {
  const { data: services, isLoading } = useAvailableServices();
  const [selectedCategory, setSelectedCategory] = useState<string>('ALL');

  const categories = [
    { value: 'ALL', label: 'All Services' },
    { value: 'CERTIFICATE', label: 'Certificates' },
    { value: 'CLEARANCE', label: 'Clearances' },
    { value: 'PERMIT', label: 'Permits' },
    { value: 'REGISTRATION', label: 'Registration' }
  ];

  const filteredServices = services?.filter(service => 
    selectedCategory === 'ALL' || service.category === selectedCategory
  );

  if (isLoading) return <ServiceCatalogSkeleton />;

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-gray-900">Available Services</h2>
        <Select value={selectedCategory} onValueChange={setSelectedCategory}>
          <SelectTrigger className="w-48">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {categories.map(category => (
              <SelectItem key={category.value} value={category.value}>
                {category.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredServices?.map(service => (
          <ServiceCard
            key={service.id}
            service={service}
            onRequest={() => router.push(`/services/request/${service.id}`)}
          />
        ))}
      </div>
    </div>
  );
};

// components/services/ServiceCard.tsx
export const ServiceCard: React.FC<{
  service: ServiceCatalog;
  onRequest: () => void;
}> = ({ service, onRequest }) => {
  return (
    <div className="bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow">
      <div className="p-6">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-3">
            <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
              <FileText className="w-6 h-6 text-blue-600" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-gray-900">{service.name}</h3>
              <p className="text-sm text-gray-500 capitalize">{service.category.toLowerCase()}</p>
            </div>
          </div>
          {!service.available && (
            <Badge variant="red">Unavailable</Badge>
          )}
        </div>

        <p className="text-gray-600 text-sm mb-4 line-clamp-3">
          {service.description}
        </p>

        <div className="space-y-3">
          <div className="flex items-center justify-between text-sm">
            <span className="text-gray-500">Processing Time:</span>
            <span className="font-medium">{service.processing_time}</span>
          </div>
          
          {service.fee && (
            <div className="flex items-center justify-between text-sm">
              <span className="text-gray-500">Fee:</span>
              <span className="font-medium">₱{service.fee.toFixed(2)}</span>
            </div>
          )}

          <div className="text-sm">
            <span className="text-gray-500">Required Documents:</span>
            <ul className="mt-1 space-y-1">
              {service.required_documents.slice(0, 3).map((doc, index) => (
                <li key={index} className="text-xs text-gray-600 flex items-center">
                  <div className="w-1 h-1 bg-gray-400 rounded-full mr-2" />
                  {doc}
                </li>
              ))}
              {service.required_documents.length > 3 && (
                <li className="text-xs text-gray-500">
                  +{service.required_documents.length - 3} more
                </li>
              )}
            </ul>
          </div>
        </div>

        <Button
          onClick={onRequest}
          disabled={!service.available}
          className="w-full mt-4"
        >
          {service.available ? 'Request Service' : 'Not Available'}
        </Button>
      </div>
    </div>
  );
};
```

---

### **PHASE 5: Notification System**

#### **5.1 Email/SMS Notification Integration**
```php
// Backend notification system

// app/Notifications/ResidentVerificationApproved.php
class ResidentVerificationApproved extends Notification
{
    use Queueable;

    protected $user;

    public function __construct(User $user)
    {
        $this->user = $user;
    }

    public function via($notifiable)
    {
        return ['mail', 'sms'];
    }

    public function toMail($notifiable)
    {
        return (new MailMessage)
            ->subject('Account Verified - Welcome to Barangay Services')
            ->greeting('Congratulations!')
            ->line('Your resident account has been verified and approved.')
            ->line('You can now access all barangay services through the resident portal.')
            ->action('Login to Portal', url('https://resident.barangay.com/login'))
            ->line('Thank you for using our services!');
    }

    public function toSms($notifiable)
    {
        return "Your barangay resident account has been verified! You can now login to resident.barangay.com to access services.";
    }
}

// app/Notifications/ServiceRequestStatusUpdate.php
class ServiceRequestStatusUpdate extends Notification
{
    protected $request;
    protected $status;

    public function __construct($request, $status)
    {
        $this->request = $request;
        $this->status = $status;
    }

    public function toMail($notifiable)
    {
        $statusMessage = match($this->status) {
            'processing' => 'Your service request is now being processed.',
            'ready' => 'Your service request is ready for pickup.',
            'completed' => 'Your service request has been completed.',
            'rejected' => 'Your service request has been rejected.',
            default => 'Your service request status has been updated.'
        };

        return (new MailMessage)
            ->subject("Service Request Update - {$this->request->service_name}")
            ->line($statusMessage)
            ->line("Request ID: {$this->request->id}")
            ->action('View Details', url("https://resident.barangay.com/services/requests/{$this->request->id}"));
    }
}
```

---

### **PHASE 6: Deployment & Domain Configuration**

#### **6.1 Nginx Configuration**
```nginx
# /etc/nginx/sites-available/barangay-portals

# Admin Portal
server {
    listen 80;
    server_name admin.barangay.com;
    root /var/www/admin-portal/dist;
    index index.html;

    location / {
        try_files $uri $uri/ /index.html;
    }

    location /api {
        proxy_pass http://localhost:8000;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}

# Resident Portal
server {
    listen 80;
    server_name resident.barangay.com;
    root /var/www/resident-portal/dist;
    index index.html;

    location / {
        try_files $uri $uri/ /index.html;
    }

    location /api {
        proxy_pass http://localhost:8000;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}

# Backend API
server {
    listen 8000;
    server_name localhost;
    root /var/www/backend/public;
    index index.php;

    location / {
        try_files $uri $uri/ /index.php?$query_string;
    }

    location ~ \\.php$ {
        fastcgi_pass unix:/var/run/php/php8.2-fpm.sock;
        fastcgi_index index.php;
        fastcgi_param SCRIPT_FILENAME $realpath_root$fastcgi_script_name;
        include fastcgi_params;
    }
}
```

#### **6.2 Environment Configuration**
```bash
# resident-portal/.env.production
VITE_API_BASE_URL=https://admin.barangay.com/api
VITE_APP_NAME="Barangay Resident Portal"
VITE_APP_URL=https://resident.barangay.com

# backend/.env updates
FRONTEND_ADMIN_URL=https://admin.barangay.com
FRONTEND_RESIDENT_URL=https://resident.barangay.com
CORS_ALLOWED_ORIGINS="https://admin.barangay.com,https://resident.barangay.com"
```

---

## 📊 **IMPLEMENTATION TIMELINE**

| **Phase** | **Duration** | **Key Deliverables** |
|-----------|--------------|----------------------|
| **Phase 1** | 1 week | Backend resident auth, API routes, database schema |
| **Phase 2** | 2 weeks | Resident portal frontend, core components |
| **Phase 3** | 1 week | Admin verification workflow, dashboard extensions |
| **Phase 4** | 1 week | Service request system, document management |
| **Phase 5** | 3 days | Email/SMS notifications, status updates |
| **Phase 6** | 2 days | Deployment, domain configuration, testing |

**Total Estimated Time: 5-6 weeks**

---

## 🔧 **TECHNICAL REQUIREMENTS**

### **Backend Extensions**
- Laravel Sanctum for resident authentication
- Spatie Permissions for resident role management
- Laravel Notifications for email/SMS
- File upload handling for document submission
- Queue system for background processing

### **Resident Portal Tech Stack**
- **Frontend**: React 18 + TypeScript + Vite
- **Styling**: TailwindCSS (matching admin portal)
- **State Management**: React Query + Context API
- **Routing**: React Router v6
- **Forms**: React Hook Form + Zod validation
- **HTTP Client**: Axios (shared with backend)

### **Infrastructure**
- **Subdomains**: DNS configuration for admin/resident separation
- **SSL Certificates**: Let's Encrypt for both portals
- **Reverse Proxy**: Nginx for routing and load balancing
- **File Storage**: Shared storage for document uploads

---

## 🛡️ **SECURITY CONSIDERATIONS**

### **Resident Data Protection**
- Residents can only access their own data
- Role-based permissions prevent admin access
- Document encryption for sensitive uploads
- Audit logging for all resident actions

### **Verification Security**
- Email verification required for account activation
- Admin approval workflow for account verification
- Document authenticity validation
- Fraud detection for duplicate submissions

### **API Security**
- Rate limiting for registration endpoints
- CAPTCHA for public forms
- SQL injection prevention
- XSS protection for user inputs

---

## 📋 **INTEGRATION CHECKLIST**

### **Backend Integration Points**
- [ ] Extend User model with resident fields
- [ ] Create resident-specific controllers
- [ ] Add resident role and permissions
- [ ] Implement verification workflow
- [ ] Set up notification system
- [ ] Configure file upload handling

### **Frontend Integration Points**
- [ ] Share design system with admin portal
- [ ] Implement responsive design for mobile
- [ ] Add PWA capabilities for mobile app feel
- [ ] Integrate with shared backend API
- [ ] Implement real-time status updates

### **Infrastructure Integration**
- [ ] Configure subdomain routing
- [ ] Set up SSL certificates
- [ ] Configure CORS for multiple origins
- [ ] Set up backup and monitoring
- [ ] Configure logging and analytics

---

This comprehensive plan leverages your existing backend infrastructure while creating a completely separate resident-facing portal. The implementation maintains security through role-based access control while providing residents with self-service capabilities for common barangay services.

Ready to begin implementation? We can start with Phase 1 (Backend Preparation) to establish the foundation for the resident portal system.
