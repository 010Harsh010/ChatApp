const express = require("express");
const router = express.Router();
const {sendFile,postImage,updateFile,updatePassword,registerUser, updateUserProfile,createUser,createVideoRoom,rejectrequest,sendMessages,isFollowing ,unfollow,userDetails,login,searchUsers,acceptUser,fetchNotification ,addUser,logout,currentUser, getConnections} = require("../controller/User.controller.js")
const {upload} = require("../middleware/multer.middleware.js");
const { authUser } = require("../middleware/user.middleware.js");

router.post("/createuser",
    upload.fields([
        {
            name: "avatar",
            maxCount: 1
        }
    ]),
    createUser);
router.post("/login", login);
router.post("/logout",authUser,logout);
router.get("/currentuser",authUser,currentUser);
router.get("/getnotification",authUser,fetchNotification);
router.post("/addUser",authUser,addUser);
router.post("/acceptUser",authUser,acceptUser);
router.get("/friends",authUser,getConnections);
router.post("/search",authUser,searchUsers);
router.post("/getUser",authUser,userDetails);
router.post("/isFollowing",authUser,isFollowing);
router.post("/unfollow",authUser,unfollow);
router.post("/rejectrequest",authUser,rejectrequest);
router.post("/sendMessages",authUser,sendMessages);
router.post("/createVideoRoom",authUser,createVideoRoom);
router.post('/register', registerUser);
router.post("/sendFile",authUser,
    upload.fields([
        {
            name:"file",
            maxCount:1
        }
    ]) 
    ,sendFile);
router.post("/updateUserProfile",authUser,updateUserProfile);
router.post("/updateFile",authUser,
    upload.fields([
        {
            name:"file",
            maxCount:1
        }
    ])
    ,updateFile);
router.post("/postImage",authUser,
    upload.fields([
        {
            name:"post",
            maxCount:1
        }
    ])
    ,postImage);
router.post("/updatePassword",authUser,updatePassword);

module.exports = router;