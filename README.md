# Student Survey Application - SWE 645 Homework Assignment 3

**Full Stack Application Development, Containerization, and Kubernetes Deployment with CI/CD Pipeline**

## Team Members

- Suryaprakash Uppalapati (G01515657)
- Jaya Krishna Gobbila (G01512906)
- Karthik Reddy Sanvelly (G01503115)

## Project Overview

This application is a full-stack student survey system that allows prospective students to submit feedback about their campus visit. The application implements CRUD operations to manage survey data with the following features:

- **Frontend**: React.js application for user interface
- **Backend**: FastAPI REST API with SQLModel/SQLAlchemy
- **Database**: MySQL (can be configured to use Amazon RDS)
- **Containerization**: Docker
- **Orchestration**: Kubernetes
- **CI/CD**: Jenkins pipeline

## Application Features

### Survey Form Fields (All Required)
- First name
- Last name
- Street address
- City
- State
- ZIP code
- Telephone number
- Email
- Date of survey

### Survey Questions
1. **What did you like most about the campus?**
   - Options: Students, Location, Campus, Atmosphere, Dorm Rooms, Sports

2. **How did you become interested in the university?**
   - Options: Friends, Television, Internet, Other

3. **Likelihood of recommending this school to others**
   - Options: Very Likely, Likely, Unlikely

### CRUD Operations
- **Create**: Submit new survey
- **Read**: View all surveys and individual survey details
- **Update**: Edit existing surveys
- **Delete**: Remove surveys

## Kubernetes Deployment URL

[Your Application URL will go here after deployment]

Example: http://34.123.45.67:80 or http://your-loadbalancer-url

**Note:** This URL will be available after deploying to Kubernetes cluster.

## Tech Stack

### Frontend
- React.js 18.2.0
- React Scripts 5.0.1
- Nginx (for production serving)

### Backend
- FastAPI 0.104.1
- SQLModel 0.0.14
- Uvicorn 0.24.0
- PyMySQL 1.1.0

### Database
- MySQL 8.0

### Infrastructure
- Docker (containerization)
- Kubernetes (orchestration)
- Jenkins (CI/CD pipeline)

## Prerequisites

### Local Development
- Python 3.11+
- Node.js 18+
- MySQL 8.0+ (or access to Amazon RDS)
- Docker and Docker Compose (optional)
- Postman (for API testing) - https://www.postman.com/

### Kubernetes Deployment
- Kubernetes cluster (minikube, EKS, GKE, etc.)
- kubectl configured
- Docker for building images
- Jenkins (for CI/CD pipeline)

## Installation and Setup Instructions

### 1. Local Development Setup

#### Backend Setup

1. Navigate to the backend directory:
```bash
cd backend
```

2. Create a virtual environment:
```bash
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate
```

3. Install dependencies:
```bash
pip install -r requirements.txt
```

4. Set up environment variables:
```bash
export DATABASE_URL="mysql+pymysql://root:password@localhost:3306/survey_db"
```

5. Create the database:
```sql
CREATE DATABASE survey_db;
```

6. Run the application:
```bash
uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
```

The API will be available at `http://localhost:8000`
API documentation: `http://localhost:8000/docs`

#### Frontend Setup

1. Navigate to the frontend directory:
```bash
cd frontend
```

2. Install dependencies:
```bash
npm install
```

3. Set environment variable (create `.env` file):
```bash
REACT_APP_API_URL=http://localhost:8000
```

4. Run the development server:
```bash
npm start
```

The application will be available at `http://localhost:3000`

### 2. Docker Setup

#### Build Docker Images

**Backend:**
```bash
cd backend
docker build -t student-survey-backend:latest .
```

**Frontend:**
```bash
cd frontend
docker build -t student-survey-frontend:latest .
```

#### Run with Docker Compose (Optional)

Create a `docker-compose.yml` file:

```yaml
version: '3.8'
services:
  mysql:
    image: mysql:8.0
    environment:
      MYSQL_ROOT_PASSWORD: password
      MYSQL_DATABASE: survey_db
    ports:
      - "3306:3306"
    volumes:
      - mysql_data:/var/lib/mysql

  backend:
    build: ./backend
    ports:
      - "8000:8000"
    environment:
      DATABASE_URL: mysql+pymysql://root:password@mysql:3306/survey_db
    depends_on:
      - mysql

  frontend:
    build: ./frontend
    ports:
      - "80:80"
    environment:
      REACT_APP_API_URL: http://localhost:8000
    depends_on:
      - backend

volumes:
  mysql_data:
```

Run with:
```bash
docker-compose up -d
```

## Database Setup

You have two options for the database setup. Choose the one that best fits your needs:

### Option A: MySQL in Kubernetes (Current Default)

This option runs MySQL as a pod in your Kubernetes cluster.

**Pros:** Free, contained environment, no external dependencies  
**Cons:** Data is lost if pod is deleted (unless using persistent volumes)

**Setup:**

1. **Deploy MySQL:**
   ```bash
   kubectl apply -f k8s/mysql-deployment.yaml
   kubectl wait --for=condition=ready pod -l app=mysql --timeout=300s
   ```

2. **Verify MySQL is running:**
   ```bash
   kubectl get pods -l app=mysql
   kubectl logs -l app=mysql
   ```

3. **(Optional) Create database manually:**
   ```bash
   kubectl exec -it <mysql-pod-name> -- mysql -u root -p
   ```
   Enter password when prompted: `password`
   
   In MySQL prompt, run:
   ```sql
   CREATE DATABASE IF NOT EXISTS survey_db;
   EXIT;
   ```

4. **The backend will automatically create tables on startup.**

   **Note:** The MySQL deployment includes a PersistentVolumeClaim, so data will persist across pod restarts. However, if you delete the PVC, data will be lost.

### Option B: Amazon RDS MySQL (As per Assignment Instructions)

This option uses AWS-managed MySQL database.

**Pros:** Production-grade, persistent, managed by AWS  
**Cons:** Requires AWS account, may incur small charges

**Setup:**

1. **Create RDS Instance:**
   - Go to AWS Console → RDS → Create Database
   - Choose MySQL 8.0.x
   - **IMPORTANT:** Select "Dev/Test" template (not Production)
   - Instance size: db.t3.micro (Free tier eligible)
   - Settings:
     - DB instance identifier: `survey-db`
     - Master username: `admin`
     - Master password: [your-secure-password]
   - Connectivity:
     - Public access: Yes (for development)
     - VPC security group: Allow MySQL (port 3306) from your IP
   - Additional configuration:
     - Initial database name: `survey_db`
   - Click "Create Database" (takes ~5-10 minutes)

2. **Get RDS Endpoint:**
   - After creation, note the "Endpoint" URL (e.g., `survey-db.xxxxx.us-east-1.rds.amazonaws.com`)
   - Also note the port (default: 3306)

3. **Update Backend Configuration:**
   - Edit `k8s/backend-deployment.yaml`
   - Update the `DATABASE_URL` environment variable:
   ```yaml
   env:
     - name: DATABASE_URL
       value: "mysql+pymysql://admin:YOUR_PASSWORD@YOUR_RDS_ENDPOINT:3306/survey_db"
   ```
   Replace:
   - `YOUR_PASSWORD` with your RDS master password
   - `YOUR_RDS_ENDPOINT` with your RDS endpoint URL

4. **Security Group Configuration:**
   - In AWS Console → EC2 → Security Groups
   - Find the RDS security group (usually named something like `rds-launch-wizard-*`)
   - Add inbound rule:
     - Type: MySQL/Aurora
     - Port: 3306
     - Source: Your Kubernetes cluster IPs or `0.0.0.0/0` for development (not recommended for production)

5. **Deploy backend (skip MySQL deployment):**
   ```bash
   # Skip: kubectl apply -f k8s/mysql-deployment.yaml
   kubectl apply -f k8s/backend-deployment.yaml
   ```

**Current Configuration:** This project is set up for Option A by default. To switch to Option B, skip the `mysql-deployment.yaml` step and update the backend `DATABASE_URL` as shown above.

## Deployment

### Kubernetes Deployment

#### Prerequisites
- Kubernetes cluster running
- kubectl configured
- Docker images built and available

#### Deploy to Kubernetes

1. **Deploy MySQL:**
```bash
kubectl apply -f k8s/mysql-deployment.yaml
```

2. **Wait for MySQL to be ready:**
```bash
kubectl wait --for=condition=ready pod -l app=mysql --timeout=300s
```

3. **Deploy Backend:**
```bash
kubectl apply -f k8s/backend-deployment.yaml
```

4. **Deploy Frontend:**
```bash
kubectl apply -f k8s/frontend-deployment.yaml
```

5. **Check deployment status:**
```bash
kubectl get pods
kubectl get services
```

6. **Get frontend service URL:**
```bash
kubectl get service frontend-service
```

For LoadBalancer type, use the external IP. For other types, use port-forwarding:
```bash
kubectl port-forward service/frontend-service 8080:80
```

Then access at `http://localhost:8080`

### Using Amazon RDS

If you prefer to use Amazon RDS instead of MySQL in Kubernetes, please refer to the [Database Setup](#database-setup) section above for detailed instructions on Option B: Amazon RDS MySQL setup.

## Testing Instructions

This section provides detailed step-by-step instructions for testing the Student Survey application at different stages of development and deployment.

### Local Testing

#### Backend Testing

Follow these steps to test the backend API locally:

1. **Navigate to the backend directory:**
   ```bash
   cd backend
   ```

2. **Create a virtual environment (if not already created):**
   ```bash
   # Windows
   python -m venv venv
   venv\Scripts\activate
   
   # Linux/Mac
   python -m venv venv
   source venv/bin/activate
   ```

3. **Install dependencies:**
   ```bash
   pip install -r requirements.txt
   ```

4. **Set up the database:**
   - Ensure MySQL is running locally or use a remote MySQL instance
   - Create the database:
     ```sql
     CREATE DATABASE survey_db;
     ```

5. **Set environment variable for database connection:**
   ```bash
   # Windows (PowerShell)
   $env:DATABASE_URL="mysql+pymysql://root:password@localhost:3306/survey_db"
   
   # Windows (CMD)
   set DATABASE_URL=mysql+pymysql://root:password@localhost:3306/survey_db
   
   # Linux/Mac
   export DATABASE_URL="mysql+pymysql://root:password@localhost:3306/survey_db"
   ```
   **Note:** Replace `root`, `password`, and `localhost:3306` with your actual MySQL credentials and host.

6. **Run the FastAPI server:**
   ```bash
   uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
   ```

7. **Verify the backend is running:**
   - Open your browser and navigate to: `http://localhost:8000`
   - You should see: `{"message":"Student Survey API","version":"1.0.0"}`
   - Check health endpoint: `http://localhost:8000/health` should return `{"status":"healthy"}`
   - View API documentation: `http://localhost:8000/docs` (Swagger UI)

8. **Test the health endpoint using curl (optional):**
   ```bash
   curl http://localhost:8000/health
   ```
   Expected response: `{"status":"healthy"}`

#### Frontend Testing

Follow these steps to test the frontend React application locally:

1. **Navigate to the frontend directory:**
   ```bash
   cd frontend
   ```

2. **Install npm packages:**
   ```bash
   npm install
   ```
   This may take a few minutes the first time.

3. **Create a `.env` file in the frontend directory:**
   ```bash
   # Windows (PowerShell)
   echo "REACT_APP_API_URL=http://localhost:8000" > .env
   
   # Linux/Mac
   echo "REACT_APP_API_URL=http://localhost:8000" > .env
   ```
   
   Or manually create a file named `.env` with the content:
   ```
   REACT_APP_API_URL=http://localhost:8000
   ```

4. **Start the development server:**
   ```bash
   npm start
   ```
   The application should automatically open in your browser at `http://localhost:3000`

5. **Verify the frontend is working:**
   - The Student Survey Application should load
   - You should see navigation buttons: "View All Surveys" and "New Survey"
   - Click "New Survey" to test the form
   - Ensure the backend API is running (see Backend Testing above) for full functionality

6. **Test form submission:**
   - Fill out all required fields
   - Select multiple options for "What did you like most about the campus?" (checkboxes)
   - Submit the form
   - Verify the survey appears in the "View All Surveys" list

### Postman API Testing

Postman collection provides a comprehensive way to test all API endpoints. Follow these steps:

1. **Import the Postman Collection:**
   - Open Postman application
   - Click "Import" button (top left)
   - Select "File" tab
 - Navigate to `postman/Student-Survey-API.postman_collection.json`
   - Click "Import"
   - The collection "Student Survey API" should appear in your collections

2. **Verify Collection Variables:**
   - Click on the collection name "Student Survey API"
   - Go to "Variables" tab
   - Verify `base_url` is set to `http://localhost:8000`
   - Verify `survey_id` is set to `1` (will be auto-updated after creating a survey)
   - If using a different backend URL, update `base_url` accordingly

3. **Ensure Backend is Running:**
   - Make sure the backend API is running (see Local Testing - Backend Testing above)
   - Verify health endpoint: `http://localhost:8000/health`

4. **Test Endpoints in Order:**

   **a. Health Check:**
   - Select "Health Check" request
   - Click "Send"
   - Expected response (200 OK): `{"status":"healthy"}`

   **b. Root Endpoint:**
   - Select "Root Endpoint" request
   - Click "Send"
   - Expected response (200 OK): `{"message":"Student Survey API","version":"1.0.0"}`

   **c. CREATE Survey:**
   - Select "CREATE Survey" request
   - Review the request body (should have example data with `liked_most` as an array)
   - Click "Send"
   - Expected response (201 Created): JSON object with survey data including an `id` field
   - **Note:** The `survey_id` collection variable will be automatically updated with the new survey ID

   **d. GET All Surveys:**
   - Select "GET All Surveys" request
   - Click "Send"
   - Expected response (200 OK): Array of survey objects, should include the survey just created

   **e. GET Survey by ID:**
   - Select "GET Survey by ID" request
   - Verify it uses `{{survey_id}}` variable (should be auto-populated from CREATE)
   - Click "Send"
   - Expected response (200 OK): Single survey object matching the ID

   **f. UPDATE Survey:**
   - Select "UPDATE Survey" request
   - Modify the request body with updated values (e.g., change address, email, or `liked_most` array)
   - Click "Send"
   - Expected response (200 OK): Updated survey object with new values

   **g. DELETE Survey:**
   - Select "DELETE Survey" request
   - Verify it uses `{{survey_id}}` variable
   - Click "Send"
   - Expected response (204 No Content): Empty response body
   - Verify deletion by running "GET Survey by ID" again (should return 404)

5. **Test Error Cases:**
   - GET non-existent survey: Use `survey_id` of 99999 (should return 404)
   - CREATE with invalid data: Remove required fields (should return 422 validation error)
   - UPDATE non-existent survey: Use `survey_id` of 99999 (should return 404)

### Kubernetes Testing

After deploying to Kubernetes, follow these steps to verify and test the deployment:

1. **Check Pod Status:**
   ```bash
   kubectl get pods
   ```
   Expected output: All pods should show `Running` status
   ```
   NAME                                   READY   STATUS    RESTARTS   AGE
   backend-deployment-xxxxx-xxxxx         1/1     Running   0          2m
   frontend-deployment-xxxxx-xxxxx        1/1     Running   0          2m
   mysql-deployment-xxxxx-xxxxx           1/1     Running   0          3m
   ```

2. **Check Service Status:**
   ```bash
   kubectl get services
   ```
   Expected output: All services should be listed
   ```
   NAME                TYPE           CLUSTER-IP      EXTERNAL-IP   PORT(S)        AGE
   backend-service     ClusterIP      10.xx.xx.xx     <none>        8000/TCP       2m
   frontend-service    LoadBalancer   10.xx.xx.xx     <pending>     80:3xxxx/TCP   2m
   mysql-service       ClusterIP      10.xx.xx.xx     <none>        3306/TCP       3m
   ```

3. **View Pod Logs (if any issues):**
   ```bash
   # Backend logs
   kubectl logs -l app=backend
   
   # Frontend logs
   kubectl logs -l app=frontend
   
   # MySQL logs
   kubectl logs -l app=mysql
   
   # Or view logs for specific pod
   kubectl logs <pod-name>
   ```

4. **Test Backend API from within cluster:**
   ```bash
   # Port-forward to backend service
   kubectl port-forward service/backend-service 8000:8000
   ```
   Then in another terminal, test the health endpoint:
   ```bash
   curl http://localhost:8000/health
   ```
   Expected response: `{"status":"healthy"}`

5. **Access the Frontend Application:**
   
   **Option A: Using LoadBalancer (if external IP is assigned):**
   ```bash
   kubectl get service frontend-service
   ```
   Look for `EXTERNAL-IP` and access `http://<EXTERNAL-IP>`
   
   **Option B: Using Port-Forwarding (recommended for local testing):**
   ```bash
   kubectl port-forward service/frontend-service 8080:80
   ```
   Then open browser: `http://localhost:8080`

6. **Test CRUD Operations Through UI:**
   
   Once the frontend is accessible:
   
   - **Create Survey:**
     - Click "New Survey" button
     - Fill in all required fields
     - Select multiple checkboxes for "What did you like most about the campus?"
     - Select options for other dropdown fields
     - Click "Submit Survey"
     - Verify success message appears
   
   - **View All Surveys:**
     - Click "View All Surveys" button
     - Verify the newly created survey appears in the table
     - Check all fields are displayed correctly
   
   - **View Survey Details:**
     - Click "View" button on any survey
     - Verify all survey information is displayed
     - Check that `liked_most` shows as an array/list of selected items
   
   - **Update Survey:**
     - Click "Edit" button on a survey
     - Modify some fields (e.g., change address, update `liked_most` selections)
     - Click "Update Survey"
     - Verify changes are saved and reflected in the list
   
   - **Delete Survey:**
     - Click "Delete" button on a survey
     - Confirm deletion in the popup
     - Verify the survey is removed from the list

7. **Test Backend API Endpoints (via Port-Forward):**
   ```bash
   # Port-forward to backend
   kubectl port-forward service/backend-service 8000:8000
   ```
   
   Then use Postman or curl to test:
   ```bash
   # Health check
   curl http://localhost:8000/health
   
   # Get all surveys
   curl http://localhost:8000/api/surveys
   
   # Create survey (with proper JSON body)
   curl -X POST http://localhost:8000/api/surveys \
     -H "Content-Type: application/json" \
     -d '{"first_name":"Test","last_name":"User",...}'
   ```

8. **Verify Database Persistence:**
   ```bash
   # Connect to MySQL pod
   kubectl exec -it <mysql-pod-name> -- mysql -uroot -ppassword survey_db
   
   # In MySQL prompt, verify data:
   USE survey_db;
   SELECT * FROM surveys;
   ```
   This confirms data is being persisted correctly in the database.

9. **Monitor Pod Resources (optional):**
   ```bash
   kubectl top pods
   ```
   This shows CPU and memory usage for all pods.

10. **Describe Pods for Detailed Information (if issues):**
    ```bash
    kubectl describe pod <pod-name>
    ```
    This provides detailed information about pod events, conditions, and configuration.

## CI/CD Pipeline

### Jenkins Pipeline Setup

1. **Install Jenkins** with required plugins:
   - Docker Pipeline
   - Kubernetes
   - Git

2. **Configure Jenkins Credentials:**
   - Add kubeconfig credentials (ID: `kubeconfig`)
   - Configure Docker registry credentials if using remote registry

3. **Update Jenkinsfile:**
   - Set `DOCKER_REGISTRY` if using a remote registry
   - Update credentials ID if different

4. **Create Jenkins Pipeline:**
   - New Item → Pipeline
   - Point to Jenkinsfile in repository
   - Configure Git repository

5. **Run Pipeline:**
   - The pipeline will:
     - Build backend Docker image
     - Build frontend Docker image
     - Deploy to Kubernetes
     - Perform health checks

### API Endpoints Reference

#### Base URL
- Local: `http://localhost:8000`
- Kubernetes: `http://backend-service:8000`

#### Endpoints
- `GET /` - Root endpoint
- `GET /health` - Health check
- `GET /api/surveys` - Get all surveys
- `GET /api/surveys/{id}` - Get survey by ID
- `POST /api/surveys` - Create new survey
- `PUT /api/surveys/{id}` - Update survey
- `DELETE /api/surveys/{id}` - Delete survey

#### API Documentation
- Swagger UI: `http://localhost:8000/docs`
- ReDoc: `http://localhost:8000/redoc`

**Note:** For detailed testing instructions, see the [Testing Instructions](#testing-instructions) section above.

## Troubleshooting

This section provides solutions to common issues you may encounter while setting up, deploying, or running the Student Survey application.

### Backend Issues

#### Database Connection Failed

**Error:** `Can't connect to MySQL server` or `OperationalError: (2003, "Can't connect to MySQL server")`

**Solutions:**

1. **Check MySQL pod is running:**
   ```bash
   kubectl get pods -l app=mysql
   ```
   Ensure the pod shows `Running` status. If not, check logs:
   ```bash
   kubectl logs -l app=mysql
   ```

2. **Verify service exists:**
   ```bash
   kubectl get svc mysql-service
   ```
   Ensure the service is listed and has a ClusterIP.

3. **Check DATABASE_URL in backend deployment:**
   ```bash
   kubectl describe deployment backend-deployment | grep DATABASE_URL
   ```
   Verify the connection string format:
   ```
   mysql+pymysql://username:password@host:port/database
   ```

4. **For RDS: Verify security group allows your K8s cluster IPs**
   - Go to AWS Console → EC2 → Security Groups
   - Find the RDS security group
   - Add inbound rule: MySQL/Aurora (3306) from your Kubernetes cluster IPs

5. **Test connection from backend pod:**
   ```bash
   kubectl exec -it <backend-pod-name> -- python -c "import pymysql; pymysql.connect(host='mysql-service', user='root', password='password', database='survey_db')"
   ```

#### Tables Not Created

**Error:** Backend logs show "Table doesn't exist" or `OperationalError: (1146, "Table 'survey_db.surveys' doesn't exist")`

**Solutions:**

1. **Check backend logs:**
   ```bash
   kubectl logs -l app=backend
   ```
   Look for database initialization messages.

2. **Verify database name matches in DATABASE_URL:**
   - Ensure database name is `survey_db`
   - Check connection string in deployment YAML

3. **Ensure init_db() is called in main.py:**
   ```python
   @app.on_event("startup")
   def on_startup():
       init_db()
   ```

4. **Manually create tables using kubectl exec:**
   ```bash
   # Connect to MySQL
   kubectl exec -it <mysql-pod-name> -- mysql -uroot -ppassword survey_db
   
   # In MySQL prompt, check if tables exist
   SHOW TABLES;
   
   # If empty, the backend should create them on next startup
   ```

5. **Restart backend deployment:**
   ```bash
   kubectl rollout restart deployment/backend-deployment
   ```

#### Port Already in Use (Local Development)

**Error:** `Address already in use` or `OSError: [Errno 48] Address already in use`

**Solutions:**

**Find process using port 8000:**

**Mac/Linux:**
```bash
lsof -i :8000
# Kill the process
kill -9 <PID>
```

**Windows:**
```powershell
netstat -ano | findstr :8000
# Kill the process
taskkill /PID <PID> /F
```

**Alternative:** Change the port in `main.py`:
```python
uvicorn.run(app, host="0.0.0.0", port=8001)  # Use different port
```

#### Import Errors

**Error:** `ModuleNotFoundError: No module named 'fastapi'` or similar

**Solutions:**

1. **Ensure virtual environment is activated:**
   ```bash
   # Windows
   venv\Scripts\activate
   
   # Linux/Mac
   source venv/bin/activate
   ```

2. **Install dependencies:**
   ```bash
   pip install -r requirements.txt
   ```

3. **Verify installation:**
   ```bash
   pip list | grep fastapi
   ```

### Frontend Issues

#### Cannot Reach Backend

**Error:** `Network Error`, `Failed to fetch`, or `CORS policy error`

**Solutions:**

1. **Check backend service:**
```bash
   kubectl get svc backend-service
   ```
   Verify service exists and has correct selector.

2. **Verify nginx.conf proxy_pass configuration:**
   - Check `frontend/nginx.conf` has proxy settings:
   ```nginx
   location /api {
       proxy_pass http://backend-service:8000;
   }
   ```

3. **Check CORS settings in backend:**
   - Verify CORS middleware in `backend/app/main.py`
   - Ensure frontend URL is in allowed origins

4. **For local development: Verify REACT_APP_API_URL in .env:**
   ```bash
   # Check .env file exists
   cat frontend/.env
   
   # Should contain:
   REACT_APP_API_URL=http://localhost:8000
   ```

5. **Test backend directly:**
   ```bash
   # Port-forward to backend
   kubectl port-forward service/backend-service 8000:8000
   
   # Test in browser
   curl http://localhost:8000/health
   ```

#### Blank Page After Deployment

**Solutions:**

1. **Check browser console for errors (F12):**
   - Open Developer Tools → Console
   - Look for JavaScript errors or network failures

2. **Verify frontend pod logs:**
   ```bash
   kubectl logs -l app=frontend
   ```
   Check for nginx errors or build issues.

3. **Check nginx configuration:**
   ```bash
   kubectl exec -it <frontend-pod-name> -- cat /etc/nginx/conf.d/default.conf
   ```

4. **Ensure build was successful:**
   - Check Docker build logs
   - Verify `frontend/build` directory exists in image

5. **Check if static files are served:**
   ```bash
   kubectl exec -it <frontend-pod-name> -- ls -la /usr/share/nginx/html
   ```

#### Build Errors

**Error:** `npm ERR!` or build failures

**Solutions:**

1. **Clear node_modules and reinstall:**
   ```bash
   cd frontend
   rm -rf node_modules package-lock.json
   npm install
   ```

2. **Check Node.js version:**
   ```bash
   node --version  # Should be 18+
   ```

3. **Clear npm cache:**
   ```bash
   npm cache clean --force
   ```

4. **Check for syntax errors in code:**
   ```bash
   npm run build
   ```

### Kubernetes Issues

#### Pods in CrashLoopBackOff

**Solutions:**

1. **Check pod logs:**
   ```bash
kubectl logs <pod-name>
   kubectl logs <pod-name> --previous  # Previous container instance
   ```

2. **Describe pod for detailed information:**
   ```bash
kubectl describe pod <pod-name>
   ```
   Look for:
   - Events section (shows what happened)
   - Container status
   - Restart count

3. **Common causes and fixes:**
   - **Wrong environment variables:** Check deployment YAML
   - **Image pull failures:** Verify image name and registry access
   - **Application errors on startup:** Check application logs
   - **Resource limits too low:** Increase memory/CPU limits in deployment
   - **Database connection issues:** Verify DATABASE_URL and MySQL service

4. **Restart deployment:**
   ```bash
kubectl rollout restart deployment/<deployment-name>
   ```

#### ImagePullBackOff

**Error:** Cannot pull Docker image, pod shows `ImagePullBackOff` status

**Solutions:**

1. **Verify image name in deployment YAML:**
   ```bash
   kubectl describe pod <pod-name> | grep Image
   ```
   Check if image name matches what you built.

2. **Check image exists locally:**
   ```bash
   docker images | grep student-survey
   ```

3. **For remote registry: Verify credentials:**
   - Check if registry requires authentication
   - Verify image was pushed successfully

4. **Use local images: Set `imagePullPolicy: Never`**
   ```yaml
   spec:
     containers:
     - name: backend
       image: student-survey-backend:latest
       imagePullPolicy: Never  # Use local image
   ```

5. **Load image into minikube (if using minikube):**
   ```bash
   minikube image load student-survey-backend:latest
   minikube image load student-survey-frontend:latest
   ```

#### Service Not Accessible

**Solutions:**

1. **Check service exists:**
   ```bash
   kubectl get svc
   ```
   Verify all services are listed.

2. **Verify selector matches pod labels:**
   ```bash
   # Check service selector
   kubectl get svc backend-service -o yaml | grep selector
   
   # Check pod labels
   kubectl get pods --show-labels
   ```
   Ensure labels match (should both have `app: backend`)

3. **Check service type:**
   - **ClusterIP:** Only accessible within cluster
   - **LoadBalancer:** May take a few minutes to get external IP
   - **NodePort:** Accessible via node IP and port

4. **For LoadBalancer: May take a few minutes to get external IP:**
   ```bash
   kubectl get svc frontend-service -w  # Watch for external IP
   ```

5. **Test service from within cluster:**
   ```bash
   kubectl run -it --rm debug --image=busybox --restart=Never -- wget -O- http://backend-service:8000/health
   ```

#### Pods Not Starting

**Solutions:**

1. **Check pod status:**
   ```bash
   kubectl get pods
   ```
   Look for `Pending`, `CrashLoopBackOff`, or `Error` statuses.

2. **Check resource availability:**
   ```bash
   kubectl describe pod <pod-name> | grep -A 5 "Events"
   ```
   Look for "Insufficient resources" messages.

3. **Verify deployment configuration:**
   ```bash
   kubectl get deployment <deployment-name> -o yaml
   ```

4. **Check node resources:**
   ```bash
   kubectl top nodes
   ```

### Jenkins Issues

#### Pipeline Fails at Docker Build

**Solutions:**

1. **Ensure Docker is installed on Jenkins server:**
   ```bash
   # On Jenkins server
   docker --version
   ```

2. **Verify Jenkins user has Docker permissions:**
   ```bash
   # Add Jenkins user to docker group (Linux)
   sudo usermod -aG docker jenkins
   sudo systemctl restart jenkins
   ```

3. **Check Jenkinsfile syntax:**
   - Verify all stages are properly closed
   - Check for syntax errors in Groovy code

4. **View console output for specific error:**
   - Go to Jenkins → Your Pipeline → Build # → Console Output
   - Look for the exact error message

5. **Check Docker daemon is running:**
   ```bash
   # On Jenkins server
   sudo systemctl status docker
   ```

#### Cannot Connect to Kubernetes

**Solutions:**

1. **Verify kubeconfig is configured in Jenkins:**
   - Go to Jenkins → Manage Jenkins → Credentials
   - Check if kubeconfig credential exists
   - Verify credential ID matches Jenkinsfile

2. **Check kubectl is installed on Jenkins server:**
   ```bash
   # On Jenkins server
   kubectl version --client
   ```

3. **Test connection: Run `kubectl get pods` from Jenkins:**
   - Create a test pipeline with just: `sh 'kubectl get pods'`
   - Or SSH to Jenkins server and run manually

4. **Verify Jenkins node has network access to Kubernetes cluster:**
   - If using remote Kubernetes, ensure firewall rules allow access

### Database Issues

#### MySQL Pod Keeps Restarting

**Solutions:**

1. **Check logs:**
   ```bash
   kubectl logs -l app=mysql
   kubectl logs -l app=mysql --previous
   ```

2. **Verify password is correct:**
   - Check `MYSQL_ROOT_PASSWORD` in deployment YAML
   - Ensure it matches connection string in backend

3. **Check persistent volume (if using):**
   ```bash
   kubectl get pvc
   kubectl describe pvc mysql-pvc
   ```
   Verify PVC is bound and has storage.

4. **Increase memory limits in deployment:**
   ```yaml
   resources:
     requests:
       memory: "512Mi"  # Increase if needed
     limits:
       memory: "1Gi"    # Increase if needed
   ```

5. **Check for disk space issues:**
   ```bash
   kubectl describe pod <mysql-pod-name> | grep -i disk
   ```

#### Data Lost After Pod Restart

**Solutions:**

- **This is expected without persistent volumes**
  - Kubernetes pods are ephemeral
  - Data in pod filesystem is lost when pod is deleted

- **Add PersistentVolumeClaim for data persistence:**
  - The `mysql-deployment.yaml` already includes a PVC
  - Verify PVC is created: `kubectl get pvc`

- **Verify PVC is mounted:**
  ```bash
  kubectl describe pod <mysql-pod-name> | grep -A 5 "Mounts"
  ```

- **Or use Amazon RDS for production:**
  - RDS provides managed persistence
  - See [Database Setup](#database-setup) section for RDS configuration

#### Connection Timeout

**Error:** `Timeout connecting to MySQL`

**Solutions:**

1. **Verify MySQL pod is ready:**
   ```bash
   kubectl wait --for=condition=ready pod -l app=mysql --timeout=300s
   ```

2. **Check network connectivity:**
   ```bash
   kubectl exec -it <backend-pod-name> -- ping mysql-service
   ```

3. **Verify service DNS resolution:**
   ```bash
   kubectl exec -it <backend-pod-name> -- nslookup mysql-service
   ```

### General Debugging Commands

Useful commands for troubleshooting:

```bash
# Check all resources
kubectl get all

# Detailed pod information
kubectl describe pod <pod-name>

# View pod logs
kubectl logs <pod-name>
kubectl logs -f <pod-name>  # Follow logs in real-time
kubectl logs <pod-name> --previous  # Previous container instance

# Access pod shell
kubectl exec -it <pod-name> -- /bin/bash
kubectl exec -it <pod-name> -- /bin/sh  # If bash not available

# Port forward for testing
kubectl port-forward service/backend-service 8000:8000
kubectl port-forward service/frontend-service 8080:80

# Check events (chronological order)
kubectl get events --sort-by='.lastTimestamp'

# Check resource usage
kubectl top pods
kubectl top nodes

# Delete and recreate deployment
kubectl delete deployment <deployment-name>
kubectl apply -f k8s/<deployment-file>.yaml

# Check service endpoints
kubectl get endpoints

# Verify configuration
kubectl get deployment <name> -o yaml
kubectl get service <name> -o yaml

# Check pod environment variables
kubectl exec <pod-name> -- env

# Test DNS resolution
kubectl run -it --rm debug --image=busybox --restart=Never -- nslookup mysql-service
```

### Still Having Issues?

If you've tried the solutions above and still encounter problems:

1. **Check the assignment requirements again**
   - Verify you're following the correct setup steps
   - Review the README installation instructions

2. **Review all configuration files for typos**
   - Check YAML syntax (indentation matters!)
   - Verify environment variable names
   - Ensure image names match

3. **Ensure all prerequisites are installed**
   - Kubernetes cluster is running
   - kubectl is configured correctly
   - Docker is installed and running

4. **Try deploying each component individually**
   - Deploy MySQL first, wait for it to be ready
   - Then deploy backend
   - Finally deploy frontend

5. **Check the official documentation for tools being used**
   - FastAPI: https://fastapi.tiangolo.com/
   - React: https://react.dev/
   - Kubernetes: https://kubernetes.io/docs/
   - Docker: https://docs.docker.com/

6. **Verify your Kubernetes cluster is working:**
   ```bash
   kubectl cluster-info
   kubectl get nodes
   ```

7. **Check for common configuration mistakes:**
   - Typos in service names
   - Wrong port numbers
   - Incorrect environment variable values
   - Missing or incorrect labels/selectors

8. **Contact TA or professor during office hours**
   - Provide specific error messages
   - Include relevant logs and configuration
   - Describe what you've already tried

## Project Structure

```
swe645-hw3/
├── backend/
│   ├── app/
│   │   ├── __init__.py
│   │   ├── main.py          # FastAPI application
│   │   ├── models.py         # SQLModel database models
│   │   ├── crud.py           # CRUD operations
│   │   └── database.py       # Database configuration
│   ├── Dockerfile
│   └── requirements.txt
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   │   ├── SurveyForm.js
│   │   │   ├── SurveyList.js
│   │   │   └── SurveyDetail.js
│   │   ├── services/
│   │   │   └── api.js
│   │   ├── App.js
│   │   └── index.js
│   ├── public/
│   ├── Dockerfile
│   ├── nginx.conf
│   └── package.json
├── k8s/
│   ├── mysql-deployment.yaml
│   ├── backend-deployment.yaml
│   ├── frontend-deployment.yaml
│   ├── backend-service.yaml
│   └── frontend-service.yaml
├── Jenkinsfile
└── README.md
```

## Additional Notes

- The application uses CORS middleware to allow frontend-backend communication
- Database tables are automatically created on application startup
- All form fields are validated on both frontend and backend
- The application includes error handling and user feedback
- Health check endpoints are implemented for Kubernetes probes

## Video Demonstration

[Include link to video or mention that video is included in submission]

## References

- FastAPI Documentation: https://fastapi.tiangolo.com/
- React Documentation: https://react.dev/
- SQLModel Documentation: https://sqlmodel.tiangolo.com/
- Kubernetes Documentation: https://kubernetes.io/docs/
- Docker Documentation: https://docs.docker.com/
- Jenkins Documentation: https://www.jenkins.io/doc/
- Postman Documentation: https://www.postman.com/

## License

[Add your license information if applicable]

---

**Assignment**: SWE 645 - Homework 3  
**Course**: Full Stack Application Development  
**Institution**: [Your Institution]
