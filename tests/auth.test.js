/*
 Tests for Node Todo API.
*/
const request = require("supertest");
const app = require("../init");
const mongoose = require("mongoose");
const jwt = require("jsonwebtoken");
const User = require("../models/user");

const userOneId = mongoose.Types.ObjectId();
const userOne = {
  _id: userOneId,
  email: "test@test.com",
  password: "$2a$12$aOh1kftAB.nEvwPQ99g3COIHb1ewJc2uwi.NRh06A0gsxD8IoB6d.",
  token: jwt.sign({ userId: userOneId }, process.env.JWT_SECRET_TOKEN, { expiresIn: "7 days" }),
};

/*
  Setup & Teardown
*/

beforeEach(async () => {
  await User.deleteMany({});
  await new User(userOne).save();
});

/*
Create a new user
*/
test("Should Sign Up A New User", async () => {
  await request(app)
    .post("/auth/signup")
    .send({
      email: "emma@jane.com",
      password: "securePa55word",
    })
    .expect(201);
});

/*
Login a user
*/
test("Should Login a new user", async () => {
  await request(app)
    .post("/auth/signup")
    .send({
      email: "emma@jane.com",
      password: "securePa55word",
    })
    .expect(201);
  await request(app)
    .post("/auth/login")
    .send({
      email: "emma@jane.com",
      password: "securePa55word",
    })
    .expect(200);
});

/*
Return Currently Logged In User
*/
test("Should return currently logged in user", async () => {
  await request(app)
    .post("/auth/signup")
    .send({
      email: "emma@jane.com",
      password: "securePa55word",
    })
    .expect(201);
  const resultFromLogin = await request(app)
    .post("/auth/login")
    .send({
      email: "emma@jane.com",
      password: "securePa55word",
    })
    .expect(200);
  await request(app).get("/auth/user").set("Authorization", `Bearer ${resultFromLogin._body.accessToken}`).expect(200);
});

/*
Should not Return Currently Logged In User not passing Authorizaton header
*/
test("Should not return currently logged in user not passing auth header", async () => {
  await request(app).get("/auth/user").expect(401);
});

/*
Should not Return Currently Logged In User passing Authorizaton header
*/
test("Should not return currently logged in user passing blank auth header", async () => {
  await request(app).get("/auth/user").set("Authorization", `Bearer `).expect(500);
});

/*
 Login a user who does not exist
*/
test("Should not login a user who does not exist", async () => {
  await request(app)
    .post("/auth/login")
    .send({
      email: "doesnotexist@test.com",
      password: "securePa55word",
    })
    .expect(422);
});
