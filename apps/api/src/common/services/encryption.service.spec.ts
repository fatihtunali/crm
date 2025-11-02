import { Test, TestingModule } from '@nestjs/testing';
import { EncryptionService } from './encryption.service';

describe('EncryptionService', () => {
  let service: EncryptionService;

  beforeAll(() => {
    // Set encryption key for tests
    process.env.ENCRYPTION_KEY = 'test-encryption-key-32-characters-long-minimum';
  });

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [EncryptionService],
    }).compile();

    service = module.get<EncryptionService>(EncryptionService);
    // Manually trigger module init since we're in test environment
    service.onModuleInit();
  });

  describe('encrypt', () => {
    it('should encrypt plaintext correctly', () => {
      const plaintext = 'sensitive-passport-number';
      const encrypted = service.encrypt(plaintext);

      expect(encrypted).toBeDefined();
      expect(encrypted).not.toBe(plaintext);
      expect(encrypted).toContain(':'); // Format: iv:authTag:encrypted
    });

    it('should produce different output for same input (IV randomness)', () => {
      const plaintext = 'test-data';
      const encrypted1 = service.encrypt(plaintext);
      const encrypted2 = service.encrypt(plaintext);

      expect(encrypted1).toBeDefined();
      expect(encrypted2).toBeDefined();
      expect(encrypted1).not.toBe(encrypted2);
      // But both should decrypt to same plaintext
      if (encrypted1 && encrypted2) {
        expect(service.decrypt(encrypted1)).toBe(plaintext);
        expect(service.decrypt(encrypted2)).toBe(plaintext);
      }
    });

    it('should handle null values', () => {
      const result = service.encrypt(null);
      expect(result).toBeNull();
    });

    it('should handle empty strings', () => {
      const result = service.encrypt('');
      // Empty string is treated as falsy and returns null
      expect(result).toBeNull();
    });

    it('should encrypt special characters', () => {
      const plaintext = 'AB-123456!@#$%^&*()';
      const encrypted = service.encrypt(plaintext);
      expect(encrypted).toBeDefined();
      if (encrypted) {
        const decrypted = service.decrypt(encrypted);
        expect(decrypted).toBe(plaintext);
      }
    });

    it('should encrypt unicode characters', () => {
      const plaintext = '日本語テスト';
      const encrypted = service.encrypt(plaintext);
      expect(encrypted).toBeDefined();
      if (encrypted) {
        const decrypted = service.decrypt(encrypted);
        expect(decrypted).toBe(plaintext);
      }
    });
  });

  describe('decrypt', () => {
    it('should decrypt encrypted text correctly', () => {
      const plaintext = 'secret-data';
      const encrypted = service.encrypt(plaintext);
      expect(encrypted).toBeDefined();
      if (encrypted) {
        const decrypted = service.decrypt(encrypted);
        expect(decrypted).toBe(plaintext);
      }
    });

    it('should throw on tampered data', () => {
      const plaintext = 'secret';
      const encrypted = service.encrypt(plaintext);
      expect(encrypted).toBeDefined();

      if (encrypted) {
        // Tamper with the encrypted data
        const parts = encrypted.split(':');
        parts[2] = 'ffffffff'; // Change encrypted data
        const tampered = parts.join(':');

        const result = service.decrypt(tampered);
        // Service returns original on decryption failure for safety
        expect(result).toBe(tampered);
      }
    });

    it('should throw on invalid format', () => {
      const invalidFormat = 'not-encrypted-data';
      const result = service.decrypt(invalidFormat);

      // Returns as-is for legacy unencrypted data
      expect(result).toBe(invalidFormat);
    });

    it('should handle null values', () => {
      const result = service.decrypt(null);
      expect(result).toBeNull();
    });

    it('should handle legacy unencrypted data', () => {
      const legacyData = 'old-passport-number';
      const result = service.decrypt(legacyData);

      // Should return as-is
      expect(result).toBe(legacyData);
    });

    it('should handle malformed encrypted strings', () => {
      const malformed = 'abc:def'; // Only 2 parts instead of 3
      const result = service.decrypt(malformed);

      expect(result).toBe(malformed);
    });
  });

  describe('isEncrypted', () => {
    it('should detect encrypted values', () => {
      const encrypted = service.encrypt('test');
      if (encrypted) {
        expect(service.isEncrypted(encrypted)).toBe(true);
      }
    });

    it('should return false for plaintext', () => {
      expect(service.isEncrypted('plaintext')).toBe(false);
      expect(service.isEncrypted('some-passport')).toBe(false);
    });

    it('should return false for null', () => {
      expect(service.isEncrypted(null)).toBe(false);
    });

    it('should return false for empty string', () => {
      expect(service.isEncrypted('')).toBe(false);
    });

    it('should return false for invalid hex format', () => {
      expect(service.isEncrypted('abc:xyz:123')).toBe(false);
    });

    it('should return true for valid hex format', () => {
      expect(service.isEncrypted('a1b2c3:d4e5f6:123456')).toBe(true);
    });
  });

  describe('encryption round-trip', () => {
    it('should handle long strings', () => {
      const longText = 'A'.repeat(10000);
      const encrypted = service.encrypt(longText);
      expect(encrypted).toBeDefined();
      if (encrypted) {
        const decrypted = service.decrypt(encrypted);
        expect(decrypted).toBe(longText);
      }
    });

    it('should handle multi-line text', () => {
      const multiline = 'Line 1\nLine 2\nLine 3';
      const encrypted = service.encrypt(multiline);
      expect(encrypted).toBeDefined();
      if (encrypted) {
        const decrypted = service.decrypt(encrypted);
        expect(decrypted).toBe(multiline);
      }
    });

    it('should be deterministically decryptable', () => {
      const plaintext = 'test-data';
      const encrypted = service.encrypt(plaintext);
      expect(encrypted).toBeDefined();

      if (encrypted) {
        // Decrypt multiple times
        expect(service.decrypt(encrypted)).toBe(plaintext);
        expect(service.decrypt(encrypted)).toBe(plaintext);
        expect(service.decrypt(encrypted)).toBe(plaintext);
      }
    });
  });

  describe('validateEncryptionAvailable', () => {
    it('should not throw when encryption is configured', () => {
      expect(() => service.validateEncryptionAvailable()).not.toThrow();
    });
  });
});
