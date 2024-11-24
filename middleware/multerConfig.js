// FILE: multerConfig.js
const multer = require('multer');
const path = require('path');
const fs = require('fs');

// Configuración del almacenamiento
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        const uploadPath = path.join(__dirname, '..', 'ImagesRepo'); // Ruta absoluta a ImagesRepo
        if (!fs.existsSync(uploadPath)) {
            fs.mkdirSync(uploadPath, { recursive: true });
        }
        cb(null, uploadPath); // Carpeta donde se guardarán los archivos
    },
    filename: (req, file, cb) => {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        cb(null, uniqueSuffix + path.extname(file.originalname)); // Nombre del archivo
    }
});

// Filtro de archivos
const fileFilter = (req, file, cb) => {
    // Aceptar solo archivos de imagen
    if (file.mimetype.startsWith('image/')) {
        cb(null, true);
    } else {
        cb(new Error('¡No es una imagen válida! Por favor, sube una imagen.'), false);
    }
};

// Configuración de `multer`
const upload = multer({
    storage: storage,
    limits: { fileSize: 1024 * 1024 * 5 }, // Límite de tamaño de archivo: 5MB
    fileFilter: fileFilter
});

module.exports = upload;