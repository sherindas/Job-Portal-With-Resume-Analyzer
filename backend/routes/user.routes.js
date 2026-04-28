const router = require('express').Router();
const { getProfile, updateProfile, toggleSaveJob, getSavedJobs } = require('../controllers/user.controller');
const { protect } = require('../middleware/auth');

router.get('/profile', protect, getProfile);
router.put('/profile', protect, updateProfile);
router.post('/save-job/:jobId', protect, toggleSaveJob);
router.get('/saved-jobs', protect, getSavedJobs);

module.exports = router;
