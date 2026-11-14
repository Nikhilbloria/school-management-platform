const crypto = require('node:crypto');
const { Buffer } = require('node:buffer');

function createAuthenticateTeacher(pool) {
  return async function authenticateTeacher(req, res, next) {
    const apiKey = req.headers['x-api-key'];

    if (!apiKey || typeof apiKey !== 'string') {
      return res.status(401).json({
        error: 'Authentication required. Provide an API key.',
      });
    }

    const teachers = [
      {
        email: 'teacher1@example.com',
        key: process.env.TEACHER_1_API_KEY,
      },
      {
        email: 'teacher2@example.com',
        key: process.env.TEACHER_2_API_KEY,
      },
    ];

    const authenticatedTeacher = teachers.find((teacher) => {
      if (!teacher.key) {
        return false;
      }

      const supplied = Buffer.from(apiKey);
      const expected = Buffer.from(teacher.key);

      return supplied.length === expected.length && crypto.timingSafeEqual(supplied, expected);
    });

    if (!authenticatedTeacher) {
      return res.status(401).json({
        error: 'Invalid API key.',
      });
    }

    try {
      const result = await pool.query(
        `SELECT id, email
         FROM teachers
         WHERE email = $1`,
        [authenticatedTeacher.email],
      );

      if (result.rows.length === 0) {
        return res.status(401).json({
          error: 'Teacher account not found.',
        });
      }

      req.teacher = result.rows[0];

      return next();
    } catch (error) {
      req.log?.error({ err: error }, 'Teacher authentication failed');

      return res.status(500).json({
        error: 'Authentication service unavailable.',
      });
    }
  };
}

module.exports = createAuthenticateTeacher;
