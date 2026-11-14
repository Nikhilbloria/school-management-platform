\# System Architecture – School Management Platform

\## 1. Overview

The School Management Platform follows a containerized three-tier architecture consisting of a reverse proxy, backend API and relational database.

\## 2. Architecture Diagram

```mermaid

flowchart TD

&#x20;   A\[Client / Browser] -->|HTTPS :443| B\[Nginx Reverse Proxy]

&#x20;   B -->|HTTP :3000 Internal Network| C\[Node.js Express API]

&#x20;   C --> D\[(PostgreSQL Database)]

&#x20;   C --> E\[Audit Logs]

&#x20;   F\[GitHub Repository] --> G\[GitHub Actions CI/CD]

&#x20;   G --> H\[GitHub Container Registry]

&#x20;   H --> C

```

\## 3. Components

\### Nginx

\- Acts as the reverse proxy.

\- Handles incoming HTTP and HTTPS traffic.

\- Redirects HTTP requests to HTTPS.

\- Forwards requests to the backend API.

\### Node.js and Express API

\- Provides REST API endpoints.

\- Handles teacher authentication.

\- Enforces teacher-class authorization.

\- Validates attendance requests.

\- Prevents duplicate attendance records.

\- Generates audit logs.

\### PostgreSQL

\- Stores teachers, students and classes.

\- Maintains teacher-class assignments.

\- Stores attendance records.

\- Maintains audit logs.

\- Uses persistent Docker volumes.

\### GitHub Actions

\- Runs code quality checks.

\- Executes automated tests.

\- Builds Docker images.

\- Publishes versioned images to GHCR.

\## 4. Security Architecture

\- API keys authenticate teachers.

\- Teachers can access only assigned classes.

\- Database is not directly exposed through the application API.

\- Backend API is accessible through the internal Docker network.

\- Nginx provides HTTPS termination.

\- Environment secrets are excluded from Git.

\## 5. Deployment Architecture

Services are deployed using Docker Compose:

\- `nginx`: Reverse proxy and HTTPS.

\- `app`: Node.js backend.

\- `db`: PostgreSQL database.

\## 6. Data Flow

1\. Client sends an HTTPS request.

2\. Nginx receives and forwards the request.

3\. Express processes authentication and authorization.

4\. API validates the requested operation.

5\. PostgreSQL stores or retrieves data.

6\. API returns the response through Nginx.
