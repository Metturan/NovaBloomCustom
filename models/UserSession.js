import mongoose from "mongoose";
const { Schema } = mongoose;

const userSessionsSchema = new Schema({
  sessionId: String,
  sessionContent: String,
});

mongoose.model("userSessions", userSessionsSchema);
