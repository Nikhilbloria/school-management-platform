\# Operations Runbook – School Management Platform



\## 1. Purpose



This runbook documents the operational procedures for deploying, monitoring, troubleshooting, backing up and recovering the School Management Platform.



\## 2. Start Application



Start all services:



```powershell

docker compose up -d

```



Check container status:



```powershell

docker compose ps

```



\## 3. Stop and Restart Services



Stop services without deleting persistent database storage:



```powershell

docker compose stop

```



Start services again:



```powershell

docker compose start

```



Restart the API:



```powershell

docker compose restart app

```



\## 4. Health Monitoring



Check application health:



```powershell

curl.exe -k https://localhost/health/live

```



Check database readiness:



```powershell

curl.exe -k https://localhost/health/ready

```



View service logs:



```powershell

docker compose logs --tail=100

```



View API logs:



```powershell

docker compose logs --tail=100 app

```



\## 5. Database Backup



Create a PostgreSQL backup:



```powershell

docker exec school-management-db pg\_dump -U school\_admin -d school\_management -F c -f /tmp/school\_backup.dump

```



Copy backup to the host:



```powershell

docker cp school-management-db:/tmp/school\_backup.dump .\\backups\\school\_backup.dump

```



\## 6. Database Restore



Create a separate restore-test database:



```powershell

docker exec school-management-db psql -U school\_admin -d postgres -c "CREATE DATABASE school\_restore\_test;"

```



Copy backup into the container:



```powershell

docker cp .\\backups\\school\_backup.dump school-management-db:/tmp/school\_backup.dump

```



Restore the backup:



```powershell

docker exec school-management-db pg\_restore -U school\_admin -d school\_restore\_test --no-owner /tmp/school\_backup.dump

```



Verify restored tables and records:



```powershell

docker exec school-management-db psql -U school\_admin -d school\_restore\_test -c "SELECT COUNT(\*) FROM students;"

```



\## 7. Rollback



To deploy a previous image version:



1\. Open `docker-compose.yml`.

2\. Change the application image tag from `main` to `v1.0.0`.

3\. Pull the previous image:



```powershell

docker compose pull app

```



4\. Recreate the application:



```powershell

docker compose up -d --force-recreate app

```



5\. Verify application health:



```powershell

curl.exe -k https://localhost/health/live

curl.exe -k https://localhost/health/ready

```



To return to the latest main image, change the tag back to `main`, pull and recreate the app.



\## 8. Troubleshooting



\### Application is unhealthy



```powershell

docker compose ps

docker compose logs app

docker compose restart app

```



\### Database is unhealthy



```powershell

docker compose logs db

docker compose restart db

```



\### Nginx is unavailable



```powershell

docker compose logs nginx

docker compose restart nginx

```



\### Port conflict



Check port usage:



```powershell

netstat -ano | findstr :443

netstat -ano | findstr :80

```



\## 9. Security Operations



\- Keep `.env` out of Git.

\- Rotate API keys and database credentials if exposed.

\- Keep TLS private keys out of Git.

\- Use HTTPS for application access.

\- Restrict database access to trusted services.

\- Review application and database logs regularly.



\## 10. Recovery and Reliability



\- PostgreSQL data is stored in a persistent Docker volume.

\- Database backups are maintained in the `backups` directory.

\- Health checks monitor application and database availability.

\- Previous versioned Docker images are available for rollback.

\- Restore operations should be tested using a separate database before production recovery.



\## 11. Important Note



The local deployment uses a self-signed TLS certificate. Production deployments should use a trusted certificate and secure secret management.



