    const express    = require('express');
    const cloudinary = require('cloudinary').v2;
    const multer     = require('multer');
    const protect    = require('../middleware/auth');
    const admin      = require('../middleware/admin');

    const router = express.Router();

    /* ── Configure Cloudinary ── */
    cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key:    process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
    });

    /* ── Multer — store in memory then send to Cloudinary ── */
    const storage = multer.memoryStorage();
    const upload  = multer({
    storage,
    limits: { fileSize: 5 * 1024 * 1024 }, /* 5MB max */
    fileFilter: (req, file, cb) => {
        if (file.mimetype.startsWith('image/')) {
        cb(null, true);
        } else {
        cb(new Error('Only image files allowed'), false);
        }
    },
    });

    /* ════════════════════════════
    POST /api/upload
    Admin only — upload up to 4 product images
    ════════════════════════════ */
    router.post('/', protect, admin, upload.array('images', 4), async (req, res) => {
    try {
        if (!req.files || !req.files.length) {
        return res.status(400).json({ success: false, message: 'No files uploaded' });
        }

        /* upload each file to Cloudinary */
        const uploadPromises = req.files.map(file => {
        return new Promise((resolve, reject) => {
            const stream = cloudinary.uploader.upload_stream(
            { folder: 'finbar-exclusive', quality: 'auto', fetch_format: 'auto' },
            (error, result) => {
                if (error) reject(error);
                else resolve(result.secure_url);
            }
            );
            stream.end(file.buffer);
        });
        });

        const urls = await Promise.all(uploadPromises);
        res.json({ success: true, urls });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
    });

    /* ════════════════════════════
    DELETE /api/upload
    Admin only — delete image from Cloudinary
    ════════════════════════════ */
    router.delete('/', protect, admin, async (req, res) => {
    try {
        const { url } = req.body;
        /* extract public_id from URL */
        const parts    = url.split('/');
        const filename = parts[parts.length - 1].split('.')[0];
        const publicId = `finbar-exclusive/${filename}`;

        await cloudinary.uploader.destroy(publicId);
        res.json({ success: true, message: 'Image deleted' });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
    });

    module.exports = router;