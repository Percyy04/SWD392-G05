import { Card, Button, Modal, Tag, Avatar, Space, Badge, Spin, Empty, Row, Col } from "antd";
import { 
  ExclamationCircleOutlined, 
  TeamOutlined, 
  UserOutlined, 
  CrownOutlined,
  UsergroupAddOutlined,
  EyeOutlined,
  CheckCircleOutlined,
  InfoCircleOutlined
} from "@ant-design/icons";
import toast from "react-hot-toast";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { socket } from "../../../src/sockets/studentSocket";
import { useStudentDashboard } from "../../../hooks/useStudentDashboard";

export default function Teams() {
  const { student, setStudent, teams, setTeams, loading, error } = useStudentDashboard(true);
  const [loadingTeamId, setLoadingTeamId] = useState(null);
  const navigate = useNavigate();

  const handleJoinTeam = async (teamId) => {
    if (!student) return;
    setLoadingTeamId(teamId);

    try {
      const token = localStorage.getItem("token");
      const res = await fetch(`http://localhost:5000/api/students/join-team/${teamId}`, {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
      });
      const data = await res.json();

      if (data.success && data.team) {
        toast.success(data.message || "Bạn đã tham gia nhóm thành công!");

        setStudent(prev => ({ ...prev, Team: teamId }));

        setTeams(prev =>
          prev.map(t =>
            String(t.teamId) === String(teamId)
              ? {
                  ...t,
                  membersCount: data.team.SoLuongThanhVienHienTai || t.membersCount,
                  status: data.team.TrangThaiNhom 
                }
              : t
          )
        );

        socket.emit("student_joined_team", {
          teamId,
          studentId: student.id,
          full_name: student.HoTen,
        });

        navigate(`/student/team/${teamId}`);
      } else {
        toast.error(data.message || "Tham gia nhóm thất bại");
      }
    } catch (err) {
      console.error("Join team error:", err);
      toast.error("Lỗi server khi tham gia nhóm");
    } finally {
      setLoadingTeamId(null);
    }
  };

const showJoinConfirm = (team) => {
  Modal.confirm({
    title: <span><TeamOutlined /> Xác nhận tham gia nhóm</span>,
    icon: <ExclamationCircleOutlined style={{ color: '#1890ff' }} />,
    content: (
      <div className="py-2">
        <p className="font-semibold text-gray-700 mb-2">Mô tả nhóm:</p>
        <p style={{ whiteSpace: "pre-line", marginTop: 4, color: '#666' }}>
          {team.description || "Không có mô tả."}
        </p>

        <p className="mt-4 text-gray-600">
          Bạn có chắc chắn muốn tham gia nhóm này không?
        </p>
      </div>
    ),
    okText: "Tham gia ngay",
    cancelText: "Hủy",
    centered: true,
    onOk: () => handleJoinTeam(team.teamId),
    okButtonProps: {
      icon: <CheckCircleOutlined />
    }
  });
};


  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <Spin size="large" tip="Đang tải danh sách nhóm..." />
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-20">
        <p className="text-red-500 text-lg">{error}</p>
      </div>
    );
  }

  // ✅ Sắp xếp: Team đã join lên đầu, các team khác theo sau
  const sortedTeams = [...teams].sort((a, b) => {
    const aIsJoined = String(a.teamId) === String(student?.Team);
    const bIsJoined = String(b.teamId) === String(student?.Team);
    
    if (aIsJoined && !bIsJoined) return -1;
    if (!aIsJoined && bIsJoined) return 1;
    return 0;
  });

  // Status color mapping
  const statusConfig = {
    active: { color: 'green', text: 'Đang hoạt động' },
    inactive: { color: 'red', text: 'Không hoạt động' },
    pending: { color: 'orange', text: 'Chờ duyệt' },
    full: { color: 'volcano', text: 'Đã đầy' },
  };

  return (
    <div className="max-w-7xl mx-auto p-6">
      {/* Header Section */}
      <div className="mb-6">
        <Card 
          className="bg-gradient-to-r from-green-500 to-teal-600 border-0 shadow-lg"
          bodyStyle={{ padding: '24px' }}
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="bg-white rounded-full p-3">
                <TeamOutlined className="text-3xl text-green-600" />
              </div>
              <div className="text-white">
                <h2 className="text-2xl font-bold mb-1">Danh Sách Nhóm</h2>
                <p className="text-green-100">
                  {student?.Team 
                    ? "Bạn đã tham gia một nhóm. Khám phá các nhóm khác!" 
                    : "Chọn một nhóm để tham gia và bắt đầu làm việc nhóm"}
                </p>
              </div>
            </div>
            <Badge 
              count={teams.length} 
              showZero 
              style={{ backgroundColor: '#fff', color: '#10b981' }}
              className="text-lg"
            />
          </div>
        </Card>
      </div>

      {/* Teams Grid */}
      {sortedTeams.length === 0 ? (
        <Card className="shadow-sm">
          <Empty
            image={Empty.PRESENTED_IMAGE_SIMPLE}
            description="Chưa có nhóm nào. Vui lòng liên hệ quản trị viên!"
          />
        </Card>
      ) : (
        <Row gutter={[16, 16]}>
          {sortedTeams.map((team) => {
            const isMyTeam = String(team.teamId) === String(student?.Team);
            const isFull = team.membersCount >= team.maxMembers;
            const currentStatus = statusConfig[team.status] || statusConfig.active;

            return (
              <Col xs={24} sm={24} md={12} lg={8} key={team.teamId}>
                <Card
                  className={`h-full shadow-md hover:shadow-xl transition-all duration-300 border-0 ${
                    isMyTeam ? 'ring-2 ring-green-500' : ''
                  }`}
                  bodyStyle={{ padding: '24px' }}
                >
                  {/* Team Header */}
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center gap-3 flex-1">
                      <Avatar 
                        size={56} 
                        icon={<TeamOutlined />}
                        className="bg-gradient-to-br from-green-500 to-teal-600 flex-shrink-0"
                      />
                      <div className="flex-1 min-w-0">
                        <h3 className="text-lg font-bold text-gray-800 truncate mb-1">
                          {team.name}
                        </h3>
                        <Tag color={currentStatus.color} className="text-xs">
                          {currentStatus.text}
                        </Tag>
                      </div>
                    </div>
                    
                    {isMyTeam && (
                      <Tag 
                        icon={<CheckCircleOutlined />} 
                        color="success"
                        className="px-3 py-1"
                      >
                        Nhóm của bạn
                      </Tag>
                    )}
                  </div>

                  {/* Team Description */}
                  <div className="mb-4">
                    <p className="text-gray-600 text-sm line-clamp-2 min-h-[40px]">
                      {team.description || "Không có mô tả"}
                    </p>
                  </div>

                  {/* Team Info */}
                  <div className="space-y-3 mb-4">
                    <Card type="inner" size="small" className="bg-blue-50 border-blue-200">
                      <Space>
                        <CrownOutlined className="text-yellow-500" />
                        <span className="text-sm text-gray-600">Trưởng nhóm:</span>
                        <span className="text-sm font-semibold text-blue-600">
                          {team.leaderName || "Chưa có"}
                        </span>
                      </Space>
                    </Card>

                    <Card type="inner" size="small" className={`${
                      isFull ? 'bg-red-50 border-red-200' : 'bg-green-50 border-green-200'
                    }`}>
                      <Space>
                        <UsergroupAddOutlined className={isFull ? 'text-red-500' : 'text-green-500'} />
                        <span className="text-sm text-gray-600">Thành viên:</span>
                        <span className={`text-sm font-semibold ${
                          isFull ? 'text-red-600' : 'text-green-600'
                        }`}>
                          {team.membersCount} / {team.maxMembers}
                        </span>
                        {isFull && <Tag color="volcano" className="text-xs">Đã đầy</Tag>}
                      </Space>
                    </Card>
                  </div>

                  {/* Action Button */}
                  <div className="pt-3 border-t border-gray-200">
                    {isMyTeam ? (
                      <Button
                        type="primary"
                        icon={<EyeOutlined />}
                        onClick={() => navigate(`/student/team/${team.teamId}`)}
                        size="large"
                        block
                        className="bg-gradient-to-r from-green-500 to-teal-600 border-0 font-semibold"
                      >
                        Xem nhóm của tôi
                      </Button>
                    ) : (
                      <Button
                        type="default"
                        icon={<InfoCircleOutlined />}
                        onClick={() => navigate(`/student/team/${team.teamId}`)}
                        size="large"
                        block
                        className="font-semibold"
                      >
                        Xem chi tiết
                      </Button>
                    )}
                  </div>
                </Card>
              </Col>
            );
          })}
        </Row>
      )}
    </div>
  );
}
