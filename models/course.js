import mongoose from "mongoose";
const { Schema } = mongoose;

const coursesSchema = new Schema({
  major: {
    type: String,
  },
  name: {
    type: String,
    trim: true,
    required: true,
  },
  code: {
    type: String,
    required: true,
  },
  instructor: {
    type: String,
  },
  time: {
    type: String,
  },
  credits: {
    type: Number,
  },
  registered: {
    type: String,
    default: "No",
    enum: ["Yes", "No"],
  },
  grades: {
    attendance: {
      percentage: String,
      mark: Number,
    },
    midterm: {
      percentage: String,
      mark: Number,
    },
    project: {
      percentage: String,
      mark: Number,
    },
    final: {
      percentage: String,
      mark: Number,
    },
    total: {
      type: Number,
    },
  },
});

const Course = mongoose.model("Course", coursesSchema);

export default Course;
