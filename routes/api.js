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

//blog posts
router.post('/create_blog',  passport.authenticate('jwt', {session: false}), blogPostController.create_blog);
router.get('/get_blog/:id', blogPostController.get_blog);
router.get('/all_blogs', blogPostController.get_all);
router.put('/update_blog/:id',  passport.authenticate('jwt', {session: false}), blogPostController.update_blog);
router.delete('/delete_blog/:id',  passport.authenticate('jwt', {session: false}), blogPostController.delete_blog);

module.exports = router;
