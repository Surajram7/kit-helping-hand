import { describe, it, expect, beforeAll } from 'vitest';
import request from 'supertest';
import app from '../src/index';

describe('Authentication & RBAC API Endpoints', () => {
  const testStudent = {
    fullName: 'Test Student One',
    email: `teststudent_${Date.now()}@kit.edu.pk`,
    password: 'Password123!',
    studentId: 'KIT-2024-001',
  };

  let studentToken = '';

  it('should successfully register a student account', async () => {
    const res = await request(app)
      .post('/api/auth/register')
      .send(testStudent);

    expect(res.status).toBe(201);
    expect(res.body.token).toBeDefined();
    expect(res.body.user.role).toBe('STUDENT');
    expect(res.body.user.email).toBe(testStudent.email.toLowerCase());
  });

  it('should reject registration with duplicate email', async () => {
    const res = await request(app)
      .post('/api/auth/register')
      .send(testStudent);

    expect(res.status).toBe(409);
    expect(res.body.error).toContain('already exists');
  });

  it('should authenticate registered student and return JWT token', async () => {
    const res = await request(app)
      .post('/api/auth/login')
      .send({
        email: testStudent.email,
        password: testStudent.password,
      });

    expect(res.status).toBe(200);
    expect(res.body.token).toBeDefined();
    expect(res.body.user.role).toBe('STUDENT');
    studentToken = res.body.token;
  });

  it('should reject login with wrong password', async () => {
    const res = await request(app)
      .post('/api/auth/login')
      .send({
        email: testStudent.email,
        password: 'WrongPassword!',
      });

    expect(res.status).toBe(401);
  });

  it('should retrieve student profile via /api/auth/me', async () => {
    const res = await request(app)
      .get('/api/auth/me')
      .set('Authorization', `Bearer ${studentToken}`);

    expect(res.status).toBe(200);
    expect(res.body.user.email).toBe(testStudent.email.toLowerCase());
  });

  it('should prevent student from accessing admin endpoints', async () => {
    const res = await request(app)
      .get('/api/admin/stats')
      .set('Authorization', `Bearer ${studentToken}`);

    expect(res.status).toBe(403);
  });
});
