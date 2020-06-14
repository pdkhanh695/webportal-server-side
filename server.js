// Import express we alredy installed
const express = require("express");

// Require variable execute => with config method available for this packaged
require("dotenv").config();

//Seting up express server => available in App variable
// express server
const app = express();

//rest endpoint
app.get(
  "/rest",
  /*call back function*/ function (req, res) {
    // the endpoint is /rest
    res.json({
      data: "you hit rest endpoint great + ${req}",
    });
  }
);

//port
app.listen(process.env.PORT, function () {
  console.log(`server is ready at http://localhost:${process.env.PORT}`);
});
