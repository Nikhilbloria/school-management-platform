const express = require('express');

function createAttendanceRouter(pool, authenticateTeacher) {
  const router = express.Router();

  // Mark attendance
  router.post('/', authenticateTeacher, async (req, res) => {
    const { classId, studentId, attendanceDate, session, status } = req.body;

    if (
      !Number.isInteger(classId) ||
      classId <= 0 ||
      !Number.isInteger(studentId) ||
      studentId <= 0
    ) {
      return res.status(400).json({
        error: 'Valid classId and studentId are required.',
      });
    }

    if (
      typeof attendanceDate !== 'string' ||
      !/^\d{4}-\d{2}-\d{2}$/.test(attendanceDate) ||
      new Date(`${attendanceDate}T00:00:00.000Z`).toISOString().slice(0, 10) !== attendanceDate
    ) {
      return res.status(400).json({
        error: 'A valid attendanceDate in YYYY-MM-DD format is required.',
      });
    }

    if (typeof session !== 'string' || session.trim().length === 0 || session.length > 50) {
      return res.status(400).json({
        error: 'A valid session is required (maximum 50 characters).',
      });
    }

    if (!['present', 'absent', 'late'].includes(status)) {
      return res.status(400).json({
        error: 'Status must be present, absent, or late.',
      });
    }

    let client;

    try {
      client = await pool.connect();
      await client.query('BEGIN');

      // Verify class exists
      const classResult = await client.query('SELECT id FROM classes WHERE id = $1', [classId]);

      if (classResult.rows.length === 0) {
        await client.query('ROLLBACK');
        return res.status(404).json({
          error: 'Class not found.',
        });
      }

      // Verify teacher is assigned to this class
      const assignmentResult = await client.query(
        `SELECT 1
         FROM teacher_classes
         WHERE teacher_id = $1 AND class_id = $2`,
        [req.teacher.id, classId],
      );

      if (assignmentResult.rows.length === 0) {
        await client.query('ROLLBACK');
        return res.status(403).json({
          error: 'You are not assigned to this class.',
        });
      }

      // Verify student belongs to this class
      const studentResult = await client.query(
        `SELECT 1
         FROM class_students
         WHERE class_id = $1 AND student_id = $2`,
        [classId, studentId],
      );

      if (studentResult.rows.length === 0) {
        await client.query('ROLLBACK');
        return res.status(400).json({
          error: 'Student does not belong to this class.',
        });
      }

      // Insert attendance record
      const attendanceResult = await client.query(
        `INSERT INTO attendance
          (class_id, student_id, teacher_id, attendance_date, session, status)
         VALUES ($1, $2, $3, $4, $5, $6)
         RETURNING id, class_id, student_id, teacher_id,
                   attendance_date, session, status, created_at`,
        [classId, studentId, req.teacher.id, attendanceDate, session.trim(), status],
      );

      const attendance = attendanceResult.rows[0];

      // Record the operation in the audit log
      await client.query(
        `INSERT INTO audit_logs
          (teacher_id, action, entity_type, entity_id, details)
         VALUES ($1, $2, $3, $4, $5)`,
        [
          req.teacher.id,
          'ATTENDANCE_MARKED',
          'attendance',
          attendance.id,
          JSON.stringify({
            classId,
            studentId,
            attendanceDate,
            session: session.trim(),
            status,
          }),
        ],
      );

      await client.query('COMMIT');

      return res.status(201).json({
        message: 'Attendance marked successfully.',
        attendance,
      });
    } catch (error) {
      if (client) {
        await client.query('ROLLBACK').catch(() => {});
      }

      if (error.code === '23505') {
        return res.status(409).json({
          error: 'Attendance already exists for this student, date, and session.',
        });
      }

      req.log?.error({ err: error }, 'Failed to mark attendance');

      return res.status(500).json({
        error: 'Failed to mark attendance.',
      });
    } finally {
      client?.release();
    }
  });

  // View attendance for an assigned class
  router.get('/:classId', authenticateTeacher, async (req, res) => {
    const classId = Number(req.params.classId);
    const attendanceDate = req.query.date;

    if (!Number.isInteger(classId) || classId <= 0) {
      return res.status(400).json({
        error: 'Invalid class ID.',
      });
    }

    if (
      attendanceDate !== undefined &&
      (typeof attendanceDate !== 'string' ||
        !/^\d{4}-\d{2}-\d{2}$/.test(attendanceDate) ||
        new Date(`${attendanceDate}T00:00:00.000Z`).toISOString().slice(0, 10) !== attendanceDate)
    ) {
      return res.status(400).json({
        error: 'Date must use YYYY-MM-DD format.',
      });
    }

    try {
      const assignmentResult = await pool.query(
        `SELECT 1
         FROM teacher_classes
         WHERE teacher_id = $1 AND class_id = $2`,
        [req.teacher.id, classId],
      );

      if (assignmentResult.rows.length === 0) {
        return res.status(403).json({
          error: 'You are not assigned to this class.',
        });
      }

      const result = await pool.query(
        `SELECT a.id, a.class_id, a.student_id,
                s.full_name AS student_name,
                a.teacher_id, a.attendance_date,
                a.session, a.status, a.created_at
         FROM attendance a
         JOIN students s ON s.id = a.student_id
         WHERE a.class_id = $1
           AND ($2::date IS NULL OR a.attendance_date = $2::date)
         ORDER BY a.attendance_date DESC, a.id`,
        [classId, attendanceDate || null],
      );

      return res.status(200).json({
        count: result.rows.length,
        attendance: result.rows,
      });
    } catch (error) {
      req.log?.error({ err: error }, 'Failed to fetch attendance');

      return res.status(500).json({
        error: 'Failed to fetch attendance.',
      });
    }
  });

  return router;
}

module.exports = createAttendanceRouter;
