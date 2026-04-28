const router = require('express').Router();
const { getNotifications, markRead, markOneRead, deleteNotification } = require('../controllers/notification.controller');
const { protect } = require('../middleware/auth');

router.get('/',              protect, getNotifications);
router.put('/mark-all-read', protect, markRead);
router.put('/:id/read',      protect, markOneRead);
router.delete('/:id',        protect, deleteNotification);

module.exports = router;
