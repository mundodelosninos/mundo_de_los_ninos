import axios from 'axios';
import { API_CONFIG } from '@/config/api';
import {
  StudentMedia,
  MediaUploadFormData,
  UpdateMediaDto,
  QueryMediaParams,
} from '@/types/media';

// Create axios instance
const api = axios.create({
  baseURL: API_CONFIG.apiUrl,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Function to safely access localStorage
const getToken = () => {
  if (typeof window !== 'undefined') {
    return localStorage.getItem('token');
  }
  return null;
};

const removeAuthData = () => {
  if (typeof window !== 'undefined') {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
  }
};

// Request interceptor to add token
api.interceptors.request.use((config) => {
  const token = getToken();
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Response interceptor to handle auth errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      removeAuthData();
      if (typeof window !== 'undefined') {
        window.location.href = '/auth/login';
      }
    }
    return Promise.reject(error);
  }
);

export const mediaApi = {
  /**
   * Upload a new photo or document
   */
  async upload(data: MediaUploadFormData): Promise<StudentMedia> {
    const formData = new FormData();
    formData.append('file', data.file);
    formData.append('mediaType', data.mediaType);
    formData.append('studentIds', JSON.stringify(data.studentIds));

    if (data.description) {
      formData.append('description', data.description);
    }

    const response = await api.post<StudentMedia>('/media/upload', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });

    return response.data;
  },

  /**
   * Get all media with optional filters
   */
  async getAll(params?: QueryMediaParams): Promise<StudentMedia[]> {
    const response = await api.get<StudentMedia[]>('/media', { params });
    return response.data;
  },

  /**
   * Get a specific media by ID
   */
  async getById(id: string): Promise<StudentMedia> {
    const response = await api.get<StudentMedia>(`/media/${id}`);
    return response.data;
  },

  /**
   * Update media metadata
   */
  async update(id: string, data: UpdateMediaDto): Promise<StudentMedia> {
    const response = await api.patch<StudentMedia>(`/media/${id}`, data);
    return response.data;
  },

  /**
   * Delete media
   */
  async delete(id: string): Promise<void> {
    await api.delete(`/media/${id}`);
  },

  /**
   * Get signed URL for private media access
   */
  async getSignedUrl(id: string, expiresIn: number = 3600): Promise<string> {
    const response = await api.post<{ url: string; expiresIn: number }>(
      `/media/${id}/signed-url`,
      { expiresIn }
    );
    return response.data.url;
  },

  /**
   * Get media by student ID
   */
  async getByStudent(studentId: string): Promise<StudentMedia[]> {
    return this.getAll({ studentId });
  },

  /**
   * Get photos only
   */
  async getPhotos(params?: Omit<QueryMediaParams, 'mediaType'>): Promise<StudentMedia[]> {
    return this.getAll({ ...params, mediaType: 'photo' as any });
  },

  /**
   * Get documents only
   */
  async getDocuments(params?: Omit<QueryMediaParams, 'mediaType'>): Promise<StudentMedia[]> {
    return this.getAll({ ...params, mediaType: 'document' as any });
  },

  /**
   * Download media file
   */
  async download(media: StudentMedia): Promise<void> {
    try {
      // Fetch the file as a blob to avoid redirect issues
      const response = await fetch(media.fileUrl);
      if (!response.ok) {
        throw new Error('Failed to download file');
      }

      const blob = await response.blob();

      // Create a blob URL and trigger download
      const blobUrl = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = blobUrl;
      link.download = media.originalFileName;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      // Clean up the blob URL
      window.URL.revokeObjectURL(blobUrl);
    } catch (error) {
      console.error('Error downloading file:', error);
      // Fallback to opening in new tab
      window.open(media.fileUrl, '_blank');
    }
  },

  /**
   * Get media file size in human-readable format
   */
  formatFileSize(bytes: number): string {
    if (bytes === 0) return '0 Bytes';

    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));

    return Math.round((bytes / Math.pow(k, i)) * 100) / 100 + ' ' + sizes[i];
  },

  /**
   * Check if file is an image
   */
  isImage(mimeType: string): boolean {
    return mimeType.startsWith('image/');
  },

  /**
   * Check if file is a PDF
   */
  isPDF(mimeType: string): boolean {
    return mimeType === 'application/pdf';
  },

  /**
   * Get file extension from filename
   */
  getFileExtension(filename: string): string {
    return filename.slice(((filename.lastIndexOf('.') - 1) >>> 0) + 2);
  },
};
