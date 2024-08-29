const mongoose = require("mongoose");

const categoryschema = new mongoose.Schema(
    {
        title: {
            type: String,
            required: [true, "category title is required"],
        },
        user: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required:[true,"user is required"]
        },
    },
    {
        timestamps: true,
    }
);

// compile th user model
const Category = mongoose.model("Category", categoryschema);
module.exports = Category;