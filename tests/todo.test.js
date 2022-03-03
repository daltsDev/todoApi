const request = require("supertest");
const app = require("../src/todoApi/init");
const mongoose = require("mongoose");
const jwt = require("jsonwebtoken");
const User = require("../src/todoApi/models/user");
const Todo = require("../src/todoApi/models/todo");
const { dbShutDown } = require("../src/todoApi/db/db");

const userOneId = mongoose.Types.ObjectId();
const userOne = {
  _id: userOneId,
  email: "test_user@test.com",
  password: "$2a$12$aOh1kftAB.nEvwPQ99g3COIHb1ewJc2uwi.NRh06A0gsxD8IoB6d.",
  token: jwt.sign(
    {
      userId: userOneId,
    },
    process.env.JWT_SECRET_TOKEN,
    {
      expiresIn: "7 days",
    }
  ),
};

const userTwoId = mongoose.Types.ObjectId();
const userTwo = {
  _id: userTwoId,
  email: "test_user_two@test.com",
  password: "$2a$12$aOh1kftAB.nEvwPQ99g3COIHb1ewJc2uwi.NRh06A0gsxD8IoB6d.",
  token: jwt.sign(
    {
      userId: userTwoId,
    },
    process.env.JWT_SECRET_TOKEN,
    {
      expiresIn: "7 days",
    }
  ),
};

/**
 * We used the describe function and resultant test names
 * inspired by https://github.com/spotify/should-up
 */

/**
 * Global Test Configuration
 */

beforeAll(function (done) {
  app.on("Connected To Database", function () {
    done();
  });
}, 90000);

beforeEach(async () => {
  await User.deleteMany({});
  await Todo.deleteMany({});
}, 30000);
afterEach(async () => {
  await User.deleteMany({});
  await Todo.deleteMany({});
}, 30000);

afterAll(async () => {
  await User.deleteMany({});
  await Todo.deleteMany({});
  await mongoose.disconnect();
  await dbShutDown();
});

/**
 * Supertest and Jest enabled API Endpoint Tests
 */

describe("Create A User", () => {
  test("does not exist", async () => {
    /**
     * Is it possible to create a new user account with
     * an email address and password.
     */
    expect.assertions(1);
    const resultFromSignup = await request(app).post("/auth/signup").send({
      email: "user_does_not_exist@todo.com",
      password: "securePa55word",
    });
    expect(resultFromSignup.statusCode).toBe(201);
  });

  test("does exist", async () => {
    /**
     * A 409 response is returned when attempting to create
     * an account with an email that already exists
     */
    expect.assertions(1);
    await request(app).post("/auth/signup").send({
      email: "user_does_not_exist@todo.com",
      password: "securePa55word",
    });
    const resultFromSecondSignup = await request(app)
      .post("/auth/signup")
      .send({
        email: "user_does_not_exist@todo.com",
        password: "securePa55word",
      });
    expect(resultFromSecondSignup.statusCode).toBe(409);
  });

  test("invalid email and password", async () => {
    /**
     * 422 response is returned when attempting to create an
     * account with an invalid email and a password less than
     * 5 characters long
     */
    expect.assertions(1);
    const resultFromSignup = await request(app).post("/auth/signup").send({
      email: "test_invalid_email.test.com",
      password: "sec",
    });
    expect(resultFromSignup.statusCode).toBe(422);
  });
});

describe("Login User", () => {
  test("does exist", async () => {
    /**
     * Is it possible to login a user with an email address and password
     * that has created an account. And, receive a JSON Web Token.
     */
    expect.assertions(2);
    const resultFromSignup = await request(app).post("/auth/signup").send({
      email: "emma@jane.com",
      password: "securePa55word",
    });
    expect(resultFromSignup.statusCode).toBe(201);

    const resultFromLogin = await request(app).post("/auth/login").send({
      email: "emma@jane.com",
      password: "securePa55word",
    });
    expect(resultFromLogin.status).toBe(200);
  });

  test("does not exist", async () => {
    expect.assertions(1);
    const resultFromLogin = await request(app).post("/auth/login").send({
      email: "doesnotexist@test.com",
      password: "securePa55word",
    });
    expect(resultFromLogin.statusCode).toBe(422);
  });

  test("confirm user identity from jwt", async () => {
    /**
     * It is possible to retrieve the logged in user's email address
     * with a JSON web token at the /guarded endpoint.
     */
    const user = {
      email: "emma@jane.com",
      password: "securePa55word",
    };
    expect.assertions(2);
    const resultFromSignup = await request(app).post("/auth/signup").send(user);
    expect(resultFromSignup.statusCode).toBe(201);

    const resultFromLogin = await request(app).post("/auth/login").send(user);
    expect(resultFromLogin.status).toBe(200);
  });

  test("confirm user identity without jwt", async () => {
    /**
     * A 401 response is returned when attempting to retrieve
     * current user without passing jwt.
     */
    await request(app).get("/auth/guarded").expect(401);
  });

  test("invalid credentials", async () => {
    /**
     * A 401 response is returned when logging in with incorrect
     * password
     */
    expect.assertions(2);
    const resultFromSignup = await request(app).post("/auth/signup").send({
      email: "emma@jane.com",
      password: "securePa55word",
    });
    expect(resultFromSignup.statusCode).toBe(201);

    const resultFromLogin = await request(app).post("/auth/login").send({
      email: "emma@jane.com",
      password: "Not5ecurePa55word",
    });
    expect(resultFromLogin.statusCode).toBe(401);
  });
});

/*
  Todo Endpoint Tests
*/
describe("Create A Todo", () => {
  beforeEach(async () => {
    await new User(userOne).save();
  }, 10000);

  test("new todo", async () => {
    /*
     * It is possible to create a new Todo and return the ID for that todo.
     */
    expect.assertions(1);
    const resultFromCreateTodo = await request(app)
      .post("/todo")
      .set("Authorization", `Bearer ${userOne.token}`)
      .send({
        todo: "Create Test Todo",
      });
    expect(resultFromCreateTodo.statusCode).toBe(200);
  });
}); // End of Describe Block

describe("Get A Todo", () => {
  beforeEach(async () => {
    await new User(userOne).save();
  }, 10000);

  test("exists", async () => {
    /*
     * Is it possible to retrieve a single todo with a valid given ObjectId
     */
    expect.assertions(1);
    const resultsFromCreateTodo = await request(app)
      .post("/todo")
      .set("Authorization", `Bearer ${userOne.token}`)
      .send({
        todo: "Create First Todo",
      });
    const resultFromGetTodo = await request(app)
      .get(`/todo/${resultsFromCreateTodo._body._id}`)
      .set("Authorization", `Bearer ${userOne.token}`);
    expect(resultFromGetTodo.statusCode).toBe(200);
  });

  test("does not exist", async () => {
    /*
     * A 404 error is returned when attempting to retrieve a todo
     * that does not exist
     */
    expect.assertions(1);
    const todoIdDoesNotExist = mongoose.Types.ObjectId();
    const resultsFromGetTodo = await request(app)
      .get(`/todo/${todoIdDoesNotExist}`)
      .set("Authorization", `Bearer ${userOne.token}`);
    expect(resultsFromGetTodo.statusCode).toBe(404);
  });
}); // End of Describe Block

describe("Get All Todos", () => {
  beforeEach(async () => {
    await new User(userOne).save();
  }, 10000);

  test("todos exists", async () => {
    /*
     * It is possible to retrieve all todos for a user
     */
    expect.assertions(1);
    await request(app)
      .post("/todo")
      .set("Authorization", `Bearer ${userOne.token}`)
      .send({
        todo: "Create First Todo",
      });
    await request(app)
      .post("/todo")
      .set("Authorization", `Bearer ${userOne.token}`)
      .send({
        todo: "Create Second Todo",
      });
    const resultFromGetAllTodos = await request(app)
      .get("/todo")
      .set("Authorization", `Bearer ${userOne.token}`);
    expect(resultFromGetAllTodos.statusCode).toBe(200);
  });

  test("todos do not exist", async () => {
    /*
     * An empty array is returned for a user if no todo items exist
     */
    expect.assertions(2);
    const expectedData = [];
    const resultFromGetAllTodos = await request(app)
      .get("/todo")
      .set("Authorization", `Bearer ${userOne.token}`);
    const returnedData = resultFromGetAllTodos._body;
    expect(resultFromGetAllTodos.statusCode).toBe(200);
    expect(expectedData).toEqual(expect.arrayContaining(returnedData));
  });
}); // End of Describe Block

describe("Modify A Todo", () => {
  beforeEach(async () => {
    await new User(userOne).save();
  }, 10000);

  test("exists", async () => {
    /*
     * Is it possible to modify a todo with a valid given ObjectId
     */
    expect.assertions(1);
    const resultsFromCreateTodo = await request(app)
      .post("/todo")
      .set("Authorization", `Bearer ${userOne.token}`)
      .send({
        todo: "Create First Todo",
      });
    const resultsFromModifyTodo = await request(app)
      .patch(`/todo/${resultsFromCreateTodo._body._id}`)
      .set("Authorization", `Bearer ${userOne.token}`)
      .send({
        todo: "Modify First Todo",
      });
    expect(resultsFromModifyTodo.statusCode).toBe(200);
  });

  test("does not exist", async () => {
    /*
     * A 404 error is returned when attempting to modify a todo
     * that does not exist
     */
    expect.assertions(1);
    const todoIdDoesNotExist = mongoose.Types.ObjectId();
    const resultsFromModifyTodo = await request(app)
      .patch(`/todo/${todoIdDoesNotExist}`)
      .send({ todo: "Todo does not exist" })
      .set("Authorization", `Bearer ${userOne.token}`);
    expect(resultsFromModifyTodo.statusCode).toBe(404);
  });
}); // End of Describe Block

describe("Delete A Todo", () => {
  beforeEach(async () => {
    await new User(userOne).save();
  }, 10000);
  test("exists", async () => {
    /*
     * Is it possible to delete a single todo with a valid given ObjectId
     */
    expect.assertions(1);
    const resultsFromCreateTodo = await request(app)
      .post("/todo")
      .set("Authorization", `Bearer ${userOne.token}`)
      .send({
        todo: "Create First Todo",
      });
    const resultFromDeleteTodo = await request(app)
      .delete(`/todo/${resultsFromCreateTodo._body._id}`)
      .set("Authorization", `Bearer ${userOne.token}`);
    expect(resultFromDeleteTodo.statusCode).toBe(200);
  });

  test("does not exist", async () => {
    /*
     * A 404 error is returned when attempting to delete a todo
     * that does not exist
     */
    expect.assertions(1);
    const todoIdDoesNotExist = mongoose.Types.ObjectId();
    const resultsFromDeleteTodo = await request(app)
      .delete(`/todo/${todoIdDoesNotExist}`)
      .set("Authorization", `Bearer ${userOne.token}`);
    expect(resultsFromDeleteTodo.statusCode).toBe(404);
  });
}); // End of Describe Block

describe("Ownership of todos", () => {
  beforeEach(async () => {
    await new User(userOne).save();
    await new User(userTwo).save();
  }, 10000);

  test("does not retrieve other user's todo", async () => {
    /**
     * A 403 response is returned when attempting to retrieve a todo
     * that the user does not own.
     */
    expect.assertions(1);
    const resultsFromCreateUserOneTodo = await request(app)
      .post("/todo")
      .set("Authorization", `Bearer ${userOne.token}`)
      .send({
        todo: "Create Test Todo",
      });

    const userOneTodoId = resultsFromCreateUserOneTodo._body._id;
    const resultsFromGetUserOneTodoWithUserTwoCreds = await request(app)
      .get(`/todo/${userOneTodoId}`)
      .set("Authorization", `Bearer ${userTwo.token}`);

    expect(resultsFromGetUserOneTodoWithUserTwoCreds.statusCode).toBe(403);
  });

  test("does not modify other user's todo", async () => {
    /**
     * A 403 response is returned when attempting to modify a todo
     * that the user does not own.
     */
    expect.assertions(1);
    const resultsFromCreateUserOneTodo = await request(app)
      .post("/todo")
      .set("Authorization", `Bearer ${userOne.token}`)
      .send({
        todo: "Create Test Todo",
      });

    const userOneTodoId = resultsFromCreateUserOneTodo._body._id;

    const resultsFromGetUserOneTodoWithUserTwoCreds = await request(app)
      .patch(`/todo/${userOneTodoId}`)
      .set("Authorization", `Bearer ${userTwo.token}`)
      .send({ todo: "Update User One Todo" });

    expect(resultsFromGetUserOneTodoWithUserTwoCreds.statusCode).toBe(403);
  });

  test("does not delete other user's todo", async () => {
    /**
     * A 403 response is returned when attempting to delete a todo
     * that the user does not own.
     */
    expect.assertions(1);
    const resultsFromCreateUserOneTodo = await request(app)
      .post("/todo")
      .set("Authorization", `Bearer ${userOne.token}`)
      .send({
        todo: "Create Test Todo",
      });

    const userOneTodoId = resultsFromCreateUserOneTodo._body._id;

    const resultsFromGetUserOneTodoWithUserTwoCreds = await request(app)
      .delete(`/todo/${userOneTodoId}`)
      .set("Authorization", `Bearer ${userTwo.token}`);

    expect(resultsFromGetUserOneTodoWithUserTwoCreds.statusCode).toBe(403);
  });
}); // End of Describe Block
