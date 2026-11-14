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
                    # Keep the currently deployed image as :previous for a one-step rollback.
                    docker image inspect ${DOCKER_IMAGE} > /dev/null 2>&1 && docker tag ${DOCKER_IMAGE} ${APP_NAME}:previous || true
                    DOCKER_BUILDKIT=1 docker build \
                        --no-cache \
                        --progress=plain \
                        --build-arg NEXT_PUBLIC_API_URL=https://awasio.com/api \
                        --build-arg INTERNAL_API_URL=http://awasio-backend:4000/api \
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

        stage('Deploy (zero downtime)') {
            steps {
                echo "🚀 [Deploy] Zero-downtime swap of ${APP_NAME} (standby :3001 covers :3000 while it is replaced)..."
                sh '''
                    set -eu
                    STANDBY="${APP_NAME}-standby"
                    ENV_OPT=""
                    if [ -f /opt/awasio/.env.frontend ]; then
                        ENV_OPT="--env-file /opt/awasio/.env.frontend"
                    fi

                    # run_frontend <name> <host-port> <restart-policy>
                    # route-cache tmpfs: ISR page cache (rootfs is read-only). In memory on purpose, so every
                    # deploy starts empty and never serves pages rendered by the previous build.
                    run_frontend() {
                        docker rm -f "$1" > /dev/null 2>&1 || true
                        docker run -d \
                            --name "$1" \
                            --restart "$3" \
                            --read-only \
                            --tmpfs /tmp:rw,noexec,nosuid,size=64m \
                            --tmpfs /app/.next/cache:rw,noexec,nosuid,size=128m,uid=1001,gid=1001,mode=0770 \
                            --tmpfs /app/.next/server/route-cache:rw,noexec,nosuid,size=256m,uid=1001,gid=1001,mode=0770 \
                            --cap-drop ALL \
                            --security-opt no-new-privileges:true \
                            --memory 1g \
                            --cpus 1.5 \
                            -p 127.0.0.1:"$2":3000 \
                            --network ${NETWORK_NAME} \
                            ${ENV_OPT} \
                            -e PORT=3000 \
                            -e NEXT_PUBLIC_API_URL='https://awasio.com/api' \
                            -e INTERNAL_API_URL='http://awasio-backend:4000/api' \
                            ${DOCKER_IMAGE} > /dev/null
                        # Dual-network attachment so SSR always reaches awasio-backend
                        docker network connect awasio_awasio-net "$1" 2>/dev/null || true
                    }

                    # wait_healthy <name>: homepage 200 from inside the container, and the backend reachable.
                    wait_healthy() {
                        for i in $(seq 1 30); do
                            if docker exec "$1" node -e "require('http').get('http://127.0.0.1:3000', r => process.exit(r.statusCode === 200 ? 0 : 1)).on('error', () => process.exit(1))" > /dev/null 2>&1; then
                                docker exec "$1" wget -qO- --timeout=3 http://awasio-backend:4000/api/v1/health > /dev/null 2>&1 \
                                    || docker network connect awasio_awasio-net "$1" 2>/dev/null || true
                                echo "✅ $1 healthy (attempt ${i})"
                                return 0
                            fi
                            sleep 2
                        done
                        echo "❌ $1 did not become healthy"
                        docker logs --tail 30 "$1" || true
                        return 1
                    }

                    docker network connect ${NETWORK_NAME} awasio-backend 2>/dev/null || true

                    # 1. New version on the standby port. If it is unhealthy, abort: the old container keeps serving.
                    run_frontend "$STANDBY" 3001 no
                    if ! wait_healthy "$STANDBY"; then
                        docker rm -f "$STANDBY" > /dev/null 2>&1 || true
                        exit 1
                    fi

                    # 2. Retire the old container. nginx fails over to :3001 (already the new version).
                    docker stop -t 20 ${APP_NAME} > /dev/null 2>&1 || true
                    docker rm ${APP_NAME} > /dev/null 2>&1 || true

                    # 3. New version back on the primary port, then drop the standby.
                    run_frontend ${APP_NAME} 3000 always
                    if ! wait_healthy ${APP_NAME}; then
                        echo "⚠️ Primary unhealthy; leaving ${STANDBY} on :3001 serving traffic."
                        exit 1
                    fi
                    sleep 3   # let nginx route back to :3000 before the standby goes away
                    docker stop -t 20 "$STANDBY" > /dev/null 2>&1 || true
                    docker rm "$STANDBY" > /dev/null 2>&1 || true
                    docker logs --tail 10 ${APP_NAME}
                '''
            }
        }

        stage('Cleanup') {
            steps {
                echo "🧹 [Cleanup] Removing old frontend images and build cache (keeping :latest and :previous)..."
                sh '''
                    docker container prune -f --filter "label=awasio.app=${APP_NAME}" > /dev/null || true
                    docker images ${APP_NAME} --format '{{.Repository}}:{{.Tag}}' \
                        | grep -vE ':(latest|previous)$' | xargs -r docker rmi > /dev/null 2>&1 || true
                    docker image prune -f > /dev/null || true
                    docker builder prune -f --filter "until=24h" > /dev/null || true
                    docker images ${APP_NAME} --format 'kept: {{.Tag}} {{.Size}}'
                    df -h / | tail -1
                '''
            }
        }
    }

    post {
        success {
            echo "🎉 Frontend deployment from GitHub main succeeded!"
        }
        failure {
            echo "❌ Frontend deployment failed! Check Jenkins console log."
        }
    }
}
