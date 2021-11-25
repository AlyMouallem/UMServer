import User from "../models/user.js";
import Class from "./../models/class.js";
import jwt from "jsonwebtoken";
import expressJwt from "express-jwt";
import updateClasses from "./helpers/register.js";
import dotenv from "dotenv";
import Course from "../models/course.js";
import checkRole from "./helpers/signin.js";
dotenv.config();

export const create = async (req, res) => {
  const { major, first_name, last_name, email } = req.body;
  let emailExist = await User.findOne({ email }).exec();
  if (emailExist) return res.status(400).send("Email is taken");
  try {
    const user = new User(req.body);
    await user.save();
    await updateClasses(major, first_name, last_name);
    const token = jwt.sign({ _id: user._id }, process.env.JWT_SECRET, {
      expiresIn: "7d",
    });
    res.cookie("token", token, {
      httpOnly: true,
      // secure: true, // only works on https
    });
    return res.status(200).json({
      token,
      user: {
        _id: user._id,
        name: `${user.first_name} ${user.last_name}`,
        email: user.email,
        role: user.role,
      },
    });
  } catch (error) {
    return res.status(400).json(error);
  }
};
export const signin = async (req, res) => {
  try {
    let user = await User.findOne({ email: req.body.email });
    if (!user) return res.status("401").json({ error: "User not found" });
    if (!user.authenticate(req.body.password)) {
      return res
        .status("401")
        .json({ error: "Email and password don't match." });
    }
    const token = jwt.sign({ _id: user._id }, process.env.JWT_SECRET, {
      expiresIn: "7d",
    });
    const uname = `${user.first_name} ${user.last_name}`;

    const { courses, coursesWM, maxMin } = await checkRole(user.role, uname);
    res.cookie("token", token, {
      httpOnly: true,
      // secure: true, // only works on https
    });
    return res.json({
      token,
      user: {
        _id: user._id,
        name: `${user.first_name} ${user.last_name}`,
        email: user.email,
        major: user.major,
        role: user.role,
      },
      courses,
      coursesWM,
      maxMin: [...maxMin],
    });
  } catch (err) {
    return res.status(401).json({ error: "Error loggin in. Try again" });
  }
};
export const list = async (req, res) => {
  try {
    let users = await User.find({ role: { $ne: "Dean" } }).select(
      "first_name last_name email major updated created"
    );
    res.json(users);
  } catch (err) {
    return res.status(400).json({ error: err });
  }
};
export const getAllStudents = async (req, res) => {
  try {
    let users = await User.find({ role: "Student" }).select(
      "first_name last_name email major"
    );
    res.json(users);
  } catch (err) {
    return res.status(400).json({ error: err });
  }
};
export const getAllInstructors = async (req, res) => {
  try {
    let users = await User.find({ role: "Instructor" }).select(
      "first_name last_name email major "
    );
    res.json(users);
  } catch (err) {
    return res.status(400).json({ error: err });
  }
};

export const userByID = async (req, res, next, id) => {
  try {
    let user = await User.findById(id);
    if (!user)
      return res.status("400").json({
        error: "User not found",
      });
    req.profile = user;
    next();
  } catch (err) {
    return res.status("400").json({
      error: "Could not retrieve user",
    });
  }
};
export const read = async (req, res) => {
  req.profile.hashed_password = undefined;
  req.profile.salt = undefined;
  return res.json(req.profile);
};
export const update = async (req, res) => {
  try {
    const _id = req.params.userId;
    var { name } = req.body;
    const { email } = req.body;
    const first_name = name.split(" ")[0];
    const last_name = name.split(" ")[1];
    const Name = `${req.profile.first_name} ${req.profile.last_name}`;

    const updateUser = await User.updateMany(
      { _id: `${_id}` },
      {
        first_name: `${first_name}`,
        last_name: `${last_name}`,
        email: `${email}`,
      }
    );
    if (req.profile.role === "Instructor") {
      const updateClass = await Class.updateMany(
        {
          "course.instructor": Name,
        },
        { "course.instructor": name }
      );
      const updateCourse = await Course.updateMany(
        {
          instructor: Name,
        },
        { instructor: name }
      );
    } else if (req.profile.role === "Student") {
      const updateClass = await Class.updateMany(
        {
          "student.name": Name,
        },
        { "student.name": name }
      );
    }

    let user = await User.findOne({ email });
    const token = jwt.sign({ _id: user._id }, process.env.JWT_SECRET);
    res.status(200).json({
      message: "User updated successfully",
      token,
      user: {
        _id: user._id,
        name: `${user.first_name} ${user.last_name}`,
        email: user.email,
        role: user.role,
        major: user.major,
      },
    });
  } catch (err) {
    return res.status(400).json({ message: err });
  }
};
export const remove = async (req, res) => {
  try {
    let user = req.profile;
    let deletedUser = await user.remove();
    deletedUser.hashed_password = undefined;
    deletedUser.salt = undefined;
    res.json(deletedUser);
    const uname = `${user.first_name} ${user.last_name}`;

    let classes = await Class.deleteMany({ "course.instructor": uname });
    let courses = await Course.deleteMany({ instructor: uname });
  } catch (err) {
    return res.status(400).json({
      error: err,
    });
  }
};

export const signout = (req, res) => {
  // res.clearCookie("t");
  return res.status("200").json({
    message: "signed out",
  });
};

export const currentDean = async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    if (user.role === "Dean") {
      res.json({ ok: true });
    } else {
      res.json({ ok: false });
    }
  } catch (err) {
    res.sendStatus(403);
  }
};
export const currentInstructor = async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    if (user.role === "Dean" || user.role === "Instructor") {
      res.json({ ok: true });
    } else {
      res.json({ ok: false });
    }
  } catch (err) {
    res.sendStatus(403);
  }
};
export const currentStudent = async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    if (user.role === "Dean" || user.role === "Student") {
      return res.json({ ok: true });
    } else {
      return res.json({ ok: false });
    }
  } catch (err) {
    res.sendStatus(403);
  }
};
export const requireSignin = expressJwt({
  secret: process.env.JWT_SECRET,
  algorithms: ["HS256"],
});
