const { body, validationResult } = require('express-validator')
const asyncHandler = require("express-async-handler");
const User = require('../models/user')
require("dotenv").config();

exports.userProfile = async function(req, res, next){
    const user = await User.findOne({_id: req.params.id}).exec();

    if (!user){
        return res.status(401).json({
            errorMessage: 'No User with that Id'
        })
    }

    return res.status(200).json({user})
}