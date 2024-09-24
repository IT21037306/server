import passport from "passport";
import { Strategy as GoogleStrategy } from "passport-google-oauth2";
import express, { Router } from "express";
import session from "express-session";

const app = express();
const router = Router();

// Configure session middleware
app.use(
  session({
    secret: process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized: true,
    cookie: { secure: false }, // Set to true if using HTTPS
  })
);

// Initialize Passport and restore authentication state, if any, from the session
app.use(passport.initialize());
app.use(passport.session());

// Configure Google OAuth2 strategy
passport.use(
  new GoogleStrategy(
    {
      clientID: process.env.CLIENT_ID,
      clientSecret: process.env.CLIENT_SECRET,
      callbackURL: process.env.CALLBACK_URL,
      passReqToCallback: true,
    },
    (request, accessToken, refreshToken, profile, done) => {
      console.log(profile);
      // This function will be called when the user is authenticated successfully
      // You can perform any necessary actions here, such as saving the user to the database
      // The user's profile information can be accessed via the `profile` parameter
      // Call `done()` to indicate that the authentication process is complete
      profile.token = accessToken;
      profile.type = "user";
      console.log(accessToken);

      done(null, profile);
    }
  )
);

// Serialize user object to store in session
passport.serializeUser((user, done) => {
  done(null, user);
});

// Deserialize user object from session
passport.deserializeUser((user, done) => {
  done(null, user);
});

// Middleware to check if the user is authenticated
function isAuthenticated(req, res, next) {
  if (req.isAuthenticated()) {
    return next();
  }
  res.redirect("/login");
}

// Example protected route that requires authentication
router.get("/profile", isAuthenticated, (req, res) => {
  res.send("Welcome to your profile!");
});

router.get("/login/failed", (req, res) => {
  res.status(401).json({
    success: false,
    message: "User failed to authenticate.",
  });
});

router.get("/login/success", (req, res) => {
  if (req.user) {
    res.status(200).json({
      success: true,
      message: "User has successfully authenticated.",
      user: req.user,
      token: req.user.token,
      //cookies: req.cookies,
    });
  }
});

router.get("/logout", (req, res) => {
  req.logout();
  res.redirect("http://localhost:3030/login");
});

export default router;
