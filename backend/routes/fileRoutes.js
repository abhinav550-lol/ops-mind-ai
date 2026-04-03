import express from "express";
import isLoggedIn from "../utils/isLoggedIn.js";
import isCompany from "../utils/isCompany.js";
import {
  uploadSingleFile,
  uploadMultipleFiles,
  getFilesByCompany,
  getCompanyFiles,
  getFileById,
  deleteFile,
} from "../controller/fileController.js";

const router = express.Router();

// POST /api/files/upload — single SOP file upload (company only)
router.post("/upload", isLoggedIn, isCompany, uploadSingleFile);

// POST /api/files/upload-multiple — multiple SOP file upload (company only)
router.post("/upload-multiple", isLoggedIn, isCompany, uploadMultipleFiles);

// GET /api/files/my-uploads — SOPs uploaded by the logged-in company
router.get("/my-uploads", isLoggedIn, isCompany, getFilesByCompany);

// GET /api/files/company/:companyId — browse a company's SOPs (any logged-in user)
router.get("/company/:companyId", isLoggedIn, getCompanyFiles);

// GET /api/files/:id — single file by ID
router.get("/:id", isLoggedIn, getFileById);

// DELETE /api/files/:id — delete an SOP and all its chunks (company only)
router.delete("/:id", isLoggedIn, isCompany, deleteFile);

export default router;
