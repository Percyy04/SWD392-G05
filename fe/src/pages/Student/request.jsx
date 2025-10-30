import React from "react";
import { useNavigate } from "react-router-dom";
import { Card, Button, Spin, Empty } from "antd";
import toast from "react-hot-toast";
import { useTeamRequests } from "../../../hooks/useTeamRequests";

export default function Request({ teamId }) {
  const navigate = useNavigate();
  const token = localStorage.getItem("token");

  const {
    lecturers,
    loading,
    sendRequest,
    sentRequests,
    approvedMentor, // Thêm hook trả về giảng viên đã accept nếu có
  } = useTeamRequests(teamId);

  if (!token) {
    toast.error("Vui lòng đăng nhập!");
    navigate("/login");
    return null;
  }

  if (!teamId) {
    return (
      <Empty
        description="Không có team hợp lệ để gửi yêu cầu giảng viên."
        image={Empty.PRESENTED_IMAGE_SIMPLE}
      />
    );
  }

  if (loading) {
    return (
      <div className="flex justify-center items-center h-96">
        <Spin size="large" />
      </div>
    );
  }

  if (approvedMentor) {
    return (
      <div className="max-w-2xl mx-auto mt-8 px-4">
        <Card
          title="Team đã có giảng viên hướng dẫn"
          bordered
          className="shadow-md rounded-xl text-center"
        >
          <p className="text-gray-700">
            Giảng viên: <strong>{approvedMentor.HoTen}</strong>
          </p>
          <p className="text-gray-500">Email: {approvedMentor.Email || "Không có"}</p>
        </Card>
      </div>
    );
  }

  if (!lecturers?.length) {
    return <Empty description="Không có giảng viên nào khả dụng" />;
  }

  return (
    <div className="max-w-6xl mx-auto mt-8 px-4">
      <h2 className="text-2xl font-semibold mb-4 text-center">
        Gửi yêu cầu hướng dẫn đến giảng viên
      </h2>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {lecturers.map((lec) => {
          const requested = sentRequests.includes(lec.MaGV);

          return (
            <Card
              key={lec.MaGV}
              title={<span className="font-bold text-lg">{lec.HoTen}</span>}
              bordered
              className="shadow-md rounded-xl"
            >
              <p className="text-gray-600 mb-4">
                <strong>Email:</strong> {lec.Email || "Không có"}
              </p>

              {requested ? (
                <Button type="default" block disabled>
                  Đã gửi yêu cầu
                </Button>
              ) : (
                <Button
                  type="primary"
                  block
                  onClick={() => sendRequest(lec.MaGV)}
                  disabled={!teamId || !!approvedMentor} // Không cho gửi nếu đã có mentor
                >
                  Gửi yêu cầu
                </Button>
              )}
            </Card>
          );
        })}
      </div>
    </div>
  );
}
