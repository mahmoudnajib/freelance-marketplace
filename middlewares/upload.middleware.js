const appError = require('../utils/appError');
const statusText = require('../utils/statusText');
const multer = require('multer');
const path = require('path'); 

const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, 'uploads/');
    },
    filename: function (req, file, cb) {

        const ext = path.extname(file.originalname).toLowerCase();
        
        const userId = req.userData?.id || `user-${Math.floor(Math.random() * 1e6)}`;
        const uniqueSuffix = `${userId}-${Date.now()}${ext}`;
        cb(null, uniqueSuffix);
    }
});

const fileFilter = (req, file, cb) => {

    const allowedExtensions = ['.png', '.jpg', '.jpeg'];
    const ext = path.extname(file.originalname).toLowerCase();
    
    if (file.mimetype.startsWith('image/') && allowedExtensions.includes(ext)) {
        cb(null, true);
    } else {
        cb(new appError('The file must be a valid image (png, jpg, jpeg)', 400, statusText.FAIL), false);
    }
};

const upload = multer({ 
    storage: storage,
    fileFilter: fileFilter,
    limits: { fileSize: 2 * 1024 * 1024 } // 2MB
});

module.exports = upload;