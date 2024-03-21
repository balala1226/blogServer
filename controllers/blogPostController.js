const { body, validationResult } = require('express-validator');
const asyncHandler = require("express-async-handler");
require("dotenv").config();

const User = require('../models/user');
const BlogPost = require('../models/blogPost');
const Comment = require('../models/comment');

exports.get_all= async function(req, res, next){
    const blogPosts = await BlogPost
    .find()
    .populate('user')
    .exec();

    if (!blogPosts){
        return res.status(401).json({
            errorMessage: 'No Blog Post Found.'
        })
    }

    return res.status(200).json({blogPosts})
}


exports.get_blog= async function(req, res, next){
    const blogPost = await BlogPost
    .findOne({_id: req.params.id})
    .populate('user')
    .exec();

    if (!blogPost){
        return res.status(401).json({
            errorMessage: 'No Blog Post Found.'
        })
    }

    return res.status(200).json({blogPost})
}

exports.create_blog = [
    // Validate and sanitize fields.
    body('title')
    .trim()
    .isLength({min:1})
    .withMessage('No title.'),
    body('content')
    .trim()
    .isLength({min:1})
    .withMessage('No content.'),

    // Process request after validation and sanitization.
    asyncHandler(async (req, res, next) => {
        // Extract the validation errors from a request.
        const errors = validationResult(req)

        const imagaUrl = "-";//Todo: fix
        if (!errors.isEmpty()){
            return res.status(403).json({
                title: req.body.title,
                blogImageUrl: imagaUrl,
                content: req.body.content,
                isPublished: req.body.isPublished,
                errors: errors.array()
            });
        }

        const user = await User.findOne({_id: req.body.userId}).exec();

        const newBlog= new BlogPost({
            title:req.body.title,
            blogImageUrl: imagaUrl,
            content: req.body.content,
            date: new Date(),
            user:  user,
            comments: [],
            isPublished: req.body.isPublished,
            reactions: []
        })
        await newBlog.save();

        const userUpdate = await User.findByIdAndUpdate(req.body.userId, {
            $push: {posts: newBlog}
        });
        
        res.status(200).json({
            message: 'Blog created successfully',
            blogPost: newBlog
        })
    }),
];

exports.update_blog = [
    // Validate and sanitize fields.
    body('title')
    .trim()
    .isLength({min:1})
    .withMessage('No title.'),
    body('content')
    .trim()
    .isLength({min:1})
    .withMessage('No content.'),

    // Process request after validation and sanitization.
    asyncHandler(async (req, res, next) => {
        // Extract the validation errors from a request.
        const errors = validationResult(req)

        const imagaUrl = "-";//Todo: fix
        if (!errors.isEmpty()){
            return res.status(403).json({
                title: req.body.title,
                blogImageUrl: imagaUrl,
                content: req.body.content,
                isPublished: req.body.isPublished,
                errors: errors.array()
            });
        }

        const blogPost = await BlogPost.findByIdAndUpdate(req.params.id, {
            title:req.body.title,
            blogImageUrl: imagaUrl,
            content: req.body.content,
            date: new Date(),
        });
        
        res.status(200).json({
            message: 'Blog updated successfully',
            blogPost: blogPost
        })
    }),
];

exports.delete_blog = asyncHandler(async (req, res, next) => {
    const blogPost = await BlogPost
    .findOne({_id: req.params.id})
    .populate('user')
    .exec();
    
    if (!blogPost){
        return res.status(401).json({
            errorMessage: 'No Blog Post Found.'
        });
    }

    const userId = blogPost.user._id;
    await BlogPost.findByIdAndDelete({_id: req.params.id});

    await User.findByIdAndUpdate(userId, {
        $pull: {posts: req.params.id}
    });

    await Comment.deleteMany({postId: req.params.id});
    return res.status(200).json({message: 'DeleteSuccess'});
});