const express = require('express');
const router = express.Router();
const Post = require('../models/Post');
const User = require('../models/User');
const { auth, optionalAuth } = require('../middleware/auth');

router.get('/feed', optionalAuth, async (req, res) => {
  try {
    const { page = 1, limit = 20 } = req.query;
    const user = req.user;

let following = [];

if (user) {
  following = [...user.following, user._id];
}

    const query = user
  ? {
      author: { $in: following },
      visibility: { $ne: 'private' }
    }
  : {
      visibility: 'public'
    };

const posts = await Post.find(query)
      .populate('author', 'username displayName avatar stats.currentStreak')
      .populate('session', 'duration stats workoutName')
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(Number(limit));

    res.json(posts);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

router.get('/explore', optionalAuth, async (req, res) => {
  try {
    const { page = 1, limit = 20, type } = req.query;
    const query = { visibility: 'public' };
    if (type) query.type = type;

    const posts = await Post.find(query)
  .populate('author', 'username displayName avatar')
  .sort({ createdAt: -1 })
  .skip((page - 1) * limit)
  .limit(Number(limit));

    res.json(posts);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

router.post('/post', auth, async (req, res) => {
  try {
    const post = await Post.create({ ...req.body, author: req.user._id });
    const populated = await Post.findById(post._id).populate('author', 'username displayName avatar');

    const io = req.app.get('io');
    req.user.followers.forEach((followerId) => {
      io.to(`user:${followerId}`).emit('newPost', populated);
    });

    res.status(201).json(populated);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

router.post('/post/:id/like', auth, async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);
    const liked = post.likes.includes(req.user._id);

    if (liked) {
      post.likes.pull(req.user._id);
    } else {
      post.likes.push(req.user._id);

      if (post.author.toString() !== req.user._id.toString()) {
        await User.findByIdAndUpdate(post.author, {
          $push: {
            notifications: {
              type: 'like',
              from: req.user._id,
              message: `${req.user.displayName} liked your post`,
              relatedPost: post._id,
            },
          },
        });
        req.app.get('io').to(`user:${post.author}`).emit('notification', {
          type: 'like',
          from: { _id: req.user._id, displayName: req.user.displayName, avatar: req.user.avatar },
          message: `${req.user.displayName} liked your post`,
        });
      }
    }

    await post.save();
    res.json({ liked: !liked, likeCount: post.likes.length });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

router.post('/post/:id/react', auth, async (req, res) => {
  try {
    const { reactionType } = req.body;
    const post = await Post.findById(req.params.id);

    const existingIdx = post.reactions.findIndex((r) => r.user.toString() === req.user._id.toString());
    if (existingIdx >= 0) {
      if (post.reactions[existingIdx].type === reactionType) {
        post.reactions.splice(existingIdx, 1);
      } else {
        post.reactions[existingIdx].type = reactionType;
      }
    } else {
      post.reactions.push({ user: req.user._id, type: reactionType });
    }

    await post.save();
    res.json({ reactions: post.reactions });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

router.post('/post/:id/comment', auth, async (req, res) => {
  try {
    const { content } = req.body;
    const post = await Post.findById(req.params.id);

    post.comments.push({ author: req.user._id, content });
    await post.save();

    const updated = await Post.findById(post._id)
      .populate('comments.author', 'username displayName avatar');

    const newComment = updated.comments[updated.comments.length - 1];

    if (post.author.toString() !== req.user._id.toString()) {
      await User.findByIdAndUpdate(post.author, {
        $push: {
          notifications: {
            type: 'comment',
            from: req.user._id,
            message: `${req.user.displayName} commented on your post`,
            relatedPost: post._id,
          },
        },
      });
      req.app.get('io').to(`user:${post.author}`).emit('notification', {
        type: 'comment',
        from: { _id: req.user._id, displayName: req.user.displayName },
        message: `${req.user.displayName} commented on your post`,
      });
    }

    res.json(newComment);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

router.delete('/post/:postId/comment/:commentId', auth, async (req, res) => {
  try {
    const post = await Post.findById(req.params.postId);
    const comment = post.comments.id(req.params.commentId);
    if (!comment) return res.status(404).json({ message: 'Comment not found' });
    if (comment.author.toString() !== req.user._id.toString() && post.author.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Unauthorized' });
    }
    post.comments.pull(req.params.commentId);
    await post.save();
    res.json({ message: 'Comment deleted' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

router.get('/user/:username/posts', optionalAuth, async (req, res) => {
  try {
    const { page = 1, limit = 20 } = req.query;
    const user = await User.findOne({ username: req.params.username });

if (!user) {
  return res.status(404).json({ message: 'User not found' });
}

const isOwn =
  req.user &&
  req.user._id.toString() === user._id.toString();

const query = { author: user._id };
    if (!isOwn) query.visibility = 'public';

    const posts = await Post.find(query)
      .populate('author', 'username displayName avatar')
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(Number(limit));

    res.json(posts);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

router.delete('/post/:id', auth, async (req, res) => {
  try {
    await Post.findOneAndDelete({ _id: req.params.id, author: req.user._id });
    res.json({ message: 'Post deleted' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;
