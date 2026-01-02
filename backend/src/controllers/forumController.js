import ForumPost from "../models/ForumPost.js";

// Get all forum posts
export const getAllPosts = async (req, res) => {
  try {
    const posts = await ForumPost.find({ isActive: true })
      .populate("author", "name email role profilePicture")
      .sort({ createdAt: -1 });

    res.json({ success: true, posts });
  } catch (error) {
    console.error("Error fetching forum posts:", error);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

// Create a new forum post
export const createPost = async (req, res) => {
  try {
    const { title, content, postType, city, area, budgetMin, budgetMax, propertyType, moveInDate } = req.body;

    if (!title || !content) {
      return res.status(400).json({ 
        success: false, 
        message: "Title and content are required" 
      });
    }

    const newPost = await ForumPost.create({
      author: req.user._id,
      title,
      content,
      postType: postType || "seeking",
      city,
      area,
      budgetMin,
      budgetMax,
      propertyType,
      moveInDate,
    });

    const populatedPost = await ForumPost.findById(newPost._id)
      .populate("author", "name email role profilePicture");

    res.status(201).json({ 
      success: true, 
      message: "Post created successfully",
      post: populatedPost 
    });
  } catch (error) {
    console.error("Error creating forum post:", error);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

// Delete a forum post (author or admin only)
export const deletePost = async (req, res) => {
  try {
    const { id } = req.params;
    const post = await ForumPost.findById(id);

    if (!post) {
      return res.status(404).json({ success: false, message: "Post not found" });
    }

    // Only post author or admin can delete
    if (post.author.toString() !== req.user._id.toString() && req.user.role !== "admin") {
      return res.status(403).json({ 
        success: false, 
        message: "Not authorized to delete this post" 
      });
    }

    await ForumPost.findByIdAndDelete(id);

    res.json({ success: true, message: "Post deleted successfully" });
  } catch (error) {
    console.error("Error deleting forum post:", error);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

// Add a comment to a post
export const addComment = async (req, res) => {
  try {
    const { id } = req.params;
    const { comment } = req.body;

    if (!comment) {
      return res.status(400).json({ 
        success: false, 
        message: "Comment is required" 
      });
    }

    const post = await ForumPost.findById(id);

    if (!post) {
      return res.status(404).json({ success: false, message: "Post not found" });
    }

    post.comments.push({
      user: req.user._id,
      comment,
    });

    await post.save();

    const updatedPost = await ForumPost.findById(id)
      .populate("author", "name email role profilePicture")
      .populate("comments.user", "name email role profilePicture");

    res.json({ 
      success: true, 
      message: "Comment added successfully",
      post: updatedPost 
    });
  } catch (error) {
    console.error("Error adding comment:", error);
    res.status(500).json({ success: false, message: "Server error" });
  }
};
