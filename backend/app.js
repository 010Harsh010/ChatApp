const express = require("express");
const app = express();
const cors = require("cors");
const cookieParser = require("cookie-parser");

const corsOptions = {
  origin: function (origin, cb) {
    if (!origin || process.env.ALLOWED_ORIGINS.split(",").includes(origin)) {
      cb(null, true);
    } else {
      cb(new Error("Not allowed by CORS"));
    }
  },
  credentials: true,
};

app.use(cors(corsOptions));
app.use(cookieParser());
app.use(express.static("public"));
app.use(
  express.json({
    limit: "100mb",
  })
);

app.use(express.urlencoded({ extended: true, limit: "10mb" }));

const userRouter = require("./routes/User.routes.js");
app.use("/user", userRouter);



module.exports = app;
