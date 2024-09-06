const express = require('express');
const router = express.Router();
const {
    getContactInfo,
    addContactInfo
} = require('../controllers/ContactController');


router.get('/allContacts', getContactInfo);
router.post('/addContact', addContactInfo);

module.exports = router;