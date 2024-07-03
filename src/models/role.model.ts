import mongoose, { Document, Schema } from "mongoose";

const roleSchema = new Schema({
  name: {
    type: String,
    required: true,
    unique: true,
  },
});

export default mongoose.model("Role", roleSchema);
