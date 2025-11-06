// ============================================================================
// services/shootings/shooting.service.ts - Shooting service
// ============================================================================

import { z } from 'zod';
import { BaseApiService } from '@/services/__shared/api';
import {
  ShootingSchema,
  ShootingParamsSchema,
  ShootingFormDataSchema,
  type Shooting,
  type ShootingParams,
  type ShootingFormData,
} from '@/services/shootings/shooting.type';
import {
  ApiResponseSchema,
  type PaginatedResponse,
} from '@/services/__shared/types';

export class ShootingService extends BaseApiService {
  /**
   * Get paginated list of shootings
   */
  async getShootings(
    params?: ShootingParams
  ): Promise<PaginatedResponse<Shooting>> {
    const validatedParams = params ? ShootingParamsSchema.parse(params) : {};

    return this.requestPaginated('/shootings', ShootingSchema, {
      method: 'GET',
      params: validatedParams,
    });
  }

  /**
   * Get a specific shooting
   */
  async getShooting(id: number): Promise<Shooting> {
    const response = await this.request(
      `/shootings/${id}`,
      ApiResponseSchema(ShootingSchema)
    );

    if (!response.data) throw new Error('Shooting not found');
    return response.data;
  }

  /**
   * Create a new shooting record
   */
  async createShooting(data: FormData): Promise<Shooting> {
    const response = await this.request(
      '/shootings',
      ApiResponseSchema(ShootingSchema),
      {
        method: 'POST',
        data,
      }
    );

    if (!response.data) throw new Error('Failed to create shooting');
    return response.data;
  }

  /**
   * Update a shooting record
   */
  async updateShooting(
    id: number,
    data: FormData
  ): Promise<Shooting> {
    const response = await this.request(
      `/shootings/${id}`,
      ApiResponseSchema(ShootingSchema),
      {
        method: 'PUT',
        data,
      }
    );

    if (!response.data) throw new Error('Failed to update shooting');
    return response.data;
  }

  /**
   * Delete a shooting record
   */
  async deleteShooting(id: number): Promise<void> {
    await this.request(`/shootings/${id}`, ApiResponseSchema(z.null()), {
      method: 'DELETE',
    });
  }

  /**
   * Import shootings via Excel
   */
  async importShootings(file: File): Promise<{ imported: number }> {
    const formData = new FormData();
    formData.append('file', file);

    const response = await this.request(
      '/shootings/import',
      ApiResponseSchema(z.object({ imported: z.number() })),
      {
        method: 'POST',
        data: formData,
        headers: { 'Content-Type': 'multipart/form-data' },
      }
    );

    if (!response.data) throw new Error('Failed to import Excel');
    return response.data;
  }
}

// Singleton instance
export const shootingService = new ShootingService();
