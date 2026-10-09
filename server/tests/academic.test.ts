import { describe, it, expect, beforeAll } from 'vitest';
import request from 'supertest';
import app from '../src/index';

describe('Academic Management & Admin Workflow API Endpoints', () => {
  let adminToken = '';
  let programId = '';
  let semesterId = '';
  let subjectId = '';
  let affiliationId = '';

  beforeAll(async () => {
    // Authenticate as Super Admin
    const res = await request(app)
      .post('/api/auth/login')
      .send({
        email: 'admin@kit.edu.pk',
        password: 'AdminKit@2025!',
      });

    expect(res.status).toBe(200);
    adminToken = res.body.token;
  });

  it('should allow admin to create an academic program', async () => {
    const res = await request(app)
      .post('/api/academic/programs')
      .set('Authorization', `Bearer ${adminToken}`)
      .send({
        name: `BS Computer Science ${Date.now()}`,
        code: `BSCS${Math.floor(Math.random() * 900 + 100)}`,
        description: 'Undergraduate computing program',
      });

    expect(res.status).toBe(201);
    expect(res.body.id).toBeDefined();
    programId = res.body.id;
  });

  it('should allow admin to create a semester', async () => {
    const semNum = Math.floor(Math.random() * 800 + 100);
    const res = await request(app)
      .post('/api/academic/semesters')
      .set('Authorization', `Bearer ${adminToken}`)
      .send({
        name: `Semester ${semNum}`,
        semesterNumber: semNum,
      });

    expect(res.status).toBe(201);
    expect(res.body.id).toBeDefined();
    semesterId = res.body.id;
  });

  it('should allow admin to create university affiliation', async () => {
    const code = `U${Math.floor(Math.random() * 900 + 100)}`;
    const res = await request(app)
      .post('/api/academic/affiliations')
      .set('Authorization', `Bearer ${adminToken}`)
      .send({
        name: `Punjab University Affiliation ${code}`,
        shortCode: code,
        description: 'Affiliated examination board',
      });

    expect(res.status).toBe(201);
    expect(res.body.id).toBeDefined();
    affiliationId = res.body.id;
  });

  it('should allow admin to create a subject under program and semester', async () => {
    const code = `CS-${Math.floor(Math.random() * 900 + 100)}`;
    const res = await request(app)
      .post('/api/academic/subjects')
      .set('Authorization', `Bearer ${adminToken}`)
      .send({
        name: 'Database Systems',
        code,
        academicProgramId: programId,
        semesterId,
        description: 'Relational database concepts and SQL',
      });

    expect(res.status).toBe(201);
    expect(res.body.id).toBeDefined();
    subjectId = res.body.id;
  });

  it('should return complete academic hierarchy', async () => {
    const res = await request(app).get('/api/academic/hierarchy');
    expect(res.status).toBe(200);
    expect(res.body.programs).toBeDefined();
    expect(res.body.semesters).toBeDefined();
    expect(res.body.affiliations).toBeDefined();
  });
});
