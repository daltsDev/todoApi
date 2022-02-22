/*
 Tests for Node Todo API.
*/
const request = require("supertest");
const app = require("../init");

/*
 Test One - Create a new user
*/
test("Should Sign Up A New User", async () => {
  await request(app)
    .post("/auth/signup")
    .send({
      email: "emma@jane.com",
      password: "password",
    })
    .expect(201);
});
