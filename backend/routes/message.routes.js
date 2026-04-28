const router = require('express').Router();
const { getMessages, sendMessage, getConversations, startConversation } = require('../controllers/message.controller');
const { protect } = require('../middleware/auth');
const chatUpload = require('../middleware/chatUpload');

router.get('/conversations',     protect, getConversations);
router.post('/start',            protect, startConversation);
router.get('/:appId',            protect, getMessages);
router.post('/:appId',           protect, chatUpload.single('file'), sendMessage);

module.exports = router;
