# AWS Barangay Management System - Database Documentation

## Overview

The Barangay Management System is designed around **Philippine local government structures** and services. The database follows a **domain-driven design** with clear entity boundaries and relationships optimized for barangay (village-level) operations.

## Core Architecture Principles

- **UUID Primary Keys**: All entities use UUID strings for better distributed system support
- **Soft Deletes**: Most entities support soft deletion for audit trails
- **Activity Logging**: All model changes are automatically tracked via `LogsActivity` trait
- **Schema-Driven Development**: Backend models use dedicated schema classes as single source of truth
- **Frontend-First**: Backend adapts to frontend requirements, not vice versa

---

## Core Entity Relationships

```
Users (Staff/Officials)
├── Creates/Manages → Residents
├── Manages → Households  
├── Processes → Documents
├── Handles → Help Desk Tickets
└── Manages → Projects

Residents (Citizens)
├── Belongs To → Households (via pivot table)
├── Requests → Documents
├── Creates → Help Desk Tickets
└── Referenced in → Blotters/Complaints

Households (Family Units)
├── Has Head → Resident
├── Contains Members → Residents (many-to-many)
└── Lives at → Address

Help Desk System
├── Base: Tickets
├── Specialized: Appointments, Blotters, Complaints, Suggestions
└── Supporting: OtherPersonInvolved, SupportingDocuments

Projects & Governance
├── Projects → Milestones → Team Members
├── Agenda Items (for meetings)
└── Barangay Officials (government structure)
```

---

## 1. CORE ENTITIES

### 1.1 Residents 👥
**Purpose**: Central registry of all barangay citizens with comprehensive profiles

**Key Fields**:
```php
- id: UUID (primary key)
- first_name, last_name, middle_name, suffix: string
- birth_date: date (auto-calculates age)
- gender: enum [MALE, FEMALE, NON_BINARY, PREFER_NOT_TO_SAY]
- civil_status: enum [SINGLE, LIVE_IN, MARRIED, WIDOWED, etc.]
- nationality: enum [FILIPINO, AMERICAN, etc.]
- religion: enum [CATHOLIC, IGLESIA_NI_CRISTO, etc.]
- educational_attainment: enum [NO_FORMAL_EDUCATION to POST_GRADUATE]
- employment_status: enum [EMPLOYED, UNEMPLOYED, SELF_EMPLOYED, etc.]
- voter_status: enum [NOT_REGISTERED, REGISTERED, DECEASED, TRANSFERRED]
- status: enum [ACTIVE, INACTIVE, DECEASED, TRANSFERRED]

// Special Classifications (Philippine context)
- senior_citizen: boolean
- person_with_disability: boolean
- indigenous_people: boolean
- four_ps_beneficiary: boolean (4Ps government program)

// Contact & Address
- contact_number, email_address: string
- complete_address: text
- purok, barangay, municipality, province: string

// System fields
- created_by, updated_by: UUID (references users)
- created_at, updated_at, deleted_at: timestamps
```

**Relationships**:
- `belongsToMany(Household)` via `household_members` pivot
- `hasMany(Document)` - requested documents
- `hasMany(Ticket)` - help desk tickets
- `belongsTo(User, 'created_by')`

**Business Rules**:
- Age is auto-calculated from birth_date
- Senior citizen status auto-determined (65+ years)
- Soft deletes for audit trails
- All changes logged via ActivityLog

---

### 1.2 Households 🏠
**Purpose**: Family unit management with socioeconomic profiling

**Key Fields**:
```php
- id: UUID (primary key)
- household_number: string (unique, frontend-generated)
- household_type: enum [NUCLEAR, EXTENDED, SINGLE, SINGLE_PARENT, OTHER]
- head_resident_id: UUID (references residents)

// Socioeconomic Profile
- monthly_income: enum [BELOW_10000, RANGE_10000_25000, etc.]
- primary_income_source: string
- four_ps_beneficiary: boolean
- indigent_family: boolean

// Demographics Flags
- has_senior_citizen: boolean
- has_pwd_member: boolean

// Housing Information
- house_type: enum [CONCRETE, SEMI_CONCRETE, WOOD, BAMBOO, MIXED]
- ownership_status: enum [OWNED, RENTED, SHARED, INFORMAL_SETTLER]

// Utilities Access
- has_electricity, has_water_supply, has_internet_access: boolean

// Address
- complete_address: text

// Status
- status: enum [ACTIVE, INACTIVE, TRANSFERRED]
- remarks: text
```

**Relationships**:
- `belongsTo(Resident, 'head_resident_id')` - household head
- `belongsToMany(Resident)` via `household_members` pivot with `relationship` field
- `belongsTo(User, 'created_by')`

**Pivot Table - household_members**:
```php
- household_id: UUID
- resident_id: UUID  
- relationship: enum [HEAD, SPOUSE, CHILD, PARENT, SIBLING, GRANDPARENT, etc.]
- created_at, updated_at: timestamps
```

**Business Rules**:
- One household head per household
- Head must also be in members pivot table with relationship='HEAD'
- Auto-calculated demographics flags based on members

---

### 1.3 Users 👨‍💼
**Purpose**: System staff, barangay officials, and administrators

**Key Fields**:
```php
- id: UUID (primary key)
- username: string (unique)
- email: string (unique)
- password: hashed string
- first_name, last_name, middle_name: string

// System Access
- role: enum [SUPER_ADMIN, ADMIN, STAFF, BARANGAY_OFFICIAL, SECRETARY]
- department: enum [ADMINISTRATION, HEALTH_SERVICES, etc.]
- is_active: boolean
- is_verified: boolean

// Profile Information
- position, employee_id: string
- contact_number: string
- complete_address: text

// Authentication
- email_verified_at: timestamp
- last_login_at: timestamp
- remember_token: string

// System fields
- created_by, updated_by: UUID
- created_at, updated_at, deleted_at: timestamps
```

**Relationships**:
- `hasMany(Resident, 'created_by')` - residents they created
- `hasMany(Document, 'processed_by')` - documents they processed
- `hasMany(Project, 'project_manager_id')` - projects they manage

**Security Notes**:
- Uses Laravel Sanctum for API authentication
- Role-based permissions via Spatie Laravel Permission package
- Password hashing automatic via Laravel

---

## 2. DOCUMENT PROCESSING SYSTEM 📄

### 2.1 Documents
**Purpose**: Barangay certificates, clearances, and permits processing

**Key Fields**:
```php
- id: UUID (primary key)
- document_number: string (auto-generated)
- document_type: enum [
    BARANGAY_CLEARANCE,
    CERTIFICATE_OF_RESIDENCY, 
    CERTIFICATE_OF_INDIGENCY,
    BUSINESS_PERMIT,
    BARANGAY_ID,
    etc.
]

// Request Information
- requester_id: UUID (references residents)
- purpose: string
- request_date: date
- needed_date: date

// Processing Status
- status: enum [PENDING, IN_PROGRESS, READY_FOR_PICKUP, RELEASED, etc.]
- priority: enum [LOW, MEDIUM, HIGH, URGENT]
- processed_by: UUID (references users)
- processed_date: date
- released_date: date
- picked_up_date: date

// Fees & Payment
- fee_amount: decimal
- payment_status: enum [UNPAID, PAID, WAIVED]
- payment_date: date

// Document Details
- validity_period_months: integer
- expiry_date: date
- requirements_submitted: json
- remarks: text
```

**Relationships**:
- `belongsTo(Resident, 'requester_id')`
- `belongsTo(User, 'processed_by')`
- `belongsTo(User, 'created_by')`

**Business Rules**:
- Document numbers auto-generated with type prefix
- Expiry date calculated from validity period
- Queue system for processing order
- Fee calculation based on document type and resident status

---

## 3. HELP DESK SYSTEM 🎫

### 3.1 Base Tickets
**Purpose**: Universal ticketing system for all citizen services

**Key Fields**:
```php
- id: UUID (primary key)
- ticket_number: string (auto-generated with prefix)
- subject: string
- description: text
- priority: enum [LOW, MEDIUM, HIGH, CRITICAL]

// Requester Information
- requester_name: string
- resident_id: UUID (nullable, for registered citizens)
- contact_number: string
- email_address: string
- complete_address: string

// Classification
- category: enum [APPOINTMENT, BLOTTER, COMPLAINT, SUGGESTION]
- status: enum [OPEN, IN_PROGRESS, PENDING, RESOLVED, CLOSED]

// Timestamps
- created_at, updated_at: timestamps
```

**Relationships**:
- `belongsTo(Resident)` - optional for registered citizens
- `hasOne(Appointment)` - if category=APPOINTMENT
- `hasOne(Blotter)` - if category=BLOTTER
- `hasOne(Complaint)` - if category=COMPLAINT
- `hasOne(Suggestion)` - if category=SUGGESTION

**Ticket Number Generation**:
- APT-YYYYMM-0001 (Appointments)
- BLT-YYYYMM-0001 (Blotters)
- CMP-YYYYMM-0001 (Complaints)  
- SUG-YYYYMM-0001 (Suggestions)

### 3.2 Specialized Help Desk Entities

#### Appointments 📅
```php
- id: UUID
- base_ticket_id: UUID (unique, 1:1 with ticket)
- department: enum [ADMINISTRATION, HEALTH_SERVICES, etc.]
- date: date
- time: time  
- additional_notes: text
```

#### Blotters 📋
```php
- id: UUID
- base_ticket_id: UUID (unique, 1:1 with ticket)
- type_of_incident: string
- date_of_incident: date
- time_of_incident: time
- location_of_incident: string
```
- `hasMany(OtherPersonInvolved)`
- `hasMany(SupportingDocument)`

#### Complaints 📢
```php
- id: UUID
- base_ticket_id: UUID (unique, 1:1 with ticket)
- c_category: enum [PUBLIC_SERVICES, INFRASTRUCTURE, etc.]
- department: enum [ADMINISTRATION, etc.]
- location: string
```

#### Suggestions 💡
```php
- id: UUID
- base_ticket_id: UUID (unique, 1:1 with ticket)
- s_category: enum [SERVICE_IMPROVEMENT, INFRASTRUCTURE, etc.]
- implementation_timeframe: enum [IMMEDIATE, SHORT_TERM, etc.]
- estimated_cost: decimal
- feasibility_assessment: text
```

#### Supporting Entities
- **OtherPersonInvolved**: Additional people in blotter cases
- **SupportingDocument**: File attachments for tickets

---

## 4. PROJECT MANAGEMENT SYSTEM 🏗️

### 4.1 Projects
**Purpose**: Barangay development projects and programs

**Key Fields**:
```php
- id: UUID
- project_code: string (unique)
- title, description: string/text
- objectives, expected_outcomes: text

// Classification
- category: enum [INFRASTRUCTURE, SOCIAL_SERVICES, etc.]
- type: enum [CONSTRUCTION, PROGRAM, EVENT, etc.]
- priority: enum [LOW, MEDIUM, HIGH, CRITICAL]

// Timeline
- start_date, end_date: date
- actual_start_date, actual_end_date: date
- duration_days: integer

// Budget Management
- total_budget, allocated_budget: decimal
- utilized_budget, remaining_budget: decimal
- funding_source, funding_agency: string

// Scope & Impact
- location: string
- target_puroks: json array
- target_beneficiaries, actual_beneficiaries: integer
- beneficiary_criteria: text

// Management
- project_manager_id: UUID (references users)
- approving_official_id: UUID (references users)
- approved_date: date

// Progress Tracking
- status: enum [PLANNING, APPROVED, IN_PROGRESS, etc.]
- progress_percentage: integer (0-100)
- quality_rating: integer (1-5)

// Documentation
- attachments: json array
- completion_report: text
- lessons_learned: json array
```

**Relationships**:
- `belongsTo(User, 'project_manager_id')`
- `belongsTo(User, 'approving_official_id')`
- `hasMany(ProjectMilestone)`
- `hasMany(ProjectTeamMember)`

### 4.2 Project Milestones
```php
- id: UUID
- project_id: UUID
- milestone_name: string
- description: text
- target_date, actual_completion_date: date
- status: enum [PENDING, IN_PROGRESS, COMPLETED, etc.]
- deliverables: json array
- percentage_weight: integer
```

### 4.3 Project Team Members
```php
- id: UUID  
- project_id: UUID
- user_id: UUID
- role: enum [PROJECT_MANAGER, TECHNICAL_LEAD, etc.]
- start_date, end_date: date
- responsibilities: text
```

---

## 5. GOVERNANCE & ADMINISTRATION 🏛️

### 5.1 Barangay Officials
**Purpose**: Official government structure and positions

**Key Fields**:
```php
- id: UUID
- user_id: UUID (references users table)
- position: enum [CAPTAIN, KAGAWAD, SK_CHAIRMAN, etc.]
- committee: string (e.g., "Health", "Peace and Order")
- term_start_date, term_end_date: date
- term_number: integer
- election_date: date
- status: enum [ACTIVE, INACTIVE, TERMINATED]
```

### 5.2 Agenda Items
**Purpose**: Meeting agenda management

```php
- id: UUID
- meeting_date: date
- agenda_item: string
- description: text
- presenter: string
- time_allocated: integer (minutes)
- status: enum [PENDING, DISCUSSED, DEFERRED, etc.]
- action_items: text
- responsible_person: string
```

### 5.3 Settings
**Purpose**: System configuration and barangay information

```php
- id: UUID
- category: enum [BARANGAY_INFO, SYSTEM_CONFIG, etc.]
- key: string (unique)
- value: text
- description: text
- is_public: boolean
```

---

## 6. AUDIT & SYSTEM ENTITIES 📊

### 6.1 Activity Log
**Purpose**: Comprehensive audit trail for all entity changes

```php
- id: UUID
- user_id: UUID (nullable)
- action_type: enum [created, updated, deleted]
- table_name: string
- record_id: string
- old_values: json
- new_values: json  
- description: text
- ip_address: string
- user_agent: text
- created_at: timestamp
```

**Auto-logging**: All models with `LogsActivity` trait automatically log changes

### 6.2 User Activities & Sessions
- **UserActivity**: User action logging
- **UserSession**: Session management and tracking

---

## 7. KEY RELATIONSHIPS & CONSTRAINTS

### Foreign Key Relationships
```sql
-- Core Entities
residents.created_by → users.id
households.head_resident_id → residents.id
household_members.household_id → households.id
household_members.resident_id → residents.id

-- Document Processing
documents.requester_id → residents.id
documents.processed_by → users.id

-- Help Desk System  
tickets.resident_id → residents.id
appointments.base_ticket_id → tickets.id
blotters.base_ticket_id → tickets.id
complaints.base_ticket_id → tickets.id
suggestions.base_ticket_id → tickets.id

-- Project Management
projects.project_manager_id → users.id
project_milestones.project_id → projects.id
project_team_members.project_id → projects.id
project_team_members.user_id → users.id

-- Governance
barangay_officials.user_id → users.id
```

### Unique Constraints
- `residents`: None (allows duplicates for family members)
- `households.household_number`: Unique
- `users.username`, `users.email`: Unique
- `documents.document_number`: Unique
- `tickets.ticket_number`: Unique
- `projects.project_code`: Unique

### Indexes for Performance
- All foreign keys are indexed
- Search fields: `residents.first_name`, `residents.last_name`
- Status fields: `documents.status`, `tickets.status`, `projects.status`
- Date fields: `documents.request_date`, `tickets.created_at`

---

## 8. BUSINESS LOGIC & VALIDATION

### Data Validation Patterns
- **Schema-driven validation**: All validation rules defined in Schema classes
- **Frontend-first**: Backend validates against frontend Zod schemas
- **Philippine-specific**: Civil status includes "LIVE_IN", addresses include barangay/municipality

### Calculated Fields
- `residents.age`: Auto-calculated from birth_date
- `documents.expiry_date`: Calculated from validity_period_months  
- `households.member_count`: Count of household_members
- `projects.budget_utilization_rate`: utilized_budget / allocated_budget

### Status Workflows
```
Documents: PENDING → IN_PROGRESS → READY_FOR_PICKUP → RELEASED
Tickets: OPEN → IN_PROGRESS → PENDING → RESOLVED → CLOSED
Projects: PLANNING → APPROVED → IN_PROGRESS → COMPLETED
```

---

## 9. PostgreSQL OPTIMIZATIONS

### JSON Field Usage
- `residents.special_classifications`: Array of classifications
- `projects.target_puroks`: Array of target areas
- `projects.attachments`: File metadata
- `documents.requirements_submitted`: Submitted requirements

### Performance Considerations
- **UUID vs Auto-increment**: UUIDs chosen for distributed system compatibility
- **Soft Deletes**: Preserves data integrity for audit requirements
- **Composite Indexes**: On frequently queried combinations (date + status)
- **JSONB Indexes**: GIN indexes on JSON fields for efficient querying

This database design effectively supports Philippine barangay operations while maintaining scalability and audit compliance for local government requirements.
