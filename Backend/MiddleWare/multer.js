const multer = require('multer');
const path = require('path');
const fs = require('fs');
const uploadPath = path.join(__dirname, "../uploads");

if (!fs.existsSync(uploadPath)) {
  fs.mkdirSync(uploadPath, { recursive: true });
}
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
   cb(null, uploadPath)
  },
  filename: function (req, file, cb) {
    const username = req.user?.name ||  "guest";
    const ext = path.extname(file.originalname);
    const uniqueSuffix = username + '-' + Date.now() + '-' + Math.round(Math.random() * 1E9);

    cb(null, file.fieldname + '-' + uniqueSuffix + ext);
  }
})

const upload = multer({ storage: storage,
    limits: {
    fileSize: 5 * 1024 * 1024  
  }
 });

module.exports = upload;