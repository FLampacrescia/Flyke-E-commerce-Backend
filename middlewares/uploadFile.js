const multer = require('multer');
const path = require('path');
const fs = require('fs');
const {v4} = require('uuid');

const storage = multer.diskStorage({
    destination: (req, res, cb) => {

        let dir;

        if(req.path.includes('/products')) {
            dir = path.join(__dirname, '../uploads/products');
        }

        if(req.path.includes('/users')) {
            dir = path.join(__dirname, '../uploads/users');
        }

        if (!dir) {
            return cb(new Error('No se encontró el directorio de destino'), null);
        }

        if(!fs.existsSync(dir)) {
            fs.mkdirSync(dir, { recursive: true });
        }

        cb(null, dir);
    },

    filename: (req, file, cb) => {
        const ext = path.extname(file.originalname).toLowerCase();
        const uniqueName = v4() + ext;

        cb(null, uniqueName);
    }
})

const upload = multer({ storage }).single('image');

module.exports = upload;