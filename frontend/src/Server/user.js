export default class user {
  constructor() {
    this.base = "http://localhost:4000/user";
  }
  async login(data) {
    let res = await fetch(this.base + "/login", {
      method: "POST",
      body: JSON.stringify(data),
      headers: {
        "Content-Type": "application/json",
      },
      credentials: "include",
      mode: "cors",
    });
    if (res.status !== 200) {
      throw new Error("User not found");
    }
    return await res.json();
  }
  async register(formData) {
    console.log("Registering user with data:", formData);

    try {
      const response = await fetch(this.base + "/register", {
        method: "POST",
        body: JSON.stringify(formData),
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include", // if you're using cookies
        mode: "cors",
      });

      const data = await response.json();
      console.log("Response from register:", data);
      return data;
    } catch (error) {
      console.error("Error in register:", error);
      return { error: true, message: error.message };
    }
  }

  async logout() {
    let res = await fetch(this.base + "/logout", {
      method: "POST",
      credentials: "include",
      mode: "cors",
    });
    return await res.json();
  }
  async currentUser() {
    let res = await fetch(this.base + "/currentuser", {
      method: "GET",
      credentials: "include",
      mode: "cors",
    });
    if (res.status !== 200) {
      throw new Error("User not found");
    }
    return await res.json();
  }
  async getConnections() {
    let res = await fetch(this.base + "/friends", {
      method: "GET",
      credentials: "include",
      mode: "cors",
    });
    if (res.status !== 200) {
      throw new Error("User not found");
    }
    return await res.json();
  }
  async getNotification() {
    const response = await fetch(this.base + "/getnotification", {
      method: "GET",
      credentials: "include",
      mode: "cors",
    });
    if (response.status !== 200) {
      throw new Error("User not found");
    }
    return await response.json();
  }
  async acceptRequest(id) {
    const response = await fetch(this.base + "/acceptUser", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ messageId: id }),
      credentials: "include",
      mode: "cors",
    });
    if (response.status !== 200) {
      throw new Error("User not found");
    }
    return await response.json();
  }
  async searchUser({ username }) {
    const response = await fetch(this.base + "/search", {
      method: "POST",
      credentials: "include",
      mode: "cors",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ username: username }),
    });
    if (response.status !== 200) {
      throw new Error("User not found");
    }
    return await response.json();
  }
  async getUserDetails({ id }) {
    const response = await fetch(this.base + "/getUser", {
      method: "POST",
      credentials: "include",
      mode: "cors",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ id: id }),
    });
    if (response.status !== 200) {
      throw new Error("User not found");
    }
    return await response.json();
  }
  async isFollowed({ id }) {
    const res = await fetch(this.base + "/isFollowing", {
      method: "POST",
      credentials: "include",
      mode: "cors",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ id: id }),
    });
    if (res.status !== 200) {
      throw new Error("User not found");
    }
    return await res.json();
  }
  async sendRequest({ userId }) {
    const res = await fetch(this.base + "/addUser", {
      method: "POST",
      credentials: "include",
      mode: "cors",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ userId: userId }),
    });
    if (res.status !== 200) {
      throw new Error("User not found");
    }
    return await res.json();
  }
  async unfollow({ id }) {
    const response = await fetch(this.base + "/unfollow", {
      method: "POST",
      credentials: "include",
      mode: "cors",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ id: id }),
    });
    if (response.status !== 200) {
      throw new Error("User not found");
    }
    return await response.json();
  }
  async rejectRequest({ id }) {
    const res = await fetch(this.base + "/rejectrequest", {
      method: "POST",
      credentials: "include",
      mode: "cors",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ id: id }),
    });
    if (res.status !== 200) {
      throw new Error("User not found");
    }
    return await res.json();
  }
  async getMessages({ id }) {
    const resposne = await fetch(this.base + "/sendMessages", {
      method: "POST",
      credentials: "include",
      mode: "cors",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ RoomId: id }),
    });

    if (resposne.status !== 200) {
      throw new Error("User not found");
    }
    return await resposne.json();
  }
  async createVideoRoom() {
    const res = await fetch(this.base + "/createVideoRoom", {
      method: "POST",
      credentials: "include",
      mode: "cors",
    });
    if (res.status !== 200) {
      throw new Error("User not found");
    }
    return await res.json();
  }
  async sendFile({ file, messageObject }) {
    try {
      // console.log("data sending",file,messageObject);

      const formData = new FormData();
      formData.append("file", file);
      formData.append("data", JSON.stringify(messageObject));

      const res = await fetch(this.base + "/sendFile", {
        body: formData,
        method: "POST",
        credentials: "include",
        mode: "cors",
      });
      return true;
    } catch (error) {
      return error.message;
    }
  }
  async updateUserProfile({ fullname, description }) {
    console.log(fullname);

    const response = await fetch(this.base + "/updateUserProfile", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        fullname,
        description,
      }),
      credentials: "include",
      mode: "cors",
    });

    if (response.status !== 200) {
      throw new Error("User not found");
    }
    return await response.json();
  }
  async updateFile({formdata}) {
    console.log("Updating file with data:", formdata);
    const res = await fetch(this.base + "/updateFile", {
      method: "POST",
      body: formdata,
      mode: "cors",
      credentials: "include",
    });

    if (res.status !== 200){
      throw new Error("Unable to update");
    }

    return await res.json();
  }
  async updatePassword({ currentPassword, newPassword }) {
    const response = await fetch(this.base + "/updatePassword", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        currentPassword,
        newPassword,
      }),
      credentials: "include",
      mode: "cors",
    });

    if (response.status !== 200) {
      throw new Error("Unable to update password");
    }
    return await response.json();
  }
  async postImage(formData) {
    try {
      const response = await fetch(this.base + "/postImage", {
        method: "POST",
        body: formData,
        credentials: "include",
        mode: "cors",
      });

      if (response.status !== 200) {
        throw new Error("Unable to upload image");
      }
      return await response.json();
    } catch (error) {
      console.error("Error uploading image:", error);
      throw error;
    }
  }
}
