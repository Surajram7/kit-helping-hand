import { describe, it, expect, beforeAll } from 'vitest';
import request from 'supertest';
import path from 'path';
import fs from 'fs';
import app from '../src/index';

describe('Resource Management & Student Request Workflow', () => {
  let adminToken = '';
  let studentToken = '';
  let studentId = '';
  let programId = '';
  let semesterId = '';
  let affiliationId = '';
  let subjectId = '';
  let resourceId = '';
  let pastPaperId = '';
  let requestId = '';
  let testFilePath = '';

  beforeAll(async () => {
    // 1. Admin login
    const adminRes = await request(app)
      .post('/api/auth/login')
      .send({ email: 'admin@kit.edu.pk', password: 'AdminKit@2025!' });
    adminToken = adminRes.body.token;

    // 2. Student register & login
    const studentEmail = `workflow_student_${Date.now()}@kit.edu.pk`;
    const studentRes = await request(app)
      .post('/api/auth/register')
      .send({
        fullName: 'Workflow Student',
        email: studentEmail,
        password: 'Password123!',
      });
    studentToken = studentRes.body.token;
    studentId = studentRes.body.user.id;

    // 3. Create dummy test file on disk
    testFilePath = path.join(__dirname, 'sample-test-note.pdf');
    fs.writeFileSync(testFilePath, '%PDF-1.4\n%Test PDF document for KIT Helping Hand platform\n%%EOF');

    // 4. Setup academic structure
    const pRes = await request(app)
      .post('/api/academic/programs')
      .set('Authorization', `Bearer ${adminToken}`)
      .send({ name: `Workflow Program ${Date.now()}`, code: `WP${Math.floor(Math.random() * 900 + 100)}` });
    programId = pRes.body.id;

    const sRes = await request(app)
      .post('/api/academic/semesters')
      .set('Authorization', `Bearer ${adminToken}`)
      .send({ name: `Workflow Sem ${Date.now()}`, semesterNumber: Math.floor(Math.random() * 8000 + 1000) });
    semesterId = sRes.body.id;

    const affRes = await request(app)
      .post('/api/academic/affiliations')
      .set('Authorization', `Bearer ${adminToken}`)
      .send({ name: `Workflow Affiliation ${Date.now()}`, shortCode: `WA${Math.floor(Math.random() * 900 + 100)}` });
    affiliationId = affRes.body.id;

    const subRes = await request(app)
      .post('/api/academic/subjects')
      .set('Authorization', `Bearer ${adminToken}`)
      .send({
        name: 'Operating Systems',
        code: `OS-${Math.floor(Math.random() * 900 + 100)}`,
        academicProgramId: programId,
        semesterId,
      });
    subjectId = subRes.body.id;
  });

  it('should upload a lecture note resource with metadata and attached PDF', async () => {
    const res = await request(app)
      .post('/api/resources')
      .set('Authorization', `Bearer ${adminToken}`)
      .field('title', 'Introduction to Process Scheduling')
      .field('description', 'Comprehensive lecture notes on CPU scheduling algorithms')
      .field('resourceType', 'LECTURE_NOTE')
      .field('academicProgramId', programId)
      .field('semesterId', semesterId)
      .field('subjectId', subjectId)
      .field('lectureNumber', 'Lecture 05')
      .field('topic', 'CPU Scheduling')
      .field('isPublished', 'true')
      .attach('file', testFilePath);

    expect(res.status).toBe(201);
    expect(res.body.id).toBeDefined();
    expect(res.body.files).toHaveLength(1);
    resourceId = res.body.id;
  });

  it('should upload a past paper marked as solved with examination metadata', async () => {
    const res = await request(app)
      .post('/api/resources')
      .set('Authorization', `Bearer ${adminToken}`)
      .field('title', 'Operating Systems Midterm 2024 Solved Paper')
      .field('resourceType', 'MIDTERM_PAPER')
      .field('academicProgramId', programId)
      .field('semesterId', semesterId)
      .field('subjectId', subjectId)
      .field('universityAffiliationId', affiliationId)
      .field('examType', 'MIDTERM')
      .field('examYear', '2024')
      .field('isSolved', 'true')
      .field('isPublished', 'true')
      .attach('file', testFilePath);

    expect(res.status).toBe(201);
    expect(res.body.isSolved).toBe(true);
    pastPaperId = res.body.id;
  });

  it('should allow student to retrieve published resources', async () => {
    const res = await request(app)
      .get(`/api/resources?subjectId=${subjectId}`)
      .set('Authorization', `Bearer ${studentToken}`);

    expect(res.status).toBe(200);
    expect(res.body.data.length).toBeGreaterThanOrEqual(1);
  });

  it('should allow student to query past papers and receive solved/unsolved counts', async () => {
    const res = await request(app)
      .get(`/api/past-papers?subjectId=${subjectId}&affiliationId=${affiliationId}`);

    expect(res.status).toBe(200);
    expect(res.body.data.length).toBeGreaterThanOrEqual(1);
    expect(res.body.counts.solved).toBeGreaterThanOrEqual(1);
  });

  it('should allow student to submit a resource request', async () => {
    const res = await request(app)
      .post('/api/requests')
      .set('Authorization', `Bearer ${studentToken}`)
      .send({
        title: 'Need Past Paper for Compiler Construction 2023',
        category: 'PAST_PAPER',
        description: 'Please provide the Punjab University solved paper for Compiler Construction.',
        semesterId,
        subjectId,
        universityAffiliationId: affiliationId,
      });

    expect(res.status).toBe(201);
    expect(res.body.status).toBe('SUBMITTED');
    requestId = res.body.id;
  });

  it('should allow admin to review and update request status with admin response', async () => {
    const res = await request(app)
      .put(`/api/requests/${requestId}/status`)
      .set('Authorization', `Bearer ${adminToken}`)
      .send({
        status: 'IN_PROGRESS',
        adminResponse: 'Paper is being digitized and will be published shortly.',
      });

    expect(res.status).toBe(200);
    expect(res.body.status).toBe('IN_PROGRESS');
  });

  it('should allow student to add a follow-up comment to their request', async () => {
    const res = await request(app)
      .post(`/api/requests/${requestId}/comments`)
      .set('Authorization', `Bearer ${studentToken}`)
      .send({ comment: 'Thank you for looking into this!' });

    expect(res.status).toBe(201);
    expect(res.body.comment).toBe('Thank you for looking into this!');
  });
});
