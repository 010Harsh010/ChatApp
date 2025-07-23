const dotenv = require("dotenv");
dotenv.config({ path: "./.env" });
const cloudinary = require("cloudinary").v2;
const fs = require("fs");

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
  timeout: 60000,
});

const uploadCloud = async (localfilepath) => {
  try {
    cloudinary.api.ping((error, result) => {
      if (error) {
        console.error("Cloudinary config test failed:", error);
      } else {
        console.log("Cloudinary config successful:", result);
      }
    });
    if (!localfilepath) {
      console.log("Invalid file path");
      return null;
    }
    console.log("Uploading file to Cloudinary:", localfilepath);

    const response = await cloudinary.uploader.upload(localfilepath, {
      resource_type: "auto",
    });
    console.log("File uploaded to Cloudinary:", response.secure_url);

    if (fs.existsSync(localfilepath)) {
      fs.unlinkSync(localfilepath);
      console.log("Local file deleted:", localfilepath);
    }
    return response;
  } catch (error) {
    console.log("Error uploading file to Cloudinary:", error);
    return null;
  }
};

module.exports = uploadCloud;
