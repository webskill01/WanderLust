const express = require("express");
const User = require("../models/user");
const passport = require("passport");
const { saveRedirectUrl } = require("../middleware");
const userController = require("../controllers/users");
const router = express.Router();

// Local signup
router.route("/signup")
  .get(userController.SignUpForm)
  .post(userController.SaveUser);

// Local login
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

// Google OAuth start
router.get('/auth/google',
  passport.authenticate('google', { scope: ['profile', 'email'] })
);

// Google OAuth callback
router.get('/auth/google/callback',
  passport.authenticate('google', {
    failureRedirect: '/listings/signup',
    failureFlash: true
  }),
  (req, res) => {
    req.flash("success", "Welcome, you are logged in with Google!");
    res.redirect('/listings');
  }
);

// Logout route
router.get("/logout", userController.LogOut);

// Exporting these routes
module.exports = router;
