import express from "express";
import cors from "cors";
import "dotenv/config";
import userRouter from "./routes/User.route.js";
import adminRouter from "./routes/Admin.route.js";
import membershipRouter from "./routes/Membership.route.js";
import trainerRouter from "./routes/Trainer.route.js";
import trainerAppRouter from "./routes/TrainerApp.route.js";
import reviewRouter from "./routes/Review.route.js";
import productRouter from "./routes/Product.route.js";
import cartRouter from "./routes/Cart.route.js";
import sessionRouter from "./routes/Session.route.js";
import attendanceRouter from "./routes/Attendance.route.js";
import paymentRouter from "./routes/Payment.route.js";
import financeRouter from "./routes/Finance.route.js";
import uploadImage from "./uploadImage.js";
import session from "express-session";
import router from "./OAuth.js";
import passport from "passport";
import helmet from "helmet";
import csurf from "csurf";

const app = express();

app.disable("x-powered-by"); //Disable X-Powered-By header

app.use(helmet());

const allowedOrigins = ["http://localhost:3030"];

app.use(
  cors({
    origin: function (origin, callback) {
      if (!origin || allowedOrigins.indexOf(origin) !== -1) {
        callback(null, true);
      } else {
        callback(new Error("Not allowed by CORS"));
      }
    },
    credentials: true,
    methods: ["GET", "POST", "PATCH", "DELETE"],
  })
);

app.use(
  helmet.contentSecurityPolicy({
    directives: {
      defaultSrc: ["'self'"],
      scriptSrc: ["'self'", "http://localhost:3030"],
      styleSrc: ["'self'"],
      imgSrc: ["'self'", "data:", "http://localhost:3030"],
      connectSrc: ["'self'", "http://localhost:3030"],
      fontSrc: ["'self'", "http://localhost:3030"],
      objectSrc: ["'none'"],
      frameSrc: ["'none'"],
      upgradeInsecureRequests: [],
      baseUri: ["'self'"],
      formAction: ["'self'"],
      frameAncestors: ["'self'"],
      scriptSrcAttr: ["'none'"],
    },
  })
);

app.use(express.json({ limit: "20mb" }));

app.get("/", (req, res) => {
  res.send("Server is Running! 🚀");
});

// Configure session middleware
app.use(
  session({
    secret: process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized: true,
    cookie: { secure: false, httpOnly: true, sameSite: "strict" },
  })
);

// Initialize Passport and restore authentication state, if any, from the session
app.use(passport.initialize());
app.use(passport.session());

// Express route for initiating Google OAuth2 authentication
app.get(
  "/auth/google",
  passport.authenticate("google", { scope: ["profile", "email"] })
);

// Express route for handling the callback from Google OAuth2
app.get(
  "/auth/google/callback",
  passport.authenticate("google", {
    successRedirect: "http://localhost:3030/auth/google/callback",
    failureRedirect: "http://localhost:3030/login",
  })
);

//User and Membership Management
app.use("/user", userRouter);
app.use("/admin", adminRouter);
app.use("/membership", membershipRouter);
app.use("/auth", router);

//Trainer Management
app.use("/trainer", trainerRouter);
app.use("/trainer/applicant", trainerAppRouter);

//Customer Relationship Management
app.use("/review", reviewRouter);

//Product Management
app.use("/product", productRouter);
app.use("/cart", cartRouter);

//Personal Training Management
app.use("/session", sessionRouter);
app.use("/attendance", attendanceRouter);

//Payment Management
app.use("/payment", paymentRouter);

//Finance Management
app.use("/finance", financeRouter);

//Upload Image
app.post("/uploadImage", (req, res) => {
  uploadImage(req.body.image)
    .then((url) => {
      res.send(url);
    })
    .catch((err) => {
      console.error(err);
      res.status(500).send("An unexpected error occurred.");
    });
});

export default app;
