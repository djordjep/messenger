const jwt = require("jsonwebtoken");
const User = require("../models/User");

function authenticateToken(req, res, next) {
  const token = req.headers["authorization"];

  if (token == null) return res.sendStatus(401);

  jwt.verify(token, process.env.JWT_SECRET, async (err, user) => {
    if (err) return res.sendStatus(403);

    let userEnt = await User.findById(user.userId);
    if (!user) {
      return res.status(404).send("User not found");
    }
    req.user = userEnt;
    next();
  });
}

module.exports = authenticateToken;
