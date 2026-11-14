const express = require('express');

function createHealthRouter(pool) {
  const router = express.Router();

  router.get('/live', (req, res) => {
    res.status(200).json({
      status: 'ok',
      service: 'school-management-platform',
    });
  });

  router.get('/ready', async (req, res) => {
    try {
      await pool.query('SELECT 1');

      res.status(200).json({
        status: 'ok',
        database: 'connected',
      });
    } catch (error) {
      req.log?.error({ err: error }, 'Database readiness check failed');

      res.status(503).json({
        status: 'error',
        database: 'unavailable',
      });
    }
  });

  return router;
}

module.exports = createHealthRouter;
