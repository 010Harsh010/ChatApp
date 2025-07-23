const mongoose = require("mongoose");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");

const UserSchema = new mongoose.Schema(
  {
    fullname: {
      type: String,
      required: [true, "Please provide"],
    },
    username: {
      type: String,
      required: [true, "Please provide your name"],
      unique: true,
    },
    email: {
      type: String,
      required: [true, "Please provide your email"],
      unique: true,
    },
    password: {
      type: String,
      select: false,
      required: [true, "Please provide a password"],
    },
    banner: {
      type: String,
      default:
        "https://res.cloudinary.com/devatchannel/image/upload/v1602752402/avatar/avatar_cugq40.png",
    },
    avatar: {
      type: String,
      default:
        "https://res.cloudinary.com/devatchannel/image/upload/v1602752402/avatar/avatar_cugq40.png",
    },
    connections: [
      {
        friend: { type: mongoose.Schema.Types.ObjectId, ref: "User" ,},
        muted: { type: Boolean, default: false },
        Room: { type: mongoose.Schema.Types.ObjectId, ref: "Room" }
      }
    ],    
    description: {
      type: String,
      default: "",
    },
    lastSeen: {
      type: Date,
      default: Date.now,
    },
    gallery: [
      {
        type: String,
      },
    ],
    accessToken: {
      type: String,
    },
    refreshToken: {
      type: String,
    },
    notification: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Message",
      },
    ],
  },
  {
    timestamps: true,
  }
);

UserSchema.pre("save", async function (next) {
  if (!this.isModified("password")) {
    next();
  }
  const hashedPassword = await bcrypt.hash(this.password, 10);
  this.password = hashedPassword;
  next();
});
UserSchema.methods.comparePassword = async function (password) {
  const user = this;
  return bcrypt.compare(password, user.password);
};
UserSchema.methods.generateToken = function () {
  const token = jwt.sign({ id: this._id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRE,
  });
  this.accessToken = token;
  return token;
};
UserSchema.methods.generaterefreshToken = function () {
  const token = jwt.sign({ id: this._id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_REFRESH_EXPIRE,
  });
  this.refreshToken = token;
  return token;
};

const User = mongoose.model("User", UserSchema);
module.exports = User;
