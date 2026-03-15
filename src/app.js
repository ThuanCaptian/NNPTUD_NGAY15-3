const express = require("express");
const morgan = require("morgan");
const userRoutes = require("./routes/user.routes");
const roleRoutes = require("./routes/role.routes");
const { enableUser, disableUser } = require("./controllers/user.controller");

const app = express();

app.use(express.json());
app.use(morgan("dev"));

app.get("/", (_req, res) => {
  res.json({ message: "User/Role API is running" });
});

app.post("/enable", enableUser);
app.post("/disable", disableUser);
app.use("/users", userRoutes);
app.use("/roles", roleRoutes);

app.use((req, res) => {
  res.status(404).json({ message: `Route not found: ${req.originalUrl}` });
});

module.exports = app;
