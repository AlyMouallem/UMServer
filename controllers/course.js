import Course from "../models/course.js";
import Class from "../models/class.js";
import dotenv from "dotenv";
dotenv.config();

export const listCourses = async (req, res) => {
  try {
    const course = await Course.find().select(
      "name major code instructor time credits grades"
    );

    return res.status(200).send(course);
  } catch (err) {
    console.log(err);
  }
};
export const getCourse = async (req, res) => {
  try {
    const code = req.params.code;
    const course = await Course.find({ code }).select(
      "name major code instructor time credits grades"
    );

    return res.status(200).send(course);
  } catch (err) {
    console.log(err);
  }
};
export const getCourseByMajor = async (req, res) => {
  try {
    const major = req.params.major;
    const course = await Course.find({ major }).select(
      "name major code instructor time credits grades registered"
    );

    return res.status(200).send(course);
  } catch (err) {
    console.log(err);
  }
};
export const getCourseByInstructor = async (req, res) => {
  try {
    const instructor = req.params.instructor;
    const course = await Course.find({ instructor }).select(
      "name major code instructor time credits grades"
    );

    return res.status(200).send(course);
  } catch (err) {
    console.log(err);
  }
};
export const postCourse = async (req, res) => {
  try {
    const body = { ...req.body.cstate, grades: req.body.grades };
    const course = new Course(body);
    await course.save();
    return res.status(200).json({ message: "Successfully added course" });
  } catch (err) {
    return res.status(400).json({ message: "Could not add course" });
    // console.log(err);
  }
};

export const updateCourse = async (req, res) => {
  try {
    const cd = req.params.code;
    const { grades, major, name, code, instructor, credits } = req.body;
    const result = await Course.updateMany(
      { code: `${cd}` },
      { $set: { grades, major, name, code, instructor, credits } }
    );
    const course = await Course.find({ code: `${cd}` });
    return res.status(201).json({ message: `Successfully Updated ${cd}` });
  } catch (err) {
    return res.status(400).json(err);
  }
};
export const delCourse = async (req, res) => {
  try {
    const code = req.params.code;
    const result = await Course.deleteOne({ code: `${code}` });
    const result2 = await Class.deleteOne({ "course.code": `${code}` });
    return res.json({ message: "Successfully deleted " });
  } catch (error) {
    return res.status(400).json(error);
  }
};
