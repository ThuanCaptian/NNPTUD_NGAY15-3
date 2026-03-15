const mongoose = require("mongoose");
const Role = require("../models/Role");
const User = require("../models/User");

const isValidObjectId = (id) => mongoose.Types.ObjectId.isValid(id);

async function createRole(req, res) {
  try {
    const role = await Role.create(req.body);
    return res.status(201).json(role);
  } catch (error) {
    return res.status(400).json({ message: error.message });
  }
}

async function getRoles(_req, res) {
  try {
    const roles = await Role.find({ isDeleted: false }).sort({ createdAt: -1 });
    return res.json(roles);
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
}

async function getRoleById(req, res) {
  try {
    const { id } = req.params;
    if (!isValidObjectId(id)) {
      return res.status(400).json({ message: "Invalid role id" });
    }
    const role = await Role.findOne({ _id: id, isDeleted: false });
    if (!role) {
      return res.status(404).json({ message: "Role not found" });
    }
    return res.json(role);
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
}

async function updateRole(req, res) {
  try {
    const { id } = req.params;
    if (!isValidObjectId(id)) {
      return res.status(400).json({ message: "Invalid role id" });
    }
    const role = await Role.findOneAndUpdate(
      { _id: id, isDeleted: false },
      req.body,
      { new: true, runValidators: true }
    );
    if (!role) {
      return res.status(404).json({ message: "Role not found" });
    }
    return res.json(role);
  } catch (error) {
    return res.status(400).json({ message: error.message });
  }
}

async function softDeleteRole(req, res) {
  try {
    const { id } = req.params;
    if (!isValidObjectId(id)) {
      return res.status(400).json({ message: "Invalid role id" });
    }
    const role = await Role.findOneAndUpdate(
      { _id: id, isDeleted: false },
      { isDeleted: true, deletedAt: new Date() },
      { new: true }
    );
    if (!role) {
      return res.status(404).json({ message: "Role not found" });
    }
    return res.json({ message: "Role soft-deleted successfully", role });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
}

async function getUsersByRoleId(req, res) {
  try {
    const { id } = req.params;
    if (!isValidObjectId(id)) {
      return res.status(400).json({ message: "Invalid role id" });
    }
    const role = await Role.findOne({ _id: id, isDeleted: false });
    if (!role) {
      return res.status(404).json({ message: "Role not found" });
    }
    const users = await User.find({ role: id, isDeleted: false })
      .select("-password")
      .populate("role", "name description");
    return res.json(users);
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
}

module.exports = {
  createRole,
  getRoles,
  getRoleById,
  updateRole,
  softDeleteRole,
  getUsersByRoleId
};
