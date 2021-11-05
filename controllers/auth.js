import User from "../models/user.js";
import Class from "./../models/class.js";
import jwt from "jsonwebtoken";
import expressJwt from "express-jwt";
import axios from "axios";
import dotenv from "dotenv";
import Course from "../models/course.js";
dotenv.config();

export const create = async (req, res) => {
  const { major, first_name, last_name, email } = req.body;
  let emailExist = await User.findOne({ email }).exec();
  if (emailExist) return res.status(400).send("Email is taken");

  const user = new User(req.body);

  try {
    if (major) {
      const { data } = await axios.get(
        `http://localhost:8000/api/courses/major/${major}`
      );
      var batata = [];
      data.map(async (course) => {
        batata = {
          course,
          student: { name: `${first_name} ${last_name}` },
        };
        const classes = new Class(batata);
        await classes.save();
      });
      await user.save();
    }
    return res
      .status(200)
      .json({ ok: true, message: "Successfully signed up!." });
  } catch (err) {
    return res.status(400).json(err);
  }
};
export const list = async (req, res) => {
  try {
    let users = await User.find().select(
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

export const signin = async (req, res) => {
  try {
    let user = await User.findOne({ email: req.body.email });
    if (!user) return res.status("401").json({ error: "User not found" });
    if (!user.authenticate(req.body.password)) {
      return res
        .status("401")
        .json({ error: "Email and password don't match." });
    }
    const token = jwt.sign({ _id: user._id }, process.env.JWT_SECRET);
    const uname = `${user.first_name} ${user.last_name}`;

    if (user.role === "Student") {
      const course = await Class.find({
        "student.name": uname,
        "course.registered": "Yes",
      });
      const courses = course.map(({ course }) => {
        return {
          code: course.code,
          grade: course.grades.total,
        };
      });
      const coursesWM = courses.filter((course) => course.grade != 0);

      res.cookie("t", token, { expire: new Date() + 9999 });
      return res.json({
        token,
        user: {
          _id: user._id,
          name: `${user.first_name} ${user.last_name}`,
          email: user.email,
          role: user.role,
          major: user.major,
        },
        courses,
        coursesWM,
      });
    } else if (user.role === "Instructor") {
      const course = await Class.find({
        "course.instructor": uname,
        "course.registered": "Yes",
        "course.grades.total": { $ne: 0 },
      });
      const coursesWM = course.map(({ course, student }) => {
        return {
          code: course.code,
          grade: course.grades.total,
          student: student.name,
        };
      });
      const codes = [...new Set(coursesWM.map(({ code }) => code))];

      var maxMin = [];
      for (let i = 0; i < codes.length; i++) {
        maxMin[i] = await Class.find(
          {
            "course.code": codes[i],
            "course.instructor": uname,
            "course.registered": "Yes",
            "course.grades.total": { $ne: 0 },
          },
          { "student.name": 1, "course.code": 1, "course.grades.total": 1 }
        )
          .sort({ "course.grades.total": -1 })
          .limit(5);
      }
      maxMin = [...maxMin].map((student) =>
        student.map(({ course, student }) => {
          return {
            code: course.code,
            grade: course.grades.total,
            student: student.name,
          };
        })
      );
      return res.json({
        token,
        user: {
          _id: user._id,
          name: `${user.first_name} ${user.last_name}`,
          email: user.email,
          role: user.role,
        },
        coursesWM,
        maxMin: [...maxMin],
      });
    } else {
      return res.json({
        token,
        user: {
          _id: user._id,
          name: `${user.first_name} ${user.last_name}`,
          email: user.email,
          role: user.role,
          major: user.major,
        },
      });
    }
  } catch (err) {
    return res.status(401).json({ error: "Error loggin in. Try again" });
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
  res.clearCookie("t");
  return res.status("200").json({
    message: "signed out",
  });
};

export const requireSignin = expressJwt({
  secret: process.env.JWT_SECRET,
  userProperty: "auth",
  algorithms: ["HS256"],
});
export const hasAuthorization = (req, res, next) => {
  const authorized = req.profile && req.auth && req.profile._id == req.auth._id;
  if (!authorized) {
    return res.status("403").json({
      error: "User is not authorized",
    });
  }
  next();
};
