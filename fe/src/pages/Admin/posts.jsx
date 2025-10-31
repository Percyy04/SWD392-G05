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
  Dropdown,
  Space,
  Badge,
  Divider,
  Empty,
} from "antd";
import {
  CommentOutlined,
  SendOutlined,
  DeleteOutlined,
  FileAddOutlined,
  MoreOutlined,
  UserOutlined,
  ClockCircleOutlined,
  EditOutlined,
  MessageOutlined,
  PlusCircleOutlined,
  CloseCircleOutlined,
} from "@ant-design/icons";
import { usePosts } from "../../../hooks/usePosts";

// Helper convert UTC -> VN time
const convertToVietnamTime = (utcTime) => {
  const date = new Date(utcTime);
  // Thêm 7 tiếng nếu server lưu UTC
  date.setHours(date.getHours() + 7);
  return date.toLocaleString("vi-VN");
};

// Component nhận thêm currentAdminId (ID của quản trị viên hiện tại)
export function Posts({ token, currentAdminId }) {
  const {
    posts,
    loadingPosts,
    fetchPosts,
    createPost,
    deletePost,
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
      return message.warning("Vui lòng điền đầy đủ thông tin");
    }
    try {
      setSaving(true);
      await createPost(title, content);
      await fetchPosts();
      setModalVisible(false);
      setTitle("");
      setContent("");
      message.success("✅ Tạo bài viết thành công");
    } catch (err) {
      message.error(err.message || "Tạo bài viết thất bại");
    } finally {
      setSaving(false);
    }
  };
  
  // ---------------- Delete Post ----------------
  const handleDeletePost = async (postId, authorId) => {
      if (authorId !== currentAdminId) {
          return message.warning("Bạn chỉ có thể xóa bài viết của mình");
      }

      Modal.confirm({
          title: "Xóa bài viết",
          content: "Bạn có chắc chắn muốn xóa bài viết này?",
          okText: "Xóa",
          okType: "danger",
          cancelText: "Hủy",
          async onOk() {
              try {
                  await deletePost(postId);
                  await fetchPosts();
                  message.success("🗑️ Đã xóa bài viết thành công");
              } catch (err) {
                  message.error(err.message || "Xóa bài viết thất bại");
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
  
  // ✅ Track comments count for each post
  const [postsCommentsCount, setPostsCommentsCount] = useState(() => {
    // Load từ localStorage khi khởi tạo
    const saved = localStorage.getItem('postsCommentsCount');
    return saved ? JSON.parse(saved) : {};
  });

  const openCommentModal = async (post) => {
    setSelectedPost(post);
    setCommentModalVisible(true);
    setLoadingComments(true);

    try {
      // ✅ Lấy comment từ API
      const fetchedComments = await fetchComments(post.id);
      setComments(fetchedComments);
      
      // ✅ Cập nhật số lượng comments cho post này
      setPostsCommentsCount(prev => ({
        ...prev,
        [post.id]: fetchedComments.length
      }));
    } catch (err) {
      message.error("Không thể tải bình luận");
      console.error(err);
    } finally {
      setLoadingComments(false);
    }
  };

  const handleSendComment = async () => {
    if (!newComment.trim()) return message.warning("Vui lòng nhập nội dung bình luận");
    try {
      setSendingComment(true);
      const commentObj = await createComment(selectedPost.id, newComment);
      setComments((prev) => [...prev, commentObj]);
      
      // ✅ Cập nhật số lượng comments
      setPostsCommentsCount(prev => ({
        ...prev,
        [selectedPost.id]: (prev[selectedPost.id] || 0) + 1
      }));
      
      setNewComment("");
      message.success("💬 Đã thêm bình luận thành công");
    } catch (err) {
      message.error(err.message || "Thêm bình luận thất bại");
    } finally {
      setSendingComment(false);
    }
  };

  const handleDeleteComment = async (commentId, authorId) => {
    if (authorId !== currentAdminId) {
        return message.warning("Bạn chỉ có thể xóa bình luận của mình");
    }
    
    Modal.confirm({
      title: "Xóa bình luận",
      content: "Bạn có chắc chắn muốn xóa bình luận này?",
      okText: "Xóa",
      okType: "danger",
      cancelText: "Hủy",
      async onOk() {
        try {
          await deleteComment(selectedPost.id, commentId);
          setComments((prev) => prev.filter((c) => c.id !== commentId));
          
          // ✅ Cập nhật số lượng comments
          setPostsCommentsCount(prev => ({
            ...prev,
            [selectedPost.id]: Math.max((prev[selectedPost.id] || 1) - 1, 0)
          }));
          
          message.success("🗑️ Đã xóa bình luận thành công");
        } catch (err) {
          message.error(err.message || "Xóa bình luận thất bại");
        }
      },
    });
  };

  // ---------------- Load posts ----------------
  useEffect(() => {
    if (token) fetchPosts();
  }, [token]);

  // ✅ Lưu comments count vào localStorage khi thay đổi
  useEffect(() => {
    localStorage.setItem('postsCommentsCount', JSON.stringify(postsCommentsCount));
  }, [postsCommentsCount]);

  return (
    <div className="max-w-6xl mx-auto p-6">
      {/* Header Section */}
      <div className="mb-6">
        <Card 
          className="border-0 shadow-lg"
          bodyStyle={{ 
            padding: '24px',
            background: 'linear-gradient(to right, #3b82f6, #a855f7)',
            borderRadius: '8px'
          }}
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="bg-white rounded-full p-3">
                <MessageOutlined className="text-2xl text-blue-600" />
              </div>
              <div className="text-white">
                <h2 className="text-2xl font-bold mb-1">Bảng Tin & Thông Báo</h2>
                <p className="text-blue-100">Chia sẻ và trao đổi thông tin với mọi người</p>
              </div>
            </div>
            <Button 
              type="primary" 
              size="large"
              icon={<PlusCircleOutlined />} 
              onClick={openCreatePostModal}
              className="bg-white text-blue-600 hover:bg-blue-50 border-0 shadow-md font-semibold"
              style={{ 
                backgroundColor: 'white',
                color: '#2563eb'
              }}
            >
              Tạo bài viết
            </Button>
          </div>
        </Card>
      </div>

      {/* Posts List */}
      <div className="space-y-4">
        {loadingPosts ? (
          <Card className="shadow-sm">
            <div className="flex justify-center py-20">
              <Spin size="large" tip="Đang tải bài viết..." />
            </div>
          </Card>
        ) : posts.length === 0 ? (
          <Card className="shadow-sm">
            <Empty
              image={Empty.PRESENTED_IMAGE_SIMPLE}
              description={
                <span className="text-gray-500">
                  Chưa có bài viết nào. Hãy là người đầu tiên tạo bài viết!
                </span>
              }
            >
              <Button 
                type="primary" 
                icon={<PlusCircleOutlined />}
                onClick={openCreatePostModal}
              >
                Tạo bài viết đầu tiên
              </Button>
            </Empty>
          </Card>
        ) : (
          posts.map((post) => (
            <Card
              key={post.id}
              className="shadow-md hover:shadow-xl transition-all duration-300 border-0"
              bodyStyle={{ padding: '24px' }}
            >
              <div className="flex items-start justify-between gap-4">
                <div className="flex gap-4 flex-1">
                  {/* Avatar */}
                  <Avatar 
                    size={56} 
                    icon={<UserOutlined />}
                    className={`${
                      post.authorRole === "Admin" 
                        ? "bg-gradient-to-br from-red-500 to-pink-600" 
                        : "bg-gradient-to-br from-green-500 to-emerald-600"
                    } flex-shrink-0`}
                  >
                    {post.authorName?.[0] || "U"}
                  </Avatar>

                  {/* Content */}
                  <div className="flex-1 min-w-0">
                    {/* Author Info */}
                    <div className="flex items-center gap-2 mb-2 flex-wrap">
                      <span className="font-bold text-gray-900 text-lg">
                        {post.authorName || "Unknown"}
                      </span>
                      {post.authorRole && (
                        <Tag 
                          color={post.authorRole === "Admin" ? "red" : "green"}
                          className="px-3 py-0.5"
                        >
                          {post.authorRole === "Admin" ? "Quản trị viên" : "Sinh viên"}
                        </Tag>
                      )}
                      <span className="text-gray-400 text-sm flex items-center gap-1">
                        <ClockCircleOutlined />
                        {convertToVietnamTime(post.createdAt)}
                      </span>
                    </div>

                    {/* Post Title & Content */}
                    <h3 className="text-xl font-bold text-gray-800 mb-2">
                      {post.title}
                    </h3>
                    <p className="text-gray-700 whitespace-pre-line leading-relaxed mb-4">
                      {post.content}
                    </p>

                    {/* Actions */}
                    <div className="flex items-center gap-3">
                      <Button
                        type="text"
                        icon={<CommentOutlined />}
                        onClick={() => openCommentModal(post)}
                        className="text-blue-600 hover:text-blue-700 hover:bg-blue-50 font-semibold"
                      >
                        <Badge 
                          count={postsCommentsCount[post.id] ?? post.comments?.length ?? 0} 
                          showZero
                          className="ml-2"
                        >
                          <span className="ml-1">Bình luận</span>
                        </Badge>
                      </Button>
                    </div>
                  </div>
                </div>
                
                {/* More Options (chỉ hiển thị nếu là chính chủ) */}
                {post.authorId === currentAdminId && (
                  <Dropdown
                    menu={{
                      items: [
                        {
                          key: "delete",
                          label: "Xóa bài viết",
                          danger: true,
                          icon: <DeleteOutlined />,
                          onClick: () => handleDeletePost(post.id, post.authorId),
                        },
                      ],
                    }}
                    trigger={['click']}
                  >
                    <Button 
                      type="text" 
                      icon={<MoreOutlined />}
                      className="hover:bg-gray-100"
                    />
                  </Dropdown>
                )}
              </div>
            </Card>
          ))
        )}
      </div>

      {/* Create Post Modal */}
      <Modal
        title={
          <Space>
            <EditOutlined className="text-blue-600" />
            <span className="text-xl font-bold">Tạo bài viết mới</span>
          </Space>
        }
        open={modalVisible}
        onCancel={() => setModalVisible(false)}
        onOk={handleCreatePost}
        confirmLoading={saving}
        okText="Tạo bài viết"
        cancelText="Hủy"
        width={700}
        okButtonProps={{ 
          size: 'large',
          icon: <PlusCircleOutlined />
        }}
        cancelButtonProps={{ size: 'large' }}
      >
        <Divider />
        <div className="space-y-4">
          <div>
            <label className="block text-gray-700 font-semibold mb-2">
              Tiêu đề <span className="text-red-500">*</span>
            </label>
            <Input 
              placeholder="Nhập tiêu đề bài viết..." 
              value={title} 
              onChange={(e) => setTitle(e.target.value)}
              size="large"
              className="border-gray-300"
            />
          </div>
          
          <div>
            <label className="block text-gray-700 font-semibold mb-2">
              Nội dung <span className="text-red-500">*</span>
            </label>
            <Input.TextArea 
              placeholder="Nhập nội dung bài viết..." 
              value={content} 
              onChange={(e) => setContent(e.target.value)} 
              rows={6}
              className="border-gray-300"
            />
          </div>
        </div>
      </Modal>

      {/* Comment Modal */}
      <Modal
        title={
          <div className="flex items-center justify-between">
            <Space>
              <CommentOutlined className="text-blue-600 text-xl" />
              <div>
                <div className="text-lg font-bold">Bình luận</div>
                <div className="text-sm text-gray-500 font-normal">
                  {selectedPost?.title}
                </div>
              </div>
            </Space>
            <Badge 
            />
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
        width={800}
      >
        <Divider className="mt-2" />
        
        {loadingComments ? (
          <div className="flex justify-center py-20">
            <Spin size="large" tip="Đang tải bình luận..." />
          </div>
        ) : (
          <>
            {/* Comments List */}
            <div className="max-h-[500px] overflow-y-auto mb-6 pr-2">
              {comments.length === 0 ? (
                <Empty
                  image={Empty.PRESENTED_IMAGE_SIMPLE}
                  description="Chưa có bình luận nào. Hãy là người đầu tiên bình luận!"
                  className="py-12"
                />
              ) : (
                <List
                  dataSource={comments}
                  renderItem={(comment) => (
                    <List.Item
                      key={comment.id}
                      className="border-0 border-b border-gray-100 hover:bg-gray-50 transition-colors px-4 py-4"
                      actions={
                        comment.authorId === currentAdminId
                          ? [
                              <Button
                                type="text"
                                danger
                                size="small"
                                icon={<DeleteOutlined />}
                                onClick={() => handleDeleteComment(comment.id, comment.authorId)}
                              >
                                Xóa
                              </Button>,
                            ]
                          : []
                      }
                    >
                      <List.Item.Meta
                        avatar={
                          <Avatar 
                            size={48} 
                            icon={<UserOutlined />}
                            className={
                              comment.authorRole === "Admin"
                                ? "bg-gradient-to-br from-red-500 to-pink-600"
                                : "bg-gradient-to-br from-green-500 to-emerald-600"
                            }
                          >
                            {comment.authorName?.[0] || "U"}
                          </Avatar>
                        }
                        title={
                          <div className="flex items-center gap-2 flex-wrap">
                            <span className="font-bold text-gray-900">
                              {comment.authorName || "Unknown"}
                            </span>
                            {comment.authorRole && (
                              <Tag 
                                color={comment.authorRole === "Admin" ? "red" : "green"}
                                className="px-2"
                              >
                                {comment.authorRole === "Admin" ? "Quản trị viên" : "Sinh viên"}
                              </Tag>
                            )}
                            <span className="text-xs text-gray-400 flex items-center gap-1">
                              <ClockCircleOutlined />
                              {convertToVietnamTime(comment.createdAt)}
                            </span>
                          </div>
                        }
                        description={
                          <p className="text-gray-700 whitespace-pre-line mt-2 leading-relaxed">
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
            <Card className="bg-gray-50 border-2 border-blue-200">
              <div className="space-y-3">
                <div className="flex gap-3">
                  <Avatar 
                    size={40} 
                    icon={<UserOutlined />}
                    className="bg-gradient-to-br from-red-500 to-pink-600 flex-shrink-0"
                  />
                  <Input.TextArea
                    placeholder="Viết bình luận của bạn..."
                    value={newComment}
                    onChange={(e) => setNewComment(e.target.value)}
                    rows={3}
                    className="flex-1"
                    onPressEnter={(e) => {
                      if (e.ctrlKey || e.metaKey) handleSendComment();
                    }}
                  />
                </div>
                
                <div className="flex items-center justify-between">
                  <p className="text-xs text-gray-500">
                    💡 Nhấn <kbd className="px-2 py-1 bg-gray-200 rounded">Ctrl</kbd> + <kbd className="px-2 py-1 bg-gray-200 rounded">Enter</kbd> để gửi
                  </p>
                  <Button
                    type="primary"
                    size="large"
                    icon={<SendOutlined />}
                    onClick={handleSendComment}
                    loading={sendingComment}
                    className="bg-gradient-to-r from-blue-500 to-purple-600 border-0"
                  >
                    Gửi bình luận
                  </Button>
                </div>
              </div>
            </Card>
          </>
        )}
      </Modal>
    </div>
  );
}