const User = require("../models/user");

module.exports.SignUpForm = (req, res) => {
    res.render("users/user.ejs");
  }

module.exports.SaveUser = async (req, res) => {
    try {
      let { username, email, password } = req.body;
      const newUser = new User({ email, username });
      const registeredUser = await User.register(newUser, password);
      console.log(registeredUser);
      req.login(registeredUser,(err)=>{
        if(err){
          return next(err)
        }else{
          req.flash("success", "Welcome To WanderLust");
          res.redirect("/listings");
        }
      })
    } catch (e) {
      req.flash("error", e.message);
      res.redirect("/signup");
    }
  }

module.exports.LoginForm  =(req, res) => {
    res.render("users/login.ejs");
  }

module.exports.Login = async (req, res) => {
    req.flash("success", "Welcome back to WanderLust !");
    let redirectUrl = res.locals.redirectUrl || "/listings"
    res.redirect(redirectUrl);
  }

module.exports.LogOut = (req, res, next) => {
    req.logOut((err) => {
      if (err) {
        return next(err);
      }
      req.flash("success", "You Are Logged Out");
      res.redirect("/listings");
    });
  }