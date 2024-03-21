const { body, validationResult } = require('express-validator');
const asyncHandler = require("express-async-handler");
require("dotenv").config();

const User = require('../models/user');
const BlogPost = require('../models/blogPost');
const Comment = require('../models/comment');

exports.get_all_post_comments = async function(req, res, next){
    const comments = await Comment
    .find({parentId: req.params.postId})
    .populate({path: 'user', select: '-password'})
    .exec();

    if (!comments){
        return res.status(401).json({
            errorMessage: 'No Blog Post Found.'
        })
    }

    return res.status(200).json({comments})
}


exports.get_comment= async function(req, res, next){
    const comment = await Comment
    .findOne({_id: req.params.id})
    .populate({path: 'user', select: '-password'})
    .exec();

    if (!comment){
        return res.status(401).json({
            errorMessage: 'No Blog Post Found.'
        })
    }

    return res.status(200).json({comment})
}

exports.create_comment = [
    // Validate and sanitize fields.
    body('content')
    .trim()
    .isLength({min:1})
    .withMessage('No content.'),

    // Process request after validation and sanitization.
    asyncHandler(async (req, res, next) => {
        // Extract the validation errors from a request.
        const errors = validationResult(req)

        if (!errors.isEmpty()){
            return res.status(403).json({
                content: req.body.content,
                errors: errors.array()
            });
        }

        const user = await User
        .findOne({_id: req.body.userId}, {password: 0});

        const newComment= new Comment({
            parentId: req.body.blogPostId,
            user: user,
            content: req.body.content,
            date: new Date(),
            reactions:[]
        })
        await newComment.save();

        const blogPostUpdate = await BlogPost.findByIdAndUpdate(req.body.blogPostId, {
            $push: {comments: newComment}
        });
        
        res.status(200).json({
            message: 'Comment created successfully',
            comment: newComment
        })
    }),
];

exports.update_comment = [
    // Validate and sanitize fields.
    body('content')
    .trim()
    .isLength({min:1})
    .withMessage('No title.'),

    // Process request after validation and sanitization.
    asyncHandler(async (req, res, next) => {
        // Extract the validation errors from a request.
        const errors = validationResult(req)
        
        if (!errors.isEmpty()){
            return res.status(403).json({
                content: req.body.content,
                errors: errors.array()
            });
        }
        
        const comment = await Comment.findByIdAndUpdate(req.params.id, {
            content: req.body.content,
            date: new Date(),
        });
        
        res.status(200).json({
            message: 'Blog updated successfully',
            comment: comment
        })
    }),
];

exports.delete_blogPost_comment = asyncHandler(async (req, res, next) => {
    const comment = await Comment
    .findOne({_id: req.params.id})
    .exec();
    
    if (!comment){
        return res.status(401).json({
            errorMessage: 'No Comment Found.'
        });
    }

    const blogPostId = comment.parentId;
    await Comment.findByIdAndDelete({_id: req.params.id});

    await BlogPost.findByIdAndUpdate(blogPostId, {
        $pull: {comments: req.params.id}
    });

    return res.status(200).json({message: 'DeleteSuccess'});
});