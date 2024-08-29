const mongoose = require("mongoose");

const commentSchema = new mongoose.Schema(
    {
        post: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "post",
            required: [true, "post is required"],
        },
        user: {
            type: Object,
            required: [true, "user is required"],
        },
        description: {
            type: String,
            required: [true, "comment description is required"],
        },
    },
    {timestamps: true}
);

// compile the user modal
const Comment = mongoose.model("Comment", commentSchema)

module.exports = Comment;