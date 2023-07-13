const util = require("util");
const multer = require("multer");
const maxSize = 10 * 1024 * 1024;
const { dirname } = require('path');
const appDir = dirname(require.main.filename);

const whitelist = [
    'image/png',
    'image/jpeg',
    'image/jpg',
    'image/webp'
]

let storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, appDir +  "/resources/uploads/");
  },
  filename: (req, file, cb) => {
    console.log(file.originalname);
    cb(null, file.originalname);
  },
  fileFilter: (req, file, cb) => {
    if (!whitelist.includes(file.mimetype)) {
      return cb(new Error('file is not allowed'))
    }
  },
});

let uploadFile = multer({
  storage: storage,
  limits: { fileSize: maxSize },
}).single("file")

let uploadFileMiddleware = util.promisify(uploadFile);
module.exports = uploadFileMiddleware;