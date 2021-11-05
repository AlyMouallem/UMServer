import Major from "../models/majors.js";
import dotenv from "dotenv";
dotenv.config();

export const getMajors = async (req, res) => {
  try {
    const majors = await Major.find({});

    return res.status(200).send(majors);
  } catch (err) {
    console.log(err);
  }
};
export const getMajor = async (req, res) => {
  try {
    const name = req.params.name;
    const major = await Major.find({ name });
    return res.status(200).send(major);
  } catch (err) {
    console.log(err);
  }
};

export const delMajor = async (req, res) => {
  try {
    const name = req.params.name;

    const result = await Major.deleteOne({ name: `${name}` });

    return res.json({ message: "Successfully deleted" });
  } catch (error) {
    console.log(error);
  }
};
export const addMajor = async (req, res) => {
  try {
    const { name } = req.body;
    const major = new Major({ name });
    await major.save();
    return res.status(200).json({ message: "Successfully added major" });
  } catch (err) {
    return res.status(400).json({ message: "Could not add major" });
    console.log(err);
  }
};

export const updateMajor = async (req, res) => {
  try {
    const major = req.params.name;
    const { name } = req.body;

    console.log(name);
    const result = await Major.updateOne(
      { name: `${major}` },
      { $set: { name: `${name}` } }
    );
    return res
      .status(201)
      .json({ message: `Successfully Updated ${major} to ${name}` });
  } catch (err) {
    return res.status(400).json(err);
  }
};
