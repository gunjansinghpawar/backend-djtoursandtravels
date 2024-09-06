const mongoose = require('mongoose');

const blogSchema = new mongoose.Schema({
    blogTitle: {
        type: String,
        required: true, // Ensures title is provided
        trim: true // Removes whitespace
    },
    blogContent: {
        type: String,
        required: true, // Ensures content is provided
    },
    blogImage: {
       data: Buffer,
       contentType: String
    },
    date: {
        type: Date,
        default: Date.now // Sets the default date to now
    },
});

module.exports = mongoose.model('Blog', blogSchema);
