import { useState, useEffect } from "react";
import {
  Card,
  Button,
  Modal,
  Input,
  List,
  Avatar,
  Tag,
  Spin,
  message,
  Dropdown, // Thêm Dropdown cho menu Tùy chọn bài viết
} from "antd";
import {
  CommentOutlined,
  SendOutlined,
  DeleteOutlined,
  FileAddOutlined,
  MoreOutlined, // Thêm MoreOutlined
} from "@ant-design/icons";
import { usePosts } from "../../../hooks/usePosts";

// Helper convert UTC -> VN time
const convertToVietnamTime = (utcTime) => {
  const date = new Date(utcTime);
  // Thêm 7 tiếng nếu server lưu UTC
  date.setHours(date.getHours() + 7);
  return date.toLocaleString("vi-VN");
};

// Component nhận thêm currentStudentId (ID của người dùng hiện tại)
export default function Posts({ token, currentStudentId }) {
  const {
    posts,
    loadingPosts,
    fetchPosts,
    createPost,
    deletePost, // Thêm deletePost
    fetchComments,
    createComment,
    deleteComment,
  } = usePosts(token);

  // ---------------- Post Modal (Create Only) ----------------
  const [modalVisible, setModalVisible] = useState(false);
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [saving, setSaving] = useState(false);

  const openCreatePostModal = () => {
    setTitle("");
    setContent("");
    setModalVisible(true);
  };

  const handleCreatePost = async () => {
    if (!title.trim() || !content.trim()) {
      return message.warning("Please fill in all fields");
    }
    try {
      setSaving(true);
      await createPost(title, content);
      await fetchPosts(); // Lấy lại danh sách posts sau khi tạo
      setModalVisible(false);
      setTitle("");
      setContent("");
      message.success("✅ Post created successfully");
    } catch (err) {
      message.error(err.message || "Failed to create post");
    } finally {
      setSaving(false);
    }
  };
  
  // ---------------- Delete Post ----------------
  const handleDeletePost = async (postId, authorId) => {
      // ✅ Kiểm tra quyền: Chỉ cho phép xóa nếu là chính chủ
      if (authorId !== currentStudentId) {
          return message.warning("You can only delete your own posts");
      }

      Modal.confirm({
          title: "Delete Post",
          content: "Are you sure you want to delete this post?",
          okText: "Yes",
          okType: "danger",
          cancelText: "No",
          async onOk() {
              try {
                  await deletePost(postId);
                  await fetchPosts(); // Lấy lại danh sách posts sau khi xóa
                  message.success("🗑️ Post deleted successfully");
              } catch (err) {
                  message.error(err.message || "Failed to delete post");
              }
          },
      });
  };

  // ---------------- Comment Modal ----------------
  const [commentModalVisible, setCommentModalVisible] = useState(false);
  const [selectedPost, setSelectedPost] = useState(null);
  const [comments, setComments] = useState([]);
  const [loadingComments, setLoadingComments] = useState(false);
  const [newComment, setNewComment] = useState("");
  const [sendingComment, setSendingComment] = useState(false);

  const openCommentModal = async (post) => {
    setSelectedPost(post);
    setCommentModalVisible(true);
    setLoadingComments(true);

    try {
      // ✅ Lấy comment từ API
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
      const commentObj = await createComment(selectedPost.id, newComment);
      // ✅ Cập nhật state comments thay vì gọi lại API
      setComments((prev) => [...prev, commentObj]); 
      setNewComment("");
      message.success("💬 Comment added successfully");
    } catch (err) {
      message.error(err.message || "Failed to add comment");
    } finally {
      setSendingComment(false);
    }
  };

  const handleDeleteComment = async (commentId, authorId) => {
    // ✅ Kiểm tra quyền: Chỉ cho phép xóa nếu là chính chủ
    if (authorId !== currentStudentId) {
        return message.warning("You can only delete your own comment");
    }
    
    Modal.confirm({
      title: "Delete Comment",
      content: "Are you sure you want to delete this comment?",
      okText: "Yes",
      okType: "danger",
      cancelText: "No",
      async onOk() {
        try {
          // ✅ API route dùng postId và commentId
          await deleteComment(selectedPost.id, commentId);
          // ✅ Cập nhật state: Lọc bỏ comment đã xóa
          setComments((prev) => prev.filter((c) => c.id !== commentId));
          message.success("🗑️ Comment deleted successfully");
        } catch (err) {
          message.error(err.message || "Failed to delete comment");
        }
      },
    });
  };

  // ---------------- Load posts ----------------
  useEffect(() => {
    if (token) fetchPosts();
  }, [token]);

  return (
    <div className="p-6">
      <Card
        title="📢 Posts & Announcements"
        extra={
          <Button type="primary" icon={<FileAddOutlined />} onClick={openCreatePostModal} className="bg-green-600">
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
          <div className="text-center text-gray-500 py-10">No posts available yet.</div>
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
                        <p className="text-gray-600 text-sm mt-1 whitespace-pre-line">{post.content}</p>

                        <div className="flex items-center gap-4 mt-2 text-xs text-gray-500">
                            <span>
                                👤 {post.authorName || "Unknown"}{" "}
                                {post.authorRole && (
                                <Tag
                                    color={post.authorRole === "Admin" ? "red" : "blue"}
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
                    
                    {/* ✅ Menu Tùy chọn (chỉ hiển thị nếu là chính chủ) */}
                    {post.authorId === currentStudentId && (
                        <Dropdown
                            menu={{
                                items: [
                                    // Loại bỏ chức năng Edit/Update
                                    {
                                        key: "2",
                                        label: "Delete",
                                        danger: true,
                                        icon: <DeleteOutlined />,
                                        onClick: () => handleDeletePost(post.id, post.authorId),
                                    },
                                ],
                            }}
                        >
                            <Button type="text" icon={<MoreOutlined />} />
                        </Dropdown>
                    )}
                </div>
              </Card>
            ))}
          </div>
        )}
      </Card>

      {/* Create Post Modal */}
      <Modal
        title="📝 Create Post"
        open={modalVisible}
        onCancel={() => setModalVisible(false)}
        onOk={handleCreatePost}
        confirmLoading={saving}
        okText="Create"
      >
        <Input placeholder="Title" value={title} onChange={(e) => setTitle(e.target.value)} className="mb-4" />
        <Input.TextArea placeholder="Content" value={content} onChange={(e) => setContent(e.target.value)} rows={4} />
      </Modal>

      {/* Comment Modal */}
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
                        // ✅ Chỉ hiển thị nút Delete nếu là chính chủ comment
                        comment.authorId === currentStudentId && (
                          <Button
                            type="link"
                            danger
                            size="small"
                            icon={<DeleteOutlined />}
                            onClick={() => handleDeleteComment(comment.id, comment.authorId)}
                          >
                            Delete
                          </Button>
                        ),
                      ]}
                    >
                      <List.Item.Meta
                        avatar={<Avatar className="bg-green-600">{comment.authorName?.[0] || "U"}</Avatar>}
                        title={
                          <div className="flex items-center gap-2">
                            <span className="font-semibold">{comment.authorName || "Unknown"}</span>
                            {comment.authorRole && <Tag color={comment.authorRole === "Admin" ? "red" : "blue"}>{comment.authorRole}</Tag>}
                            <span className="text-xs text-gray-400">{convertToVietnamTime(comment.createdAt)}</span>
                          </div>
                        }
                        description={<p className="text-gray-700 whitespace-pre-line">{comment.content}</p>}
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
                    if (e.ctrlKey || e.metaKey) handleSendComment(); // Thêm metaKey cho Mac
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
              <p className="text-xs text-gray-400 mt-1">Press Ctrl/Cmd+Enter to send</p>
            </div>
          </>
        )}
      </Modal>
    </div>
  );
}