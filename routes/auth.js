const express = require("express");
const router = express.Router();
const User = require("../models/User");
const { body, validationResult } = require("express-validator");
const bcrypt = require("bcryptjs");
var jwt = require("jsonwebtoken");
const fetchUser = require("../middleware/fetchUser");
require("dotenv").config();

const JWT_SECRET = process.env.JWT_SECRET;

// ROUTE 1 : create a user using: POST : http://localhost:5000/api/auth/createuser. No login required
router.post(
  "/createuser",
  [
    body("name", "Enter a valid name").isLength({ min: 3 }),
    body("email", "Enter a valid email").isEmail(),
    body("password", "Password must be at least 5 characters").isLength({
      min: 5,
    }),
  ],
  async (req, res) => {
    let success = false;

    try {
      //if there are errors return them
      const errors = validationResult(req);

      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }

      //check whether the user with this email exists already
      let user = await User.findOne({ email: req.body.email });
      if (user) {
        return res.status(400).send("User already exixts");
      }

      const salt = await bcrypt.genSalt(10);
      secPass = await bcrypt.hash(req.body.password, salt);

      //create a new user
      user = await User.create({
        name: req.body.name,
        email: req.body.email,
        password: secPass,
      });

      const data = {
        user: {
          id: user.id,
        },
      };
      const authToken = jwt.sign(data, JWT_SECRET);

      //res.json(user);
      success = true;
      res.json({ success, authToken });
    } catch (error) {
      console.error(error.message);
      res.status(500).send("Internal Server Error");
    }

    // .then(user => res.json(user))
    // .catch(err => {
    //     console.error(err);
    //     res.status(500).send("Internal Server Error");
    // });
  },
);

// ROUTE 2 : login a user using: POST : http://localhost:5000/api/auth/login. No login required
router.post(
  "/login",
  [
    body("email", "Enter a valid email").isEmail(),
    body("password", "Password cannot be blank").exists(),
  ],
  async (req, res) => {
    let success = false;

    //if there are errors return them
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { email, password } = req.body;
    try {
      let user = await User.findOne({ email });
      //user doesnt exist
      if (!user) {
        return res
          .status(400)
          .json({ success, err: "Pls try to login with correct credentials." });
      }

      // if password doesnt match
      const passwordCompare = await bcrypt.compare(password, user.password);
      if (!passwordCompare) {
        return res
          .status(400)
          .json({ success, err: "Pls try to login with correct credentials." });
      }

      const data = {
        user: {
          id: user.id,
        },
      };
      const authToken = jwt.sign(data, JWT_SECRET);
      success = true;
      res.json({ success, authToken });
    } catch (error) {
      console.error(error.message);
      res.status(500).send("Internal Server Error");
    }
  },
);

// ROUTE 3 : get logged in user details : GET : http://localhost:5000/api/auth/getuser. Login required
router.post("/getuser", fetchUser, async (req, res) => {
  //Fetching the user
  try {
    userId = req.user.id;
    const user = await User.findById(userId).select("-password");
    res.send(user);
  } catch (error) {
    console.error(error.message);
    res.status(500).send("Internal Server Error");
  }
});

module.exports = router;
