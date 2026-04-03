import multer from "multer";
import path from "path";
import AppError from "../error/appError.js";

// Allowed MIME types
const ALLOWED_TYPES = [
  "application/pdf",
  "application/msword",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
  "text/plain",
  "text/csv",
  "application/vnd.ms-excel",
  "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
  "image/png",
  "image/jpeg",
];

// Disk storage config
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "uploads/");
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = `${Date.now()}-${Math.round(Math.random() * 1e9)}`;
    const ext = path.extname(file.originalname);
    cb(null, `${uniqueSuffix}${ext}`);
  },
});

// File filter — reject unsupported types
const fileFilter = (req, file, cb) => {
  if (ALLOWED_TYPES.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(
      new AppError(
        `Unsupported file type: ${file.mimetype}. Allowed types: PDF, DOCX, TXT, CSV, XLSX, PNG, JPG.`,
        400
      ),
      false
    );
  }
};

// Pre-configured upload handlers
const upload = multer({
  storage,
  fileFilter,
  limits: { fileSize: 10 * 1024 * 1024 * 1000 }, // 10 MB per file
});

export const uploadSingle = upload.single("file");
export const uploadMultiple = upload.array("files", 10);
