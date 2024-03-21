const { body, validationResult } = require('express-validator')
const asyncHandler = require("express-async-handler");
const User = require('../models/user')
require("dotenv").config();

exports.get_user= async function(req, res, next){
    const user = await User
        .findOne({_id: req.params.id}, {password: 0});

    if (!user){
        return res.status(401).json({
            errorMessage: 'No User Found.'
        })
    }

    return res.status(200).json({user})
}