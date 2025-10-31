import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { filesApi } from '../endpoints/files';
import { RequestUploadUrlDto } from '../types';

const FILES_KEY = 'files';

/**
 * Get all files with pagination and filters
 */
export function useFiles(params?: {
  page?: number;
  limit?: number;
  entity?: string;
  entityId?: number;
}) {
  return useQuery({
    queryKey: [FILES_KEY, params],
    queryFn: () => filesApi.getAll(params),
  });
}

/**
 * Get file by ID
 */
export function useFile(id: number) {
  return useQuery({
    queryKey: [FILES_KEY, id],
    queryFn: () => filesApi.getById(id),
    enabled: !!id,
  });
}

/**
 * Upload file (3-step process: request URL, upload to S3, confirm)
 */
export function useUploadFile() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      file,
      entity,
      entityId,
    }: {
      file: File;
      entity?: string;
      entityId?: number;
    }) => {
      // Step 1: Request upload URL
      const uploadData: RequestUploadUrlDto = {
        fileName: file.name,
        mimeType: file.type,
        fileSize: file.size,
        entity,
        entityId,
      };

      const uploadUrlResponse = await filesApi.requestUploadUrl(uploadData);

      // Step 2: Upload to S3
      await filesApi.uploadToS3(uploadUrlResponse.uploadUrl, file);

      // Step 3: Confirm upload
      const confirmedFile = await filesApi.confirmUpload(uploadUrlResponse.fileId);

      return confirmedFile;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [FILES_KEY] });
    },
  });
}

/**
 * Delete file
 */
export function useDeleteFile() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: number) => filesApi.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [FILES_KEY] });
    },
  });
}

/**
 * Download file
 */
export function useDownloadFile() {
  return useMutation({
    mutationFn: async (id: number) => {
      const response = await filesApi.getDownloadUrl(id);

      // Trigger download
      const link = document.createElement('a');
      link.href = response.downloadUrl;
      link.download = response.fileName;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    },
  });
}
