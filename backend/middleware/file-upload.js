const multer = require('multer');
const streamifier = require('streamifier');
const cloudinary = require('../config/cloudinary');
const HttpError = require('../models/http-error');

const MIME_TYPE_MAP = {
  'image/png': 'png',
  'image/jpeg': 'jpeg',
  'image/jpg': 'jpg',
};

const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB limit
  fileFilter: (req, file, cb) => {
    const isValid = !!MIME_TYPE_MAP[file.mimetype];
    cb(isValid ? null : new Error('Invalid file type. Only PNG/JPG allowed.'), isValid);
  },
});

const uploadToCloudinary = (req, res, next) => {
  if (!req.file) {
    return next(); // no file uploaded — let controller handle validation if required
  }

  const stream = cloudinary.uploader.upload_stream(
    { folder: 'placepulse-updated' },
    (error, result) => {
      if (error) {
        return next(new HttpError('Image upload failed, please try again.', 500));
      }
      req.file.cloudinaryUrl = result.secure_url;
      req.file.cloudinaryPublicId = result.public_id; // NEW — needed to delete later
      next();
    }
  );

  streamifier.createReadStream(req.file.buffer).pipe(stream);
};

module.exports = { upload, uploadToCloudinary };

// const multer = require("multer");
// // const uuid = require('uuid'); // old way of importing
// const { v4: uuidv4 } = require('uuid');

// const MIME_TYPE_MAP = {
//   "image/png": "png",
//   "image/jpeg": "jpeg",
//   "image/jpg": "jpg",
// };

// const fileUpload = multer({
//   limits: 500000,
//   storage: multer.diskStorage({
//     destination: (req, file, cb) => { 
//       cb(null, 'uploads/images'); // cb means "callback"
//     },
//     filename: (req, file, cb) => {
//       const ext = MIME_TYPE_MAP[file.mimetype];
//       cb(null, uuidv4() + "." + ext);
//     },
//   }),
//   fileFilter: (req, file, cb) => {
//     const isValid = !!MIME_TYPE_MAP[file.mimetype];
//     let error = isValid ? null : new Error('Invalid mime type');
//     cb(error, isValid);
//   }
// });

// module.exports = fileUpload;