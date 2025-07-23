const mongoose = require("mongoose");
const { Schema } = mongoose;
const messageSchema = new mongoose.Schema(
  {
    message: {
      type: String,
      required: true,
    },
    sender: {
      type: Schema.Types.ObjectId,
      ref: "User",
      require: true,
    },
    receiver: {
      type: Schema.Types.ObjectId,
      ref: "User",
      require: true,
    },
    conversation: {
      type: Schema.Types.ObjectId,
      ref: "Room",
    },
    type: {
      type: String,
      enum: ["text", "image", "video", "notification", "file","videocall","phonecall"],
      default: "text",
    },
    status: {
      type: String,
      enum: ["seen", "pending", "unseen"],
      default: "unseen",
    },
    metadata: {
      type: Object, // or use: Schema.Types.Mixed
      default: {},
    },
  },
  {
    timestamps: true,
  }
);

const Message = mongoose.model("Message", messageSchema);
module.exports = Message;
