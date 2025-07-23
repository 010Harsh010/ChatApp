import React, { useState } from "react";
import { Camera, User, Lock, Eye, EyeOff, Upload } from "lucide-react";
import { useSelector } from "react-redux";
import Users from "../Server/user.js";

const Setting = () => {
  const user = useSelector((state) => state.user.user);
  const users = new Users();
  const [activeSection, setActiveSection] = useState("details");
  const [profileData, setProfileData] = useState({
    name: user?.fullname || "Guest",
    email: user?.email || "Guest@example.com",
    description: user?.description || "",
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });

  const [avatar, setAvatar] = useState(null);
  const [avatarFile, setAvatarFile] = useState(null);
  const [profileImage, setProfileImage] = useState(null);
  const [profileImageFile, setProfileImageFile] = useState(null);
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [updatePhoto, setUpdatePhoto] = useState(null);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setProfileData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleImageUpload = (e, type) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        if (type === "profile") {
          setProfileImage(e.target.result); // preview
          setProfileImageFile(file); // real file
        } else {
          setAvatar(e.target.result); // preview
          setAvatarFile(file); // real file
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const updateDetails = async () => {
    if (
      !profileData.name ||
      !profileData.email ||
      activeSection === "password" ||
      (activeSection === "avatar" && !avatar) ||
      (activeSection === "profile" && !profileImage)
    ) {
      return;
    }
    if (
      profileData.name === "Guest" ||
      profileData.name === "" ||
      profileData.name.length < 3
    ) {
      return;
    }

    try {
      const res = await users.updateUserProfile({
        fullname: profileData?.name,
        description: profileData?.description,
      });
    } catch (error) {
      alert(error.message);
    }
  };

  const handleCancel = () => {
    setProfileData({
      name: user?.fullname || "Guest",
      email: user?.email || "Guest@example.com",
      currentPassword: "",
      newPassword: "",
      confirmPassword: "",
    });
  };

  const updateFile = async ({ type, file }) => {
    if (!type || !file) return;

    const formdata = new FormData();
    formdata.append("type", type);
    formdata.append("file", file);

    try {
      const res = await users.updateFile({formdata});
      const data = await res.json();
      console.log("Upload success:", data);
    } catch (err) {
      console.error("Upload failed:", err.message);
    }
  };

  const updatePassword = async () => {
    if (
      !profileData.currentPassword ||
      !profileData.newPassword ||
      !profileData.confirmPassword
    ) {
      alert("Please fill in all password fields.");
      return;
    }

    if (profileData.newPassword !== profileData.confirmPassword) {
      alert("New passwords do not match!");
      return;
    }

    try {
      const res = await users.updatePassword({
        currentPassword: profileData.currentPassword,
        newPassword: profileData.newPassword,
      });
      console.log("Password updated successfully:", res);
    } catch (error) {
      alert(error.message);
    }
  }

  const handleUpdate = async () => {
    try {
      if (activeSection === "password") {
        if (
          profileData.newPassword &&
          profileData.newPassword !== profileData.confirmPassword
        ) {
          alert("New passwords do not match!");
          return;
        }

        if (profileData.newPassword && !profileData.currentPassword) {
          alert("Please enter your current password to change it.");
          return;
        }
        await updatePassword();
      }
      if (activeSection === "avatar") {
        await updateFile({ type: "avatar", file: avatarFile });
      }
      if (activeSection === "profile") {
        await updateFile({ type: "profile", file: profileImageFile });
      }
    } catch (error) {
      console.log(error.message);
    }
  };

  const sidebarItems = [
    { id: "details", label: "My details", icon: User },
    { id: "password", label: "Password", icon: Lock },
    { id: "avatar", label: "Avatar", icon: User },
    { id: "profile", label: "Profile Picture", icon: Camera },
  ];

  const renderContent = () => {
    switch (activeSection) {
      case "details":
        return (
          <div className="space-y-6">
            <div>
              <h1 className="text-2xl font-medium text-white mb-2">
                Personal Details
              </h1>
              <p className="text-gray-400 text-sm">
                Update your personal information.
              </p>
            </div>

            <div className="space-y-6">
              <div>
                <label className="block text-white text-sm font-medium mb-3">
                  Full Name
                </label>
                <input
                  type="text"
                  name="name"
                  value={profileData?.name}
                  onChange={handleInputChange}
                  className="w-full bg-transparent border border-gray-600 rounded-md px-4 py-3 max-[800px]:px-3 max-[800px]:py-2 text-white placeholder-gray-500 focus:border-purple-500 focus:outline-none transition-all duration-200"
                  placeholder="Enter your full name"
                />
              </div>

              <div>
                <label className="block text-gray-400 text-sm font-medium mb-3">
                  Email
                </label>
                <input
                  disabled
                  type="email"
                  name="email"
                  value={profileData?.email}
                  onChange={handleInputChange}
                  className="w-full bg-transparent border border-gray-600 rounded-md px-4 py-3 max-[800px]:px-3 max-[800px]:py-2 text-gray-400 placeholder-gray-500 focus:border-purple-500 focus:outline-none transition-all duration-200"
                  placeholder="Enter your email"
                />
              </div>
              <div>
                <label className="block text-white text-sm font-medium mb-3">
                  Description
                </label>
                <input
                  type="text"
                  name="description"
                  value={profileData?.description}
                  onChange={handleInputChange}
                  className="w-full bg-transparent border border-gray-600 rounded-md px-4 py-3 max-[800px]:px-3 max-[800px]:py-2 text-white placeholder-gray-500 focus:border-purple-500 focus:outline-none transition-all duration-200"
                  placeholder="Description"
                />
              </div>
            </div>
          </div>
        );

      case "password":
        return (
          <div className="space-y-6">
            <div>
              <h1 className="text-2xl font-medium text-white mb-2">Password</h1>
              <p className="text-gray-400 text-sm">
                Please enter your current password to change your password.
              </p>
            </div>

            <div className="space-y-6">
              <div>
                <label className="block text-white text-sm font-medium mb-3">
                  Current password
                </label>
                <div className="relative">
                  <input
                    type={showCurrentPassword ? "text" : "password"}
                    name="currentPassword"
                    value={profileData.currentPassword}
                    onChange={handleInputChange}
                    className="w-full bg-transparent border border-gray-600 rounded-md px-4 py-3 pr-12 max-[800px]:px-3 max-[800px]:py-2 text-white placeholder-gray-500 focus:border-purple-500 focus:outline-none transition-all duration-200"
                    placeholder="••••••••"
                  />
                  <button
                    type="button"
                    onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                    className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-200 transition-colors duration-200"
                  >
                    {showCurrentPassword ? (
                      <EyeOff className="w-5 h-5" />
                    ) : (
                      <Eye className="w-5 h-5" />
                    )}
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-white text-sm font-medium mb-3">
                  New password
                </label>
                <div className="relative">
                  <input
                    type={showNewPassword ? "text" : "password"}
                    name="newPassword"
                    value={profileData.newPassword}
                    onChange={handleInputChange}
                    className="w-full bg-transparent border border-gray-600 rounded-md px-4 py-3 pr-12 max-[800px]:px-3 max-[800px]:py-2 text-white placeholder-gray-500 focus:border-purple-500 focus:outline-none transition-all duration-200"
                    placeholder="••••••••"
                  />
                  <button
                    type="button"
                    onClick={() => setShowNewPassword(!showNewPassword)}
                    className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-200 transition-colors duration-200"
                  >
                    {showNewPassword ? (
                      <EyeOff className="w-5 h-5" />
                    ) : (
                      <Eye className="w-5 h-5" />
                    )}
                  </button>
                </div>
                <p className="text-gray-500 text-xs mt-2">
                  Your new password must be more than 8 characters.
                </p>
              </div>

              <div>
                <label className="block text-white text-sm font-medium mb-3">
                  Confirm new password
                </label>
                <div className="relative">
                  <input
                    type={showConfirmPassword ? "text" : "password"}
                    name="confirmPassword"
                    value={profileData.confirmPassword}
                    onChange={handleInputChange}
                    className="w-full bg-transparent border border-gray-600 rounded-md px-4 py-3 pr-12 max-[800px]:px-3 max-[800px]:py-2 text-white placeholder-gray-500 focus:border-purple-500 focus:outline-none transition-all duration-200"
                    placeholder="••••••••"
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-200 transition-colors duration-200"
                  >
                    {showConfirmPassword ? (
                      <EyeOff className="w-5 h-5" />
                    ) : (
                      <Eye className="w-5 h-5" />
                    )}
                  </button>
                </div>
              </div>
            </div>
          </div>
        );

      case "avatar":
        return (
          <div className="space-y-6">
            <div>
              <h1 className="text-2xl font-medium text-white mb-2">Avatar</h1>
              <p className="text-gray-400 text-sm">
                Upload a square avatar image for your profile.
              </p>
            </div>

            <div className="flex items-center gap-8 max-[800px]:gap-4">
              <div className="relative group">
                <div className="w-32 h-32 max-[800px]:w-24 max-[800px]:h-24 rounded-lg overflow-hidden border-2 border-gray-600 bg-gray-800 transition-all duration-300 group-hover:border-purple-500">
                  {avatar ? (
                    <img
                      src={avatar}
                      alt="Avatar"
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <User className="w-16 h-16 max-[800px]:w-12 max-[800px]:h-12 text-gray-400 group-hover:text-purple-400 transition-colors duration-300" />
                    </div>
                  )}
                </div>
                <label className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-50 opacity-0 group-hover:opacity-100 transition-opacity duration-300 cursor-pointer rounded-lg">
                  <Upload className="w-8 h-8 max-[800px]:w-6 max-[800px]:h-6 text-white" />
                  <input
                    type="file"
                    accept="image/*"
                    onChange={(e) => handleImageUpload(e, "avatar")}
                    className="hidden"
                  />
                </label>
              </div>

              <div>
                <p className="text-white text-sm mb-2">
                  Click to upload new avatar
                </p>
                <p className="text-gray-400 text-xs max-[800px]:hidden">
                  Recommended: 400x400px, max 2MB
                </p>
              </div>
            </div>
          </div>
        );

      case "profile":
        return (
          <div className="space-y-6">
            <div>
              <h1 className="text-2xl font-medium text-white mb-2">
                Profile Picture
              </h1>
              <p className="text-gray-400 text-sm">
                Upload a circular profile picture for your account.
              </p>
            </div>

            <div className="flex items-center gap-8 max-[800px]:gap-4">
              <div className="relative group">
                <div className="w-32 h-32 max-[800px]:w-24 max-[800px]:h-24 rounded-full overflow-hidden border-2 border-gray-600 bg-gray-800 transition-all duration-300 group-hover:border-purple-500">
                  {profileImage ? (
                    <img
                      src={profileImage}
                      alt="Profile"
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <User className="w-16 h-16 max-[800px]:w-12 max-[800px]:h-12 text-gray-400 group-hover:text-purple-400 transition-colors duration-300" />
                    </div>
                  )}
                </div>
                <label className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-50 opacity-0 group-hover:opacity-100 transition-opacity duration-300 cursor-pointer rounded-full">
                  <Upload className="w-8 h-8 max-[800px]:w-6 max-[800px]:h-6 text-white" />
                  <input
                    type="file"
                    accept="image/*"
                    onChange={(e) => handleImageUpload(e, "profile")}
                    className="hidden"
                  />
                </label>
              </div>

              <div>
                <p className="text-white text-sm mb-2">
                  Click to upload new profile picture
                </p>
                <p className="text-gray-400 text-xs max-[800px]:hidden">
                  Recommended: 400x400px, max 2MB
                </p>
              </div>
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen w-[100%] bg-black flex">
      {/* Sidebar */}
      <div className="w-64 max-[800px]:w-16 bg-black border-r border-gray-800 p-6 max-[800px]:p-2 transition-all duration-300">
        <div className="space-y-2">
          {sidebarItems.map((item) => {
            const Icon = item.icon;
            return (
              <button
                key={item.id}
                onClick={() => setActiveSection(item.id)}
                className={`w-full flex items-center gap-3 max-[800px]:justify-center px-4 py-3 max-[800px]:px-2 rounded-lg text-left transition-all duration-200 transform hover:scale-105 group relative ${
                  activeSection === item.id
                    ? "bg-gray-800 text-white border border-gray-700"
                    : "text-gray-400 hover:text-white hover:bg-gray-900"
                }`}
              >
                <Icon className="w-5 h-5 flex-shrink-0" />
                <span className="font-medium max-[800px]:hidden">
                  {item.label}
                </span>
                {/* Tooltip for mobile */}
                <div className="hidden max-[800px]:group-hover:block absolute left-full ml-2 px-2 py-1 bg-gray-800 text-white text-xs rounded whitespace-nowrap z-10">
                  {item.label}
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 p-8 max-[800px]:p-4">
        <div className="max-w-2xl max-[800px]:max-w-none">
          <div
            className="transition-all duration-300 ease-in-out transform"
            key={activeSection}
          >
            {renderContent()}
          </div>

          {/* Bottom Border */}
          <div className="border-t border-gray-800 mt-12 pt-8">
            <div className="flex justify-end gap-4 max-[800px]:flex-col max-[800px]:gap-2">
              <button
                onClick={handleCancel}
                className="px-6 py-2 max-[800px]:px-4 text-gray-400 hover:text-white border border-gray-600 hover:border-gray-500 rounded-md transition-all duration-200 transform hover:scale-105"
              >
                Cancel
              </button>
              <button
                onClick={handleUpdate}
                className="px-6 py-2 max-[800px]:px-4 bg-purple-600 hover:bg-purple-700 text-white rounded-md transition-all duration-200 transform hover:scale-105"
              >
                {activeSection === "password"
                  ? "Update password"
                  : `Update ${activeSection}`}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Setting;
