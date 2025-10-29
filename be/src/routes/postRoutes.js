// routes/postRoutes.js
const express = require('express');
const router = express.Router();
const PostModel = require('../models/PostModel');
const CommentModel = require('../models/CommentModel');
const { verifyToken, verifyAdmin } = require('../middlewares/authMiddleware');

// ------------------- POSTS ------------------- //

// routes/postRoutes.js
router.post('/', verifyToken, async (req, res) => {
  try {
    const { title, content } = req.body;
    if (!title || !content)
      return res.status(400).json({ message: 'Title and content required' });

    const post = await PostModel.create({
      authorId: req.user.id,
      authorRole: req.user.role,
      title,
      content,
    });

    // 👇 Emit event cho tất cả client
    const io = req.app.get("io");
    io.emit("post_created", post);

    res.json({ success: true, post });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Failed to create post' });
  }
});



// Lấy tất cả bài viết
router.get('/', verifyToken, async (req, res) => {
  try {
    const posts = await PostModel.getAll();
    res.json({ success: true, posts });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Failed to fetch posts' });
  }
});

// Cập nhật bài viết (người đăng hoặc Admin)
router.put('/:id', verifyToken, async (req, res) => {
  try {
    const { id } = req.params;
    const post = await PostModel.findById(id);
    if (!post) return res.status(404).json({ message: 'Post not found' });

    if (post.authorId !== req.user.id && req.user.role !== 'Admin')
      return res.status(403).json({ message: 'Access denied' });

    const { title, content } = req.body;
    const updated = await PostModel.update(id, { title, content });
    
    // ✅ Thêm socket emit
    const io = req.app.get("io");
    io.emit("post_updated", updated);
    
    res.json({ success: true, post: updated });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Failed to update post' });
  }
});

// Xoá bài viết (người đăng hoặc Admin)
router.delete('/:id', verifyToken, async (req, res) => {
  try {
    const { id } = req.params;
    const post = await PostModel.findById(id);
    if (!post) return res.status(404).json({ message: 'Post not found' });

    if (post.authorId !== req.user.id && req.user.role !== 'Admin')
      return res.status(403).json({ message: 'Access denied' });

    await PostModel.delete(id);
    
    // ✅ Thêm socket emit
    const io = req.app.get("io");
    io.emit("post_deleted", { id: parseInt(id) }); // Gửi id của post bị xóa
    
    res.json({ success: true, message: 'Post deleted successfully' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Failed to delete post' });
  }
});

// ------------------- COMMENTS ------------------- //

// Tạo comment cho bài viết (Admin hoặc Student)
router.post('/:postId/comments', verifyToken, async (req, res) => {
  try {
    const { postId } = req.params;
    const { content } = req.body;
    if (!content) return res.status(400).json({ message: 'Content required' });

    const post = await PostModel.findById(postId);
    if (!post) return res.status(404).json({ message: 'Post not found' });

    const comment = await CommentModel.create({
      postId,
      authorId: req.user.id,
      content,
    });

    // 👇 Emit event realtime
    const io = req.app.get("io");
    io.emit("comment_created", comment);

    res.json({ success: true, comment });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Failed to create comment' });
  }
});


// Lấy tất cả comment theo bài viết
router.get('/:postId/comments', verifyToken, async (req, res) => {
  try {
    const { postId } = req.params;
    const post = await PostModel.findById(postId);
    if (!post) return res.status(404).json({ message: 'Post not found' });

    const comments = await CommentModel.getByPost(postId);
    res.json({ success: true, comments });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Failed to fetch comments' });
  }
});

// Xoá comment (người đăng hoặc Admin)
router.delete('/:postId/comments/:commentId', verifyToken, async (req, res) => {
  try {
    const { postId, commentId } = req.params;
    const commentData = await CommentModel.findById(commentId);
    if (!commentData) return res.status(404).json({ message: 'Comment not found' });

    if (commentData.authorId !== req.user.id && req.user.role !== 'Admin')
      return res.status(403).json({ message: 'Access denied' });

    await CommentModel.delete(commentId);
    
    // ✅ Thêm socket emit
    const io = req.app.get("io");
    io.emit("comment_deleted", { postId: parseInt(postId), commentId: parseInt(commentId) });
    
    res.json({ success: true, message: 'Comment deleted successfully' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Failed to delete comment' });
  }
});

module.exports = router;
