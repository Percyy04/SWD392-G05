import { useState, useEffect } from "react";
import { Card, Button, Dropdown, Modal, Input, message, Spin, Tag, Avatar, List } from "antd";
import {
  FileAddOutlined,
  MoreOutlined,
  EditOutlined,
  DeleteOutlined,
  CommentOutlined,
  SendOutlined,
} from "@ant-design/icons";
import { usePosts } from "../../../hooks/usePosts";


export function Posts({ token }) {
  const {
    posts,
    loadingPosts,
    fetchPosts,
    createPost,
    updatePost,
    deletePost,
    fetchComments,
    createComment,
    deleteComment,
  } = usePosts(token);

  // Modal states
  const [modalVisible, setModalVisible] = useState(false);
  const [editingPost, setEditingPost] = useState(null);
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [saving, setSaving] = useState(false);
  const convertToVietnamTime = (utcTime) => {
    const date = new Date(utcTime);
    // Thêm 7 tiếng nếu server lưu UTC
    date.setHours(date.getHours() + 7);
    return date.toLocaleString("vi-VN");
  };

  // Comment modal states
  const [commentModalVisible, setCommentModalVisible] = useState(false);
  const [selectedPost, setSelectedPost] = useState(null);
  const [comments, setComments] = useState([]);
  const [loadingComments, setLoadingComments] = useState(false);
  const [newComment, setNewComment] = useState("");
  const [sendingComment, setSendingComment] = useState(false);

  // -------------------- LOAD POSTS -------------------- //
  useEffect(() => {
    console.log("🚀 useEffect triggered, token:", token ? "exists" : "missing");
    if (token) fetchPosts();
  }, [token]);

  // -------------------- POST MODAL -------------------- //
  const openModal = (post = null) => {
    setEditingPost(post);
    setTitle(post?.title || "");
    setContent(post?.content || "");
    setModalVisible(true);
  };

  const handleSave = async () => {
    if (!title.trim() || !content.trim()) {
      message.warning("Please fill in all fields");
      return;
    }

    try {
      setSaving(true);
      if (editingPost) {
        await updatePost(editingPost.id, title, content);
        message.success("✅ Post updated successfully");
      } else {
        await createPost(title, content);
        message.success("✅ Post created successfully");
      }

      // ✅ fetch lại posts từ server để tránh duplicate
      await fetchPosts();

      setModalVisible(false);
      setEditingPost(null);
      setTitle("");
      setContent("");
    } catch (err) {
      message.error(err.message || "Something went wrong");
    } finally {
      setSaving(false);
    }
  };


  const handleDelete = async (id) => {
    Modal.confirm({
      title: "Delete Post",
      content: "Are you sure you want to delete this post?",
      okText: "Yes",
      okType: "danger",
      cancelText: "No",
      async onOk() {
        try {
          await deletePost(id);
          message.success("🗑️ Post deleted successfully");
        } catch (err) {
          message.error(err.message || "Failed to delete post");
        }
      },
    });
  };

  // -------------------- COMMENT MODAL -------------------- //
  const openCommentModal = async (post) => {
    setSelectedPost(post);
    setCommentModalVisible(true);
    setLoadingComments(true);

    try {
      const fetchedComments = await fetchComments(post.id);
      setComments(fetchedComments);
    } catch (err) {
      message.error("Failed to load comments");
      console.error(err);
    } finally {
      setLoadingComments(false);
    }
  };

  const handleSendComment = async () => {
    if (!newComment.trim()) return message.warning("Please enter a comment");

    try {
      setSendingComment(true);
      await createComment(selectedPost.id, newComment);
      const updatedComments = await fetchComments(selectedPost.id);
      setComments(updatedComments); // ✅ chỉ set từ API
      setNewComment("");
      message.success("💬 Comment added successfully");
    } catch (err) {
      message.error(err.message || "Failed to add comment");
    } finally {
      setSendingComment(false);
    }
  };


  const handleDeleteComment = async (commentId) => {
    Modal.confirm({
      title: "Delete Comment",
      content: "Are you sure you want to delete this comment?",
      okText: "Yes",
      okType: "danger",
      cancelText: "No",
      async onOk() {
        try {
          await deleteComment(selectedPost.id, commentId);
          setComments((prev) => prev.filter((c) => c.id !== commentId));
          message.success("🗑️ Comment deleted successfully");
        } catch (err) {
          message.error(err.message || "Failed to delete comment");
        }
      },
    });
  };

  // -------------------- RENDER -------------------- //
  return (
    <>
      <Card
        title="📢 Posts & Announcements"
        extra={
          <Button
            type="primary"
            icon={<FileAddOutlined />}
            className="bg-green-600"
            onClick={() => openModal()}
          >
            Create Post
          </Button>
        }
        className="bg-white border border-gray-200 shadow-sm"
      >
        {loadingPosts ? (
          <div className="flex justify-center py-10">
            <Spin size="large" />
          </div>
        ) : posts.length === 0 ? (
          <div className="text-center text-gray-500 py-10">
            No posts available yet.
          </div>
        ) : (
          <div className="space-y-4">
            {posts.map((post) => (
              <Card
                key={post.id}
                size="small"
                className="bg-gray-50 border border-gray-200 hover:border-green-400 transition-all"
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <h4 className="text-gray-900 font-semibold">{post.title}</h4>
                    <p className="text-gray-600 text-sm mt-1 whitespace-pre-line">
                      {post.content}
                    </p>

                    <div className="flex items-center gap-4 mt-2 text-xs text-gray-500">
                      <span>
                        👤 {post.authorName || "Unknown"}{" "}
                        {post.authorRole && (
                          <Tag
                            color={
                              post.authorRole === "Admin"
                                ? "red"
                                : post.authorRole === "Student"
                                  ? "blue"
                                  : "default"
                            }
                            className="ml-1"
                          >
                            {post.authorRole}
                          </Tag>
                        )}
                      </span>
                      <span className="text-xs text-gray-400">
                        {convertToVietnamTime(post.createdAt)}
                      </span>
                      <Button
                        type="link"
                        size="small"
                        icon={<CommentOutlined />}
                        onClick={() => openCommentModal(post)}
                        className="text-gray-500 hover:text-green-600"
                      >
                        Comments ({post.comments?.length || 0})
                      </Button>
                    </div>
                  </div>

                  <Dropdown
                    menu={{
                      items: [
                        {
                          key: "1",
                          label: "Edit",
                          icon: <EditOutlined />,
                          onClick: () => openModal(post),
                        },
                        {
                          key: "2",
                          label: "Delete",
                          danger: true,
                          icon: <DeleteOutlined />,
                          onClick: () => handleDelete(post.id),
                        },
                      ],
                    }}
                  >
                    <Button type="text" icon={<MoreOutlined />} />
                  </Dropdown>
                </div>
              </Card>
            ))}
          </div>
        )}

        {/* Modal Create / Edit Post */}
        <Modal
          title={editingPost ? "✏️ Edit Post" : "📝 Create Post"}
          open={modalVisible}
          onCancel={() => setModalVisible(false)}
          onOk={handleSave}
          confirmLoading={saving}
          okText={editingPost ? "Update" : "Create"}
        >
          <Input
            placeholder="Title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="mb-4"
          />
          <Input.TextArea
            placeholder="Content"
            value={content}
            onChange={(e) => setContent(e.target.value)}
            rows={4}
          />
        </Modal>
      </Card>

      {/* Modal Comments */}
      <Modal
        title={
          <div>
            <CommentOutlined className="mr-2" />
            Comments - {selectedPost?.title}
          </div>
        }
        open={commentModalVisible}
        onCancel={() => {
          setCommentModalVisible(false);
          setSelectedPost(null);
          setComments([]);
          setNewComment("");
        }}
        footer={null}
        width={600}
      >
        {loadingComments ? (
          <div className="flex justify-center py-10">
            <Spin />
          </div>
        ) : (
          <>
            {/* Comments List */}
            <div className="max-h-96 overflow-y-auto mb-4">
              {comments.length === 0 ? (
                <div className="text-center text-gray-400 py-8">
                  No comments yet. Be the first to comment!
                </div>
              ) : (
                <List
                  dataSource={comments}
                  renderItem={(comment) => (
                    <List.Item
                      key={comment.id}
                      actions={[
                        <Button
                          type="link"
                          danger
                          size="small"
                          icon={<DeleteOutlined />}
                          onClick={() => handleDeleteComment(comment.id)}
                        >
                          Delete
                        </Button>,
                      ]}
                    >
                      <List.Item.Meta
                        avatar={
                          <Avatar className="bg-green-600">
                            {comment.authorName?.[0] || "U"}
                          </Avatar>
                        }
                        title={
                          <div className="flex items-center gap-2">
                            <span className="font-semibold">
                              {comment.authorName || "Unknown"}
                            </span>
                            {comment.authorRole && (
                              <Tag
                                color={
                                  comment.authorRole === "Admin" ? "red" : "blue"
                                }
                                className="text-xs"
                              >
                                {comment.authorRole}
                              </Tag>
                            )}
                            <span className="text-xs text-gray-400">
                              {convertToVietnamTime(comment.createdAt)}
                            </span>

                          </div>
                        }
                        description={
                          <p className="text-gray-700 whitespace-pre-line">
                            {comment.content}
                          </p>
                        }
                      />
                    </List.Item>
                  )}
                />
              )}
            </div>

            {/* Add Comment Input */}
            <div className="border-t pt-4">
              <div className="flex gap-2">
                <Input.TextArea
                  placeholder="Write a comment..."
                  value={newComment}
                  onChange={(e) => setNewComment(e.target.value)}
                  rows={2}
                  onPressEnter={(e) => {
                    if (e.ctrlKey || e.metaKey) {
                      handleSendComment();
                    }
                  }}
                />
                <Button
                  type="primary"
                  icon={<SendOutlined />}
                  onClick={handleSendComment}
                  loading={sendingComment}
                  className="bg-green-600"
                >
                  Send
                </Button>
              </div>
              <p className="text-xs text-gray-400 mt-1">
                Press Ctrl+Enter to send
              </p>
            </div>
          </>
        )}
      </Modal>
    </>
  );
}