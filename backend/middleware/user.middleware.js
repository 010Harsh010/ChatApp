const User = require("../model/User.model");
const jwt = require("jsonwebtoken");

exports.authUser = async (req, res, next) => {
  try {
    const token = req?.cookies?.accessToken || req?.header("Authorization")?.split(" ")[1];
    if (!token) {
      return res.status(401).json({ message: "Unauthorized" });
    }
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findById(decoded.id).select("-password");
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }
    req.user = user;
    next();
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: error.message });
  }
};
