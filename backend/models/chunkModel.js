import mongoose from "mongoose";

const documentChunkSchema = new mongoose.Schema(
  {
    fileId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "File",
      required: true,
    },

    // The company that owns this SOP — used for company-scoped retrieval
    companyId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    // The user who uploaded the file
    uploadedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    chunkIndex: {
      type: Number,
      required: true,
    },

    text: {
      type: String,
      required: true,
    },

    embedding: {
      type: [Number],
      default: [],
    },

    metadata: {
      fileName: {
        type: String,
        default: "",
      },
      category: {
        type: String,
        default: "",
      },
      page: {
        type: Number,
      },
      preview: {
        type: String,
        default: "",
      },
    },
  },
  { timestamps: true }
);

documentChunkSchema.index({ fileId: 1 });
documentChunkSchema.index({ companyId: 1 });
documentChunkSchema.index({ uploadedBy: 1 });

export default mongoose.model("DocumentChunk", documentChunkSchema);