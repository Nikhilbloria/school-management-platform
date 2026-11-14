const { test } = require('node:test');
const assert = require('node:assert/strict');
const request = require('supertest');

process.env.TEACHER_1_API_KEY = 'test-teacher-1-key';
process.env.TEACHER_2_API_KEY = 'test-teacher-2-key';

const createApp = require('../src/app');

function createMockPool() {
  const pool = {
    query: async (sql, params) => {
      if (sql.includes('FROM teachers')) {
        const email = params[0];

        return {
          rows: [
            {
              id: email === 'teacher1@example.com' ? 1 : 2,
              email,
            },
          ],
        };
      }

      throw new Error(`Unexpected pool query: ${sql}`);
    },

    connect: async () => {
      const client = {
        query: async (sql, params = []) => {
          if (['BEGIN', 'COMMIT', 'ROLLBACK'].includes(sql)) {
            return { rows: [] };
          }

          if (sql.includes('SELECT id FROM classes')) {
            return { rows: [{ id: 1 }] };
          }

          if (sql.includes('FROM teacher_classes')) {
            const [teacherId, classId] = params;

            return {
              rows: teacherId === 1 && classId === 1 ? [{ '?column?': 1 }] : [],
            };
          }

          if (sql.includes('FROM class_students')) {
            const [classId, studentId] = params;

            return {
              rows: classId === 1 && studentId === 1 ? [{ '?column?': 1 }] : [],
            };
          }

          if (sql.includes('INSERT INTO attendance')) {
            return {
              rows: [
                {
                  id: 1,
                  class_id: params[0],
                  student_id: params[1],
                  teacher_id: params[2],
                  attendance_date: params[3],
                  session: params[4],
                  status: params[5],
                },
              ],
            };
          }

          if (sql.includes('INSERT INTO audit_logs')) {
            return { rows: [] };
          }

          throw new Error(`Unexpected client query: ${sql}`);
        },

        release: () => {},
      };

      return client;
    },
  };

  return pool;
}

function createTestApp() {
  return createApp(createMockPool());
}

const attendancePayload = {
  classId: 1,
  studentId: 1,
  attendanceDate: '2026-11-14',
  session: 'morning',
  status: 'present',
};

test('Teacher can successfully mark attendance', async () => {
  const app = createTestApp();

  const response = await request(app)
    .post('/api/attendance')
    .set('x-api-key', 'test-teacher-1-key')
    .send(attendancePayload);

  assert.equal(response.status, 201);
  assert.equal(response.body.message, 'Attendance marked successfully.');
  assert.equal(response.body.attendance.student_id, 1);
});

test('Attendance request without API key is rejected', async () => {
  const app = createTestApp();

  const response = await request(app).post('/api/attendance').send(attendancePayload);

  assert.equal(response.status, 401);
});

test('Unassigned teacher cannot mark attendance', async () => {
  const app = createTestApp();

  const response = await request(app)
    .post('/api/attendance')
    .set('x-api-key', 'test-teacher-2-key')
    .send(attendancePayload);

  assert.equal(response.status, 403);
});

test('Attendance cannot be marked for a student outside the class', async () => {
  const app = createTestApp();

  const response = await request(app)
    .post('/api/attendance')
    .set('x-api-key', 'test-teacher-1-key')
    .send({
      ...attendancePayload,
      studentId: 999,
    });

  assert.equal(response.status, 400);
  assert.equal(response.body.error, 'Student does not belong to this class.');
});

test('Invalid attendance status is rejected', async () => {
  const app = createTestApp();

  const response = await request(app)
    .post('/api/attendance')
    .set('x-api-key', 'test-teacher-1-key')
    .send({
      ...attendancePayload,
      status: 'unknown',
    });

  assert.equal(response.status, 400);
  assert.equal(response.body.error, 'Status must be present, absent, or late.');
});
