const mongoose = require("mongoose");
const User = require("../models/User");
const Role = require("../models/Role");

const isValidObjectId = (id) => mongoose.Types.ObjectId.isValid(id);

async function createUser(req, res) {
  try {
    const { role } = req.body;
    if (role) {
      if (!isValidObjectId(role)) {
        return res.status(400).json({ message: "Invalid role id" });
      }
      const roleDoc = await Role.findOne({ _id: role, isDeleted: false });
      if (!roleDoc) {
        return res.status(400).json({ message: "Role not found or deleted" });
      }
    }

    const user = await User.create(req.body);
    const userData = await User.findById(user._id)
      .select("-password")
      .populate("role", "name description");
    return res.status(201).json(userData);
  } catch (error) {
    return res.status(400).json({ message: error.message });
  }
}

async function getUsers(_req, res) {
  try {
    const users = await User.find({ isDeleted: false })
      .select("-password")
      .populate("role", "name description")
      .sort({ createdAt: -1 });
    return res.json(users);
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
}

async function getUserById(req, res) {
  try {
    const { id } = req.params;
    if (!isValidObjectId(id)) {
      return res.status(400).json({ message: "Invalid user id" });
    }

    const user = await User.findOne({ _id: id, isDeleted: false })
      .select("-password")
      .populate("role", "name description");
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }
    return res.json(user);
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
}

async function updateUser(req, res) {
  try {
    const { id } = req.params;
    if (!isValidObjectId(id)) {
      return res.status(400).json({ message: "Invalid user id" });
    }

    const { role } = req.body;
    if (role) {
      if (!isValidObjectId(role)) {
        return res.status(400).json({ message: "Invalid role id" });
      }
      const roleDoc = await Role.findOne({ _id: role, isDeleted: false });
      if (!roleDoc) {
        return res.status(400).json({ message: "Role not found or deleted" });
      }
    }

    const user = await User.findOneAndUpdate(
      { _id: id, isDeleted: false },
      req.body,
      { new: true, runValidators: true }
    )
      .select("-password")
      .populate("role", "name description");

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }
    return res.json(user);
  } catch (error) {
    return res.status(400).json({ message: error.message });
  }
}

async function softDeleteUser(req, res) {
  try {
    const { id } = req.params;
    if (!isValidObjectId(id)) {
      return res.status(400).json({ message: "Invalid user id" });
    }

    const user = await User.findOneAndUpdate(
      { _id: id, isDeleted: false },
      { isDeleted: true, deletedAt: new Date() },
      { new: true }
    )
      .select("-password")
      .populate("role", "name description");

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }
    return res.json({ message: "User soft-deleted successfully", user });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
}

async function enableUser(req, res) {
  try {
    const { email, username } = req.body;
    if (!email || !username) {
      return res.status(400).json({ message: "email and username are required" });
    }
    const user = await User.findOneAndUpdate(
      { email: String(email).toLowerCase(), username, isDeleted: false },
      { status: true },
      { new: true }
    )
      .select("-password")
      .populate("role", "name description");
    if (!user) {
      return res.status(404).json({ message: "User not found with provided email and username" });
    }
    return res.json({ message: "User enabled successfully", user });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
}

async function disableUser(req, res) {
  try {
    const { email, username } = req.body;
    if (!email || !username) {
      return res.status(400).json({ message: "email and username are required" });
    }
    const user = await User.findOneAndUpdate(
      { email: String(email).toLowerCase(), username, isDeleted: false },
      { status: false },
      { new: true }
    )
      .select("-password")
      .populate("role", "name description");
    if (!user) {
      return res.status(404).json({ message: "User not found with provided email and username" });
    }
    return res.json({ message: "User disabled successfully", user });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
}

module.exports = {
  createUser,
  getUsers,
  getUserById,
  updateUser,
  softDeleteUser,
  enableUser,
  disableUser
};
