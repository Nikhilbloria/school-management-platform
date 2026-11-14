const express = require('express');

function createClassesRouter(pool, authenticateTeacher) {
  const router = express.Router();

  // Get all classes
  router.get('/', async (req, res) => {
    try {
      const result = await pool.query(
        `SELECT id, class_name, section
         FROM classes
         ORDER BY id`,
      );

      return res.status(200).json({
        count: result.rows.length,
        classes: result.rows,
      });
    } catch (error) {
      req.log?.error({ err: error }, 'Failed to fetch classes');

      return res.status(500).json({
        error: 'Failed to fetch classes',
      });
    }
  });

  // Get students assigned to a class (teacher authentication required)
  router.get('/:classId/students', authenticateTeacher, async (req, res) => {
    const classId = Number(req.params.classId);

    if (!Number.isInteger(classId) || classId <= 0) {
      return res.status(400).json({
        error: 'Invalid class ID',
      });
    }

    try {
      // Check whether the class exists
      const classResult = await pool.query(
        `SELECT id, class_name, section
           FROM classes
           WHERE id = $1`,
        [classId],
      );

      if (classResult.rows.length === 0) {
        return res.status(404).json({
          error: 'Class not found',
        });
      }

      // Verify that the authenticated teacher is assigned to this class
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

      // Fetch students belonging to the assigned class
      const studentsResult = await pool.query(
        `SELECT s.id, s.full_name, s.email
           FROM students s
           JOIN class_students cs ON cs.student_id = s.id
           WHERE cs.class_id = $1
           ORDER BY s.id`,
        [classId],
      );

      return res.status(200).json({
        class: classResult.rows[0],
        count: studentsResult.rows.length,
        students: studentsResult.rows,
      });
    } catch (error) {
      req.log?.error({ err: error }, 'Failed to fetch students');

      return res.status(500).json({
        error: 'Failed to fetch students',
      });
    }
  });

  return router;
}

module.exports = createClassesRouter;
