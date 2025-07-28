export interface S3Provider {
  id: string;
  name: string;
  defaultEndpoint?: string;
  defaultRegion: string;
  requiresEndpoint: boolean;
  corsInstructions: string;
  setupGuide: string;
}

export const S3_PROVIDERS: S3Provider[] = [
  {
    id: 'aws',
    name: 'Amazon Web Services (AWS) S3',
    defaultRegion: 'us-east-1',
    requiresEndpoint: false,
    corsInstructions: `
1. Go to your S3 bucket in AWS Console
2. Click on the "Permissions" tab
3. Scroll down to "Cross-origin resource sharing (CORS)"
4. Add the following CORS configuration:

[
  {
    "AllowedHeaders": ["*"],
    "AllowedMethods": ["GET", "PUT", "POST", "DELETE", "HEAD"],
    "AllowedOrigins": ["${typeof window !== 'undefined' ? window.location.origin : 'https://yourdomain.com'}"],
    "ExposeHeaders": ["ETag"]
  }
]`,
    setupGuide: 'Create an IAM user with S3 permissions and generate access keys.'
  },
  {
    id: 'cloudflare',
    name: 'Cloudflare R2',
    defaultEndpoint: 'https://<account-id>.r2.cloudflarestorage.com',
    defaultRegion: 'auto',
    requiresEndpoint: true,
    corsInstructions: `
1. Go to your Cloudflare dashboard
2. Navigate to R2 Object Storage
3. Select your bucket
4. Go to Settings tab
5. Add the following CORS policy:

[
  {
    "AllowedOrigins": ["${typeof window !== 'undefined' ? window.location.origin : 'https://yourdomain.com'}"],
    "AllowedMethods": ["GET", "PUT", "POST", "DELETE", "HEAD"],
    "AllowedHeaders": ["*"],
    "ExposeHeaders": ["ETag"]
  }
]`,
    setupGuide: 'Create R2 API tokens with Object Read & Write permissions.'
  },
  {
    id: 'digitalocean',
    name: 'DigitalOcean Spaces',
    defaultEndpoint: 'https://<region>.digitaloceanspaces.com',
    defaultRegion: 'nyc3',
    requiresEndpoint: true,
    corsInstructions: `
1. Go to your DigitalOcean Spaces
2. Select your Space
3. Click on "Settings"
4. Add the following CORS configuration:

Origin: ${typeof window !== 'undefined' ? window.location.origin : 'https://yourdomain.com'}
Allowed Methods: GET, PUT, POST, DELETE, HEAD
Allowed Headers: *`,
    setupGuide: 'Generate Spaces access keys from the API section in your account.'
  },
  {
    id: 'wasabi',
    name: 'Wasabi Hot Cloud Storage',
    defaultEndpoint: 'https://s3.<region>.wasabisys.com',
    defaultRegion: 'us-east-1',
    requiresEndpoint: true,
    corsInstructions: `
1. Log into Wasabi Console
2. Go to your bucket
3. Click on "Policies" tab
4. Add CORS policy:

<?xml version="1.0" encoding="UTF-8"?>
<CORSConfiguration>
  <CORSRule>
    <AllowedOrigin>${typeof window !== 'undefined' ? window.location.origin : 'https://yourdomain.com'}</AllowedOrigin>
    <AllowedMethod>GET</AllowedMethod>
    <AllowedMethod>PUT</AllowedMethod>
    <AllowedMethod>POST</AllowedMethod>
    <AllowedMethod>DELETE</AllowedMethod>
    <AllowedMethod>HEAD</AllowedMethod>
    <AllowedHeader>*</AllowedHeader>
  </CORSRule>
</CORSConfiguration>`,
    setupGuide: 'Create access keys from the Access Keys section in Wasabi Console.'
  },
  {
    id: 'backblaze',
    name: 'Backblaze B2',
    defaultEndpoint: 'https://s3.<region>.backblazeb2.com',
    defaultRegion: 'us-west-000',
    requiresEndpoint: true,
    corsInstructions: `
1. Go to Backblaze B2 Console
2. Select your bucket
3. Go to "Bucket Settings"
4. Add CORS rules:

[
  {
    "corsRuleName": "downloadFromAnyOrigin",
    "allowedOrigins": ["${typeof window !== 'undefined' ? window.location.origin : 'https://yourdomain.com'}"],
    "allowedHeaders": ["*"],
    "allowedOperations": ["s3_get", "s3_put", "s3_post", "s3_delete", "s3_head"],
    "exposeHeaders": ["ETag"]
  }
]`,
    setupGuide: 'Create application keys with read/write permissions for your bucket.'
  },
  {
    id: 'custom',
    name: 'Custom S3-Compatible Provider',
    defaultRegion: 'us-east-1',
    requiresEndpoint: true,
    corsInstructions: `
Configure CORS on your S3-compatible storage provider to allow:

Origin: ${typeof window !== 'undefined' ? window.location.origin : 'https://yourdomain.com'}
Methods: GET, PUT, POST, DELETE, HEAD
Headers: *

The exact configuration method depends on your provider.`,
    setupGuide: 'Refer to your provider\'s documentation for creating access keys.'
  }
];

export function getProviderById(id: string): S3Provider | undefined {
  return S3_PROVIDERS.find(provider => provider.id === id);
}

export function getProviderEndpoint(provider: S3Provider, region: string, accountId?: string): string {
  if (!provider.defaultEndpoint) {
    return ''; // AWS S3 uses default SDK endpoint
  }
  
  return provider.defaultEndpoint
    .replace('<region>', region)
    .replace('<account-id>', accountId || 'your-account-id');
}
