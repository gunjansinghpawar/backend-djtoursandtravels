const { check, validationResult } = require('express-validator');
const Blog = require('../models/Blog');

// Fetch all blogs
exports.fetchAllBlogs = async (req, res) => {
    try {
        const blogs = await Blog.find();
        if (blogs.length === 0) {
            return res.status(404).json({ message: 'No blogs found' });
        }
        res.status(200).json(blogs);
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Server Error' });
    }
};

// Create a new blog
exports.createBlog = [
    check('blogTitle', 'Title is required').notEmpty(),
    check('blogContent', 'Content is required').notEmpty().isLength({ min: 20, max: 300 }),
    async (req, res) => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }

        const { blogTitle, blogContent } = req.body;
        try {
            const newBlog = new Blog({ blogTitle, blogContent });
            await newBlog.save();
            res.status(201).json(newBlog);
        } catch (err) {
            console.error(err);
            res.status(400).json({ message: 'Invalid blog data' });
        }
    }
];

// Update an existing blog
exports.updateBlog = [
    check('blogTitle', 'Title is required').notEmpty(),
    check('blogContent', 'Content is required').notEmpty().isLength({ min: 20, max: 300 }),
    async (req, res) => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }

        const { blogTitle, blogContent } = req.body;
        try {
            const blogId = req.params.id;
            const updatedBlog = await Blog.findByIdAndUpdate(
                blogId,
                { blogTitle, blogContent },
                { new: true, runValidators: true }
            );

            if (!updatedBlog) {
                return res.status(404).json({ message: 'Blog not found' });
            }

            res.status(200).json(updatedBlog);
        } catch (err) {
            console.error(err);
            res.status(400).json({ message: 'Invalid blog data' });
        }
    }
];

// Delete a blog
exports.deleteBlog = async (req, res) => {
    try {
        const blogId = req.params.id;
        const deletedBlog = await Blog.findByIdAndDelete(blogId);

        if (!deletedBlog) {
            return res.status(404).json({ message: 'Blog not found' });
        }

        res.status(200).json({ message: 'Blog deleted successfully' });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Server Error' });
    }
};
