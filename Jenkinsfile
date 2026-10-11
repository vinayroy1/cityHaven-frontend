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
        stage('Checkout Code') {
            steps {
                echo "Fetching latest commit from GitHub main branch..."
                checkout scm
            }
        }

        stage('Build Docker Image') {
            steps {
                echo "Building Next.js production image for ${APP_NAME}..."
                sh '''
                    docker build \
                        --build-arg NEXT_PUBLIC_API_URL=http://95.111.252.156:4000/api \
                        -t ${DOCKER_IMAGE} .
                '''
            }
        }

        stage('Deploy Container') {
            steps {
                echo "Deploying ${APP_NAME} on Contabo VPS..."
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

        stage('Health Verification') {
            steps {
                echo "Verifying frontend health..."
                sh '''
                    sleep 5
                    docker logs --tail 15 ${APP_NAME}
                    curl -fsS http://localhost:3000/ > /dev/null || exit 1
                    echo "✅ Frontend is live and healthy on port 3000!"
                '''
            }
        }
    }

    post {
        always {
            sh 'docker builder prune -f || true'
        }
        success {
            echo "🎉 Frontend deployment from GitHub main succeeded!"
        }
        failure {
            echo "❌ Frontend deployment failed! Check Jenkins console log."
        }
    }
}
