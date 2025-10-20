// ============================================================================
// services/establishments/establishment.service.ts - Establishment service
// ============================================================================

import { z } from 'zod';
import { BaseApiService } from '@/services/__shared/api';
import {
  EstablishmentSchema,
  EstablishmentParamsSchema,
  EstablishmentFormDataSchema,
  type Establishment,
  type EstablishmentParams,
  type EstablishmentFormData
} from '@/services/establishments/establishment.types';
import {
  ApiResponseSchema,
  type PaginatedResponse
} from '@/services/__shared/types';

export class EstablishmentService extends BaseApiService {
  /**
   * Get paginated list of establishments
   */
  async getEstablishments(
    params?: EstablishmentParams
  ): Promise<PaginatedResponse<Establishment>> {
    const validatedParams = params ? EstablishmentParamsSchema.parse(params) : {};

    return this.requestPaginated(
      '/establishments',
      EstablishmentSchema,
      {
        method: 'GET',
        params: validatedParams
      }
    );
  }

  /**
   * Get a specific establishment
   */
  async getEstablishment(id: number): Promise<Establishment> {
    const response = await this.request(
      `/establishments/${id}`,
      ApiResponseSchema(EstablishmentSchema)
    );

    if (!response.data) throw new Error('Establishment not found');
    return response.data;
  }

  /**
   * Create a new establishment
   */
  async createEstablishment(data: FormData): Promise<Establishment> {
    // const validatedData = EstablishmentFormDataSchema.parse(data);

    const response = await this.request(
      '/establishments',
      ApiResponseSchema(EstablishmentSchema),
      {
        method: 'POST',
        data: data
      }
    );

    if (!response.data) throw new Error('Failed to create establishment');
    return response.data;
  }

  /**
   * Update establishment
   */
  async updateEstablishment(
    id: number,
    data: Partial<EstablishmentFormData>
  ): Promise<Establishment> {
    const response = await this.request(
      `/establishments/${id}`,
      ApiResponseSchema(EstablishmentSchema),
      {
        method: 'PUT',
        data
      }
    );

    if (!response.data) throw new Error('Failed to update establishment');
    return response.data;
  }

  /**
   * Delete establishment
   */
  async deleteEstablishment(id: number): Promise<void> {
    await this.request(
      `/establishments/${id}`,
      ApiResponseSchema(z.null()),
      {
        method: 'DELETE'
      }
    );
  }

  /**
   * Import establishments via Excel
   */
  async importEstablishments(file: File): Promise<{ imported: number }> {
    const formData = new FormData();
    formData.append('file', file);

    const response = await this.request(
      '/establishments/import',
      ApiResponseSchema(z.object({ imported: z.number() })),
      {
        method: 'POST',
        data: formData,
        headers: { 'Content-Type': 'multipart/form-data' }
      }
    );

    if (!response.data) throw new Error('Failed to import Excel');
    return response.data;
  }
}

// Create singleton instance
export const establishmentService = new EstablishmentService();
