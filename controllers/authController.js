const jwt = require('jsonwebtoken');
const passport = require('passport')
const { body, validationResult } = require('express-validator')
const asyncHandler = require("express-async-handler");
const bcrypt= require('bcryptjs');
const User = require('../models/user')
require("dotenv").config();

exports.login_post = [
    passport.authenticate('local', {
        session: false,
        failureRedirect: '/api/logInFail'
    }),

    asyncHandler(async (req, res, next) => {
        // Extract the validation errors from a request.
        // create token
        const user = {_id: req.user._id, username: req.user.username, admin: req.user.admin}
        const token = jwt.sign({user: user}, process.env.SECRET_KEY, {expiresIn: '1d'});

        return res.status(200).json({user, token});
    })
];

exports.logout = (req, res, next) => {
};

exports.login_fail = (req, res) => {
    return res.status(401).json({
        errorMessage: 'User does not exist'
    })
};

exports.sign_up_post = [
    // Validate and sanitize fields.
    body('username').trim()
    .isLength({min:1})
    .withMessage('No username input.')
    .custom( async(username) => {
        try {
            const user = await User.findOne({username: username});
            if (user){
                throw new Error('Username already exists');
            }
        } catch (err){
            throw new Error(err);
        }
    }),
    body('password')
    .isLength({min:6})
    .withMessage('Password must be 6 characters long'),
    body('confirmPassword')
    .custom( async( value, {req}) => {
        if (value !== req.body.password){
            throw new Error('Password does not match');
        }
        return true
    }),

    // Process request after validation and sanitization.
    asyncHandler(async (req, res, next) => {
      // Extract the validation errors from a request.
      const errors = validationResult(req)

        if (!errors.isEmpty()){
            return res.status(403).json({
                username: req.body.username,
                errors: errors.array()
            });
        }

        bcrypt.hash(req.body.password, 12, async (err, hashedPassword) => {
            const user= new User({
                username:req.body.username,
                password: hashedPassword,
                admin: false
            })
            await user.save();

            res.status(200).json({
                message: 'User created successfully',
            })
        });
    }),
];