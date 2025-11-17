// Jenkinsfile
// CI/CD Pipeline for Student Survey Application
// Author: Suryaprakash
        // Jaya Krishna
        // Karthik Reddy
// Description: Jenkins pipeline for building, testing, and deploying to Kubernetes

pipeline {
    agent any
    
    environment {
        DOCKER_HUB_REPO = 'your-dockerhub-username'
        FRONTEND_IMAGE = "${DOCKER_HUB_REPO}/swe645-frontend"
        BACKEND_IMAGE = "${DOCKER_HUB_REPO}/swe645-backend"
        DOCKER_CREDENTIALS = 'docker-hub-credentials'
        KUBECONFIG_CREDENTIALS = 'kubeconfig-credentials'
    }
    
    stages {
        stage('Checkout') {
            steps {
                echo 'Checking out source code...'
                checkout scm
            }
        }
        
        stage('Build Backend Docker Image') {
            steps {
                echo 'Building Backend Docker image...'
                dir('backend') {
                    script {
                        docker.build("${BACKEND_IMAGE}:${BUILD_NUMBER}")
                        docker.build("${BACKEND_IMAGE}:latest")
                    }
                }
            }
        }
        
        stage('Build Frontend Docker Image') {
            steps {
                echo 'Building Frontend Docker image...'
                dir('frontend') {
                    script {
                        docker.build("${FRONTEND_IMAGE}:${BUILD_NUMBER}")
                        docker.build("${FRONTEND_IMAGE}:latest")
                    }
                }
            }
        }
        
        stage('Push Docker Images') {
            steps {
                echo 'Pushing Docker images to Docker Hub...'
                script {
                    docker.withRegistry('https://registry.hub.docker.com', DOCKER_CREDENTIALS) {
                        docker.image("${BACKEND_IMAGE}:${BUILD_NUMBER}").push()
                        docker.image("${BACKEND_IMAGE}:latest").push()
                        docker.image("${FRONTEND_IMAGE}:${BUILD_NUMBER}").push()
                        docker.image("${FRONTEND_IMAGE}:latest").push()
                    }
                }
            }
        }
        
        stage('Deploy to Kubernetes') {
            steps {
                echo 'Deploying to Kubernetes cluster...'
                withCredentials([file(credentialsId: KUBECONFIG_CREDENTIALS, variable: 'KUBECONFIG')]) {
                    sh '''
                        # Apply MySQL deployment first
                        kubectl apply -f k8s/mysql-deployment.yaml
                        
                        # Wait for MySQL to be ready
                        kubectl wait --for=condition=ready pod -l app=mysql --timeout=120s
                        
                        # Apply backend deployment and service
                        kubectl apply -f k8s/backend-deployment.yaml
                        kubectl apply -f k8s/backend-service.yaml
                        
                        # Wait for backend to be ready
                        kubectl wait --for=condition=ready pod -l app=backend --timeout=120s
                        
                        # Apply frontend deployment and service
                        kubectl apply -f k8s/frontend-deployment.yaml
                        kubectl apply -f k8s/frontend-service.yaml
                        
                        # Force rolling update to use latest images
                        kubectl rollout restart deployment backend-deployment
                        kubectl rollout restart deployment frontend-deployment
                        
                        # Check rollout status
                        kubectl rollout status deployment backend-deployment
                        kubectl rollout status deployment frontend-deployment
                    '''
                }
            }
        }
        
        stage('Verify Deployment') {
            steps {
                echo 'Verifying deployment...'
                withCredentials([file(credentialsId: KUBECONFIG_CREDENTIALS, variable: 'KUBECONFIG')]) {
                    sh '''
                        echo "=== Deployment Status ==="
                        kubectl get deployments
                        
                        echo "=== Pods Status ==="
                        kubectl get pods
                        
                        echo "=== Services ==="
                        kubectl get services
                        
                        echo "=== Frontend Service URL ==="
                        kubectl get service frontend-service
                    '''
                }
            }
        }
    }
    
    post {
        success {
            echo 'Pipeline completed successfully!'
            echo 'Application deployed to Kubernetes cluster.'
        }
        failure {
            echo 'Pipeline failed. Please check the logs.'
        }
        always {
            echo 'Cleaning up workspace...'
            cleanWs()
        }
    }
}