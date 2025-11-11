// Jenkins CI/CD pipeline for Student Survey application.
// Builds Docker images for frontend and backend, then deploys to Kubernetes cluster.
pipeline {
    agent any
    
    environment {
        DOCKER_REGISTRY = 'your-docker-registry'  // Update with your Docker registry if using remote registry
        BACKEND_IMAGE = 'student-survey-backend'
        FRONTEND_IMAGE = 'student-survey-frontend'
        // KUBECONFIG = credentials('kubeconfig')  // Uncomment if using kubeconfig credentials
        // Ensure kubectl is configured on Jenkins node or set KUBECONFIG environment variable
    }
    
    stages {
        stage('Checkout') {
            steps {
                checkout scm
            }
        }
        
        stage('Build Backend') {
            steps {
                dir('backend') {
                    script {
                        def backendImage = docker.build("${BACKEND_IMAGE}:${env.BUILD_NUMBER}")
                        docker.tag("${BACKEND_IMAGE}:${env.BUILD_NUMBER}", "${BACKEND_IMAGE}:latest")
                        // Push to registry if configured
                        // docker.withRegistry("https://${DOCKER_REGISTRY}") {
                        //     backendImage.push("${env.BUILD_NUMBER}")
                        //     backendImage.push("latest")
                        // }
                    }
                }
            }
        }
        
        stage('Build Frontend') {
            steps {
                dir('frontend') {
                    script {
                        def frontendImage = docker.build("${FRONTEND_IMAGE}:${env.BUILD_NUMBER}")
                        docker.tag("${FRONTEND_IMAGE}:${env.BUILD_NUMBER}", "${FRONTEND_IMAGE}:latest")
                        // Push to registry if configured
                        // docker.withRegistry("https://${DOCKER_REGISTRY}") {
                        //     frontendImage.push("${env.BUILD_NUMBER}")
                        //     frontendImage.push("latest")
                        // }
                    }
                }
            }
        }
        
        stage('Deploy to Kubernetes') {
            steps {
                script {
                    // Verify kubectl is available
                    sh 'kubectl version --client || exit 1'
                    
                    // Apply all Kubernetes manifests (MySQL first, then backend, then frontend)
                    sh """
                        kubectl apply -f k8s/mysql-deployment.yaml
                        kubectl wait --for=condition=ready pod -l app=mysql --timeout=300s || true
                    """
                    
                    sh """
                        kubectl apply -f k8s/backend-deployment.yaml
                    """
                    
                    sh """
                        kubectl apply -f k8s/frontend-deployment.yaml
                    """
                    
                    // Update image tags if needed (for rolling updates)
                    sh """
                        kubectl set image deployment/backend-deployment backend=${BACKEND_IMAGE}:latest --namespace=default || true
                        kubectl set image deployment/frontend-deployment frontend=${FRONTEND_IMAGE}:latest --namespace=default || true
                    """
                    
                    // Wait for deployments to be ready
                    sh """
                        kubectl rollout status deployment/backend-deployment --timeout=5m
                        kubectl rollout status deployment/frontend-deployment --timeout=5m
                    """
                }
            }
        }
        
        stage('Health Check') {
            steps {
                script {
                    // Wait for services to be ready
                    sleep(time: 30, unit: 'SECONDS')
                    
                    // Check backend health
                    sh """
                        kubectl get pods -l app=backend
                        kubectl get pods -l app=frontend
                    """
                }
            }
        }
    }
    
    post {
        success {
            echo 'Pipeline succeeded!'
        }
        failure {
            echo 'Pipeline failed!'
        }
        always {
            // Clean up workspace or perform cleanup tasks
            echo 'Pipeline completed.'
        }
    }
}



