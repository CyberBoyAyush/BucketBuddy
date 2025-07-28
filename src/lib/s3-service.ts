import { 
  S3Client, 
  ListObjectsV2Command, 
  GetObjectCommand, 
  PutObjectCommand, 
  DeleteObjectCommand, 
  CopyObjectCommand,
  HeadBucketCommand,
  HeadObjectCommand
} from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import { decryptCredentials } from './encryption';

export interface S3Config {
  accessKey: string;
  secretKey: string;
  region: string;
  endpoint?: string;
  bucketName: string;
}

export interface S3Object {
  key: string;
  size: number;
  lastModified: Date;
  etag: string;
  isFolder: boolean;
}

export interface S3ListResult {
  objects: S3Object[];
  continuationToken?: string;
  isTruncated: boolean;
}

export class S3Service {
  private client: S3Client;
  private bucketName: string;

  constructor(config: S3Config) {
    this.bucketName = config.bucketName;
    
    const clientConfig: Record<string, unknown> = {
      region: config.region,
      credentials: {
        accessKeyId: config.accessKey,
        secretAccessKey: config.secretKey,
      },
    };

    if (config.endpoint) {
      clientConfig.endpoint = config.endpoint;
      clientConfig.forcePathStyle = true; // Required for most S3-compatible services
    }

    this.client = new S3Client(clientConfig);
  }

  /**
   * Test connection to the S3 bucket
   */
  async testConnection(): Promise<boolean> {
    try {
      await this.client.send(new HeadBucketCommand({ Bucket: this.bucketName }));
      return true;
    } catch (error) {
      console.error('S3 connection test failed:', error);
      return false;
    }
  }

  /**
   * List objects in the bucket with optional prefix
   */
  async listObjects(prefix = '', continuationToken?: string, maxKeys = 1000): Promise<S3ListResult> {
    try {
      const command = new ListObjectsV2Command({
        Bucket: this.bucketName,
        Prefix: prefix,
        ContinuationToken: continuationToken,
        MaxKeys: maxKeys,
        Delimiter: '/', // This helps separate folders from files
      });

      const response = await this.client.send(command);
      
      const objects: S3Object[] = [];

      // Add folders (common prefixes)
      if (response.CommonPrefixes) {
        for (const commonPrefix of response.CommonPrefixes) {
          if (commonPrefix.Prefix) {
            objects.push({
              key: commonPrefix.Prefix,
              size: 0,
              lastModified: new Date(),
              etag: '',
              isFolder: true,
            });
          }
        }
      }

      // Add files
      if (response.Contents) {
        for (const object of response.Contents) {
          if (object.Key && object.Key !== prefix) { // Exclude the prefix itself
            objects.push({
              key: object.Key,
              size: object.Size || 0,
              lastModified: object.LastModified || new Date(),
              etag: object.ETag || '',
              isFolder: false,
            });
          }
        }
      }

      return {
        objects,
        continuationToken: response.NextContinuationToken,
        isTruncated: response.IsTruncated || false,
      };
    } catch (error) {
      console.error('Error listing objects:', error);
      throw new Error('Failed to list objects');
    }
  }

  /**
   * Get a presigned URL for downloading a file
   */
  async getDownloadUrl(key: string, expiresIn = 3600): Promise<string> {
    try {
      const command = new GetObjectCommand({
        Bucket: this.bucketName,
        Key: key,
      });

      return await getSignedUrl(this.client, command, { expiresIn });
    } catch (error) {
      console.error('Error generating download URL:', error);
      throw new Error('Failed to generate download URL');
    }
  }

  /**
   * Get a presigned URL for uploading a file
   */
  async getUploadUrl(key: string, contentType?: string, expiresIn = 3600): Promise<string> {
    try {
      const command = new PutObjectCommand({
        Bucket: this.bucketName,
        Key: key,
        ContentType: contentType,
      });

      return await getSignedUrl(this.client, command, { expiresIn });
    } catch (error) {
      console.error('Error generating upload URL:', error);
      throw new Error('Failed to generate upload URL');
    }
  }

  /**
   * Delete an object
   */
  async deleteObject(key: string): Promise<void> {
    try {
      const command = new DeleteObjectCommand({
        Bucket: this.bucketName,
        Key: key,
      });

      await this.client.send(command);
    } catch (error) {
      console.error('Error deleting object:', error);
      throw new Error('Failed to delete object');
    }
  }

  /**
   * Copy/rename an object
   */
  async copyObject(sourceKey: string, destinationKey: string): Promise<void> {
    try {
      const command = new CopyObjectCommand({
        Bucket: this.bucketName,
        CopySource: `${this.bucketName}/${sourceKey}`,
        Key: destinationKey,
      });

      await this.client.send(command);
    } catch (error) {
      console.error('Error copying object:', error);
      throw new Error('Failed to copy object');
    }
  }

  /**
   * Get object metadata
   */
  async getObjectMetadata(key: string) {
    try {
      const command = new HeadObjectCommand({
        Bucket: this.bucketName,
        Key: key,
      });

      const response = await this.client.send(command);
      return {
        size: response.ContentLength || 0,
        lastModified: response.LastModified || new Date(),
        contentType: response.ContentType || 'application/octet-stream',
        etag: response.ETag || '',
      };
    } catch (error) {
      console.error('Error getting object metadata:', error);
      throw new Error('Failed to get object metadata');
    }
  }
}

/**
 * Create an S3Service instance from encrypted bucket credentials
 */
export function createS3ServiceFromBucket(bucket: {
  encryptedAccessKey: string;
  encryptedSecretKey: string;
  region: string;
  endpoint?: string;
  bucketName: string;
}): S3Service {
  const { accessKey, secretKey } = decryptCredentials(
    bucket.encryptedAccessKey,
    bucket.encryptedSecretKey
  );

  return new S3Service({
    accessKey,
    secretKey,
    region: bucket.region,
    endpoint: bucket.endpoint || undefined,
    bucketName: bucket.bucketName,
  });
}
