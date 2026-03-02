const http = require("http");
const eio = require("engine.io");
const express = require("express");
const helmet = require("helmet");
const fileUpload = require("express-fileupload");
const cors = require("cors");
const bodyParser = require("body-parser");
const {app: config, version} = require("./config");
const logger = require("./backend/logger");
const router = require("./backend/router");
const apiRouter = require("./backend/api/");
const updateDatabase = require("./scripts/update_database");
require("./backend/data-watch");

const app = express();

// Middlewares
app.use(helmet({
  contentSecurityPolicy: false,
  crossOriginEmbedderPolicy: false
}));
app.use(bodyParser.json()); // for parsing application/json
app.use(cors());
app.use(fileUpload());

// Routing
app.use(express.static("built"));
app.use("/api", apiRouter);

// Load custom sets from sets/ directory on startup
updateDatabase();

// Create server
const server = http.createServer(app);
const io = new eio.attach(server);
io.on("connection", router);

server.listen(config.PORT);
logger.info(`Started up on port ${config.PORT} with version ${version}`);
