import fs from "fs";
import File from "../models/fileModel.js";
import DocumentChunk from "../models/chunkModel.js";
import AppError from "../error/appError.js";
import { uploadSingle, uploadMultiple } from "../middleware/multerConfig.js";
import { ingestFile } from "../ai/ingestionService.js";

/**
 * Upload a single SOP file
 * POST /api/files/upload
 * Only companies can upload.
 */
export const uploadSingleFile = (req, res, next) => {
  uploadSingle(req, res, (err) => {
    if (err) {
      return next(new AppError(err.message, err.statusCode || 400));
    }

    if (!req.file) {
      return next(new AppError("No file provided. Please attach a file.", 400));
    }

    const { originalname, filename, path: filePath, mimetype, size } = req.file;
    const companyId = req.session.user._id;

    File.create({
      originalName: originalname,
      storedName: filename,
      filePath: filePath,
      mimeType: mimetype,
      size: size,
      companyId: companyId,
      uploadedBy: companyId,
      status: "uploaded",
    })
      .then((savedFile) => {
        // Trigger ingestion asynchronously (don't block the response)
        ingestFile(savedFile._id).catch((err) =>
          console.error(`[Ingestion] async trigger failed: ${err.message}`)
        );

        res.status(201).json({
          success: true,
          message: "SOP file uploaded successfully. Ingestion started.",
          data: savedFile,
        });
      })
      .catch((error) => next(error));
  });
};

/**
 * Upload multiple SOP files
 * POST /api/files/upload-multiple
 * Only companies can upload.
 */
export const uploadMultipleFiles = (req, res, next) => {
  uploadMultiple(req, res, (err) => {
    if (err) {
      return next(new AppError(err.message, err.statusCode || 400));
    }

    if (!req.files || req.files.length === 0) {
      return next(
        new AppError("No files provided. Please attach at least one file.", 400)
      );
    }

    const companyId = req.session.user._id;

    const fileDocs = req.files.map((file) => ({
      originalName: file.originalname,
      storedName: file.filename,
      filePath: file.path,
      mimeType: file.mimetype,
      size: file.size,
      companyId: companyId,
      uploadedBy: companyId,
      status: "uploaded",
    }));

    File.insertMany(fileDocs)
      .then((savedFiles) => {
        // Trigger ingestion for each file asynchronously
        for (const file of savedFiles) {
          ingestFile(file._id).catch((err) =>
            console.error(`[Ingestion] async trigger failed for ${file._id}: ${err.message}`)
          );
        }

        res.status(201).json({
          success: true,
          message: `${savedFiles.length} SOP file(s) uploaded successfully. Ingestion started.`,
          data: savedFiles,
        });
      })
      .catch((error) => next(error));
  });
};

/**
 * Get all SOPs uploaded by the logged-in company
 * GET /api/files/my-uploads
 */
export const getFilesByCompany = async (req, res, next) => {
  try {
    const files = await File.find({ companyId: req.session.user._id });

    res.status(200).json({
      success: true,
      count: files.length,
      data: files,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Get all SOPs for a specific company (for users to browse)
 * GET /api/files/company/:companyId
 */
export const getCompanyFiles = async (req, res, next) => {
  try {
    const { companyId } = req.params;

    const files = await File.find({
      companyId: companyId,
      status: "ready", // Only show fully processed SOPs to users
    }).select("originalName mimeType size metadata createdAt");

    res.status(200).json({
      success: true,
      count: files.length,
      data: files,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Get a single file by ID
 * GET /api/files/:id
 */
export const getFileById = async (req, res, next) => {
  try {
    const file = await File.findById(req.params.id);

    if (!file) {
      return next(new AppError("File not found", 404));
    }

    res.status(200).json({
      success: true,
      data: file,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Delete an SOP file + all its chunks + physical file
 * DELETE /api/files/:id
 * Only the owning company can delete their files.
 */
export const deleteFile = async (req, res, next) => {
  try {
    const file = await File.findById(req.params.id);

    if (!file) {
      return next(new AppError("File not found", 404));
    }

    // Ensure the requesting company owns this file
    if (file.companyId.toString() !== req.session.user._id.toString()) {
      return next(new AppError("You are not authorized to delete this file", 403));
    }

    // 1. Delete all document chunks associated with this file
    const chunkResult = await DocumentChunk.deleteMany({ fileId: file._id });
    console.log(`[Delete] Removed ${chunkResult.deletedCount} chunks for file ${file._id}`);

    // 2. Delete the physical file from disk
    try {
      if (file.filePath && fs.existsSync(file.filePath)) {
        fs.unlinkSync(file.filePath);
        console.log(`[Delete] Removed physical file: ${file.filePath}`);
      }
    } catch (fsErr) {
      console.error(`[Delete] Could not remove physical file: ${fsErr.message}`);
      // Continue even if physical file removal fails
    }

    // 3. Delete the File document from MongoDB
    await File.findByIdAndDelete(file._id);

    res.status(200).json({
      success: true,
      message: "SOP document and all related data deleted successfully.",
      deletedChunks: chunkResult.deletedCount,
    });
  } catch (error) {
    next(error);
  }
};
