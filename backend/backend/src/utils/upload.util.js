const fs = require('fs');
const path = require('path');
const multer = require('multer');

const uploadDir = path.resolve(process.cwd(), process.env.UPLOAD_DIR || 'uploads');
fs.mkdirSync(uploadDir, { recursive: true });

const storage = multer.diskStorage({
  destination: (_req, _file, cb) => cb(null, uploadDir),
  filename: (_req, file, cb) => {
    const ext = path.extname(file.originalname);
    const safeName = `${Date.now()}-${Math.round(Math.random() * 1e9)}${ext}`;
    cb(null, safeName);
  }
});

const imageFilter = (_req, file, cb) => {
  if (!file.mimetype.startsWith('image/')) {
    const err = new Error('Only image uploads are allowed');
    err.status = 400;
    return cb(err);
  }
  return cb(null, true);
};

const limits = {
  fileSize: Number(process.env.MAX_FILE_SIZE || 5 * 1024 * 1024)
};

module.exports = multer({ storage, fileFilter: imageFilter, limits });
