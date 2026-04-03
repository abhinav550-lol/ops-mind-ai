import mongoose from "mongoose";

const chatSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    // The company whose SOPs this chat is querying
    companyId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    title: {
      type: String,
      trim: true,
      default: "New Chat",
    },
    // Restrict RAG retrieval to these files (empty = search all company files)
    fileIds: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "File",
      },
    ],
  },
  { timestamps: true }
);

chatSchema.index({ userId: 1 });
chatSchema.index({ companyId: 1 });

export default mongoose.model("Chat", chatSchema);
