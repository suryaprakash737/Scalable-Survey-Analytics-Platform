# Next Steps for SWE 645 Homework Assignment 3

## Current Status Assessment

✅ **Completed:**
- Full stack application with React frontend and FastAPI backend
- All required survey form fields implemented
- CRUD operations (Create, Read, Update, Delete) fully functional
- Docker containers for both frontend and backend
- Kubernetes deployment manifests (Deployments and Services)
- Jenkins CI/CD pipeline configuration
- Database models with proper validation using Enums
- Comprehensive README documentation

✅ **Recently Enhanced:**
- Added backend validation using Enum types for select fields (liked_most, interested_in, recommendation)
- Ensured all field options match assignment requirements exactly

## Immediate Actions Required

### 1. Add Team Member Names
- [ ] Update `README.md` line 18 with your team member names
- [ ] Add team member names to all source files (optional but recommended)

### 2. Test Locally First (Recommended)

**Backend Testing:**
```bash
cd backend
python -m venv venv
# Windows: venv\Scripts\activate
# Linux/Mac: source venv/bin/activate
pip install -r requirements.txt
export DATABASE_URL="mysql+pymysql://root:password@localhost:3306/survey_db"
uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
```

**Frontend Testing:**
```bash
cd frontend
npm install
# Create .env file with: REACT_APP_API_URL=http://localhost:8000
npm start
```

**Test with Postman:**
- Test all CRUD endpoints:
  - POST `/api/surveys` - Create survey
  - GET `/api/surveys` - Get all surveys
  - GET `/api/surveys/{id}` - Get survey by ID
  - PUT `/api/surveys/{id}` - Update survey
  - DELETE `/api/surveys/{id}` - Delete survey

### 3. Build Docker Images

**Build Backend:**
```bash
cd backend
docker build -t student-survey-backend:latest .
```

**Build Frontend:**
```bash
cd frontend
docker build -t student-survey-frontend:latest .
```

**Verify Images:**
```bash
docker images | grep student-survey
```

### 4. Deploy to Kubernetes

**Option A: Using MySQL in Kubernetes (Current Setup)**

1. **Deploy MySQL:**
   ```bash
   kubectl apply -f k8s/mysql-deployment.yaml
   kubectl wait --for=condition=ready pod -l app=mysql --timeout=300s
   ```

2. **Deploy Backend:**
   ```bash
   kubectl apply -f k8s/backend-deployment.yaml
   kubectl wait --for=condition=ready pod -l app=backend --timeout=300s
   ```

3. **Deploy Frontend:**
   ```bash
   kubectl apply -f k8s/frontend-deployment.yaml
   kubectl wait --for=condition=ready pod -l app=frontend --timeout=300s
   ```

4. **Check Status:**
   ```bash
   kubectl get pods
   kubectl get services
   kubectl logs -l app=backend
   kubectl logs -l app=frontend
   ```

5. **Access Application:**
   - If using LoadBalancer: `kubectl get service frontend-service` (get EXTERNAL-IP)
   - If using port-forward: `kubectl port-forward service/frontend-service 8080:80`
   - Access at: `http://localhost:8080` or `http://<EXTERNAL-IP>`

**Option B: Using Amazon RDS (Alternative)**

1. **Create RDS MySQL Instance:**
   - Go to AWS Console → RDS → Create Database
   - Choose MySQL 8.0
   - Select Development/Sandbox template
   - Note the endpoint URL

2. **Update Backend Deployment:**
   - Edit `k8s/backend-deployment.yaml`
   - Update `DATABASE_URL` environment variable:
     ```yaml
     env:
     - name: DATABASE_URL
       value: "mysql+pymysql://username:password@your-rds-endpoint:3306/survey_db"
     ```

3. **Create Database in RDS:**
   - Connect to RDS and run: `CREATE DATABASE survey_db;`

4. **Deploy Backend and Frontend (skip MySQL deployment):**
   ```bash
   kubectl apply -f k8s/backend-deployment.yaml
   kubectl apply -f k8s/frontend-deployment.yaml
   ```

### 5. Set Up CI/CD Pipeline (Jenkins)

**Prerequisites:**
- Jenkins installed and running
- Docker installed on Jenkins server
- kubectl configured and accessible
- Kubernetes cluster accessible

**Steps:**

1. **Install Jenkins Plugins:**
   - Docker Pipeline
   - Kubernetes
   - Git

2. **Configure Jenkins Credentials:**
   - Add kubeconfig as credentials (ID: `kubeconfig`)
   - Configure Docker registry credentials if using remote registry

3. **Create Jenkins Pipeline:**
   - New Item → Pipeline
   - Point to Jenkinsfile in repository
   - Configure Git repository URL
   - Save

4. **Update Jenkinsfile (if needed):**
   - Set `DOCKER_REGISTRY` if using remote registry
   - Update credentials ID if different
   - Ensure image names match your setup

5. **Run Pipeline:**
   - Click "Build Now"
   - Monitor build progress
   - Check logs for any errors

### 6. Testing and Verification

**Functional Testing:**
- [ ] Create a new survey with all fields
- [ ] View all surveys
- [ ] View individual survey details
- [ ] Update an existing survey
- [ ] Delete a survey
- [ ] Verify form validation works (required fields)
- [ ] Verify select field options match assignment

**API Testing (Postman):**
- [ ] Test all CRUD endpoints
- [ ] Test error cases (invalid IDs, missing fields)
- [ ] Verify response formats

**Integration Testing:**
- [ ] Frontend can communicate with backend
- [ ] Database persists data correctly
- [ ] All pods are running and healthy
- [ ] Services are correctly routing traffic

### 7. Documentation and Video

**Documentation Checklist:**
- [ ] Update README with team member names
- [ ] Add Kubernetes application URL to README
- [ ] Document any custom configurations
- [ ] Include troubleshooting section updates if needed

**Video Recording:**
- [ ] Record demonstration of:
  - Local development setup and running
  - Docker image building
  - Kubernetes deployment
  - CI/CD pipeline execution
  - Full application functionality (CRUD operations)
  - Application running in Kubernetes

### 8. Final Submission Preparation

**Before Submission:**
- [ ] Test everything one more time
- [ ] Ensure all source files have proper header comments
- [ ] Verify all configuration files are included
- [ ] Check that README is complete
- [ ] Ensure video is recorded and included
- [ ] Add Kubernetes URL to README
- [ ] Create zip package with all files

**Submission Package Should Include:**
- All source code files
- Dockerfiles
- Kubernetes YAML manifests
- Jenkinsfile
- requirements.txt and package.json
- README.md
- Video recording
- Any additional scripts or configuration files

## Common Issues and Solutions

### Issue: Backend can't connect to database
**Solution:** 
- Check MySQL pod is running: `kubectl get pods -l app=mysql`
- Verify DATABASE_URL in backend deployment
- Check MySQL service: `kubectl get svc mysql-service`

### Issue: Frontend can't reach backend
**Solution:**
- Verify backend service exists: `kubectl get svc backend-service`
- Check nginx.conf proxy configuration
- Verify CORS settings in backend

### Issue: Pods in CrashLoopBackOff
**Solution:**
- Check pod logs: `kubectl logs <pod-name>`
- Verify environment variables
- Check resource limits
- Verify image names are correct

### Issue: Database tables not created
**Solution:**
- Check backend logs for errors
- Verify database exists
- Ensure init_db() is called on startup
- Check database connection string

## Additional Notes

- The application uses Enum types for select fields to ensure data integrity
- All form fields are required and validated on both frontend and backend
- The application includes health check endpoints for Kubernetes probes
- CORS is configured to allow frontend-backend communication
- Database tables are automatically created on application startup

## Assignment Requirements Checklist

- [x] React.js frontend
- [x] FastAPI backend with SQLModel/SQLAlchemy
- [x] MySQL database (Kubernetes or RDS)
- [x] CRUD operations (Create, Read, Update, Delete)
- [x] All required form fields
- [x] All survey question options
- [x] Docker containerization
- [x] Kubernetes deployment (Frontend Pod and Backend Pod)
- [x] CI/CD pipeline (Jenkins)
- [x] Documentation
- [ ] Video demonstration
- [ ] Kubernetes URL in README

---

**Good luck with your submission!** 🚀
