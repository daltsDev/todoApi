## TODO App

This is a REST API for a TODO Application. It supports creating, reading, updating and deleting TODO items. It provides user authentication with JSON Web Tokens. Written in Node.js & Express.

### Installation

Requires Node 17.x

```
npm install .
```

---

### Run locally

##### Setting up the environment

The following will start the application on local port 8080 with a random secret key.

```
npm install . // If not already installed
JWT_SECRET_TOKEN=secret-token npm start
```

---

### Run in Docker

- Install Docker
- Build the image

```
docker build -t todo-api .
```

- Run the application.
  - The following will start the application on local port 8080 with a random secret key.

```
docker run -d -p 8080:8080 --env JWT_SECRET_TOKEN=secret-token --name todo-api todo-api
```

---

### Run the tests

The tests run via GitHub Actions.

To run the tests locally

```
npm install . // If not already installed
npm test
```

---

### Interact with the API using `cURL`

You will first need to create an account with an email and password:

```
curl --request POST 'http://127.0.0.1:8080/auth/signup' \
--header 'Content-Type: application/json' \
--data-raw '{
    "email" : "example_email@example.com",
    "password" : "3xAmplePA55word"
}'
```

You should receive a sign up success message:

```
{
    "message":"Successfully Signed Up"
    _id":"621fd94d1667e88e9baa69f2"
}
```

You will then need to login with those credentials:

```
curl --request POST 'http://127.0.0.1:8080/auth/login' \
--header 'Content-Type: application/json' \
--data-raw '{
    "email" : "example_email@example.com",
    "password" : "3xAmplePA55word"
}'
```

Logging in with generate an access token. You will need to include this token in the authorization header of subsequent requests:

```
{
    "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOiI8VVNFUiBJRCBIRVJFPiIsImlhdCI6MTY0NjI1NjUwNywiZXhwIjoxNjQ2ODYxMzA3fQ.f2_C_i-B_2h5p8XmSLWbvV0j4qdHaq9ZWdpHcqab-Os"
}
```

You can create a local environmental variable with the access token for future use:

```
export accessToken=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOiI8VVNFUiBJRCBIRVJFPiIsImlhdCI6MTY0NjI1NjUwNywiZXhwIjoxNjQ2ODYxMzA3fQ.f2_C_i-B_2h5p8XmSLWbvV0j4qdHaq9ZWdpHcqab-Os
```

Confirm who you are logged in as:

```
curl --request GET 'http://127.0.0.1:8080/auth/guarded' \
--header 'Authorization: Bearer $accessToken'
{
    "loggedInAs": "example_email@example.com"
}
```

##### Examples of interacting with the todo api:

###### Creating a Todo

```
curl --request POST 'http://127.0.0.1:8080/todo' \
--header 'Authorization: Bearer $accessToken' \
--header 'Content-Type: application/json' \
--data-raw '{ "todo": "Example First Todo" }'
```

###### Get a Todo

Include Todo Id from creating a todo

```
curl --request POST 'http://127.0.0.1:8080/todo/<object_id>' \
--header 'Authorization: Bearer $accessToken' \
--header 'Content-Type: application/json' \
```

###### Get all Todos

```
curl --request GET 'http://127.0.0.1:8080/todo' \
--header 'Content-Type: application/json' \
--header 'Authorization: Bearer $accessToken'
```

###### Modify a Todo

Include Todo Id from creating a todo

```
curl --request PATCH 'http://127.0.0.1:8080/todo/<object_id>' \
--header 'Authorization: Bearer $accessToken' \
--header 'Content-Type: application/json' \
--data-raw '{ "todo": "Example Modifying First Todo"}'
```

###### Delete a Todo

Include Todo Id from creating a todo

```
curl --request DELETE 'http://127.0.0.1:8080/todo/<object_id>' \
--header 'Authorization: Bearer $accessToken'
```

###### Optional Query Parameter

You can pass an optional query parameter `?verbose=true || false` to the following actions to return a verbose JSON Response:

1. [Creating a Todo](#creating-a-todo)
2. [Get a Todo](#get-a-todo)
3. [Get all Todos](#get-all-todos)
4. [Modify a Todo](#modify-a-todo)

---

### Interact with the API using `Postman`

Configuration:

- Import Postman Collection found in `Postman/_Postman_Todo_API.json`
- Set `{{ACCESS_TOKEN}}` Variable after logging in.
- Set `{{TODO_ID}}` Variable after creating todo item. If required.
