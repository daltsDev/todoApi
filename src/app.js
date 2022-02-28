const app = require("./init");
require("dotenv").config();

const PORT = process.env.PORT;

app.listen(PORT || 8080);
