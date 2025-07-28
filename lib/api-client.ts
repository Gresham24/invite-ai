// API client with error handling and type safety

export interface ApiError {
  success: false;
  error: string;
  details?: any;
}

export interface ApiSuccess<T = any> {
  success: true;
  data: T;
}

export type ApiResponse<T = any> = ApiSuccess<T> | ApiError;

// Base API configuration
const API_BASE_URL = process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3001';

// Custom error class for API errors
export class APIError extends Error {
  public statusCode: number;
  public response?: any;

  constructor(message: string, statusCode: number, response?: any) {
    super(message);
    this.name = 'APIError';
    this.statusCode = statusCode;
    this.response = response;
  }
}

// Generic API request handler with error handling
async function apiRequest<T = any>(
  endpoint: string,
  options: RequestInit = {}
): Promise<T> {
  try {
    const url = `${API_BASE_URL}${endpoint}`;
    
    const response = await fetch(url, {
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
      ...options,
    });

    const data = await response.json();

    if (!response.ok) {
      throw new APIError(
        data.error || `Request failed with status ${response.status}`,
        response.status,
        data
      );
    }

    return data;
  } catch (error) {
    if (error instanceof APIError) {
      throw error;
    }
    
    // Handle network errors, parsing errors, etc.
    throw new APIError(
      error instanceof Error ? error.message : 'Unknown error occurred',
      0,
      error
    );
  }
}

// Generate invite API
export interface GenerateInviteRequest {
  inviteId: string;
  formData: {
    eventTitle: string;
    eventDate: string;
    eventTime: string;
    venue: string;
    dressCode?: string;
    eventTheme?: string;
    colorScheme?: string;
    rsvpWhatsApp?: string;
    rsvpContact?: string;
    eventDescription: string;
    userEmail?: string;
  };
  uploadedImages?: {
    hero?: string;
    logo?: string;
    themeImages?: string[];
    additional?: string[];
  };
}

export interface GenerateInviteResponse {
  success: true;
  inviteId: string;
  inviteUrl: string;
  usage: {
    input_tokens: number;
    output_tokens: number;
  };
}

export async function generateInvite(
  data: GenerateInviteRequest
): Promise<GenerateInviteResponse> {
  return apiRequest<GenerateInviteResponse>('/api/generate-invite', {
    method: 'POST',
    body: JSON.stringify(data),
  });
}

// Upload images API
export async function uploadImages(
  inviteId: string,
  files: {
    heroImage?: File[];
    eventLogo?: File[];
    themeImages?: File[];
    additionalImages?: File[];
  }
): Promise<{
  success: true;
  uploadedImages: {
    hero?: string;
    logo?: string;
    themeImages?: string[];
    additional?: string[];
  };
}> {
  const formData = new FormData();
  formData.append('inviteId', inviteId);

  // Append files to FormData
  Object.entries(files).forEach(([key, fileArray]) => {
    if (fileArray && fileArray.length > 0) {
      fileArray.forEach(file => {
        formData.append(key, file);
      });
    }
  });

  const response = await fetch(`${API_BASE_URL}/api/upload-images`, {
    method: 'POST',
    body: formData,
  });

  const data = await response.json();

  if (!response.ok) {
    throw new APIError(
      data.error || `Upload failed with status ${response.status}`,
      response.status,
      data
    );
  }

  return data;
}

// Get invite by ID
export interface InviteData {
  id: string;
  form_data: any;
  generated_code: string;
  user_email?: string;
  view_count: number;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export async function getInvite(inviteId: string): Promise<InviteData> {
  return apiRequest<InviteData>(`/api/invite/${inviteId}`);
}

// Get user's invites
export async function getUserInvites(
  email: string,
  limit: number = 10
): Promise<InviteData[]> {
  return apiRequest<InviteData[]>(`/api/user/${encodeURIComponent(email)}/invites?limit=${limit}`);
}

// Get invite analytics
export async function getInviteAnalytics(inviteId: string): Promise<{
  success: true;
  analytics: {
    viewCount: number;
    createdAt: string;
    daysSinceCreation: number;
    averageViewsPerDay: number;
  };
}> {
  return apiRequest(`/api/invite/${inviteId}/analytics`);
}

// Error handling utility
export function handleApiError(error: unknown): string {
  if (error instanceof APIError) {
    // Handle specific API errors
    switch (error.statusCode) {
      case 400:
        return 'Invalid request. Please check your input and try again.';
      case 401:
        return 'Authentication required. Please log in and try again.';
      case 403:
        return 'Access denied. You do not have permission to perform this action.';
      case 404:
        return 'The requested resource was not found.';
      case 429:
        return 'Too many requests. Please wait a moment and try again.';
      case 500:
        return 'Server error. Please try again later.';
      default:
        return error.message || 'An unexpected error occurred.';
    }
  }
  
  if (error instanceof Error) {
    return error.message;
  }
  
  return 'An unknown error occurred. Please try again.';
}

// Retry utility for failed requests
export async function retryRequest<T>(
  requestFn: () => Promise<T>,
  maxRetries: number = 3,
  delay: number = 1000
): Promise<T> {
  let lastError: Error;
  
  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      return await requestFn();
    } catch (error) {
      lastError = error instanceof Error ? error : new Error('Unknown error');
      
      if (attempt === maxRetries) {
        throw lastError;
      }
      
      // Wait before retrying, with exponential backoff
      await new Promise(resolve => setTimeout(resolve, delay * attempt));
    }
  }
  
  throw lastError!;
}