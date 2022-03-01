/*
 Tests for Node Todo API.
*/
const request = require("supertest");
const app = require("../src/todoApi/init");
const mongoose = require("mongoose");
const jwt = require("jsonwebtoken");
const User = require("../src/todoApi/models/user");
const Todo = require("../src/todoApi/models/todo");
const { dbShutDown } = require("../src/todoApi/db/db");
/*
 Test Users For Todo Endpoint Tests
*/
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

// Globals
beforeEach(async () => {
  await User.deleteMany({});
  await Todo.deleteMany({});
}, 10000);
afterEach(async () => {
  await User.deleteMany({});
  await Todo.deleteMany({});
}, 10000);
/**
 * Todo Authentication Tests
 */

describe("Create A User", () => {
  test("does not exist", async () => {
    /**
     * Is it possible to create a new user account with
     * an email address and password.
     */
    expect.assertions(4);
    const resultFromSignup = await request(app).post("/auth/signup").send({
      email: "user_does_not_exist@todo.com",
      password: "securePa55word",
    });
    expect(resultFromSignup.statusCode).toBe(201);
    expect(resultFromSignup._body.message).toBe("Successfully Signed Up");
    expect(resultFromSignup._body).toHaveProperty("_id");
    expect(
      mongoose.mongo.ObjectId.isValid(resultFromSignup._body._id)
    ).toBeTruthy();
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
    expect.assertions(4);
    const resultFromSignup = await request(app).post("/auth/signup").send({
      email: "test_invalid_email.test.com",
      password: "sec",
    });
    expect(resultFromSignup.statusCode).toBe(422);
    expect(resultFromSignup._body.message).toBe(
      "Validation Failed. Entered Incorrect Value"
    );
    expect(resultFromSignup._body.data[0].msg).toBe(
      "Please Enter a valid email"
    );
    expect(resultFromSignup._body.data[1].msg).toBe(
      "Password needs to be minimum 5 characters long"
    );
  });
});

describe("Login User", () => {
  test("does exist", async () => {
    /**
     * Is it possible to login a user with an email address and password
     * that has created an account. And, receive a JSON Web Token.
     */
    expect.assertions(6);
    const resultFromSignup = await request(app).post("/auth/signup").send({
      email: "emma@jane.com",
      password: "securePa55word",
    });
    expect(resultFromSignup.statusCode).toBe(201);
    expect(resultFromSignup._body.message).toBe("Successfully Signed Up");
    expect(resultFromSignup._body).toHaveProperty("_id");
    expect(
      mongoose.mongo.ObjectId.isValid(resultFromSignup._body._id)
    ).toBeTruthy();
    const resultFromLogin = await request(app).post("/auth/login").send({
      email: "emma@jane.com",
      password: "securePa55word",
    });
    expect(resultFromLogin._body.accessToken).toMatch(
      // JWT REGEX
      /^([a-zA-Z0-9_=]+)\.([a-zA-Z0-9_=]+)\.([a-zA-Z0-9_\-+/=]*)/
    );
    expect(resultFromLogin.status).toBe(200);
  });

  test("does not exist", async () => {
    expect.assertions(2);
    const resultFromLogin = await request(app).post("/auth/login").send({
      email: "doesnotexist@test.com",
      password: "securePa55word",
    });
    expect(resultFromLogin.statusCode).toBe(422);
    expect(resultFromLogin._body.data[0].msg).toBe(
      "Account Does Not Exist. Please Create An Account."
    );
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
    expect.assertions(9);
    const resultFromSignup = await request(app).post("/auth/signup").send(user);
    expect(resultFromSignup.statusCode).toBe(201);
    expect(resultFromSignup._body.message).toBe("Successfully Signed Up");
    expect(resultFromSignup._body).toHaveProperty("_id");
    expect(
      mongoose.mongo.ObjectId.isValid(resultFromSignup._body._id)
    ).toBeTruthy();
    const resultFromLogin = await request(app).post("/auth/login").send(user);
    expect(resultFromLogin._body.accessToken).toMatch(
      // JWT REGEX
      /^([a-zA-Z0-9_=]+)\.([a-zA-Z0-9_=]+)\.([a-zA-Z0-9_\-+/=]*)/
    );
    expect(resultFromLogin.status).toBe(200);
    const resultFromUserCall = await request(app)
      .get("/auth/guarded")
      .set("Authorization", `Bearer ${resultFromLogin._body.accessToken}`);
    expect(resultFromUserCall.statusCode).toBe(200);
    expect(resultFromUserCall._body).toHaveProperty("loggedInAs");
    expect(resultFromUserCall._body.loggedInAs).toMatch(user.email);
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
    expect.assertions(6);
    const resultFromSignup = await request(app).post("/auth/signup").send({
      email: "emma@jane.com",
      password: "securePa55word",
    });
    expect(resultFromSignup.statusCode).toBe(201);
    expect(resultFromSignup._body.message).toBe("Successfully Signed Up");
    expect(resultFromSignup._body).toHaveProperty("_id");
    expect(
      mongoose.mongo.ObjectId.isValid(resultFromSignup._body._id)
    ).toBeTruthy();
    const resultFromLogin = await request(app).post("/auth/login").send({
      email: "emma@jane.com",
      password: "Not5ecurePa55word",
    });
    expect(resultFromLogin._body.message).toBe("Incorrect Email or Password!");
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
    expect.assertions(3);
    const resultFromCreateTodo = await request(app)
      .post("/todo")
      .set("Authorization", `Bearer ${userOne.token}`)
      .send({
        todo: "Create Test Todo",
      });
    expect(resultFromCreateTodo.statusCode).toBe(200);
    expect(resultFromCreateTodo._body).toHaveProperty("todo");
    expect(
      mongoose.mongo.ObjectId.isValid(resultFromCreateTodo._body._id)
    ).toBeTruthy();
  });
}); // End of Describe Block

describe("Get A Todo", () => {
  beforeEach(async () => {
    await User.deleteMany({});
    await new User(userOne).save();
    await Todo.deleteMany({});
  }, 10000);

  test("exists", async () => {
    /*
     * Is it possible to retrieve a single todo with a valid given ObjectId
     */
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
    expect({
      _id: resultsFromCreateTodo._body._id,
      todo: "Create First Todo",
    }).toMatchObject(resultFromGetTodo._body);
  });

  test("does not exist", async () => {
    /*
     * A 404 error is returned when attempting to retrieve a todo
     * that does not exist
     */
    const todoIdDoesNotExist = mongoose.Types.ObjectId();
    const resultsFromGetTodo = await request(app)
      .get(`/todo/${todoIdDoesNotExist}`)
      .set("Authorization", `Bearer ${userOne.token}`);
    expect(resultsFromGetTodo.statusCode).toBe(404);
    expect(resultsFromGetTodo._body.message).toBe(
      `No todo found with ID ${todoIdDoesNotExist}. Please check ID.`
    );
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
    const firstTodo = await request(app)
      .post("/todo")
      .set("Authorization", `Bearer ${userOne.token}`)
      .send({
        todo: "Create First Todo",
      });
    const secondTodo = await request(app)
      .post("/todo")
      .set("Authorization", `Bearer ${userOne.token}`)
      .send({
        todo: "Create Second Todo",
      });
    const firstPostId = firstTodo._body._id;
    const secondPostId = secondTodo._body._id;
    const resultFromGetAllTodos = await request(app)
      .get("/todo")
      .set("Authorization", `Bearer ${userOne.token}`);
    expect(resultFromGetAllTodos.statusCode).toBe(200);
    expect(resultFromGetAllTodos._body).toHaveLength(2);
    expect([
      {
        _id: firstPostId,
        todo: "Create First Todo",
      },
      {
        _id: secondPostId,
        todo: "Create Second Todo",
      },
    ]).toEqual(expect.arrayContaining(resultFromGetAllTodos._body));
  });

  test("todos do not exist", async () => {
    /*
     * An empty array is returned for a user if no todo items exist
     */
    const expectedData = [];
    const resultFromGetAllTodos = await request(app)
      .get("/todo")
      .set("Authorization", `Bearer ${userOne.token}`);
    expect(resultFromGetAllTodos.statusCode).toBe(200);
    expect(expectedData).toEqual(
      expect.arrayContaining(resultFromGetAllTodos._body)
    );
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
    expect({
      _id: resultsFromCreateTodo._body._id,
      todo: "Modify First Todo",
    }).toMatchObject(resultsFromModifyTodo._body);
  });

  test("does not exist", async () => {
    /*
     * A 404 error is returned when attempting to modify a todo
     * that does not exist
     */
    const todoIdDoesNotExist = mongoose.Types.ObjectId();
    const resultsFromModifyTodo = await request(app)
      .patch(`/todo/${todoIdDoesNotExist}`)
      .send({ todo: "Todo does not exist" })
      .set("Authorization", `Bearer ${userOne.token}`);
    expect(resultsFromModifyTodo.statusCode).toBe(404);
    expect(resultsFromModifyTodo._body.message).toBe(
      `No todo found with ID ${todoIdDoesNotExist}. Please check ID.`
    );
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
    expect(resultFromDeleteTodo._body.message).toBe(
      "Successfully Deleted Todo"
    );
  });

  test("does not exist", async () => {
    /*
     * A 404 error is returned when attempting to delete a todo
     * that does not exist
     */
    const todoIdDoesNotExist = mongoose.Types.ObjectId();
    const resultsFromDeleteTodo = await request(app)
      .delete(`/todo/${todoIdDoesNotExist}`)
      .set("Authorization", `Bearer ${userOne.token}`);
    expect(resultsFromDeleteTodo.statusCode).toBe(404);
    expect(resultsFromDeleteTodo._body.message).toBe(
      `No todo found with ID ${todoIdDoesNotExist}. Please check ID.`
    );
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

afterAll(async () => {
  await User.deleteMany({});
  await Todo.deleteMany({});
  setTimeout(() => {});
  await mongoose.disconnect();
  await dbShutDown();
});
