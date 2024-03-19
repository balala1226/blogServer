var express = require('express');
var router = express.Router();
const passport = require('passport');
const authController = require('../controllers/authController');
const userController = require('../controllers/userController');
const blogPostController = require('../controllers/blogPostController');
const commentController = require('../controllers/commentController');

//authentications
router.post('/login', authController.login_post);
router.get('/loginfail', authController.login_fail);
router.post('/signup', authController.sign_up_post);
router.post('/logout', authController.logout);

module.exports = router;
