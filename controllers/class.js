import Class from "../models/class.js";
import dotenv from "dotenv";
import axios from "axios";
dotenv.config();

export const addClass = async (req, res) => {
  try {
    const body = req.body;
    const classe = new Class(body);
    await classe.save();
    return res.status(200).json({ message: "Successfully added class" });
  } catch (err) {
    return res.status(400).json({ message: "Could not add class", err });
  }
};
export const updateClass = async (req, res) => {
  try {
    const yes = req.params.yn;
    const name = req.params.name;
    const { registered } = req.body;

    registered.map(async (code) => {
      const result = await Class.updateMany(
        { "course.code": `${code}`, "student.name": `${name}` },
        { $set: { "course.registered": `${yes}` } }
      );
    });

    // const coursesWM = courses.filter((course) => course.grade != 0);

    // res.cookie("t", token, { expire: new Date() + 9999 });
    // return res.json({
    //   token,
    //   user: {
    //     _id: user._id,
    //     name: `${user.first_name} ${user.last_name}`,
    //     email: user.email,
    //     role: user.role,
    //     major: user.major,
    //   },
    //   courses,
    //   coursesWM,
    // });

    return res.status(200).json({ message: "Registered Successfully" });
  } catch (err) {
    return res.status(400).json({ message: "Could not register class", err });
  }
};
export const instructorUpdateMarks = async (req, res) => {
  try {
    const instructor = req.params.name;
    const student = req.params.student;
    const code = req.params.code;

    const grade = req.body;

    const result = await Class.updateMany(
      {
        "course.instructor": `${instructor}`,
        "course.code": `${code}`,
        "student.name": `${student}`,
      },
      { "course.grades": grade }
    );

    return res.status(200).json({ message: "Marks updated successfully" });
  } catch (err) {
    return res.status(400).json({ message: "Could not update mark", err });
  }
};

export const getClasses = async (req, res) => {
  try {
    const reg = req.params.yn;
    const name = req.params.name;
    const classes = await Class.find({
      "course.registered": reg,
      "student.name": name,
    }).select("course");

    return res.status(200).send(classes);
  } catch (err) {
    console.log(err);
  }
};
export const getClassesDashboard = async (req, res) => {
  try {
    const reg = req.params.yn;
    const name = req.params.name;
    const classes = await Class.find({
      "course.registered": reg,
      "student.name": name,
    }).select("course.code course.grades.total");

    return res.status(200).send(classes);
  } catch (err) {
    console.log(err);
  }
};

export const getClassByCode = async (req, res) => {
  try {
    const code = req.params.code;
    const clas = await Class.find({ "course.code": code });
    return res.status(200).send(clas);
  } catch (err) {
    console.log(err);
  }
};
export const getClassBySName = async (req, res) => {
  try {
    const name = req.params.name;
    const clas = await Class.find({ "student.name": name });
    return res.status(200).send(clas);
  } catch (err) {
    console.log(err);
  }
};
export const getClassByIName = async (req, res) => {
  try {
    const name = req.params.name;
    const code = req.params.code;
    const clas = await Class.find({
      "course.instructor": name,
      "course.code": code,
    });
    return res.status(200).send(clas);
  } catch (err) {
    console.log(err);
  }
};
export const delClass = async (req, res) => {
  try {
    const code = req.params.code;
    const name = req.params.name;

    const result = await Class.deleteOne({
      "course.code": code,
      "student.name": name,
    });

    return res.json({ message: "Successfully deleted", result });
  } catch (error) {
    console.log(error);
  }
};
