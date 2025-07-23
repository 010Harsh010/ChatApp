const mongoose = require("mongoose");

const roomSchema = new mongoose.Schema({
    type:{
        type:String,
        enum:["chat","video","audio","group"],
        require: true
    },
    people:[
        {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
        }
    ],
    message:[
        {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Message",
        }
    ]
},{
    timestamps: true
});

const Room = mongoose.model("Room",roomSchema);
module.exports = Room;