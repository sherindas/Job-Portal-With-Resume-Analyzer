const router = require('express').Router();
const { apply, getMyApplications, withdraw, updateStatus } = require('../controllers/application.controller');
const { protect, authorize } = require('../middleware/auth');
const upload = require('../middleware/upload');

router.post('/apply', protect, authorize('jobseeker'), upload.single('resume'), apply);
router.get('/my', protect, authorize('jobseeker'), getMyApplications);
router.delete('/:id', protect, authorize('jobseeker'), withdraw);
router.put('/:id/status', protect, authorize('recruiter'), updateStatus);

module.exports = router;
