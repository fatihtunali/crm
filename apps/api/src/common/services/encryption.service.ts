import { Injectable, OnModuleInit } from '@nestjs/common';
import { createCipheriv, createDecipheriv, randomBytes, scryptSync } from 'crypto';

/**
 * Encryption Service (Issue #25 - Field-Level Encryption)
 *
 * Provides AES-256-GCM encryption for sensitive fields such as:
 * - Passport numbers
 * - Tax IDs
 * - Bank account numbers
 * - Credit card numbers (if added)
 *
 * Uses authenticated encryption (GCM mode) to ensure data integrity.
 */
@Injectable()
export class EncryptionService implements OnModuleInit {
  private readonly algorithm = 'aes-256-gcm';
  private key: Buffer | null = null;
  private readonly saltPrefix = 'tour-crm-2025';

  onModuleInit() {
    this.initializeKey();
  }

  /**
   * Initialize encryption key from environment variable
   */
  private initializeKey() {
    const secret = process.env.ENCRYPTION_KEY;

    if (!secret) {
      console.warn(
        '⚠️  WARNING: ENCRYPTION_KEY environment variable is not set. Field-level encryption will not work.',
      );
      return;
    }

    if (secret.length < 32) {
      throw new Error(
        'ENCRYPTION_KEY must be at least 32 characters long for AES-256 encryption',
      );
    }

    // Derive a 32-byte key from the secret using scrypt
    this.key = scryptSync(secret, this.saltPrefix, 32);
    console.log('✅ Field-level encryption initialized successfully');
  }

  /**
   * Encrypt a string value using AES-256-GCM
   *
   * @param text - The plaintext to encrypt
   * @returns Encrypted string in format: iv:authTag:encryptedData (all hex-encoded)
   */
  encrypt(text: string | null): string | null {
    if (!text) {
      return null;
    }

    if (!this.key) {
      console.error('Cannot encrypt: Encryption key not initialized');
      return text; // Return plaintext if encryption not available
    }

    try {
      // Generate a random initialization vector (IV)
      const iv = randomBytes(16);

      // Create cipher
      const cipher = createCipheriv(this.algorithm, this.key, iv);

      // Encrypt the text
      const encrypted = Buffer.concat([
        cipher.update(text, 'utf8'),
        cipher.final(),
      ]);

      // Get the authentication tag
      const authTag = cipher.getAuthTag();

      // Return in format: iv:authTag:encryptedData
      return `${iv.toString('hex')}:${authTag.toString('hex')}:${encrypted.toString('hex')}`;
    } catch (error) {
      console.error('Encryption failed:', error);
      throw new Error('Failed to encrypt sensitive data');
    }
  }

  /**
   * Decrypt a string value encrypted with encrypt()
   *
   * @param encryptedText - Encrypted string in format: iv:authTag:encryptedData
   * @returns Decrypted plaintext
   */
  decrypt(encryptedText: string | null): string | null {
    if (!encryptedText) {
      return null;
    }

    if (!this.key) {
      console.error('Cannot decrypt: Encryption key not initialized');
      return encryptedText; // Return as-is if decryption not available
    }

    // Check if the string is encrypted (contains colons)
    if (!encryptedText.includes(':')) {
      // This is likely unencrypted legacy data
      return encryptedText;
    }

    try {
      // Parse the encrypted string
      const parts = encryptedText.split(':');
      if (parts.length !== 3) {
        console.error('Invalid encrypted data format');
        return encryptedText; // Return as-is if format is invalid
      }

      const [ivHex, authTagHex, encryptedHex] = parts;

      // Convert from hex to buffers
      const iv = Buffer.from(ivHex, 'hex');
      const authTag = Buffer.from(authTagHex, 'hex');
      const encrypted = Buffer.from(encryptedHex, 'hex');

      // Create decipher
      const decipher = createDecipheriv(this.algorithm, this.key, iv);

      // Set the authentication tag
      decipher.setAuthTag(authTag);

      // Decrypt the data
      const decrypted = Buffer.concat([
        decipher.update(encrypted),
        decipher.final(),
      ]);

      return decrypted.toString('utf8');
    } catch (error) {
      console.error('Decryption failed:', error);
      // In case of decryption failure, return the encrypted text
      // This allows gradual migration and prevents data loss
      return encryptedText;
    }
  }

  /**
   * Check if a string is encrypted
   *
   * @param value - String to check
   * @returns true if the string appears to be encrypted
   */
  isEncrypted(value: string | null): boolean {
    if (!value) {
      return false;
    }

    // Encrypted values have the format: hex:hex:hex
    const parts = value.split(':');
    if (parts.length !== 3) {
      return false;
    }

    // Check if all parts are valid hex strings
    const hexRegex = /^[0-9a-f]+$/i;
    return parts.every((part) => hexRegex.test(part) && part.length > 0);
  }

  /**
   * Validate that encryption is available
   *
   * @throws Error if encryption is not properly configured
   */
  validateEncryptionAvailable(): void {
    if (!this.key) {
      throw new Error(
        'Encryption is not available. Please set ENCRYPTION_KEY environment variable.',
      );
    }
  }
}
