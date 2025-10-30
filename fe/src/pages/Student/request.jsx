import React from "react";
import { useNavigate } from "react-router-dom";
import { Card, Button, Spin, Empty, Tag, Avatar, Space, Badge, Row, Col, Divider, Modal } from "antd";
import {
  UserOutlined,
  MailOutlined,
  CheckCircleOutlined,
  SendOutlined,
  TeamOutlined,
  StarOutlined,
  InfoCircleOutlined,
  CrownOutlined,
  ExclamationCircleOutlined,
  WarningOutlined,
} from "@ant-design/icons";
import toast from "react-hot-toast";
import { useTeamRequests } from "../../../hooks/useTeamRequests";

export default function Request({ teamId, isLeader }) {
  const navigate = useNavigate();
  const token = localStorage.getItem("token");

  const {
    lecturers,
    loading,
    sendRequest,
    sentRequests,
    approvedMentor, // Thêm hook trả về giảng viên đã accept nếu có
  } = useTeamRequests(teamId);

  

  // ✅ Hàm check leader trước khi gửi request
  const handleSendRequest = (lecturerId) => {
    if (!isLeader) {
      Modal.warning({
        title: <span><WarningOutlined /> Không có quyền</span>,
        content: (
          <div className="py-2">
            <p className="text-gray-700">
              Bạn không phải <b>trưởng nhóm</b> nên không thể gửi yêu cầu tới giảng viên.
            </p>
            <p className="text-gray-600 mt-3 text-sm">
              Chỉ trưởng nhóm mới có quyền gửi yêu cầu hướng dẫn đến giảng viên.
            </p>
          </div>
        ),
        okText: "Đã hiểu",
        centered: true,
        icon: <ExclamationCircleOutlined style={{ color: '#faad14' }} />,
      });
      return;
    }
    
    // Nếu là leader thì gửi request
    sendRequest(lecturerId);
  };

  if (!token) {
    toast.error("Vui lòng đăng nhập!");
    navigate("/login");
    return null;
  }

  if (!teamId) {
    return (
      <div className="max-w-4xl mx-auto p-6">
        <Card className="shadow-sm">
          <Empty
            image={Empty.PRESENTED_IMAGE_SIMPLE}
            description={
              <div className="text-center py-4">
                <p className="text-gray-700 text-lg mb-2">
                  Bạn chưa tham gia nhóm nào
                </p>
                <p className="text-gray-500 text-sm">
                  Vui lòng tham gia một nhóm trước khi gửi yêu cầu giảng viên hướng dẫn.
                </p>
              </div>
            }
          >
            <Button 
              type="primary" 
              onClick={() => navigate("/student")}
              className="mt-4"
            >
              Về trang Teams
            </Button>
          </Empty>
        </Card>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="flex justify-center items-center h-96">
        <Spin size="large" tip="Đang tải danh sách giảng viên..." />
      </div>
    );
  }

  if (approvedMentor) {
    return (
      <div className="max-w-4xl mx-auto p-6">
        {/* Header */}
        <div className="mb-6">
          <Card 
            className="bg-gradient-to-r from-green-500 to-emerald-600 border-0 shadow-lg"
            bodyStyle={{ padding: '24px' }}
          >
            <div className="flex items-center gap-3">
              <div className="bg-white rounded-full p-3">
                <CheckCircleOutlined className="text-3xl text-green-600" />
              </div>
              <div className="text-white">
                <h2 className="text-2xl font-bold mb-1">Nhóm Đã Có Giảng Viên Hướng Dẫn</h2>
                <p className="text-green-100">Giảng viên đã chấp nhận hướng dẫn nhóm của bạn</p>
              </div>
            </div>
          </Card>
        </div>

        {/* Mentor Info Card */}
        <Card
          className="shadow-xl border-0"
          bodyStyle={{ padding: '32px' }}
        >
          <div className="text-center mb-6">
            <Avatar 
              size={120} 
              icon={<UserOutlined />}
              className="bg-gradient-to-br from-green-500 to-emerald-600 mb-4"
            >
              {approvedMentor.HoTen?.[0] || "GV"}
            </Avatar>
            <h3 className="text-2xl font-bold text-gray-800 mb-2">
              {approvedMentor.HoTen}
            </h3>
            <Tag icon={<CrownOutlined />} color="gold" className="text-base px-4 py-1">
              Giảng viên hướng dẫn
            </Tag>
          </div>

          <Divider />

          <Card type="inner" className="bg-blue-50 border-blue-200">
            <Space>
              <MailOutlined className="text-blue-600 text-xl" />
              <div>
                <p className="text-gray-600 text-sm mb-1">Email liên hệ:</p>
                <p className="text-gray-800 font-semibold">
                  {approvedMentor.Email || "Không có thông tin"}
                </p>
              </div>
            </Space>
          </Card>

          <div className="mt-6 p-4 bg-green-50 rounded-lg border border-green-200">
            <Space>
              <InfoCircleOutlined className="text-green-600" />
              <p className="text-gray-700 text-sm">
                Hãy liên hệ với giảng viên để bắt đầu quá trình hướng dẫn đề tài của nhóm.
              </p>
            </Space>
          </div>
        </Card>
      </div>
    );
  }

  if (!lecturers?.length) {
    return (
      <div className="max-w-4xl mx-auto p-6">
        <Card className="shadow-sm">
          <Empty
            image={Empty.PRESENTED_IMAGE_SIMPLE}
            description={
              <span className="text-gray-500">
                Không có giảng viên nào khả dụng để gửi yêu cầu
              </span>
            }
          />
        </Card>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto p-6">
      {/* Header Section */}
      <div className="mb-6">
        <Card 
          className="bg-gradient-to-r from-purple-500 to-pink-600 border-0 shadow-lg"
          bodyStyle={{ padding: '24px' }}
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="bg-white rounded-full p-3">
                <TeamOutlined className="text-3xl text-purple-600" />
              </div>
              <div className="text-white">
                <h2 className="text-2xl font-bold mb-1">Yêu Cầu Giảng Viên Hướng Dẫn</h2>
                <p className="text-purple-100">Gửi yêu cầu đến giảng viên để được hướng dẫn đề tài</p>
              </div>
            </div>
            <Badge 
              count={lecturers.length} 
              showZero 
              style={{ backgroundColor: '#fff', color: '#a855f7' }}
              className="text-lg"
            />
          </div>
        </Card>
      </div>

      {/* Lecturers Grid */}
      <Row gutter={[16, 16]}>
        {lecturers.map((lec) => {
          const requested = sentRequests.includes(lec.MaGV);

          return (
            <Col xs={24} sm={12} md={8} lg={6} key={lec.MaGV}>
              <Card
                className="h-full shadow-md hover:shadow-xl transition-all duration-300 border-0"
                bodyStyle={{ padding: '24px' }}
              >
                {/* Avatar & Name */}
                <div className="text-center mb-4">
                  <Avatar 
                    size={80} 
                    icon={<UserOutlined />}
                    className="bg-gradient-to-br from-purple-500 to-pink-600 mb-3"
                  >
                    {lec.HoTen?.[0] || "GV"}
                  </Avatar>
                  <h3 className="text-lg font-bold text-gray-800 mb-2 line-clamp-2 min-h-[56px]">
                    {lec.HoTen}
                  </h3>
                  <Tag color="purple" className="text-xs">
                    Giảng viên
                  </Tag>
                </div>

                {/* Email Info */}
                <Card type="inner" size="small" className="bg-gray-50 mb-4">
                  <Space direction="vertical" size="small" className="w-full">
                    <div className="flex items-center gap-2">
                      <MailOutlined className="text-gray-500" />
                      <span className="text-xs text-gray-600">Email:</span>
                    </div>
                    <p className="text-sm text-gray-800 truncate">
                      {lec.Email || "Không có"}
                    </p>
                  </Space>
                </Card>

                {/* Action Button */}
                <div className="pt-3 border-t border-gray-200">
                  {requested ? (
                    <Button
                      type="default"
                      icon={<CheckCircleOutlined />}
                      block
                      size="large"
                      disabled
                      className="font-semibold"
                    >
                      Đã gửi yêu cầu
                    </Button>
                  ) : (
                    <Button
                      type="primary"
                      icon={<SendOutlined />}
                      block
                      size="large"
                      onClick={() => handleSendRequest(lec.MaGV)}
                      disabled={!teamId || !!approvedMentor || !isLeader}
                      className="bg-gradient-to-r from-purple-500 to-pink-600 border-0 font-semibold hover:shadow-lg"
                    >
                      Gửi yêu cầu
                    </Button>
                  )}
                </div>

                {/* Status Indicator */}
                {requested && (
                  <div className="mt-3 p-2 bg-green-50 rounded border border-green-200">
                    <Space size="small">
                      <InfoCircleOutlined className="text-green-600 text-xs" />
                      <span className="text-xs text-gray-600">
                        Đang chờ phản hồi
                      </span>
                    </Space>
                  </div>
                )}
              </Card>
            </Col>
          );
        })}
      </Row>
    </div>
  );
}
