import mongoose from "mongoose";

const messageSchema = new mongoose.Schema(
  {
    chatId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Chat",
      required: true,
    },
    role: {
      type: String,
      enum: ["user", "assistant"],
      required: true,
    },
    content: {
      type: String,
      required: true,
    },
    // Sources used to generate this answer (only populated for assistant messages)
    sources: [
      {
        fileId: { type: mongoose.Schema.Types.ObjectId, ref: "File" },
        fileName: { type: String, default: "" },
        chunkIndex: { type: Number },
        preview: { type: String, default: "" },
        score: { type: Number },
      },
    ],
  },
  { timestamps: true }
);

messageSchema.index({ chatId: 1 });

export default mongoose.model("Message", messageSchema);
