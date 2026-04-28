const router = require('express').Router();
const { analyzeResume } = require('../controllers/resume.controller');
const { protect } = require('../middleware/auth');
const upload = require('../middleware/upload');

router.post('/analyze', protect, upload.single('resume'), analyzeResume);

module.exports = router;
