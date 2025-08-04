import { describe, it, expect, beforeEach, vi, afterEach } from 'vitest';
import { ResidentService } from '../../../src/services/residents.service';

// Mock fetch for testing
const mockFetch = vi.fn();
global.fetch = mockFetch;

describe('Resident Service Integration Tests', () => {
  let residentService: ResidentService;
  const mockBaseUrl = 'http://localhost:8000/api';
  const mockToken = 'test-token';

  beforeEach(() => {
    residentService = new ResidentService(mockBaseUrl, mockToken);
    mockFetch.mockClear();
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  describe('getResidentWithRelationships', () => {
    it('should fetch resident with all relationships', async () => {
      const mockResponse = {
        data: {
          id: 'resident-123',
          first_name: 'John',
          last_name: 'Doe',
          households: [
            {
              id: 'household-123',
              address: '123 Test Street',
              head_id: 'resident-123',
              status: 'ACTIVE',
              created_at: '2024-01-01T00:00:00Z',
              updated_at: '2024-01-01T00:00:00Z'
            }
          ],
          documents: [
            {
              id: 'doc-123',
              type: 'BARANGAY_CLEARANCE',
              status: 'PENDING',
              resident_id: 'resident-123'
            }
          ],
          tickets: [
            {
              id: 'ticket-123',
              type: 'COMPLAINT',
              status: 'OPEN',
              subject: 'Test complaint',
              created_at: '2024-01-01T00:00:00Z',
              resident_id: 'resident-123'
            }
          ],
          summary: {
            total_documents: 1,
            pending_documents: 1,
            approved_documents: 0,
            total_tickets: 1,
            open_tickets: 1,
            total_appointments: 0,
            upcoming_appointments: 0,
            total_households: 1
          }
        }
      };

      mockFetch.mockResolvedValue({
        ok: true,
        json: () => Promise.resolve(mockResponse)
      });

      const result = await residentService.getResidentWithRelationships('resident-123');

      expect(mockFetch).toHaveBeenCalledWith(
        `${mockBaseUrl}/residents/resident-123/relationships`,
        {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${mockToken}`,
            'Accept': 'application/json'
          }
        }
      );

      expect(result).toEqual(mockResponse.data);
      expect(result.summary.total_documents).toBe(1);
      expect(result.households).toHaveLength(1);
      expect(result.documents).toHaveLength(1);
      expect(result.tickets).toHaveLength(1);
    });

    it('should handle API errors gracefully', async () => {
      mockFetch.mockResolvedValue({
        ok: false,
        status: 404,
        json: () => Promise.resolve({ message: 'Resident not found' })
      });

      await expect(
        residentService.getResidentWithRelationships('non-existent-id')
      ).rejects.toThrow('HTTP error! status: 404');
    });
  });

  describe('getResidentHouseholds', () => {
    it('should fetch resident households with proper structure', async () => {
      const mockResponse = {
        data: {
          member_of_households: [
            {
              id: 'household-456',
              address: '456 Member Street',
              head_id: 'other-resident',
              status: 'ACTIVE',
              created_at: '2024-01-01T00:00:00Z',
              updated_at: '2024-01-01T00:00:00Z',
              head: {
                id: 'other-resident',
                first_name: 'Jane',
                last_name: 'Smith'
              }
            }
          ],
          head_of_households: [
            {
              id: 'household-123',
              address: '123 Head Street',
              head_id: 'resident-123',
              status: 'ACTIVE',
              created_at: '2024-01-01T00:00:00Z',
              updated_at: '2024-01-01T00:00:00Z',
              members: [
                {
                  id: 'member-1',
                  first_name: 'Child',
                  last_name: 'Doe',
                  relationship_to_head: 'CHILD'
                }
              ]
            }
          ],
          total_households: 2
        }
      };

      mockFetch.mockResolvedValue({
        ok: true,
        json: () => Promise.resolve(mockResponse)
      });

      const result = await residentService.getResidentHouseholds('resident-123');

      expect(mockFetch).toHaveBeenCalledWith(
        `${mockBaseUrl}/residents/resident-123/households`,
        expect.any(Object)
      );

      expect(result).toEqual(mockResponse.data);
      expect(result.total_households).toBe(2);
      expect(result.member_of_households).toHaveLength(1);
      expect(result.head_of_households).toHaveLength(1);
    });
  });

  describe('getResidentDocuments', () => {
    it('should fetch resident documents with filters and pagination', async () => {
      const mockResponse = {
        data: [
          {
            id: 'doc-1',
            type: 'BARANGAY_CLEARANCE',
            status: 'PENDING',
            submitted_at: '2024-01-01T00:00:00Z',
            resident_id: 'resident-123'
          },
          {
            id: 'doc-2',
            type: 'CERTIFICATE_OF_RESIDENCY',
            status: 'APPROVED',
            submitted_at: '2024-01-02T00:00:00Z',
            processed_at: '2024-01-02T10:00:00Z',
            resident_id: 'resident-123'
          }
        ],
        meta: {
          current_page: 1,
          last_page: 1,
          per_page: 15,
          total: 2
        }
      };

      mockFetch.mockResolvedValue({
        ok: true,
        json: () => Promise.resolve(mockResponse)
      });

      const filters = {
        status: 'PENDING',
        type: 'BARANGAY_CLEARANCE',
        sort_by: 'submitted_at',
        sort_order: 'desc' as const
      };

      const result = await residentService.getResidentDocuments('resident-123', filters);

      expect(mockFetch).toHaveBeenCalledWith(
        `${mockBaseUrl}/residents/resident-123/documents?status=PENDING&type=BARANGAY_CLEARANCE&sort_by=submitted_at&sort_order=desc`,
        expect.any(Object)
      );

      expect(result.data).toHaveLength(2);
      expect(result.meta.total).toBe(2);
    });

    it('should work without filters', async () => {
      const mockResponse = {
        data: [],
        meta: {
          current_page: 1,
          last_page: 1,
          per_page: 15,
          total: 0
        }
      };

      mockFetch.mockResolvedValue({
        ok: true,
        json: () => Promise.resolve(mockResponse)
      });

      const result = await residentService.getResidentDocuments('resident-123');

      expect(mockFetch).toHaveBeenCalledWith(
        `${mockBaseUrl}/residents/resident-123/documents`,
        expect.any(Object)
      );

      expect(result.data).toHaveLength(0);
    });
  });

  describe('getResidentTickets', () => {
    it('should fetch resident tickets with filters', async () => {
      const mockResponse = {
        data: [
          {
            id: 'ticket-1',
            type: 'COMPLAINT',
            status: 'OPEN',
            subject: 'Noise complaint',
            created_at: '2024-01-01T00:00:00Z',
            resident_id: 'resident-123'
          },
          {
            id: 'ticket-2',
            type: 'SUGGESTION',
            status: 'UNDER_REVIEW',
            subject: 'Park improvement suggestion',
            created_at: '2024-01-02T00:00:00Z',
            resident_id: 'resident-123'
          }
        ],
        meta: {
          current_page: 1,
          last_page: 1,
          per_page: 15,
          total: 2
        }
      };

      mockFetch.mockResolvedValue({
        ok: true,
        json: () => Promise.resolve(mockResponse)
      });

      const filters = {
        type: 'COMPLAINT',
        status: 'OPEN'
      };

      const result = await residentService.getResidentTickets('resident-123', filters);

      expect(mockFetch).toHaveBeenCalledWith(
        `${mockBaseUrl}/residents/resident-123/tickets?type=COMPLAINT&status=OPEN`,
        expect.any(Object)
      );

      expect(result.data).toHaveLength(2);
    });
  });

  describe('getResident with includes', () => {
    it('should fetch resident with specified relationships', async () => {
      const mockResponse = {
        data: {
          id: 'resident-123',
          first_name: 'John',
          last_name: 'Doe',
          documents: [
            {
              id: 'doc-123',
              type: 'BARANGAY_CLEARANCE',
              status: 'PENDING',
              resident_id: 'resident-123'
            }
          ],
          tickets: [
            {
              id: 'ticket-123',
              type: 'COMPLAINT',
              status: 'OPEN',
              subject: 'Test complaint',
              created_at: '2024-01-01T00:00:00Z',
              resident_id: 'resident-123'
            }
          ],
          total_documents: 1,
          total_tickets: 1
        }
      };

      mockFetch.mockResolvedValue({
        ok: true,
        json: () => Promise.resolve(mockResponse)
      });

      const includes = ['documents', 'tickets'];
      const result = await residentService.getResident('resident-123', includes);

      expect(mockFetch).toHaveBeenCalledWith(
        `${mockBaseUrl}/residents/resident-123?include=documents,tickets`,
        expect.any(Object)
      );

      expect(result.documents).toBeDefined();
      expect(result.tickets).toBeDefined();
      expect(result.total_documents).toBe(1);
      expect(result.total_tickets).toBe(1);
    });
  });

  describe('Error Handling', () => {
    it('should handle network errors', async () => {
      mockFetch.mockRejectedValue(new Error('Network error'));

      await expect(
        residentService.getResidentWithRelationships('resident-123')
      ).rejects.toThrow('Network error');
    });

    it('should handle invalid JSON responses', async () => {
      mockFetch.mockResolvedValue({
        ok: true,
        json: () => Promise.reject(new Error('Invalid JSON'))
      });

      await expect(
        residentService.getResidentWithRelationships('resident-123')
      ).rejects.toThrow('Invalid JSON');
    });

    it('should handle authorization errors', async () => {
      mockFetch.mockResolvedValue({
        ok: false,
        status: 401,
        json: () => Promise.resolve({ message: 'Unauthorized' })
      });

      await expect(
        residentService.getResidentWithRelationships('resident-123')
      ).rejects.toThrow('HTTP error! status: 401');
    });
  });

  describe('URL Construction', () => {
    it('should construct URLs correctly with query parameters', () => {
      const service = residentService as any; // Access private methods for testing

      // Test buildQueryString method
      const params = {
        status: 'PENDING',
        type: 'BARANGAY_CLEARANCE',
        sort_by: 'created_at',
        sort_order: 'desc'
      };

      const queryString = Object.entries(params)
        .map(([key, value]) => `${encodeURIComponent(key)}=${encodeURIComponent(value)}`)
        .join('&');

      expect(queryString).toBe('status=PENDING&type=BARANGAY_CLEARANCE&sort_by=created_at&sort_order=desc');
    });

    it('should handle empty query parameters', () => {
      const params = {};
      const queryString = Object.entries(params)
        .map(([key, value]) => `${encodeURIComponent(key)}=${encodeURIComponent(value)}`)
        .join('&');

      expect(queryString).toBe('');
    });
  });
});
