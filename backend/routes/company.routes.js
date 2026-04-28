const router = require('express').Router();
const { createOrUpdate, getMyCompany, getPublicCompany } = require('../controllers/company.controller');
const { protect, authorize } = require('../middleware/auth');

router.post('/',    protect, authorize('recruiter'), createOrUpdate);
router.put('/',     protect, authorize('recruiter'), createOrUpdate);
router.get('/my',   protect, authorize('recruiter'), getMyCompany);
router.get('/:id',  getPublicCompany); // public

module.exports = router;
