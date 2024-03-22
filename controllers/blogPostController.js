const { body, validationResult } = require('express-validator');
const asyncHandler = require("express-async-handler");
require("dotenv").config();

const User = require('../models/user');
const BlogPost = require('../models/blogPost');
const Comment = require('../models/comment');

const path = require("path");
const fs = require("fs");

function deleteImage(filePath) {
    // Construct the full path to the image file
    const fullPath = "public/" + filePath;
    // Check if the file exists
    if (fs.existsSync(fullPath) && !filePath.includes("-default.")) {
        // File exists, delete it
        fs.unlinkSync(fullPath);
    }
}

exports.get_all= async function(req, res, next){
    const blogPosts = await BlogPost
    .find()
    .populate({path: 'user', select: '-password'})
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
    .populate({path: 'user', select: '-password'})
    .populate({path: 'comments', populate:{path: 'user', select: '-password'}})
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

        var imageUrl = "-";
        if (req.file){
            imageUrl = "images/"+req.file.filename;
        }

        if (!errors.isEmpty()){
            return res.status(403).json({
                title: req.body.title,
                blogImageUrl: imageUrl,
                content: req.body.content,
                isPublished: req.body.isPublished,
                errors: errors.array()
            });
        }

        const user = await User
        .findOne({_id: req.body.userId}, {password: 0});

        const newBlog= new BlogPost({
            title:req.body.title,
            blogImageUrl: imageUrl,
            content: req.body.content,
            date: new Date(),
            user:  user,
            comments: [],
            isPublished: req.body.isPublished,
            reactions: []
        })
        await newBlog.save();

        await User.findByIdAndUpdate(req.body.userId, {
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

        const oldBlogPost = await BlogPost
        .findOne({_id: req.params.id})
        .populate({path: 'user', select: '-password'})
        .populate({path: 'comments', populate:{path: 'user', select: '-password'}})
        .exec();

        var imageUrl = oldBlogPost.blogImageUrl;
        if (req.file){
            deleteImage(oldBlogPost.blogImageUrl);
            imageUrl = "images/"+req.file.filename;
        }

        if (!errors.isEmpty()){
            return res.status(403).json({
                title: req.body.title,
                blogImageUrl: imageUrl,
                content: req.body.content,
                isPublished: req.body.isPublished,
                errors: errors.array()
            });
        }

        const updatedBlogPost = await BlogPost.findByIdAndUpdate(req.params.id, {
            title:req.body.title,
            blogImageUrl: imageUrl,
            content: req.body.content,
            date: new Date(),
        })
        .populate({path: 'user', select: '-password'})
        .populate({path: 'comments', populate:{path: 'user', select: '-password'}});
        
        res.status(200).json({
            message: 'Blog updated successfully',
            blogPost: updatedBlogPost
        })
    }),
];

exports.delete_blog = asyncHandler(async (req, res, next) => {
    const blogPost = await BlogPost
    .findOne({_id: req.params.id})
    .populate({path: 'user', select: '-password'})
    .exec();
    
    if (!blogPost){
        return res.status(401).json({
            errorMessage: 'No Blog Post Found.'
        });
    }

    const imagePath = blogPost.blogImageUrl;
    deleteImage(imagePath);
    
    const userId = blogPost.user._id;
    await BlogPost.findByIdAndDelete({_id: req.params.id});

    await User.findByIdAndUpdate(userId, {
        $pull: {posts: req.params.id}
    });

    await Comment.deleteMany({postId: req.params.id});

    return res.status(200).json({message: 'DeleteSuccess'});
});