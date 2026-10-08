pipeline {
    agent any

    options {
        timeout(time: 20, unit: 'MINUTES')
        buildDiscarder(logRotator(numToKeepStr: '10'))
        disableConcurrentBuilds()
    }

    environment {
        APP_NAME     = "awasio-frontend"
        DOCKER_IMAGE = "vinaykumar111/awasio-frontend"
        DOCKER_TAG   = "${BUILD_NUMBER}"
        REGISTRY_CREDS = "dockerhub-credentials"
    }

    stages {
        stage('Checkout') {
            steps {
                echo "Pulling latest code for ${APP_NAME}..."
                checkout scm
            }
        }

        stage('Install & Lint') {
            steps {
                sh '''
                    echo "Checking node & npm versions..."
                    node -v
                    npm -v
                '''
            }
        }

        stage('Build Docker Image') {
            steps {
                echo "Building Docker container image for ${APP_NAME}..."
                sh """
                    docker build -t ${DOCKER_IMAGE}:${DOCKER_TAG} -t ${DOCKER_IMAGE}:latest .
                """
            }
        }

        stage('Push Image to Registry') {
            steps {
                echo "Pushing image to Docker Hub..."
                withCredentials([usernamePassword(credentialsId: "${REGISTRY_CREDS}", usernameVariable: 'DOCKER_USER', passwordVariable: 'DOCKER_PASS')]) {
                    sh '''
                        echo "$DOCKER_PASS" | docker login -u "$DOCKER_USER" --password-stdin
                        docker push ${DOCKER_IMAGE}:${DOCKER_TAG}
                        docker push ${DOCKER_IMAGE}:latest
                    '''
                }
            }
        }

        stage('Deploy to Server') {
            steps {
                echo "Deploying ${APP_NAME} container with zero downtime..."
                sh '''
                    # Stop previous container if running and restart with new image
                    docker pull ${DOCKER_IMAGE}:latest
                    docker stop ${APP_NAME} || true
                    docker rm ${APP_NAME} || true
                    docker run -d \
                        --name ${APP_NAME} \
                        --restart unless-stopped \
                        -p 3000:3000 \
                        --network awasio-network \
                        ${DOCKER_IMAGE}:latest
                '''
            }
        }
    }

    post {
        always {
            sh 'docker system prune -f'
        }
        success {
            echo "✅ Frontend deployment completed successfully!"
        }
        failure {
            echo "❌ Frontend pipeline failed! Check logs."
        }
    }
}
