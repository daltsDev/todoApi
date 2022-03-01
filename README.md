Todo API

docker build -t todo-api .
docker run -d -p 8080:8080 --env JWT_SECRET_TOKEN=secret-token --name todo-api todo-api
