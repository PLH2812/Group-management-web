const express = require("express");
const User = require("../../models/User");
const auth = require("../../middleware/auth").auth;
const checkStatus = require("../../middleware/checkUserStatus");

const router = express.Router();

router.post("/api/users/", async (req, res) => {
    try {
      
    } catch (error) {
      res.status(400).send(error);
    }
  });

module.exports = router;