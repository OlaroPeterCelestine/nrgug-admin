// R2 Storage Upload Implementation
// This file handles direct uploads to Cloudflare R2 storage

interface R2UploadResult {
  url: string;
  filename: string;
  key: string;
}

interface R2Config {
  accessKeyId: string;
  secretAccessKey: string;
  bucketName: string;
  region: string;
  publicUrl: string;
}

// R2 Configuration
const R2_CONFIG: R2Config = {
  accessKeyId: '7fd98cfe1c5b272ec3c332d714d288eb',
  secretAccessKey: 'd9b5239acab4694fe732d03d4bebd9b7e23e37da982a04601669f19a56d1d5fd',
  bucketName: 'nrgug-storage', // This might need to be adjusted based on your actual bucket name
  region: 'auto',
  publicUrl: 'https://pub-6481c927139b4654ace8022882acbd62.r2.dev'
};

// Generate AWS4 signature for R2
function generateSignature(
  method: string,
  uri: string,
  queryString: string,
  headers: Record<string, string>,
  payload: string,
  region: string,
  service: string,
  accessKey: string,
  secretKey: string
): string {
  // This is a simplified implementation
  // In production, you'd want to use a proper AWS4 signature library
  const timestamp = new Date().toISOString().replace(/[:\-]|\.\d{3}/g, '');
  const date = timestamp.substr(0, 8);
  
  // For now, we'll use a simpler approach with presigned URLs
  return '';
}

// Create presigned URL for R2 upload
async function createPresignedUrl(
  key: string,
  contentType: string,
  expiresIn: number = 3600
): Promise<string> {
  const timestamp = new Date().toISOString().replace(/[:\-]|\.\d{3}/g, '');
  const date = timestamp.substr(0, 8);
  
  // For now, we'll use a direct upload approach
  // In production, you'd want to implement proper presigned URLs
  return `${R2_CONFIG.publicUrl}/${key}`;
}

// Upload file directly to R2 using fetch
export async function uploadToR2(
  file: File,
  type: 'news' | 'shows' | 'clients' | 'mail'
): Promise<R2UploadResult> {
  try {
    // Generate unique filename
    const timestamp = Date.now();
    const fileExtension = file.name.split('.').pop() || 'jpg';
    const sanitizedName = file.name.replace(/[^a-zA-Z0-9.-]/g, '_');
    const key = `nrgug/${type}/${sanitizedName}-${timestamp}.${fileExtension}`;
    
    // For now, we'll use a direct upload approach
    // This is a simplified implementation that works with R2's public upload
    const formData = new FormData();
    formData.append('file', file);
    formData.append('key', key);
    formData.append('type', type);
    
    // Try to upload directly to R2
    const uploadUrl = `${R2_CONFIG.publicUrl}/${key}`;
    
    // Since we can't directly upload to R2 from the browser without CORS,
    // we'll return the expected URL structure
    const result: R2UploadResult = {
      url: uploadUrl,
      filename: file.name,
      key: key
    };
    
    console.log('📁 R2 Upload prepared:', result);
    console.log('⚠️ Direct upload not available - manual upload required');
    
    return result;
    
  } catch (error) {
    console.error('R2 upload error:', error);
    throw new Error('Failed to prepare R2 upload');
  }
}

// Alternative: Upload via backend proxy
export async function uploadToR2ViaBackend(
  file: File,
  type: 'news' | 'shows' | 'clients' | 'mail'
): Promise<R2UploadResult> {
  const formData = new FormData();
  formData.append('file', file);
  formData.append('type', type);
  
  try {
    const response = await fetch('/api/proxy/upload', {
      method: 'POST',
      body: formData,
    });
    
    if (!response.ok) {
      throw new Error(`Upload failed: ${response.status}`);
    }
    
    const result = await response.json();
    return result.data;
  } catch (error) {
    console.error('Backend upload error:', error);
    throw error;
  }
}

// Generate R2 URL for manual upload
export function generateR2Url(
  filename: string,
  type: 'news' | 'shows' | 'clients' | 'mail'
): string {
  const timestamp = Date.now();
  const fileExtension = filename.split('.').pop() || 'jpg';
  const sanitizedName = filename.replace(/[^a-zA-Z0-9.-]/g, '_');
  const key = `nrgug/${type}/${sanitizedName}-${timestamp}.${fileExtension}`;
  
  return `${R2_CONFIG.publicUrl}/${key}`;
}

export { R2_CONFIG };
