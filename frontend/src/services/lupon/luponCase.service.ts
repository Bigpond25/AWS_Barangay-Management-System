// ============================================================================
// services/lupon/luponCase.service.ts - Lupon Case service
// ============================================================================

import { z } from 'zod';
import { BaseApiService } from '@/services/__shared/api';
import {
  LuponCaseSchema,
  LuponCaseParamsSchema,
  LuponCaseFormDataSchema,
  type LuponCase,
  type LuponCaseParams,
  type LuponCaseFormData,
} from '@/services/lupon/luponCase.type';
import {
  ApiResponseSchema,
  type PaginatedResponse,
} from '@/services/__shared/types';

export class LuponCaseService extends BaseApiService {
  /**
   * Get paginated list of lupon cases
   */
  async getLuponCases(
    params?: LuponCaseParams
  ): Promise<PaginatedResponse<LuponCase>> {
    const validatedParams = params ? LuponCaseParamsSchema.parse(params) : {};

    return this.requestPaginated('/lupon-cases', LuponCaseSchema, {
      method: 'GET',
      params: validatedParams,
    });
  }

  /**
   * Get a specific lupon case
   */
  async getLuponCaseById(id: number): Promise<LuponCase> {
    const response = await this.request(
      `/lupon-cases/${id}`,
      ApiResponseSchema(LuponCaseSchema)
    );

    if (!response.data) throw new Error('Lupon case not found');
    return response.data;
  }

  /**
   * Create a new lupon case with nested parties & hearings
   */
  async createLuponCase(data: FormData): Promise<LuponCase> {
    const response = await this.request(
      '/lupon-cases',
      ApiResponseSchema(LuponCaseSchema),
      {
        method: 'POST',
        data,
      }
    );

    if (!response.data) throw new Error('Failed to create lupon case');
    return response.data;
  }

  /**
   * Update a lupon case
   */
  async updateLuponCase(
    id: number,
    data: Partial<LuponCaseFormData>
  ): Promise<LuponCase> {
    const response = await this.request(
      `/lupon-cases/${id}`,
      ApiResponseSchema(LuponCaseSchema),
      {
        method: 'PUT',
        data,
      }
    );

    if (!response.data) throw new Error('Failed to update lupon case');
    return response.data;
  }

  /**
   * Delete a lupon case
   */
  async deleteLuponCase(id: number): Promise<void> {
    await this.request(`/lupon-cases/${id}`, ApiResponseSchema(z.null()), {
      method: 'DELETE',
    });
  }

  /**
   * Import lupon cases via Excel
   */
  async importLuponCases(file: File): Promise<{ imported: number }> {
    const formData = new FormData();
    formData.append('file', file);

    const response = await this.request(
      '/lupon-cases/import',
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
export const luponCaseService = new LuponCaseService();
