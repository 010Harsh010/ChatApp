const multer =  require('multer');

const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null,'./public/upload');
    },
    filename: (req, file, cb) => {
        cb(null,file.originalname);
    }
});

exports.upload = multer({
    storage,
})
