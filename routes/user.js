const express = require("express");
const User = require("../models/user");
const passport = require("passport");
const { saveRedirectUrl } = require("../middleware");
const userController = require("../controllers/users");
const router = express.Router();


router.route("/signup")
.get( userController.SignUpForm)
.post(userController.SaveUser);


router.route("/login")
.get(userController.LoginForm)
.post(
  saveRedirectUrl,
  passport.authenticate("local", {
    failureRedirect: "/login",
    failureFlash: true,
  }),
  userController.Login
);

//logout route
router.get("/logout", userController.LogOut);

//eporting these routes
module.exports = router;
