pipeline {
    agent any

    options {
        timeout(time: 60, unit: 'MINUTES')
        buildDiscarder(logRotator(numToKeepStr: '10'))
        disableConcurrentBuilds()
    }

    environment {
        APP_NAME     = "awasio-frontend"
        DOCKER_IMAGE = "awasio-frontend:latest"
        NETWORK_NAME = "awasio-frontend-net"
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
                    docker network inspect ${NETWORK_NAME} > /dev/null 2>&1 || docker network create ${NETWORK_NAME}
                    docker network connect ${NETWORK_NAME} awasio-backend 2>/dev/null || true
                    echo "Validation passed."
                '''
            }
        }

        stage('Build') {
            steps {
                echo "🔨 [Build] Compiling Next.js production Docker image without cache..."
                sh '''
                    DOCKER_BUILDKIT=1 docker build \
                        --no-cache \
                        --progress=plain \
                        --build-arg NEXT_PUBLIC_API_URL=https://awasio.com/api \
                        --label awasio.app=${APP_NAME} \
                        --label awasio.build=${BUILD_NUMBER} \
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
                echo "🚀 [Deploy] Deploying hardened ${APP_NAME} container on Contabo VPS..."
                sh '''
                    docker stop ${APP_NAME} || true
                    docker rm ${APP_NAME} || true
                    ENV_OPT=""
                    if [ -f /opt/awasio/.env.frontend ]; then
                        ENV_OPT="--env-file /opt/awasio/.env.frontend"
                        echo "Using server-side environment file /opt/awasio/.env.frontend"
                    fi
                    docker run -d \
                        --name ${APP_NAME} \
                        --restart always \
                        --read-only \
                        --tmpfs /tmp:rw,noexec,nosuid,size=64m \
                        --tmpfs /app/.next/cache:rw,noexec,nosuid,size=128m \
                        --cap-drop ALL \
                        --security-opt no-new-privileges:true \
                        --memory 1g \
                        --cpus 1.5 \
                        -p 127.0.0.1:3000:3000 \
                        --network ${NETWORK_NAME} \
                        ${ENV_OPT} \
                        -e PORT=3000 \
                        -e NEXT_PUBLIC_API_URL='https://awasio.com/api' \
                        ${DOCKER_IMAGE}
                '''
            }
        }

        stage('Health Check') {
            steps {
                echo "🩺 [Health Check] Probing frontend live endpoint..."
                sh '''
                    echo "Waiting for ${APP_NAME} to initialize..."
                    for i in $(seq 1 15); do
                        if docker exec ${APP_NAME} node -e "require('http').get('http://127.0.0.1:3000', r => process.exit(r.statusCode === 200 ? 0 : 1))" > /dev/null 2>&1; then
                            echo "✅ Frontend is healthy and responding (attempt ${i})!"
                            docker logs --tail 10 ${APP_NAME}
                            exit 0
                        fi
                        echo "Attempt ${i}/15: frontend still initializing, waiting 3s..."
                        sleep 3
                    done
                    echo "❌ Frontend failed to become healthy in time"
                    docker logs --tail 30 ${APP_NAME}
                    exit 1
                '''
            }
        }
    }

    post {
        always {
            // Keep recent layers for fast rebuilds while bounding stale disk use.
            sh 'docker image prune -f --filter "until=168h" || true'
        }
        success {
            echo "🎉 Frontend deployment from GitHub main succeeded!"
        }
        failure {
            echo "❌ Frontend deployment failed! Check Jenkins console log."
        }
    }
}
