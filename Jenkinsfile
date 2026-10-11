pipeline {
    agent any

    options {
        timeout(time: 25, unit: 'MINUTES')
        buildDiscarder(logRotator(numToKeepStr: '10'))
        disableConcurrentBuilds()
    }

    environment {
        APP_NAME     = "awasio-frontend"
        DOCKER_IMAGE = "awasio-frontend:latest"
        NETWORK_NAME = "awasio_awasio-net"
    }

    stages {
        stage('Validation') {
            steps {
                echo "🔍 [Validation] Validating environment and fetching latest commit from GitHub main..."
                checkout scm
                sh '''
                    echo "Git Commit: $(git rev-parse --short HEAD)"
                    echo "Git Branch: $(git rev-parse --abbrev-ref HEAD)"
                    docker info > /dev/null || (echo "Docker engine unreachable" && exit 1)
                    echo "Validation passed."
                '''
            }
        }

        stage('Build') {
            steps {
                echo "🔨 [Build] Compiling Next.js production Docker image..."
                sh '''
                    docker build \
                        --build-arg NEXT_PUBLIC_API_URL=http://95.111.252.156:4000/api \
                        -t ${DOCKER_IMAGE} .
                '''
            }
        }

        stage('Build Validation') {
            steps {
                echo "🧪 [Build Validation] Verifying Docker image integrity..."
                sh '''
                    docker image inspect ${DOCKER_IMAGE} > /dev/null || exit 1
                    IMAGE_SIZE=$(docker images ${DOCKER_IMAGE} --format "{{.Size}}")
                    echo "Image size: ${IMAGE_SIZE}"
                    echo "Image verified successfully."
                '''
            }
        }

        stage('Deploy') {
            steps {
                echo "🚀 [Deploy] Deploying ${APP_NAME} container on Contabo VPS..."
                sh '''
                    docker stop ${APP_NAME} || true
                    docker rm ${APP_NAME} || true
                    docker run -d \
                        --name ${APP_NAME} \
                        --restart always \
                        -p 3000:3000 \
                        --network ${NETWORK_NAME} \
                        -e PORT=3000 \
                        -e NEXT_PUBLIC_API_URL='http://95.111.252.156:4000/api' \
                        ${DOCKER_IMAGE}
                '''
            }
        }

        stage('Health Check') {
            steps {
                echo "🩺 [Health Check] Probing frontend live endpoint..."
                sh '''
                    sleep 6
                    docker logs --tail 15 ${APP_NAME}
                    curl -fsS http://${APP_NAME}:3000/ > /dev/null || curl -fsS http://95.111.252.156:3000/ > /dev/null || exit 1
                    echo "✅ Frontend is live and responding healthy on port 3000!"
                '''
            }
        }
    }

    post {
        always {
            sh 'docker image prune -f || true'
        }
        success {
            echo "🎉 Frontend deployment from GitHub main succeeded!"
        }
        failure {
            echo "❌ Frontend deployment failed! Check Jenkins console log."
        }
    }
}
