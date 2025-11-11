# Video Recording Guide for SWE 645 Assignment 3

## Overview

The assignment requires a video demonstration showing "every part of your application."

**Recommended length:** 15-25 minutes  
**Format:** MP4, MOV, or AVI

## Recommended Tools

### Windows
- **OBS Studio** (free, open-source) - https://obsproject.com/
- **Xbox Game Bar** (built-in Windows 10/11) - Press `Win + G`
- **Loom** (free tier available) - https://www.loom.com/

### Mac
- **QuickTime Screen Recording** (built-in) - `Cmd + Shift + 5`
- **OBS Studio** (free, open-source) - https://obsproject.com/
- **Loom** (free tier available) - https://www.loom.com/

### Linux
- **OBS Studio** (free, open-source) - https://obsproject.com/
- **SimpleScreenRecorder** - Available in most package managers
- **Kazam** - Lightweight screen recorder

## Video Outline

### Part 1: Introduction (1 minute)

- State your name(s) and assignment number
- Brief overview of what you'll demonstrate
- Mention the tech stack (React, FastAPI, Kubernetes, Jenkins)

**Example Script:**
> "Hello, I'm [Your Name] / We are [Team Member Names] from SWE 645. This video demonstrates our Homework Assignment 3: Full Stack Application with Containerization and Kubernetes Deployment. I'll show you the complete application from code to deployment."

### Part 2: Code Walkthrough (3-5 minutes)

Show key files and highlight important sections:

1. **Backend API** (`backend/app/main.py`)
   - Show REST API endpoints
   - Point out CORS configuration
   - Mention CRUD operations

2. **Database Models** (`backend/app/models.py`)
   - Show Survey model
   - Highlight required fields
   - Show enum validation for select fields

3. **Frontend Form** (`frontend/src/components/SurveyForm.js`)
   - Show form component
   - Highlight validation
   - Point out checkbox implementation for `liked_most`

4. **Kubernetes Config** (`k8s/backend-deployment.yaml`)
   - Show deployment configuration
   - Point out replicas: 1
   - Show environment variables

5. **CI/CD Pipeline** (`Jenkinsfile`)
   - Show pipeline stages
   - Highlight build and deployment steps

**Tip:** Don't read through all code, just highlight important sections. Use your cursor to point to specific lines.

### Part 3: Local Development Demo (3-4 minutes)

1. **Backend Running Locally:**
   - Show terminal with `uvicorn app.main:app --reload`
   - Open browser to `http://localhost:8000`
   - Show Swagger UI at `http://localhost:8000/docs`
   - Test health endpoint: `http://localhost:8000/health`

2. **Frontend Running Locally:**
   - Show terminal with `npm start`
   - Open browser to `http://localhost:3000`
   - Show the application UI

3. **Demonstrate One CRUD Operation:**
   - Create a test survey
   - Show it appears in the list
   - Mention that full CRUD demo comes later in Kubernetes

### Part 4: Docker Build (2-3 minutes)

1. **Build Backend Image:**
   ```bash
   cd backend
   docker build -t student-survey-backend:latest .
   ```

2. **Build Frontend Image:**
   ```bash
   cd frontend
   docker build -t student-survey-frontend:latest .
   ```

3. **List Built Images:**
   ```bash
   docker images | grep student-survey
   ```

4. **Optional:** Show image sizes and explain multi-stage build for frontend.

### Part 5: Kubernetes Deployment (4-6 minutes)

1. **Deploy MySQL:**
   ```bash
   kubectl apply -f k8s/mysql-deployment.yaml
   kubectl wait --for=condition=ready pod -l app=mysql --timeout=300s
   ```

2. **Check Pod Status:**
   ```bash
   kubectl get pods
   ```
   Show all pods are in "Running" state

3. **Deploy Backend:**
   ```bash
   kubectl apply -f k8s/backend-deployment.yaml
   ```

4. **Deploy Frontend:**
   ```bash
   kubectl apply -f k8s/frontend-deployment.yaml
   ```

5. **Check Services:**
   ```bash
   kubectl get services
   ```
   Show service types and ports

6. **Access Application:**
   - If LoadBalancer: Show external IP
   - If port-forward: `kubectl port-forward service/frontend-service 8080:80`
   - Open browser to show application running

7. **Optional:** Show pod logs:
   ```bash
   kubectl logs -l app=backend
   ```

### Part 6: Application Functionality (5-8 minutes)

**This is the most important part!**

Demonstrate all CRUD operations through the UI:

1. **Create:**
   - Click "New Survey" button
   - Fill out ALL required fields:
     - First name, last name
     - Street address, city, state, ZIP
     - Telephone, email
     - Date of survey
   - Select MULTIPLE checkboxes for "What did you like most about the campus?"
   - Select option for "How did you become interested?"
   - Select recommendation likelihood
   - Click "Submit Survey"
   - Show success message

2. **Read:**
   - Click "View All Surveys"
   - Show the survey appears in the table
   - Click "View" button on a survey
   - Show all survey details displayed correctly
   - Verify `liked_most` shows as a list/array

3. **Update:**
   - Click "Edit" button on a survey
   - Modify some fields (e.g., change address, update email)
   - Change `liked_most` selections (uncheck some, check others)
   - Click "Update Survey"
   - Show success message

4. **Read Again:**
   - View the updated survey
   - Verify changes are reflected
   - Show updated `liked_most` selections

5. **Delete:**
   - Go back to list view
   - Click "Delete" button on a survey
   - Confirm deletion in popup
   - Show survey is removed from list

6. **Form Validation:**
   - Try to submit form with missing required fields
   - Show validation error messages appear
   - Fill in required fields and submit successfully

### Part 7: CI/CD Pipeline (3-4 minutes)

1. **Show Jenkins Dashboard:**
   - Open Jenkins web interface
   - Show pipeline job

2. **Trigger Pipeline Build:**
   - Click "Build Now"
   - Show build starts

3. **Show Build Stages:**
   - Checkout stage
   - Build Backend stage
   - Build Frontend stage
   - Deploy to Kubernetes stage
   - Health Check stage

4. **Show Successful Deployment:**
   - Show build succeeded
   - Verify pods are running after deployment
   - Test application still works

**Note:** If Jenkins is not available, you can:
- Show the Jenkinsfile and explain what it does
- Show how it would work in a CI/CD environment
- Mention that it's configured and ready for use

### Part 8: Postman API Testing (Optional, 2-3 minutes)

If time permits, show API testing:

1. **Import Collection:**
   - Open Postman
   - Show importing `postman/Student-Survey-API.postman_collection.json`

2. **Test Endpoints:**
   - Run "GET All Surveys" - show JSON response
   - Run "CREATE Survey" - show created survey with ID
   - Run "GET Survey by ID" - show single survey JSON
   - Mention that `survey_id` variable is auto-updated

3. **Show Response Format:**
   - Point out `liked_most` is an array in the JSON
   - Show all required fields are present

### Part 9: Conclusion (1 minute)

- Summary of what was demonstrated:
  - Full stack application (React + FastAPI)
  - Docker containerization
  - Kubernetes deployment
  - CI/CD pipeline
  - Complete CRUD functionality
- Mention any challenges faced and how you solved them
- Thank the viewer

**Example Script:**
> "In this demonstration, I've shown you our complete Student Survey application. We've successfully implemented a full-stack application with React frontend and FastAPI backend, containerized both services with Docker, deployed them to Kubernetes with one pod per service, and set up a CI/CD pipeline with Jenkins. The application supports all CRUD operations with proper validation. One challenge we faced was [mention challenge], which we solved by [explain solution]. Thank you for watching."

## Recording Tips

### 1. Audio Quality

- Use a decent microphone (even phone earbuds are better than laptop mic)
- Record in a quiet room
- Speak clearly and at a moderate pace
- Test audio levels before recording
- Consider using a pop filter or speaking slightly off-axis to avoid plosives

### 2. Screen Setup

- Close unnecessary applications and browser tabs
- Use a clean desktop background
- Increase terminal font size for readability (16-18pt minimum)
- Use browser zoom (125-150%) if needed for better visibility
- Full-screen your terminal/IDE windows
- Hide taskbar/dock if possible

### 3. Practice First

- Do a dry run to ensure everything works
- Time yourself to stay within 25 minutes
- Have a script or outline handy (but don't read from it word-for-word)
- Prepare terminal commands in a text file for copy-paste
- Test all applications start correctly before recording

### 4. Common Mistakes to Avoid

- ❌ Don't show errors you can't explain
- ❌ Don't spend too long on any one section (especially code walkthrough)
- ❌ Don't forget to show your name/team members at the beginning
- ❌ Don't rush through the CRUD demo (it's the most important part)
- ❌ Don't record with system notifications enabled
- ❌ Don't use a cluttered screen (close unnecessary windows)
- ❌ Don't speak too fast or too quietly
- ❌ Don't forget to test the application works before recording

### 5. If Something Goes Wrong During Recording

- **Minor issue:** Pause, fix it, continue
- **Major issue:** Stop recording, fix the problem, restart from a logical point
- **Application crashes:** Keep calm, restart the service, explain what happened
- **Time running out:** Prioritize Part 6 (CRUD demo) over other sections

### 6. Editing Tips

- You can pause and resume if needed
- If you make a mistake, pause, re-record that section, edit later
- Don't worry about small "ums" or pauses - they make it natural
- Focus on clarity over perfection

## File Size and Submission

### Video Size Considerations

- **If video is < 500MB:** Include it directly in the zip file
- **If video is > 500MB:**
  - Upload to Google Drive or YouTube (unlisted/private)
  - Include the link in a file called `VIDEO-LINK.txt` in the root directory
  - Mention this in the README.md

### Recommended Settings for Smaller File Size

- **Resolution:** 1080p (1920x1080) is sufficient
- **Frame Rate:** 30fps is fine (no need for 60fps)
- **Bitrate:** Adjust based on your tool (lower bitrate = smaller file)
- **Format:** MP4 with H.264 codec is most compatible

### Upload Options

1. **Google Drive:**
   - Upload video to Google Drive
   - Right-click → Share → Get link
   - Set to "Anyone with the link can view"
   - Include link in `VIDEO-LINK.txt`

2. **YouTube:**
   - Upload as unlisted video
   - Include link in `VIDEO-LINK.txt`
   - Mention it's unlisted in README

## Checklist Before Finalizing

### Content Checklist

- [ ] Audio is clear and understandable
- [ ] Screen content is readable (text isn't too small)
- [ ] All required sections demonstrated:
  - [ ] Introduction with names
  - [ ] Code walkthrough
  - [ ] Local development demo
  - [ ] Docker build
  - [ ] Kubernetes deployment
  - [ ] Complete CRUD operations
  - [ ] CI/CD pipeline (or explanation)
  - [ ] Conclusion
- [ ] CRUD operations clearly shown:
  - [ ] Create survey
  - [ ] Read/view surveys
  - [ ] Update survey
  - [ ] Delete survey
  - [ ] Form validation shown
- [ ] Multiple selections for `liked_most` demonstrated
- [ ] Video length is reasonable (15-25 min)
- [ ] Team member names stated at beginning
- [ ] No major errors or crashes shown
- [ ] Application is actually working in the demo

### Technical Checklist

- [ ] Video file saved in appropriate format (MP4, MOV, or AVI)
- [ ] File size is manageable (< 500MB or uploaded to cloud)
- [ ] Video plays correctly on different media players
- [ ] If > 500MB, `VIDEO-LINK.txt` file created with link
- [ ] README mentions video location or link

### Submission Checklist

- [ ] Video file included in submission package OR
- [ ] `VIDEO-LINK.txt` included with working link
- [ ] Link is accessible (test it from an incognito window)
- [ ] README mentions video in appropriate section

---

## Additional Resources

### OBS Studio Setup (Recommended)

1. **Download:** https://obsproject.com/
2. **Basic Setup:**
   - Add "Display Capture" source
   - Add "Audio Input Capture" (microphone)
   - Set output to MP4 format
   - Set recording quality to "High Quality, Medium File Size"
3. **Hotkeys:** Set up start/stop recording hotkeys

### QuickTime (Mac) Setup

1. Press `Cmd + Shift + 5`
2. Choose "Record Entire Screen" or "Record Selected Portion"
3. Click "Options" → Choose microphone
4. Click "Record"
5. Press `Cmd + Control + Esc` to stop

### Xbox Game Bar (Windows) Setup

1. Press `Win + G` to open Game Bar
2. Click the record button (or `Win + Alt + R`)
3. Press again to stop
4. Find recordings in: `C:\Users\YourName\Videos\Captures`

---

**Note:** The video doesn't need to be perfect. The goal is to prove your application works and that you understand what you built. Focus on clarity and demonstrating functionality rather than production-quality video editing.

**Good luck with your recording!** 🎥

