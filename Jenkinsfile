pipeline {

    agent any

    environment {
        IMAGE_NAME      = "nivicap-sit-ui"
        NETWORK_NAME    = "nivi-sit-app-ui-network"
        HOST_PORT       = "8081"
        CONTAINER_PORT  = "80"
    }

    stages {

        stage('Workspace Validation') {
            steps {
                sh '''
                pwd
                ls -ltr
                '''
            }
        }

        stage('Build Docker Image') {
            steps {
                sh '''
                docker buildx build -t ${IMAGE_NAME}:latest .
                '''
            }
        }

        stage('Ensure Docker Network') {
            steps {
                sh '''
                docker network inspect ${NETWORK_NAME} >/dev/null 2>&1 || \
                docker network create ${NETWORK_NAME}
                '''
            }
        }

        stage('Check API Container') {
            steps {
                sh '''
                echo "===== Existing API Containers ====="
                docker ps -a | grep nivi-api || true
                '''
            }
        }

        stage('Stop Running UI Containers') {
            steps {
                sh '''
                echo "Stopping only running UI containers..."

                docker ps \
                  --filter "name=nivicap-sit-ui" \
                  -q | xargs -r docker stop

                sleep 5
                '''
            }
        }

        stage('Deploy New UI Container') {
            steps {
                sh '''
                TIMESTAMP=$(date +%d-%m-%Y-%H-%M-%S)
                CONTAINER_NAME="nivicap-sit-ui${TIMESTAMP}"

                echo "Deploying Container: ${CONTAINER_NAME}"

                docker run -d \
                    --name "${CONTAINER_NAME}" \
                    --network "${NETWORK_NAME}" \
                    --restart unless-stopped \
                    -p ${HOST_PORT}:${CONTAINER_PORT} \
                    --label app=nivi-ui \
                    ${IMAGE_NAME}:latest

                echo "${CONTAINER_NAME}" > container_name.txt

                sleep 10

                echo "Verifying container existence..."

                docker ps -a | grep "${CONTAINER_NAME}"
                '''
            }
        }

        stage('Verify UI Health') {
            steps {
                sh '''
                CONTAINER_NAME=$(cat container_name.txt)

                echo "================================"
                echo "Container Status"
                echo "================================"
                docker ps -a | grep "${CONTAINER_NAME}"

                echo "================================"
                echo "Waiting for UI Startup"
                echo "================================"

                SUCCESS=0

                for i in $(seq 1 12)
                do
                    echo "Health Check Attempt $i"

                    if curl -fs http://localhost:${HOST_PORT} >/dev/null 2>&1
                    then
                        SUCCESS=1
                        echo "UI Application is healthy."
                        break
                    fi

                    sleep 5
                done

                if [ $SUCCESS -ne 1 ]; then
                    echo "UI failed health check"

                    echo "===== Container Logs ====="
                    docker logs "${CONTAINER_NAME}" || true

                    exit 1
                fi
                '''
            }
        }

        stage('Keep Latest 5 UI Containers') {
            steps {
                sh '''
                echo "Keeping latest 5 UI containers..."

                CONTAINERS=$(docker ps -a \
                    --filter "name=nivicap-sit-ui" \
                    --format "{{.ID}} {{.CreatedAt}}" \
                    | sort -rk2 \
                    | awk '{print $1}')

                COUNT=$(echo "$CONTAINERS" | wc -l)

                if [ "$COUNT" -gt 5 ]; then
                    echo "$CONTAINERS" | tail -n +6 | xargs -r docker rm -f
                fi
                '''
            }
        }

        stage('Deployment Summary') {
            steps {
                sh '''
                echo "================================"
                echo "Running UI Containers"
                echo "================================"

                docker ps -a --filter "nivicap-sit-ui"

                echo "================================"
                echo "Network Containers"
                echo "================================"

                docker network inspect ${NETWORK_NAME}

                echo "================================"
                echo "Port Validation"
                echo "================================"

                curl -I http://localhost:${HOST_PORT}
                '''
            }
        }
    }

    post {

        success {
            sh '''
            echo "================================"
            echo "UI Deployment Successful"
            echo "================================"

            docker ps | grep nivicap-sit-ui || true
            '''
        }

        failure {
            sh '''
            echo "================================"
            echo "UI Deployment Failed"
            echo "================================"

            if [ -f container_name.txt ]; then

                CONTAINER_NAME=$(cat container_name.txt)

                echo "===== Container Status ====="
                docker ps -a | grep "${CONTAINER_NAME}" || true

                echo "===== Container Logs ====="
                docker logs "${CONTAINER_NAME}" || true

                echo "===== Inspect ====="
                docker inspect "${CONTAINER_NAME}" || true
            fi

            echo "===== Port Status ====="
            ss -tulpn | grep ${HOST_PORT} || true

            echo "===== API Status ====="
            docker ps | grep nivicap-sit-ui || true
            '''
        }
    }
}
