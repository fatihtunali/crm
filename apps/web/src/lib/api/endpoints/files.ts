import { apiClient } from '../client';
import {
  File,
  RequestUploadUrlDto,
  UploadUrlResponse,
  DownloadUrlResponse,
  PaginatedResponse,
} from '../types';

export const filesApi = {
  /**
   * Request a pre-signed upload URL for file upload
   */
  requestUploadUrl: async (
    data: RequestUploadUrlDto
  ): Promise<UploadUrlResponse> => {
    const response = await apiClient.post<UploadUrlResponse>(
      '/files/upload-url',
      data
    );
    return response.data;
  },

  /**
   * Upload file to S3 using pre-signed URL
   */
  uploadToS3: async (uploadUrl: string, file: globalThis.File): Promise<void> => {
    await fetch(uploadUrl, {
      method: 'PUT',
      body: file,
      headers: {
        'Content-Type': file.type,
      },
    });
  },

  /**
   * Confirm file upload completion
   */
  confirmUpload: async (fileId: number): Promise<File> => {
    const response = await apiClient.post<File>(`/files/${fileId}/confirm`);
    return response.data;
  },

  /**
   * Get all files with optional filters
   */
  getAll: async (params?: {
    page?: number;
    limit?: number;
    entity?: string;
    entityId?: number;
  }): Promise<PaginatedResponse<File>> => {
    const queryParams = new URLSearchParams();

    if (params?.page) queryParams.append('page', params.page.toString());
    if (params?.limit) queryParams.append('limit', params.limit.toString());
    if (params?.entity) queryParams.append('entity', params.entity);
    if (params?.entityId) queryParams.append('entityId', params.entityId.toString());

    const response = await apiClient.get<PaginatedResponse<File>>(
      `/files?${queryParams.toString()}`
    );
    return response.data;
  },

  /**
   * Get file by ID
   */
  getById: async (id: number): Promise<File> => {
    const response = await apiClient.get<File>(`/files/${id}`);
    return response.data;
  },

  /**
   * Get download URL for file
   */
  getDownloadUrl: async (id: number): Promise<DownloadUrlResponse> => {
    const response = await apiClient.get<DownloadUrlResponse>(
      `/files/${id}/download-url`
    );
    return response.data;
  },

  /**
   * Delete file
   */
  delete: async (id: number): Promise<void> => {
    await apiClient.delete(`/files/${id}`);
  },
};
