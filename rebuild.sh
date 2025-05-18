# 1. Stop only auth-app and quiz-app
docker compose -f /home/patrick/docker-compose.yml -p patrick stop auth-app quiz-app

# 2. Remove the stopped containers for auth-app and quiz-app
docker compose -f /home/patrick/docker-compose.yml -p patrick rm -f auth-app quiz-app

# 3. Rebuild and start only auth-app and quiz-app (and their dependencies if not already running)
docker compose -f /home/patrick/docker-compose.yml -p patrick up -d --build auth-app quiz-app