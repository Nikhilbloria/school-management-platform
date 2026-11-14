const express = require('express');
const helmet = require('helmet');
const cors = require('cors');
const pinoHttp = require('pino-http');

const pool = require('./config/database');
const createHealthRouter = require('./routes/health.routes');
const createClassesRouter = require('./routes/classes.routes');
const createAttendanceRouter = require('./routes/attendance.routes');
const createAuthenticateTeacher = require('./middleware/auth.middleware');

function createApp(database = pool) {
  const app = express();

  app.use(helmet());
  app.use(cors());
  app.use(express.json({ limit: '1mb' }));
  app.use(
    pinoHttp({
      redact: ['req.headers.x-api-key', 'req.headers.authorization'],
    }),
  );

  app.get('/', (req, res) => {
    res.json({
      message: 'School Management Platform API',
      version: '1.0.0',
    });
  });

  app.use('/health', createHealthRouter(database));

  const authenticateTeacher = createAuthenticateTeacher(database);

  app.use('/api/classes', createClassesRouter(database, authenticateTeacher));

  app.use('/api/attendance', createAttendanceRouter(database, authenticateTeacher));

  app.use((req, res) => {
    res.status(404).json({
      error: 'Route not found',
    });
  });

  return app;
}

module.exports = createApp;
