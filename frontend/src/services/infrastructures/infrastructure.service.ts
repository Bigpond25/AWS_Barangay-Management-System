// ============================================================================
// services/infrastructures/infrastructure.service.ts - Infrastructure service
// ============================================================================

import { z } from 'zod';
import { BaseApiService } from '@/services/__shared/api';
import {
  InfrastructureSchema,
  InfrastructureParamsSchema,
  InfrastructureFormDataSchema,
  type Infrastructure,
  type InfrastructureParams,
  type InfrastructureFormData
} from '@/services/infrastructures/infrastructure.types';
import {
  ApiResponseSchema,
  type PaginatedResponse
} from '@/services/__shared/types';

export class InfrastructureService extends BaseApiService {
  /**
   * Get paginated list of infrastructures
   */
  async getInfrastructures(
    params?: InfrastructureParams
  ): Promise<PaginatedResponse<Infrastructure>> {
    const validatedParams = params ? InfrastructureParamsSchema.parse(params) : {};

    return this.requestPaginated(
      '/infrastructures',
      InfrastructureSchema,
      {
        method: 'GET',
        params: validatedParams
      }
    );
  }

  /**
   * Get a specific infrastructure
   */
  async getInfrastructure(id: number): Promise<Infrastructure> {
    const response = await this.request(
      `/infrastructures/${id}`,
      ApiResponseSchema(InfrastructureSchema)
    );

    if (!response.data) throw new Error('Infrastructure not found');
    return response.data;
  }

  /**
   * Create a new infrastructure
   */
  async createInfrastructure(data: FormData): Promise<Infrastructure> {
    // const validatedData = InfrastructureFormDataSchema.parse(data);

    const response = await this.request(
      '/infrastructures',
      ApiResponseSchema(InfrastructureSchema),
      {
        method: 'POST',
        data: data
      }
    );

    if (!response.data) throw new Error('Failed to create infrastructure');
    return response.data;
  }

  async attachClearance(id: number, data: FormData): Promise<Infrastructure> {
    const response = await this.request(
      `/infrastructures/${id}/clearance`,
      ApiResponseSchema(InfrastructureSchema),
      {
        headers: {
          'Content-Type': 'multipart/form-data'
        },
        method: 'POST',
        data
      }
    );

    if (!response.data) throw new Error('Failed to attach clearance');
    return response.data;
  }

  /**
   * Update infrastructure
   */
  async updateInfrastructure(
    id: number,
    data: FormData
  ): Promise<Infrastructure> {
    const response = await this.request(
      `/infrastructures/${id}`,
      ApiResponseSchema(InfrastructureSchema),
      {
        method: 'PUT',
        data
      }
    );

    if (!response.data) throw new Error('Failed to update infrastructure');
    return response.data;
  }

  /**
   * Delete infrastructure
   */
  async deleteInfrastructure(id: number): Promise<void> {
    await this.request(
      `/infrastructures/${id}`,
      ApiResponseSchema(z.null()),
      {
        method: 'DELETE'
      }
    );
  }

  /**
   * Import infrastructures via Excel
   */
  async importInfrastructures(file: File): Promise<{ imported: number }> {
    const formData = new FormData();
    formData.append('file', file);

    const response = await this.request(
      '/infrastructures/import',
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
export const infrastructureService = new InfrastructureService();
