import mongoose from "mongoose";
const { Schema } = mongoose;

const majorsSchema = new Schema({
  name: {
    type: String,
    unique: true,
    required: true,
  },
});

export default mongoose.model("Major", majorsSchema);
