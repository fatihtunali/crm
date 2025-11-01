import { INestApplication } from '@nestjs/common';
import request from 'supertest';
import { PrismaService } from '../src/prisma/prisma.service';
import { createTestApp, closeTestApp, cleanDatabase } from './helpers/test-utils';

describe('Authentication (E2E)', () => {
  let app: INestApplication;
  let prisma: PrismaService;

  beforeAll(async () => {
    app = await createTestApp();
    prisma = app.get(PrismaService);
  });

  afterAll(async () => {
    await closeTestApp(app);
  });

  beforeEach(async () => {
    await cleanDatabase(prisma);
  });

  describe('/api/v1/auth/login (POST)', () => {
    it('should login successfully with valid credentials', async () => {
      // Create tenant and user
      const argon2 = require('argon2');
      const tenant = await prisma.tenant.create({
        data: {
          name: 'Test Agency',
          code: 'TEST001',
          email: 'test@agency.com',
          isActive: true,
        },
      });

      const user = await prisma.user.create({
        data: {
          tenantId: tenant.id,
          email: 'user@test.com',
          passwordHash: await argon2.hash('Password123!'),
          name: 'Test User',
          role: 'ADMIN',
          isActive: true,
        },
      });

      const response = await request(app.getHttpServer())
        .post('/api/v1/auth/login')
        .send({
          email: 'user@test.com',
          password: 'Password123!',
        })
        .expect(200);

      expect(response.body).toHaveProperty('accessToken');
      expect(response.body).toHaveProperty('refreshToken');
      expect(response.body.user).toMatchObject({
        email: 'user@test.com',
        name: 'Test User',
        role: 'ADMIN',
        tenantId: tenant.id,
      });
    });

    it('should reject login with invalid email', async () => {
      const response = await request(app.getHttpServer())
        .post('/api/v1/auth/login')
        .send({
          email: 'nonexistent@test.com',
          password: 'Password123!',
        })
        .expect(401);

      expect(response.body.message).toBe('Invalid credentials');
    });

    it('should reject login with invalid password', async () => {
      const argon2 = require('argon2');
      const tenant = await prisma.tenant.create({
        data: {
          name: 'Test Agency',
          code: 'TEST002',
          email: 'test@agency.com',
          isActive: true,
        },
      });

      await prisma.user.create({
        data: {
          tenantId: tenant.id,
          email: 'user@test.com',
          passwordHash: await argon2.hash('CorrectPassword123!'),
          name: 'Test User',
          role: 'ADMIN',
          isActive: true,
        },
      });

      const response = await request(app.getHttpServer())
        .post('/api/v1/auth/login')
        .send({
          email: 'user@test.com',
          password: 'WrongPassword123!',
        })
        .expect(401);

      expect(response.body.message).toBe('Invalid credentials');
    });

    it('should reject login for inactive user', async () => {
      const argon2 = require('argon2');
      const tenant = await prisma.tenant.create({
        data: {
          name: 'Test Agency',
          code: 'TEST003',
          email: 'test@agency.com',
          isActive: true,
        },
      });

      await prisma.user.create({
        data: {
          tenantId: tenant.id,
          email: 'inactive@test.com',
          passwordHash: await argon2.hash('Password123!'),
          name: 'Inactive User',
          role: 'ADMIN',
          isActive: false, // Inactive user
        },
      });

      const response = await request(app.getHttpServer())
        .post('/api/v1/auth/login')
        .send({
          email: 'inactive@test.com',
          password: 'Password123!',
        })
        .expect(401);

      expect(response.body.message).toBe('Invalid credentials');
    });

    it('should reject login for user with inactive tenant', async () => {
      const argon2 = require('argon2');
      const tenant = await prisma.tenant.create({
        data: {
          name: 'Inactive Agency',
          code: 'TEST004',
          email: 'inactive@agency.com',
          isActive: false, // Inactive tenant
        },
      });

      await prisma.user.create({
        data: {
          tenantId: tenant.id,
          email: 'user@inactive.com',
          passwordHash: await argon2.hash('Password123!'),
          name: 'User in Inactive Tenant',
          role: 'ADMIN',
          isActive: true,
        },
      });

      const response = await request(app.getHttpServer())
        .post('/api/v1/auth/login')
        .send({
          email: 'user@inactive.com',
          password: 'Password123!',
        })
        .expect(401);

      expect(response.body.message).toBe('Tenant is inactive');
    });

    it('should update last login timestamp on successful login', async () => {
      const argon2 = require('argon2');
      const tenant = await prisma.tenant.create({
        data: {
          name: 'Test Agency',
          code: 'TEST005',
          email: 'test@agency.com',
          isActive: true,
        },
      });

      const user = await prisma.user.create({
        data: {
          tenantId: tenant.id,
          email: 'user@test.com',
          passwordHash: await argon2.hash('Password123!'),
          name: 'Test User',
          role: 'ADMIN',
          isActive: true,
          lastLoginAt: null,
        },
      });

      expect(user.lastLoginAt).toBeNull();

      await request(app.getHttpServer())
        .post('/api/v1/auth/login')
        .send({
          email: 'user@test.com',
          password: 'Password123!',
        })
        .expect(200);

      const updatedUser = await prisma.user.findUnique({
        where: { id: user.id },
      });

      expect(updatedUser).not.toBeNull();
      if (updatedUser) {
        expect(updatedUser.lastLoginAt).not.toBeNull();
        expect(updatedUser.lastLoginAt).toBeInstanceOf(Date);
      }
    });
  });

  describe('/api/v1/auth/me (GET)', () => {
    it('should return current user profile with valid token', async () => {
      const argon2 = require('argon2');
      const tenant = await prisma.tenant.create({
        data: {
          name: 'Test Agency',
          code: 'TEST006',
          email: 'test@agency.com',
          isActive: true,
        },
      });

      await prisma.user.create({
        data: {
          tenantId: tenant.id,
          email: 'user@test.com',
          passwordHash: await argon2.hash('Password123!'),
          name: 'Test User',
          role: 'ADMIN',
          isActive: true,
        },
      });

      // Login to get token
      const loginResponse = await request(app.getHttpServer())
        .post('/api/v1/auth/login')
        .send({
          email: 'user@test.com',
          password: 'Password123!',
        });

      const token = loginResponse.body.accessToken;

      // Get profile
      const response = await request(app.getHttpServer())
        .get('/api/v1/auth/me')
        .set('Authorization', `Bearer ${token}`)
        .expect(200);

      expect(response.body).toMatchObject({
        email: 'user@test.com',
        name: 'Test User',
        role: 'ADMIN',
        tenantId: tenant.id,
      });
      expect(response.body).toHaveProperty('tenant');
      expect(response.body.tenant).toMatchObject({
        name: 'Test Agency',
        code: 'TEST006',
      });
    });

    it('should reject request without token', async () => {
      await request(app.getHttpServer())
        .get('/api/v1/auth/me')
        .expect(401);
    });

    it('should reject request with invalid token', async () => {
      await request(app.getHttpServer())
        .get('/api/v1/auth/me')
        .set('Authorization', 'Bearer invalid-token')
        .expect(401);
    });
  });

  describe('/api/v1/auth/refresh (POST)', () => {
    it('should refresh tokens with valid refresh token', async () => {
      const argon2 = require('argon2');
      const tenant = await prisma.tenant.create({
        data: {
          name: 'Test Agency',
          code: 'TEST007',
          email: 'test@agency.com',
          isActive: true,
        },
      });

      await prisma.user.create({
        data: {
          tenantId: tenant.id,
          email: 'user@test.com',
          passwordHash: await argon2.hash('Password123!'),
          name: 'Test User',
          role: 'ADMIN',
          isActive: true,
        },
      });

      // Login to get refresh token
      const loginResponse = await request(app.getHttpServer())
        .post('/api/v1/auth/login')
        .send({
          email: 'user@test.com',
          password: 'Password123!',
        });

      const refreshToken = loginResponse.body.refreshToken;

      // Refresh tokens
      const response = await request(app.getHttpServer())
        .post('/api/v1/auth/refresh')
        .send({ refreshToken })
        .expect(200);

      expect(response.body).toHaveProperty('accessToken');
      expect(response.body).toHaveProperty('refreshToken');
      // Note: Access token might be same if generated within same second (JWT iat claim)
      expect(response.body.accessToken).toBeTruthy();
    });

    it('should reject refresh with invalid token', async () => {
      await request(app.getHttpServer())
        .post('/api/v1/auth/refresh')
        .send({ refreshToken: 'invalid-token' })
        .expect(401);
    });
  });
});
