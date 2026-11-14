 
# School Management Platform
### Cloud Deployment & CI/CD Pipeline

A containerized School Management Platform backend built using Node.js, PostgreSQL, Docker, Nginx, and GitHub Actions. The project demonstrates secure REST APIs, automated testing, containerization, CI/CD automation, HTTPS deployment, database backup and recovery, and rollback strategies.

---

## 1. Project Overview

The School Management Platform is a backend application designed to manage school-related operations such as students, classes, teachers, and attendance.

The application provides REST APIs for managing school data with teacher authentication and authorization. It uses PostgreSQL for persistent data storage and Docker for containerization.

A GitHub Actions CI/CD pipeline automates code validation, testing, security auditing, Docker image building, and publishing images to GitHub Container Registry (GHCR).

The project also implements HTTPS through Nginx, container health checks, database backup and restore, and application rollback procedures.

## 2. Objectives

- Develop REST APIs for school management operations.
- Implement teacher authentication and authorization.
- Prevent duplicate attendance records.
- Maintain attendance audit logs.
- Containerize the application using Docker.
- Configure PostgreSQL with persistent storage.
- Automate build, test, and deployment workflows.
- Publish Docker images to GitHub Container Registry.
- Secure application communication using HTTPS.
- Implement database backup and restoration.
- Demonstrate application recovery and rollback.

## 3. Technology Stack

| Technology | Purpose |
|---|---|
| Node.js | Backend runtime |
| Express.js | REST API framework |
| PostgreSQL | Relational database |
| Docker | Application containerization |
| Docker Compose | Multi-container orchestration |
| Nginx | Reverse proxy and HTTPS |
| GitHub Actions | CI/CD automation |
| GitHub Container Registry | Docker image storage |
| Git | Version control |
| npm | Dependency management |

## 4. System Architecture

The application follows a containerized architecture.

```text
                 Client
                   |
                   | HTTPS
                   v
             Nginx Reverse Proxy
                   |
                   v
            Node.js Application
                   |
          +--------+--------+
          |                 |
          v                 v
     Authentication     REST APIs
          |                 |
          +--------+--------+
                   |
                   v
              PostgreSQL
                   |
             Persistent Volume
```

### CI/CD Architecture

```text
        Developer
            |
            v
        GitHub Push
            |
            v
      GitHub Actions
            |
     +------+------+
     |             |
     v             v
   Linting      Formatting
     |             |
     +------+------+
            |
            v
      Automated Tests
            |
            v
       npm audit
            |
            v
      Docker Build
            |
            v
    GitHub Container
       Registry
          GHCR
```

## 5. Project Features

### Student Management
- REST APIs for student management.
- Student records stored in PostgreSQL.
- Class and student membership validation.

### Class Management
- Class management functionality.
- Teacher-class assignment validation.
- Authorization checks for assigned classes.

### Teacher Authentication
- API-key-based teacher authentication.
- Environment-variable-based API key configuration.
- Secure key comparison using timing-safe comparison.
- Unauthorized requests are rejected.

### Attendance Management
- Attendance marking through REST APIs.
- Support for present, absent, and late statuses.
- Duplicate attendance prevention.
- Attendance date and session tracking.
- Teacher authorization before attendance submission.

### Audit Logging
- Attendance operations are recorded in audit logs.
- Helps track attendance-related activities.

### Health Monitoring
The application provides health endpoints:

| Endpoint | Purpose |
|---|---|
| `/health/live` | Checks whether the application is running |
| `/health/ready` | Checks whether the application is ready to serve requests |

## 6. Project Structure

```text
school-management-platform/
│
├── src/
│   ├── middleware/
│   │   └── auth.middleware.js
│   │
│   ├── routes/
│   │   └── attendance.routes.js
│   │
│   └── ...
│
├── docs/
│   ├── evidence/
│   ├── architecture/
│   └── runbook/
│
├── backups/
│   └── school_backup.dump
│
├── .github/
│   └── workflows/
│       └── ...
│
├── Dockerfile
├── docker-compose.yml
├── package.json
├── package-lock.json
├── .env.example
├── .gitignore
└── README.md
```

*Note: The structure above highlights the main project components. Additional files and folders may exist in the repository.*

## 7. Prerequisites

Install the following tools before running the project:

- Node.js
- npm
- Git
- Docker Desktop
- Docker Compose

Verify installations:

```cmd
node --version
npm --version
git --version
docker --version
docker compose version
```

## 8. Installation and Local Setup

### Step 1: Clone the Repository

```cmd
git clone https://github.com/Nikhilbloria/school-management-platform.git
```

Navigate to the project directory:

```cmd
cd school-management-platform
```

### Step 2: Install Dependencies

```cmd
npm install
```

### Step 3: Configure Environment Variables

Create a local `.env` file using the project's environment example:

```cmd
copy .env.example .env
```

Open the file:

```cmd
notepad .env
```

Configure the required database settings and teacher API keys according to the application's environment configuration.

**Important:** Never commit `.env` or expose API keys, database passwords, or other credentials publicly.

### Step 4: Start Docker Services

Make sure Docker Desktop is running.

Execute:

```cmd
docker compose up -d --build
```

This starts the configured application, PostgreSQL, and Nginx services.

### Step 5: Verify Containers

```cmd
docker compose ps
```

Check application logs:

```cmd
docker compose logs app
```

Check all service logs:

```cmd
docker compose logs
```

### Step 6: Verify Health Endpoints

```cmd
curl -k https://localhost/health/live
```

```cmd
curl -k https://localhost/health/ready
```

The health endpoints should return successful responses when the application is running and ready.

## 9. API Authentication

Teacher authentication is implemented using API keys.

The application reads teacher API keys from environment variables:

```env
TEACHER_1_API_KEY=your_teacher_1_api_key
TEACHER_2_API_KEY=your_teacher_2_api_key
```

Include the API key in the request header:

```http
x-api-key: YOUR_TEACHER_API_KEY
```

The application validates the API key and identifies the corresponding teacher.

Requests without valid authentication are rejected.

## 10. Attendance API

### Endpoint

```http
POST /api/attendance
```

### Request Headers

```http
Content-Type: application/json
x-api-key: YOUR_TEACHER_API_KEY
```

### Request Body

```json
{
  "classId": 1,
  "studentId": 1,
  "attendanceDate": "2026-11-14",
  "session": "Morning",
  "status": "present"
}
```

### Supported Attendance Statuses

- `present`
- `absent`
- `late`

### Response Status Codes

| Status Code | Description |
|---|---|
| 201 | Attendance created successfully |
| 400 | Invalid request data |
| 401 | Missing or invalid API key |
| 403 | Teacher not authorized for the class |
| 409 | Duplicate attendance record |

The API validates teacher authorization and student-class membership before creating an attendance record.

## 11. Docker Configuration

The project uses Docker to package and run the application in isolated containers.

### Main Components

**Application Container**
- Runs the Node.js backend.
- Uses a non-root user.
- Provides REST APIs.
- Includes health checks.

**PostgreSQL Container**
- Stores application data.
- Uses persistent volume storage.
- Supports database backup and restoration.

**Nginx Container**
- Works as a reverse proxy.
- Handles HTTPS traffic.
- Redirects HTTP requests to HTTPS.

### Useful Docker Commands

Start services:

```cmd
docker compose up -d
```

Stop services:

```cmd
docker compose down
```

Rebuild services:

```cmd
docker compose up -d --build
```

View running containers:

```cmd
docker compose ps
```

View application logs:

```cmd
docker compose logs -f app
```

Restart application:

```cmd
docker compose restart app
```

## 12. CI/CD Pipeline

The project uses GitHub Actions to automate the CI/CD process.

The workflow performs the following operations:

1. Checks out the repository.
2. Sets up the Node.js environment.
3. Installs project dependencies.
4. Runs linting checks.
5. Runs formatting checks.
6. Executes automated tests.
7. Performs npm security auditing.
8. Builds the Docker image.
9. Publishes the image to GitHub Container Registry.

### Pipeline Benefits

- Automated code validation.
- Consistent application builds.
- Early detection of errors.
- Dependency security checks.
- Automated Docker image publishing.
- Versioned container images.

### GitHub Actions

The workflow configuration is stored inside:

```text
.github/workflows/
```

The pipeline can be monitored through the **Actions** tab of the GitHub repository.

## 13. Docker Image Registry

Docker images are published to GitHub Container Registry.

**Registry:**

```text
ghcr.io/nikhilbloria/school-management-platform
```

### Image Tags

```text
ghcr.io/nikhilbloria/school-management-platform:main
ghcr.io/nikhilbloria/school-management-platform:v1.0.0
```

### Pull Docker Image

```cmd
docker pull ghcr.io/nikhilbloria/school-management-platform:main
```

Version-specific image:

```cmd
docker pull ghcr.io/nikhilbloria/school-management-platform:v1.0.0
```

The project also records image digests for image verification and version tracking.

## 14. Security Implementation

The following security practices are implemented:

- Teacher API-key authentication.
- Teacher-class authorization.
- Environment-based secret configuration.
- Timing-safe API-key comparison.
- Non-root application container.
- HTTPS communication through Nginx.
- HTTP-to-HTTPS redirection.
- Restricted direct exposure of the application container.
- Automated npm dependency security audit.
- Docker container health checks.

## 15. Database Backup and Restore

PostgreSQL backup and restoration are included in the project recovery process.

### Create Database Backup

A PostgreSQL custom-format backup can be created using:

```cmd
docker compose exec -T db pg_dump -U postgres -d school_db -Fc > backups\school_backup.dump
```

Use the actual database service, username, and database name configured in your environment.

### Restore Database

A separate test database can be created for restoration testing:

```cmd
docker compose exec db createdb -U postgres school_restore_test
```

Restore the backup:

```cmd
docker compose exec -T db pg_restore -U postgres -d school_restore_test --clean --if-exists < backups\school_backup.dump
```

Verify restored tables and records:

```cmd
docker compose exec db psql -U postgres -d school_restore_test -c "\dt"
```

**Note:** Backup and restore commands must use the database credentials and service names configured in the project.

## 16. Rollback and Recovery

The project demonstrates rollback using previously published Docker image versions.

### Rollback Strategy

1. Identify the previous stable image tag.
2. Update the application image reference to the stable version.
3. Recreate the application container.
4. Verify application health.
5. Confirm that the application is responding correctly.

Example stable image:

```text
ghcr.io/nikhilbloria/school-management-platform:v1.0.0
```

Application recovery can also be tested by restarting the application container.

## 17. Testing and Validation

The following test cases were executed during project verification:

| Test Scenario | Expected Result | Status |
|---|---|---|
| Valid attendance request | 201 Created | Passed |
| Duplicate attendance request | 409 Conflict | Passed |
| Missing API key | 401 Unauthorized | Passed |
| Unauthorized class access | 403 Forbidden | Passed |
| Application liveness | Successful response | Passed |
| Database readiness | Successful response | Passed |
| npm security audit | 0 vulnerabilities | Passed |
| Database backup | Backup generated | Passed |
| Database restoration | Records restored | Passed |
| Application rollback | Previous version restored | Passed |

## 18. Evidence and Documentation

Project evidence is maintained in the `docs/evidence/` directory.

Important evidence includes:

- GitHub Actions successful workflow screenshot.
- Docker container status.
- Main Docker image digest.
- Version `v1.0.0` image digest.
- Database backup and restoration evidence.
- Architecture documentation.
- Deployment and recovery runbook.

## 19. GitHub Repository

**Repository URL:**

https://github.com/Nikhilbloria/school-management-platform

**Docker Registry:**

https://ghcr.io/nikhilbloria/school-management-platform

## 20. Future Improvements

Potential future enhancements include:

- Frontend dashboard for administrators and teachers.
- Role-based access control.
- Student and teacher profile management.
- Attendance analytics and reporting.
- Cloud-hosted production deployment.
- Automated scheduled database backups.
- Centralized logging and monitoring.
- Integration with a school notification system.

## 21. Conclusion

The School Management Platform demonstrates the practical implementation of backend development, database management, containerization, CI/CD automation, application security, and recovery strategies.

By integrating Node.js, PostgreSQL, Docker, Nginx, GitHub Actions, and GitHub Container Registry, the project establishes an automated and maintainable deployment workflow.

The implementation also demonstrates authentication, authorization, duplicate attendance prevention, health monitoring, HTTPS configuration, database backup and restore, and application rollback.

This project provides practical experience with modern DevOps practices and the deployment lifecycle of a containerized backend application.

---

**Project:** School Management Platform  
**Repository:** https://github.com/Nikhilbloria/school-management-platform  
**Container Registry:** ghcr.io/nikhilbloria/school-management-platform  
**Version:** v1.0.0  
**Status:** Development, CI/CD, containerization, and recovery verification completed.
