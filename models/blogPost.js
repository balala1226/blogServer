const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const BlogPostSchema = new Schema({
    title: { type: String, required: true },
    blogImageUrl: { type: String, required: true },
    content: { type: String, required: true },
    date: { type: Date, default: Date.now , required:true },
    user:{type:Schema.Types.ObjectId, ref:'User', requried: true},
    comments:[{type:Schema.Types.ObjectId, ref:'Comment'}],
    isPublished:{type:Boolean, default: false},
    reactions:[{type: Object}]
});

// Virtual for this user URL.
BlogPostSchema.virtual("url").get(function () {
  return "/blog/" + this._id;
});

// Export model.
module.exports = mongoose.model("BlogPost", BlogPostSchema);
