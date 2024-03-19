const mongoose = require("mongoose");

const Schema = mongoose.Schema;

const UserSchema = new Schema({
    username: { type: String, required: true },
    password: { type: String, required: true },
    admin: {type: Boolean, default: false},
    posts:[{type: Schema.Types.ObjectId, ref: 'Post'}],
});

// Virtual for this user URL.
UserSchema.virtual("url").get(function () {
  return "/user/" + this._id;
});

// Export model.
module.exports = mongoose.model("User", UserSchema);