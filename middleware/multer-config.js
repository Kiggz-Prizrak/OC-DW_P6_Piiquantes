// installation de multer pour gérer les DL files
const multer = require('multer');

const MIME_TYPES = {
    'image/jpg': 'jpg',
    'image/jpeg': 'jpg',
    'image/png': 'png'
}

const storage = multer.diskStorage({
    destination: (req, file, callbacks) => {callbacks(null,'images')},
    filename: (req, file, callback) => {
        const name = file.originalname.split(' ').join('_');
        const extension = MIME_TYPES[file.mimetype]
        callback(null, name + Date.now() + '.' + extension);
    }
});

module.exports = multer({storage}).single('image');