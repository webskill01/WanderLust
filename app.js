if (process.env.NODE_ENV !== "production") {
  require("dotenv").config({ quiet: true });
}
const express = require("express");
const app = express();
const path = require("path");
const mongoose = require("mongoose");
const methodOverride = require("method-override");
const ejsMate = require("ejs-mate");
const expressError = require("./utils/expressError.js");
const session = require("express-session");
const MongoStore = require('connect-mongo');
const flash = require("connect-flash")
const passport = require("passport")
const LocalStrategy = require("passport-local")
const GoogleStrategy = require("passport-google-oauth20").Strategy;
const User = require("./models/user.js");
const dbUrl = process.env.ATLASDB_URL;
const MongoUrl = "mongodb://127.0.0.1:27017/wanderlust";


// Google OAuth strategy
passport.use(new GoogleStrategy({
  clientID: process.env.GOOGLE_CLIENT_ID,
  clientSecret: process.env.GOOGLE_CLIENT_SECRET,
  callbackURL: "/auth/google/callback"
}, async (accessToken, refreshToken, profile, done) => {
  try {
    let user = await User.findOne({ googleId: profile.id });
    if (!user) {
      user = await User.create({
        googleId: profile.id,
        email: profile.emails[0].value,
        username: profile.displayName,
      });
    }
    return done(null, user);
  } catch (err) {
    return done(err, null);
  }
}));

passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());


//mongodb
const store = MongoStore.create({ 
  mongoUrl:dbUrl,
  crypto:{
    secret: process.env.SECRET,
  },
  touchAfter: 24*3600,
 })
store.on("error",()=>{
  console.log("ERROR in MONGODB SESSION STORE",err)
})

const sessionOptions = {
  store :store,
  secret: process.env.SECRET,
  resave: false,
  saveUninitialized: true,
  cookie: {
    expires: Date.now() + 7 * 24 * 60 * 60 * 1000,
    maxAge: 7 * 24 * 60 * 60 * 1000,
    httpOnly: true,
  },
};

//requiring the routing files
const listingRouter = require("./routes/listing.js");
const reviewRouter = require("./routes/review.js");
const userRouter = require("./routes/user.js");
const { error } = require('console');

app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(express.static(path.join(__dirname, "public")));
app.use(methodOverride("_method"));

app.engine("ejs", ejsMate);
app.set("views", path.join(__dirname, "views"));
app.set("view engine", "ejs");

app.use(session(sessionOptions));
app.use(flash());

app.use(passport.initialize());
app.use(passport.session());
passport.use(new LocalStrategy(User.authenticate()));

passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

//connecting to databae
async function main() {
  await mongoose.connect(dbUrl);
}
//accessing database throug mongoose
main()
  .then((res) => {
    console.log("connection succesfull");
  })
  .catch((err) => console.log(err));

  
  app.use((req,res,next)=>{
    res.locals.success = req.flash("success")
    res.locals.error = req.flash("error")
    res.locals.currUser = req.user;
    next();
  })

//accessing both the router files
app.use("/listings", listingRouter);
app.use("/listings/:id/reviews", reviewRouter);
app.use("/", userRouter);


app.get("/",(req,res)=>{
  res.redirect("/listings")
})
app.get("/policy",(req,res)=>{
  res.render("additional/policy.ejs")
})
app.get("/terms",(req,res)=>{
  res.render("additional/terms.ejs")
})

//error handling for all non-existent pages
app.all(/.*/, (req, res, next) => {
  console.log("⚠️  404 caught for:", req.originalUrl);
  next(new expressError(404, "page not found"));
});



//error handling middleware
app.use((err, req, res, next) => {
  console.error("UNHANDLED ERROR:", err.message);
  let { statuscode = 500, message = "Something went wrong" } = err;

  // Check for form submission (POST or PUT)
  if (["POST", "PUT"].includes(req.method)) {
    req.flash("error", message);

    // Use referer (form page URL) to go back to original page
    const redirectBackTo = req.headers.referer || "/listings";
    return res.redirect(redirectBackTo);
  }

  // Default error page
  res.status(statuscode).render("error.ejs", { message });
});


//listening to port
app.listen(3000, () => {
  console.log(`Listening for port 3000`);
});
