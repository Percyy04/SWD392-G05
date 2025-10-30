import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Card, List, Tag, Button, Popconfirm, Modal, Radio, Avatar, Space, Divider, Badge, Spin } from "antd";
import { 
  ArrowLeftOutlined, 
  UserOutlined, 
  TeamOutlined, 
  CrownOutlined, 
  LogoutOutlined,
  TrophyOutlined,
  CheckCircleOutlined,
  BarChartOutlined,
  MailOutlined,
  UsergroupAddOutlined
} from "@ant-design/icons";
import toast from "react-hot-toast";
import { useStudentDashboard } from "../../../hooks/useStudentDashboard";
import jwtDecode from "jwt-decode";

export default function TeamDetail() {
  const { teamId } = useParams();
  const navigate = useNavigate();
  const [team, setTeam] = useState(null);
  const [loading, setLoading] = useState(true);

  const [isVoteModalOpen, setIsVoteModalOpen] = useState(false);
  const [candidateId, setCandidateId] = useState(null);
  const [hasVoted, setHasVoted] = useState(false);

  const token = localStorage.getItem("token");
  const decoded = token ? jwtDecode(token) : null;
  const studentId = decoded?.id;

  const { leaveTeam } = useStudentDashboard(true);

  useEffect(() => {
    const fetchTeamDetail = async () => {
      try {
        const res = await fetch(`http://localhost:5000/api/students/team/${teamId}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        const data = await res.json();

        if (data.success) {
          setTeam(data.team);
        } else {
          toast.error(data.message || "Không thể tải thông tin nhóm");
        }
      } catch (err) {
        console.error("Fetch team detail error:", err);
        toast.error("Lỗi server khi tải thông tin nhóm");
      } finally {
        setLoading(false);
      }
    };

    const checkVoteStatus = async () => {
      try {
        const res = await fetch(`http://localhost:5000/api/vote/leader/${teamId}`, {
          headers: { Authorization: `Bearer ${token}` },
        });

        const data = await res.json();
        const voted = data?.votes?.some(v => v.voterId === studentId);
        setHasVoted(voted);
      } catch (err) {
        console.error("Check vote status error:", err);
      }
    };

    fetchTeamDetail();
    checkVoteStatus();
  }, [teamId, token, studentId]);

  const isMember = team?.members?.some(m => m.studentId === studentId);

  const handleVoteSubmit = async () => {
    if (!candidateId) {
      return toast.error("Vui lòng chọn một ứng viên để bình chọn!");
    }

    try {
      const res = await fetch(`http://localhost:5000/api/vote/leader`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ teamId, candidateId })
      });

      const data = await res.json();

      if (data.status === "voted") {
        setHasVoted(true);
        toast.success("Đã ghi nhận lượt bình chọn của bạn!");
      } else if (data.status === "leader_chosen") {
        toast.success("Đã chọn trưởng nhóm thành công!");
      } else {
        toast.error(data.msg);
      }

      setIsVoteModalOpen(false);
    } catch (err) {
      console.error(err);
      toast.error("Bình chọn thất bại!");
    }
  };

  const handleViewVotes = async () => {
    try {
      const res = await fetch(`http://localhost:5000/api/vote/leader/${teamId}`, {
        headers: { Authorization: `Bearer ${token}` }
      });

      const data = await res.json();

      if (data.status === "success") {
        console.log("Vote result:", data.votes);
        toast.success("Đã tải kết quả bình chọn!");
        Modal.info({
          title: <span><BarChartOutlined /> Kết Quả Bình Chọn Trưởng Nhóm</span>,
          content: (
            <div className="pt-4">
              <p className="text-lg mb-3">
                <b>Tổng số phiếu:</b> <Badge count={data.totalVotes} showZero color="#52c41a" />
              </p>
              <List
                size="small"
                bordered
                dataSource={data.votes}
                renderItem={(v, idx) => (
                  <List.Item>
                    <Space>
                      <CheckCircleOutlined style={{ color: '#52c41a' }} />
                      <span>{v.voterName}</span>
                      <span>→</span>
                      <b style={{ color: '#1890ff' }}>{v.candidateName}</b>
                    </Space>
                  </List.Item>
                )}
              />
            </div>
          ),
          width: 600,
          okText: "Đóng"
        });
      } else {
        toast.error(data.msg || "Không thể tải kết quả bình chọn");
      }
    } catch (err) {
      console.error("Load votes error:", err);
      toast.error("Lỗi server!");
    }
  };


  const handleLeave = async () => {
    await leaveTeam(teamId);
    navigate("/student", { state: { selectedMenu: "2" } });
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <Spin size="large" tip="Đang tải thông tin nhóm..." />
      </div>
    );
  }
  
  if (!team) {
    return (
      <div className="text-center py-20">
        <p className="text-gray-500 text-lg">Không tìm thấy nhóm</p>
        <Button 
          type="primary" 
          icon={<ArrowLeftOutlined />} 
          onClick={() => navigate(-1)}
          className="mt-4"
        >
          Quay lại
        </Button>
      </div>
    );
  }

  // Map status colors
  const statusConfig = {
    active: { color: 'green', text: 'Đang hoạt động' },
    inactive: { color: 'red', text: 'Không hoạt động' },
    pending: { color: 'orange', text: 'Chờ duyệt' },
  };

  const currentStatus = statusConfig[team.status] || { color: 'blue', text: team.status };

  return (
    <div className="max-w-5xl mx-auto p-6">
      {/* Header with back button */}
      <div className="mb-6">
        <Button 
          icon={<ArrowLeftOutlined />} 
          onClick={() => navigate(-1)}
          size="large"
          type="text"
          className="mb-4"
        >
          Quay lại
        </Button>
      </div>

      {/* Main Team Card */}
      <Card 
        className="shadow-lg rounded-xl border-0"
        bordered={false}
      >
        {/* Team Header */}
        <div className="flex items-start justify-between mb-6">
          <div className="flex items-center gap-4">
            <Avatar 
              size={64} 
              icon={<TeamOutlined />} 
              className="bg-gradient-to-br from-blue-500 to-purple-600"
            />
            <div>
              <h1 className="text-3xl font-bold text-gray-800 mb-2">{team.name}</h1>
              <Tag color={currentStatus.color} className="text-sm px-3 py-1">
                {currentStatus.text}
              </Tag>
            </div>
          </div>
        </div>

        <Divider />

        {/* Team Info Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
          <Card type="inner" className="bg-blue-50 border-blue-200">
            <Space direction="vertical" size="small" className="w-full">
              <div className="flex items-center gap-2 text-gray-600">
                <CrownOutlined className="text-yellow-500 text-xl" />
                <span className="font-semibold">Trưởng nhóm:</span>
              </div>
              <p className="text-lg font-bold text-blue-600 ml-7">{team.leaderName || "Chưa có"}</p>
            </Space>
          </Card>

          <Card type="inner" className="bg-green-50 border-green-200">
            <Space direction="vertical" size="small" className="w-full">
              <div className="flex items-center gap-2 text-gray-600">
                <UsergroupAddOutlined className="text-green-500 text-xl" />
                <span className="font-semibold">Thành viên:</span>
              </div>
              <p className="text-lg font-bold text-green-600 ml-7">
                {team.currentMembers} / {team.maxMembers}
              </p>
            </Space>
          </Card>
        </div>

        {/* Description */}
        {team.description && (
          <Card type="inner" className="bg-gray-50 mb-6">
            <h3 className="text-sm font-semibold text-gray-600 mb-2">Mô tả nhóm:</h3>
            <p className="text-gray-800 leading-relaxed">{team.description}</p>
          </Card>
        )}

        {/* Vote Section */}
        {isMember && (
          <Card type="inner" className="bg-purple-50 border-purple-200 mb-6">
            <div className="flex items-center justify-between flex-wrap gap-3">
              <div className="flex items-center gap-2">
                <TrophyOutlined className="text-purple-500 text-2xl" />
                <span className="font-semibold text-gray-700">Bình chọn trưởng nhóm</span>
              </div>
              
              <Space>
                {!hasVoted ? (
                  <Button 
                    type="primary" 
                    icon={<TrophyOutlined />}
                    onClick={() => setIsVoteModalOpen(true)}
                    size="large"
                    className="bg-gradient-to-r from-purple-500 to-pink-500 border-0"
                  >
                    Bình chọn ngay
                  </Button>
                ) : (
                  <Tag icon={<CheckCircleOutlined />} color="success" className="text-base px-4 py-2">
                    Bạn đã bình chọn
                  </Tag>
                )}
                
                <Button 
                  icon={<BarChartOutlined />} 
                  onClick={handleViewVotes}
                  size="large"
                >
                  Xem kết quả
                </Button>
              </Space>
            </div>
          </Card>
        )}

        {/* Members List */}
        <div className="mb-6">
          <h3 className="text-xl font-bold text-gray-800 mb-4 flex items-center gap-2">
            <TeamOutlined />
            Danh sách thành viên
          </h3>
          
          <List
            className="bg-white"
            bordered
            dataSource={team.members}
            renderItem={(member) => (
              <List.Item className="hover:bg-gray-50 transition-colors">
                <List.Item.Meta
                  avatar={
                    <Avatar 
                      size={48} 
                      icon={<UserOutlined />}
                      className={member.studentId === team.leaderId ? "bg-yellow-500" : "bg-green-500"}
                    />
                  }
                  title={
                    <Space>
                      <span className="text-lg font-semibold">{member.fullName}</span>
                      {member.studentId === team.leaderId && (
                        <Tag icon={<CrownOutlined />} color="gold">
                          Trưởng nhóm
                        </Tag>
                      )}
                    </Space>
                  }
                  description={
                    <Space>
                      <MailOutlined />
                      <span className="text-gray-600">{member.email}</span>
                    </Space>
                  }
                />
              </List.Item>
            )}
          />
        </div>

        {/* Action Buttons */}
        {isMember && (
          <div className="flex justify-end">
            <Popconfirm
              title="Rời khỏi nhóm"
              description="Bạn có chắc chắn muốn rời khỏi nhóm này?"
              onConfirm={handleLeave}
              okText="Rời nhóm"
              cancelText="Hủy"
              okButtonProps={{ danger: true }}
            >
              <Button 
                danger 
                icon={<LogoutOutlined />}
                size="large"
                type="primary"
              >
                Rời khỏi nhóm
              </Button>
            </Popconfirm>
          </div>
        )}
      </Card>

      {/* Vote Modal */}
      <Modal
        title={
          <Space>
            <TrophyOutlined className="text-purple-500" />
            <span>Bình chọn trưởng nhóm</span>
          </Space>
        }
        open={isVoteModalOpen}
        onCancel={() => setIsVoteModalOpen(false)}
        onOk={handleVoteSubmit}
        okText="Xác nhận bình chọn"
        cancelText="Hủy"
        width={600}
      >
        <Divider />
        <p className="text-gray-600 mb-4">Chọn thành viên mà bạn muốn bình chọn làm trưởng nhóm:</p>
        
        <Radio.Group
          onChange={(e) => setCandidateId(e.target.value)}
          style={{ width: "100%" }}
          value={candidateId}
        >
          <List
            dataSource={team.members.filter(m => m.studentId !== studentId)}
            renderItem={(member) => (
              <List.Item className="hover:bg-gray-50 cursor-pointer transition-colors">
                <Radio value={member.studentId} className="w-full">
                  <Space className="w-full">
                    <Avatar icon={<UserOutlined />} className="bg-blue-500" />
                    <div>
                      <div className="font-semibold">{member.fullName}</div>
                      <div className="text-gray-500 text-sm">{member.email}</div>
                    </div>
                  </Space>
                </Radio>
              </List.Item>
            )}
          />
        </Radio.Group>
      </Modal>
    </div>
  );
}
