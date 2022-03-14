/**
 * Import Express App &
 * enabling Port listening. This has been configured
 * to enable the usage of Supertest test suite.
 */

const app = require("./init");
require("dotenv").config();

const PORT = process.env.PORT;

app.listen(PORT || 8080);
