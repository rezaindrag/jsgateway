const express = require("express");
const fs = require("fs");

const app = require("./app");

const server = express();

const file = fs.readFileSync("./config.json");
const config = JSON.parse(file);

app.init(server, config);

server.listen(config.server.port, function(err) {
  if (err) throw err;
  console.log("Server is running");
});
