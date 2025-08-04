import { describe, it, expect, beforeEach, vi } from 'vitest';
import { z } from 'zod';
import { 
  ResidentSchema, 
  HouseholdRelationshipSchema, 
  DocumentSummarySchema, 
  TicketSummarySchema,
  AppointmentSummarySchema
} from '../../../src/services/residents.service';

describe('Resident Relationship Schemas', () => {
  describe('HouseholdRelationshipSchema', () => {
    it('should validate a complete household relationship', () => {
      const validHousehold = {
        id: 'household-123',
        address: '123 Test Street',
        head_id: 'resident-123',
        status: 'ACTIVE',
        created_at: '2024-01-01T00:00:00Z',
        updated_at: '2024-01-01T00:00:00Z',
        head: {
          id: 'resident-123',
          first_name: 'John',
          last_name: 'Doe'
        },
        members: [
          {
            id: 'resident-456',
            first_name: 'Jane',
            last_name: 'Doe',
            relationship_to_head: 'SPOUSE'
          }
        ],
        memberCount: 2,
        children: []
      };

      expect(() => HouseholdRelationshipSchema.parse(validHousehold)).not.toThrow();
    });

    it('should reject invalid household relationship data', () => {
      const invalidHousehold = {
        id: 'household-123',
        // Missing required fields
      };

      expect(() => HouseholdRelationshipSchema.parse(invalidHousehold)).toThrow();
    });

    it('should validate optional fields correctly', () => {
      const minimalHousehold = {
        id: 'household-123',
        address: '123 Test Street',
        head_id: 'resident-123',
        status: 'ACTIVE',
        created_at: '2024-01-01T00:00:00Z',
        updated_at: '2024-01-01T00:00:00Z'
      };

      expect(() => HouseholdRelationshipSchema.parse(minimalHousehold)).not.toThrow();
    });
  });

  describe('DocumentSummarySchema', () => {
    it('should validate a complete document summary', () => {
      const validDocument = {
        id: 'doc-123',
        type: 'BARANGAY_CLEARANCE',
        status: 'PENDING',
        submitted_at: '2024-01-01T00:00:00Z',
        processed_at: '2024-01-01T10:00:00Z',
        resident_id: 'resident-123'
      };

      expect(() => DocumentSummarySchema.parse(validDocument)).not.toThrow();
    });

    it('should allow optional fields to be undefined', () => {
      const minimalDocument = {
        id: 'doc-123',
        type: 'BARANGAY_CLEARANCE',
        status: 'PENDING',
        resident_id: 'resident-123'
      };

      expect(() => DocumentSummarySchema.parse(minimalDocument)).not.toThrow();
    });

    it('should reject invalid document types', () => {
      const invalidDocument = {
        id: 'doc-123',
        type: 'INVALID_TYPE',
        status: 'PENDING',
        resident_id: 'resident-123'
      };

      expect(() => DocumentSummarySchema.parse(invalidDocument)).toThrow();
    });
  });

  describe('TicketSummarySchema', () => {
    it('should validate a complete ticket summary', () => {
      const validTicket = {
        id: 'ticket-123',
        type: 'COMPLAINT',
        status: 'OPEN',
        subject: 'Test complaint',
        created_at: '2024-01-01T00:00:00Z',
        resident_id: 'resident-123'
      };

      expect(() => TicketSummarySchema.parse(validTicket)).not.toThrow();
    });

    it('should validate different ticket types', () => {
      const appointmentTicket = {
        id: 'ticket-123',
        type: 'APPOINTMENT',
        status: 'SCHEDULED',
        subject: 'Medical appointment',
        created_at: '2024-01-01T00:00:00Z',
        resident_id: 'resident-123'
      };

      const suggestionTicket = {
        id: 'ticket-456',
        type: 'SUGGESTION',
        status: 'UNDER_REVIEW',
        subject: 'Suggestion for improvement',
        created_at: '2024-01-01T00:00:00Z',
        resident_id: 'resident-123'
      };

      expect(() => TicketSummarySchema.parse(appointmentTicket)).not.toThrow();
      expect(() => TicketSummarySchema.parse(suggestionTicket)).not.toThrow();
    });
  });

  describe('AppointmentSummarySchema', () => {
    it('should validate a complete appointment summary', () => {
      const validAppointment = {
        id: 'appointment-123',
        type: 'CONSULTATION',
        status: 'SCHEDULED',
        date: '2024-01-15',
        time: '10:00:00',
        purpose: 'Document consultation',
        resident_id: 'resident-123'
      };

      expect(() => AppointmentSummarySchema.parse(validAppointment)).not.toThrow();
    });

    it('should require date and time for appointments', () => {
      const invalidAppointment = {
        id: 'appointment-123',
        type: 'CONSULTATION',
        status: 'SCHEDULED',
        purpose: 'Document consultation',
        resident_id: 'resident-123'
        // Missing date and time
      };

      expect(() => AppointmentSummarySchema.parse(invalidAppointment)).toThrow();
    });
  });

  describe('Enhanced ResidentSchema', () => {
    it('should validate resident with all relationship fields', () => {
      const residentWithRelationships = {
        id: 'resident-123',
        first_name: 'John',
        last_name: 'Doe',
        middle_name: 'Smith',
        suffix: 'Jr.',
        birth_date: '1990-01-01',
        birth_place: 'Test City',
        gender: 'MALE',
        civil_status: 'SINGLE',
        nationality: 'Filipino',
        religion: 'Catholic',
        occupation: 'Teacher',
        monthly_income: 25000,
        complete_address: '123 Test Street',
        current_address: '123 Test Street',
        mobile_number: '09123456789',
        email_address: 'john@example.com',
        emergency_contact_name: 'Jane Doe',
        emergency_contact_number: '09987654321',
        emergency_contact_relationship: 'Spouse',
        is_pwd: false,
        is_senior_citizen: false,
        is_solo_parent: false,
        is_indigenous: false,
        is_4ps_beneficiary: false,
        voter_id_number: 'VOTER123',
        precinct_number: '001',
        is_registered_voter: true,
        created_at: '2024-01-01T00:00:00Z',
        updated_at: '2024-01-01T00:00:00Z',
        // Relationship fields
        households: [],
        documents: [],
        tickets: [],
        summary: {
          total_documents: 5,
          pending_documents: 2,
          approved_documents: 3,
          total_tickets: 3,
          open_tickets: 1,
          total_appointments: 2,
          upcoming_appointments: 1,
          total_households: 1
        }
      };

      expect(() => ResidentSchema.parse(residentWithRelationships)).not.toThrow();
    });

    it('should allow resident without relationship fields', () => {
      const basicResident = {
        id: 'resident-123',
        first_name: 'John',
        last_name: 'Doe',
        birth_date: '1990-01-01',
        birth_place: 'Test City',
        gender: 'MALE',
        civil_status: 'SINGLE',
        nationality: 'Filipino',
        religion: 'Catholic',
        complete_address: '123 Test Street',
        current_address: '123 Test Street',
        is_pwd: false,
        is_senior_citizen: false,
        is_solo_parent: false,
        is_indigenous: false,
        is_4ps_beneficiary: false,
        is_registered_voter: true,
        created_at: '2024-01-01T00:00:00Z',
        updated_at: '2024-01-01T00:00:00Z'
      };

      expect(() => ResidentSchema.parse(basicResident)).not.toThrow();
    });

    it('should validate relationship summary structure', () => {
      const resident = {
        id: 'resident-123',
        first_name: 'John',
        last_name: 'Doe',
        birth_date: '1990-01-01',
        birth_place: 'Test City',
        gender: 'MALE',
        civil_status: 'SINGLE',
        nationality: 'Filipino',
        religion: 'Catholic',
        complete_address: '123 Test Street',
        current_address: '123 Test Street',
        is_pwd: false,
        is_senior_citizen: false,
        is_solo_parent: false,
        is_indigenous: false,
        is_4ps_beneficiary: false,
        is_registered_voter: true,
        created_at: '2024-01-01T00:00:00Z',
        updated_at: '2024-01-01T00:00:00Z',
        summary: {
          total_documents: 'invalid', // Should be number
          pending_documents: 2,
          approved_documents: 3,
          total_tickets: 3,
          open_tickets: 1,
          total_appointments: 2,
          upcoming_appointments: 1,
          total_households: 1
        }
      };

      expect(() => ResidentSchema.parse(resident)).toThrow();
    });
  });

  describe('Schema Type Inference', () => {
    it('should infer correct TypeScript types', () => {
      type HouseholdRelationship = z.infer<typeof HouseholdRelationshipSchema>;
      type DocumentSummary = z.infer<typeof DocumentSummarySchema>;
      type TicketSummary = z.infer<typeof TicketSummarySchema>;
      type AppointmentSummary = z.infer<typeof AppointmentSummarySchema>;
      type Resident = z.infer<typeof ResidentSchema>;

      // Type assertions to verify correct inference
      const household: HouseholdRelationship = {} as HouseholdRelationship;
      const document: DocumentSummary = {} as DocumentSummary;
      const ticket: TicketSummary = {} as TicketSummary;
      const appointment: AppointmentSummary = {} as AppointmentSummary;
      const resident: Resident = {} as Resident;

      // These should compile without errors
      expect(typeof household.id).toBe('string');
      expect(typeof document.status).toBe('string');
      expect(typeof ticket.type).toBe('string');
      expect(typeof appointment.date).toBe('string');
      expect(typeof resident.first_name).toBe('string');
    });
  });

  describe('Schema Validation Edge Cases', () => {
    it('should handle null and undefined values correctly', () => {
      const residentWithNulls = {
        id: 'resident-123',
        first_name: 'John',
        last_name: 'Doe',
        middle_name: null, // Should be allowed
        birth_date: '1990-01-01',
        birth_place: 'Test City',
        gender: 'MALE',
        civil_status: 'SINGLE',
        nationality: 'Filipino',
        religion: 'Catholic',
        complete_address: '123 Test Street',
        current_address: '123 Test Street',
        is_pwd: false,
        is_senior_citizen: false,
        is_solo_parent: false,
        is_indigenous: false,
        is_4ps_beneficiary: false,
        is_registered_voter: true,
        created_at: '2024-01-01T00:00:00Z',
        updated_at: '2024-01-01T00:00:00Z'
      };

      expect(() => ResidentSchema.parse(residentWithNulls)).not.toThrow();
    });

    it('should validate array relationships correctly', () => {
      const residentWithEmptyArrays = {
        id: 'resident-123',
        first_name: 'John',
        last_name: 'Doe',
        birth_date: '1990-01-01',
        birth_place: 'Test City',
        gender: 'MALE',
        civil_status: 'SINGLE',
        nationality: 'Filipino',
        religion: 'Catholic',
        complete_address: '123 Test Street',
        current_address: '123 Test Street',
        is_pwd: false,
        is_senior_citizen: false,
        is_solo_parent: false,
        is_indigenous: false,
        is_4ps_beneficiary: false,
        is_registered_voter: true,
        created_at: '2024-01-01T00:00:00Z',
        updated_at: '2024-01-01T00:00:00Z',
        households: [],
        documents: [],
        tickets: []
      };

      expect(() => ResidentSchema.parse(residentWithEmptyArrays)).not.toThrow();
    });
  });
});
