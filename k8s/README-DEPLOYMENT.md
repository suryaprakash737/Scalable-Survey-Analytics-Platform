# Kubernetes Deployment Documentation

## Database Configuration

### Amazon RDS MySQL

This deployment uses **Amazon RDS** for the database instead of a local MySQL deployment in Kubernetes.

**RDS Instance Details:**
- **Instance Name:** `survey-db`
- **Endpoint:** `survey-db.cb1i1vmqprrz.us-east-1.rds.amazonaws.com`
- **Port:** `3306`
- **Database Name:** `survey_db`
- **Username:** `admin`
- **Password:** `SurveyDB2024!`
- **Security Group:** Configured to allow access from anywhere

**Connection String:**
```
mysql+pymysql://admin:SurveyDB2024!@survey-db.cb1i1vmqprrz.us-east-1.rds.amazonaws.com:3306/survey_db
```

### Important Notes

⚠️ **The file `k8s/mysql-deployment.yaml` is NOT used when deploying with RDS.**

When deploying this application with Amazon RDS:
- Do NOT deploy `k8s/mysql-deployment.yaml`
- The backend deployment (`k8s/backend-deployment.yaml`) is configured to connect directly to the RDS instance
- The DATABASE_URL environment variable in the backend deployment points to the RDS endpoint

### Deployment Steps

1. Deploy the backend service:
   ```bash
   kubectl apply -f k8s/backend-deployment.yaml
   ```

2. Deploy the frontend service:
   ```bash
   kubectl apply -f k8s/frontend-deployment.yaml
   ```

3. **DO NOT** deploy the MySQL deployment:
   ```bash
   # Skip this file when using RDS:
   # kubectl apply -f k8s/mysql-deployment.yaml
   ```

### Verifying RDS Connection

After deploying the backend, verify it can connect to RDS by checking the backend logs:
```bash
kubectl logs -l app=backend
```

You should see successful database connection messages without any connection errors.

