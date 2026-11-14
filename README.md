\# School Management Platform

A containerized School Management Platform built using Node.js, Express, PostgreSQL, Docker, Nginx and GitHub Actions.

\## Features

\- Student and class management APIs

\- Teacher API-key authentication

\- Teacher-class assignment authorization

\- Attendance creation and retrieval

\- Duplicate attendance prevention

\- Student-class membership validation

\- Audit logging

\- Health and readiness endpoints

\- PostgreSQL persistent storage

\- Docker Compose deployment

\- Nginx reverse proxy with HTTPS

\- Automated CI/CD using GitHub Actions

\- Versioned Docker images published to GHCR

\- Database backup and restore

\## Technology Stack

| Component | Technology |

|---|---|

| Backend | Node.js, Express |

| Database | PostgreSQL 16 |

| Containers | Docker, Docker Compose |

| Reverse Proxy | Nginx |

| CI/CD | GitHub Actions |

| Registry | GitHub Container Registry |

| Testing | Node.js Test Runner, Supertest |

| Code Quality | ESLint, Prettier |

\## Architecture

Client → Nginx HTTPS Reverse Proxy → Node.js API → PostgreSQL

Detailed architecture: `docs/architecture/architecture.md`

\## Prerequisites

\- Windows 11 or Linux

\- Docker Desktop / Docker Engine

\- Git

\- Node.js 24

\- GitHub account

\## Setup

Clone the repository:

```bash

git clone https://github.com/Nikhilbloria/school-management-platform.git

cd school-management-platform

```

Create environment configuration:

```powershell

Copy-Item .env.example .env

```

Configure database credentials and teacher API keys in `.env`.

Start services:

```bash

docker compose up -d

docker compose ps

```

\## API Endpoints

| Method | Endpoint | Description |

|---|---|---|

| GET | `/health/live` | Application health |

| GET | `/health/ready` | Database readiness |

| GET | `/api/classes` | List classes |

| GET | `/api/classes/:classId/students` | List class students |

| POST | `/api/attendance` | Record attendance |

| GET | `/api/attendance/:classId` | Retrieve attendance |

Teacher-protected endpoints require the `x-api-key` header.

\## HTTPS

Local application:

`https://localhost`

Test health:

```bash

curl -k https://localhost/health/live

curl -k https://localhost/health/ready

```

The local deployment uses a self-signed certificate. Production requires a trusted TLS certificate.

\## CI/CD

GitHub Actions performs:

1\. Dependency installation

2\. ESLint checks

3\. Prettier formatting checks

4\. Automated tests

5\. npm security audit

6\. Docker image build

7\. Image publishing to GHCR

Repository: https://github.com/Nikhilbloria/school-management-platform

Image: `ghcr.io/nikhilbloria/school-management-platform`

\## Backup and Restore

Database backup and restore procedures are documented in:

`docs/runbook/operations-runbook.md`

\## Evidence

Deployment evidence and image digests are stored in:

`docs/evidence/`

\## Security

\- `.env` excluded from Git

\- SSL private keys excluded from Git

\- Teacher API-key authentication

\- Internal API networking

\- HTTPS reverse proxy

\- Database and application health checks

\- Credential rotation

\## Production Considerations

This is a local demonstration deployment. Production deployment requires trusted TLS, production-grade secret management, infrastructure monitoring and tested disaster recovery.

\## Author

Nikhil Bloria
