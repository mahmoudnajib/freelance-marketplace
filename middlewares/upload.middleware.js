const appError = require('../utils/appError');
const statusText = require('../utils/statusText');

const multer = require('multer');

const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, 'uploads/');
    },
    filename: function (req, file, cb) {
        const ext = file.mimetype.split('/')[1];
        const uniqueSuffix = `${req.userData?.id || 'avatar'}-${Date.now()}.${ext}`;
        cb(null, uniqueSuffix);
    }
});

const fileFilter = (req, file, cb) => {
    const imageType = file.mimetype.split('/')[0];
    
    if (imageType === 'image') {
        cb(null, true);
    } else {
        cb(new appError('The file must be an image', 400, statusText.FAIL), false);
    }
};

const upload = multer({ 
    storage: storage,
    fileFilter: fileFilter,
    limits: { fileSize: 2 * 1024 * 1024 }
});

module.exports = upload;