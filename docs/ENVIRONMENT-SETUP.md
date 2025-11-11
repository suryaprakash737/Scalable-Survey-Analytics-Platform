# Environment Variables Configuration

This document lists all environment variables used in the project and how to configure them.

## Backend Environment Variables

### Development (Local)

Create a `.env` file in the `backend/` directory (optional, can also use export commands):

```env
DATABASE_URL=mysql+pymysql://root:password@localhost:3306/survey_db
```

**Note:** The backend uses `os.getenv()` to read environment variables. You can set them using:

**Windows (PowerShell):**
```powershell
$env:DATABASE_URL="mysql+pymysql://root:password@localhost:3306/survey_db"
```

**Windows (CMD):**
```cmd
set DATABASE_URL=mysql+pymysql://root:password@localhost:3306/survey_db
```

**Linux/Mac:**
```bash
export DATABASE_URL="mysql+pymysql://root:password@localhost:3306/survey_db"
```

### Production (Kubernetes)

Environment variables are set in `k8s/backend-deployment.yaml`:

| Variable | Description | Default Value | Required |
|----------|-------------|---------------|----------|
| DATABASE_URL | MySQL connection string | `mysql+pymysql://root:password@mysql-service:3306/survey_db` | Yes |

**Current Configuration:**
```yaml
env:
  - name: DATABASE_URL
    value: "mysql+pymysql://root:password@mysql-service:3306/survey_db"
```

**For Amazon RDS:**
```yaml
env:
  - name: DATABASE_URL
    value: "mysql+pymysql://admin:YOUR_PASSWORD@YOUR_RDS_ENDPOINT:3306/survey_db"
```

**Connection String Format:**
```
mysql+pymysql://[username]:[password]@[host]:[port]/[database_name]
```

### CORS Configuration

The backend CORS is configured in code (`backend/app/main.py`) rather than environment variables. Current configuration allows:
- `http://localhost:3000` (local development)
- `http://localhost:80` (local frontend on port 80)
- `http://frontend-service` (Kubernetes service)
- `*` (all origins in development)

## Frontend Environment Variables

### Development (Local)

Create a `.env` file in the `frontend/` directory:

```env
REACT_APP_API_URL=http://localhost:8000
```

**Important:** 
- React requires the `REACT_APP_` prefix for environment variables
- The `.env` file must be in the `frontend/` directory
- Restart the development server after changing `.env` file

**Example:**
```env
# For local development
REACT_APP_API_URL=http://localhost:8000

# For testing against remote backend
# REACT_APP_API_URL=http://your-backend-url:8000
```

### Production (Kubernetes)

The frontend uses nginx reverse proxy, configured in `frontend/nginx.conf`:

- API requests to `/api/*` are automatically proxied to `http://backend-service:8000`
- No environment variables needed in production
- The React app is built at build time, so environment variables are baked into the static files

**Note:** If you need to configure the API URL at runtime in Kubernetes, you would need to:
1. Build the frontend with a placeholder
2. Use an init container or entrypoint script to replace the placeholder
3. Or use a configmap to inject the API URL

For this project, the nginx proxy approach is used, so no environment variables are required.

## MySQL Environment Variables (if using Kubernetes MySQL)

Configured in `k8s/mysql-deployment.yaml`:

| Variable | Description | Default Value | Required |
|----------|-------------|---------------|----------|
| MYSQL_ROOT_PASSWORD | Root user password | `password` | Yes |
| MYSQL_DATABASE | Initial database name | `survey_db` | Yes |
| MYSQL_USER | Additional MySQL user | `survey_user` | No |
| MYSQL_PASSWORD | Password for additional user | `survey_password` | No |

**Current Configuration:**
```yaml
env:
  - name: MYSQL_ROOT_PASSWORD
    value: "password"
  - name: MYSQL_DATABASE
    value: "survey_db"
  - name: MYSQL_USER
    value: "survey_user"
  - name: MYSQL_PASSWORD
    value: "survey_password"
```

**Security Note:** 
- ⚠️ **Change default passwords in production!**
- Never commit passwords to version control
- Use Kubernetes Secrets for sensitive data (see below)

## Jenkins Environment Variables

Set in Jenkins pipeline (`Jenkinsfile`) or Jenkins environment:

| Variable | Description | Example | Required |
|----------|-------------|---------|----------|
| DOCKER_REGISTRY | Docker registry URL | `docker.io/username` | No |
| BACKEND_IMAGE | Backend Docker image name | `student-survey-backend` | No |
| FRONTEND_IMAGE | Frontend Docker image name | `student-survey-frontend` | No |
| KUBECONFIG | Path to kubeconfig file | `/var/jenkins_home/.kube/config` | No |

**Current Configuration in Jenkinsfile:**
```groovy
environment {
    DOCKER_REGISTRY = 'your-docker-registry'  // Optional
    BACKEND_IMAGE = 'student-survey-backend'
    FRONTEND_IMAGE = 'student-survey-frontend'
    // KUBECONFIG = credentials('kubeconfig')  // Optional
}
```

**Note:** These are set in the Jenkinsfile itself. You can override them in Jenkins UI under pipeline configuration.

## How to Update Environment Variables

### Local Development

#### Backend:

1. **Option 1: Edit `.env` file** (create if it doesn't exist)
   ```bash
   # Create .env file in backend/ directory
   echo "DATABASE_URL=mysql+pymysql://root:password@localhost:3306/survey_db" > backend/.env
   ```

2. **Option 2: Use export/command line**
   ```bash
   # Windows PowerShell
   $env:DATABASE_URL="mysql+pymysql://root:password@localhost:3306/survey_db"
   
   # Linux/Mac
   export DATABASE_URL="mysql+pymysql://root:password@localhost:3306/survey_db"
   ```

3. **Restart the application:**
   ```bash
   uvicorn app.main:app --reload
   ```

#### Frontend:

1. **Edit `.env` file** in `frontend/` directory:
   ```env
   REACT_APP_API_URL=http://localhost:8000
   ```

2. **Restart the development server:**
   ```bash
   npm start
   ```

**Important:** React requires restarting the dev server after changing `.env` files.

### Kubernetes

#### Update Environment Variables:

1. **Edit the deployment YAML file:**
   ```bash
   # Edit backend deployment
   nano k8s/backend-deployment.yaml
   # or
   code k8s/backend-deployment.yaml
   ```

2. **Update the environment variable:**
   ```yaml
   env:
     - name: DATABASE_URL
       value: "mysql+pymysql://newuser:newpassword@newhost:3306/survey_db"
   ```

3. **Apply changes:**
   ```bash
   kubectl apply -f k8s/backend-deployment.yaml
   ```

4. **Restart pods to pick up changes:**
   ```bash
   kubectl rollout restart deployment/backend-deployment
   ```

5. **Verify pods are running:**
   ```bash
   kubectl get pods -l app=backend
   ```

### Using Kubernetes Secrets (Recommended for Production)

For production environments, use Kubernetes Secrets instead of plain text in YAML files.

#### Create Secrets:

```bash
# Create secret for database credentials
kubectl create secret generic db-credentials \
  --from-literal=username=admin \
  --from-literal=password=YOUR_SECURE_PASSWORD \
  --from-literal=host=your-rds-endpoint.rds.amazonaws.com \
  --from-literal=database=survey_db
```

#### Reference Secrets in Deployment:

Update `k8s/backend-deployment.yaml`:

```yaml
env:
  - name: DB_USERNAME
    valueFrom:
      secretKeyRef:
        name: db-credentials
        key: username
  - name: DB_PASSWORD
    valueFrom:
      secretKeyRef:
        name: db-credentials
        key: password
  - name: DB_HOST
    valueFrom:
      secretKeyRef:
        name: db-credentials
        key: host
  - name: DB_NAME
    valueFrom:
      secretKeyRef:
        name: db-credentials
        key: database
  - name: DATABASE_URL
    value: "mysql+pymysql://$(DB_USERNAME):$(DB_PASSWORD)@$(DB_HOST):3306/$(DB_NAME)"
```

**Note:** The `DATABASE_URL` using variable substitution may not work directly. You may need to modify the backend code to construct the URL from individual environment variables, or use an init container to build the connection string.

#### Alternative: Use Secrets with Base64 Encoding

```bash
# Create secret from file
kubectl create secret generic db-credentials \
  --from-file=./db-credentials.env
```

Where `db-credentials.env` contains:
```
username=admin
password=secure_password
host=rds-endpoint.rds.amazonaws.com
database=survey_db
```

## Environment Variable Reference Summary

### Development

| Component | Variable | Location | Example |
|-----------|----------|----------|---------|
| Backend | `DATABASE_URL` | `backend/.env` or export | `mysql+pymysql://root:password@localhost:3306/survey_db` |
| Frontend | `REACT_APP_API_URL` | `frontend/.env` | `http://localhost:8000` |

### Production (Kubernetes)

| Component | Variable | Location | Example |
|-----------|----------|----------|---------|
| Backend | `DATABASE_URL` | `k8s/backend-deployment.yaml` | `mysql+pymysql://root:password@mysql-service:3306/survey_db` |
| MySQL | `MYSQL_ROOT_PASSWORD` | `k8s/mysql-deployment.yaml` | `password` |
| MySQL | `MYSQL_DATABASE` | `k8s/mysql-deployment.yaml` | `survey_db` |
| MySQL | `MYSQL_USER` | `k8s/mysql-deployment.yaml` | `survey_user` |
| MySQL | `MYSQL_PASSWORD` | `k8s/mysql-deployment.yaml` | `survey_password` |

### CI/CD (Jenkins)

| Variable | Location | Example |
|----------|----------|---------|
| `DOCKER_REGISTRY` | `Jenkinsfile` | `docker.io/username` |
| `BACKEND_IMAGE` | `Jenkinsfile` | `student-survey-backend` |
| `FRONTEND_IMAGE` | `Jenkinsfile` | `student-survey-frontend` |

## Security Best Practices

1. **Never commit `.env` files to version control**
   - Add `.env` to `.gitignore`
   - Use `.env.example` as a template

2. **Use strong passwords in production**
   - Generate secure random passwords
   - Use different passwords for each environment

3. **Use Kubernetes Secrets for sensitive data**
   - Don't store passwords in plain text in YAML files
   - Use secrets and reference them in deployments

4. **Rotate credentials regularly**
   - Change database passwords periodically
   - Update secrets and restart deployments

5. **Limit access to secrets**
   - Use RBAC to control who can access secrets
   - Use separate secrets for different environments

## Troubleshooting

### Backend can't connect to database

**Check environment variable:**
```bash
# In pod
kubectl exec -it <backend-pod-name> -- env | grep DATABASE_URL
```

**Verify connection string format:**
- Check username, password, host, port, and database name
- Ensure special characters in password are URL-encoded

### Frontend can't reach backend

**Check API URL:**
```bash
# In browser console
console.log(process.env.REACT_APP_API_URL);
```

**Verify nginx proxy configuration:**
- Check `frontend/nginx.conf` for proxy settings
- Verify backend service is accessible from frontend pod

### Environment variables not updating

**For Kubernetes:**
- Ensure you ran `kubectl apply` after editing YAML
- Restart pods: `kubectl rollout restart deployment/<name>`
- Check pod environment: `kubectl describe pod <pod-name>`

**For Local Development:**
- Restart the application after changing `.env` files
- For React, restart the dev server (environment variables are baked in at build time)

---

**Last Updated:** 2024  
**Maintained by:** SWE 645 Assignment 3 Team

