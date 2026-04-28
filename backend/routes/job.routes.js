const router = require('express').Router();
const {
  createJob, getJobs, getJobById, updateJob, deleteJob,
  getMyJobs, getJobApplicants, toggleJobStatus, getRecommendedJobs
} = require('../controllers/job.controller');
const { protect, authorize } = require('../middleware/auth');

router.get('/',                    getJobs);
router.get('/my',                  protect, authorize('recruiter'), getMyJobs);
router.get('/recommended',         protect, getRecommendedJobs);
router.get('/:id',                 getJobById);
router.post('/',                   protect, authorize('recruiter'), createJob);
router.put('/:id',                 protect, authorize('recruiter'), updateJob);
router.patch('/:id/toggle-status', protect, authorize('recruiter'), toggleJobStatus);
router.delete('/:id',              protect, authorize('recruiter'), deleteJob);
router.get('/:id/applicants',      protect, authorize('recruiter'), getJobApplicants);

module.exports = router;
