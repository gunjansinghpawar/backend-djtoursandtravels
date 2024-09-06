const express = require('express');
const router = express.Router();

const {
    createBlog,
    fetchAllBlogs,
    updateBlog,
    deleteBlog
} = require('../controllers/BlogController');

// Create a new blog
router.post('/createBlog', createBlog);
router.get('/fetchAllBlogs', fetchAllBlogs);
router.put('/updateBlog/:id', updateBlog);
router.delete('/deleteBlog/:id', deleteBlog);

module.exports = router;
