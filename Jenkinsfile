// Jenkins CI/CD pipeline for Student Survey application - SWE 645 Assignment 3
// Team: Prakash, Jaya Krishna, Karthik Reddy
// Builds Docker images for frontend and backend, pushes to Docker Hub, then deploys to Kubernetes cluster
pipeline {
    agent any
    
    environment {
        DOCKER_HUB_REPO = 'suryaprakashuppalapati'
        BACKEND_IMAGE = "${DOCKER_HUB_REPO}/student-survey-backend"
        FRONTEND_IMAGE = "${DOCKER_HUB_REPO}/student-survey-frontend"
        DOCKER_CREDENTIALS_ID = 'dockerhub-credentials'
    }
    
    stages {
        stage('Checkout') {
            steps {
                echo '========== Checking out code from GitHub =========='
                checkout scm
            }
        }
        
        stage('Build Backend Image') {
            steps {
                echo '========== Building Backend Docker Image =========='
                dir('backend') {
                    script {
                        docker.build("${BACKEND_IMAGE}:${env.BUILD_NUMBER}")
                        docker.build("${BACKEND_IMAGE}:latest")
                    }
                }
            }
        }
        
        stage('Build Frontend Image') {
            steps {
                echo '========== Building Frontend Docker Image =========='
                dir('frontend') {
                    script {
                        docker.build("${FRONTEND_IMAGE}:${env.BUILD_NUMBER}")
                        docker.build("${FRONTEND_IMAGE}:latest")
                    }
                }
            }
        }
        
        stage('Push to Docker Hub') {
            steps {
                echo '========== Pushing Images to Docker Hub =========='
                script {
                    docker.withRegistry('https://registry.hub.docker.com', "${DOCKER_CREDENTIALS_ID}") {
                        // Push backend images
                        docker.image("${BACKEND_IMAGE}:${env.BUILD_NUMBER}").push()
                        docker.image("${BACKEND_IMAGE}:latest").push()
                        
                        // Push frontend images
                        docker.image("${FRONTEND_IMAGE}:${env.BUILD_NUMBER}").push()
                        docker.image("${FRONTEND_IMAGE}:latest").push()
                    }
                }
            }
        }
        
        stage('Deploy MySQL to Kubernetes') {
            steps {
                echo '========== Deploying MySQL to Kubernetes =========='
                script {
                    bat 'kubectl apply -f k8s/mysql-deployment.yaml'
                    bat 'kubectl wait --for=condition=ready pod -l app=mysql --timeout=300s || exit 0'
                }
            }
        }
        
        stage('Deploy Backend to Kubernetes') {
            steps {
                echo '========== Deploying Backend to Kubernetes =========='
                script {
                    bat 'kubectl apply -f k8s/backend-deployment.yaml'
                    bat 'kubectl set image deployment/backend-deployment backend=${BACKEND_IMAGE}:latest'
                    bat 'kubectl rollout status deployment/backend-deployment --timeout=300s'
                }
            }
        }
        
        stage('Deploy Frontend to Kubernetes') {
            steps {
                echo '========== Deploying Frontend to Kubernetes =========='
                script {
                    bat 'kubectl apply -f k8s/frontend-deployment.yaml'
                    bat 'kubectl set image deployment/frontend-deployment frontend=${FRONTEND_IMAGE}:latest'
                    bat 'kubectl rollout status deployment/frontend-deployment --timeout=300s'
                }
            }
        }
        
        stage('Verify Deployment') {
            steps {
                echo '========== Verifying Kubernetes Deployment =========='
                script {
                    bat '''
                        kubectl get pods
                        kubectl get services
                        kubectl get deployments
                    '''
                }
            }
        }
        
        stage('Health Check') {
            steps {
                echo '========== Running Health Checks =========='
                script {
                    sleep(time: 10, unit: 'SECONDS')
                    bat '''
                        kubectl get pods -l app=mysql
                        kubectl get pods -l app=backend
                        kubectl get pods -l app=frontend
                    '''
                }
            }
        }
    }
    
    post {
        success {
            echo '=========================================='
            echo 'Pipeline completed successfully!'
            echo 'Application deployed to Kubernetes'
            echo 'Access at: http://localhost'
            echo '=========================================='
        }
        failure {
            echo '=========================================='
            echo 'Pipeline failed! Check logs for details.'
            echo '=========================================='
        }
        always {
            echo 'Pipeline execution completed.'
        }
    }
}