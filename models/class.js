import mongoose from "mongoose";
import Course from "./course.js";
import User from "./user.js";

const { Schema } = mongoose;

const classSchema = new Schema({
  student: {
    type: Schema.Types.Object,
    ref: User,
  },
  course: {
    type: Schema.Types.Object,
    ref: Course,
  },
});

const Class = mongoose.model("Class", classSchema);
Class.createIndexes();
export default Class;
