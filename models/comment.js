const mongoose = require("mongoose");

const Schema = mongoose.Schema;

const CommentSchema = new Schema({
    parentId: { type: Schema.ObjectId, required: true },
    user: { type: Schema.ObjectId, ref: "User", required: true },
    content: { type: String, required: true },
    date: { type: Date, required: true },
    reactions:[{type: Object}]
});

// Export model.
module.exports = mongoose.model("Comment", CommentSchema);
