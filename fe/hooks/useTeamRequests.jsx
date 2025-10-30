import { useState, useEffect } from "react";
import toast from "react-hot-toast";

/**
 * Hook cho phép Leader lấy danh sách giảng viên và gửi request
 * API:
 *   - GET  /api/lecturer-requests/lecturers
 *   - POST /api/team-requests/:teamId/request/:lecturerId
 */
export function useTeamRequests(teamId) {
  const [lecturers, setLecturers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [sending, setSending] = useState(false);
  const [sentRequests, setSentRequests] = useState([]);
  const [approvedMentor, setApprovedMentor] = useState(null);
  const token = localStorage.getItem("token");

  // ----------- 🧩 Lấy danh sách giảng viên -----------
  const fetchLecturers = async () => {
    if (!token) {
      console.warn("⚠️ Không có token, không fetch lecturers");
      return;
    }

    try {
      setLoading(true);
      const res = await fetch("http://localhost:5000/api/lecturer-requests/lecturers", {
        headers: { Authorization: `Bearer ${token}` },
      });

      const data = await res.json();

      if (res.status === 401) {
        toast.error("Token hết hạn hoặc không hợp lệ");
        return;
      }

      if (data.success) {
        setLecturers(data.data || []);
      } else {
        toast.error(data.message || "Không thể tải danh sách giảng viên");
      }
    } catch (err) {
      console.error("🔥 Fetch lecturers error:", err);
      toast.error("Lỗi khi tải danh sách giảng viên");
    } finally {
      setLoading(false);
    }
  };

  // ----------- 🚀 Gửi request đến giảng viên -----------
  const sendRequest = async (lecturerId) => {
    if (!token) {
      toast.error("Bạn cần đăng nhập trước");
      return;
    }
    if (!teamId) {
      toast.error("Không tìm thấy team hợp lệ");
      return;
    }

    try {
      setSending(true);
      const res = await fetch(
        `http://localhost:5000/api/team-requests/${teamId}/request/${lecturerId}`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        }
      );

      const data = await res.json();

      if (res.status === 403) {
        toast.error("Chỉ leader mới có quyền gửi yêu cầu!");
        return;
      }
      if (res.status === 404) {
        toast.error("Không tìm thấy team hoặc giảng viên!");
        return;
      }

      if (data.success) {
        toast.success("✅ Đã gửi yêu cầu đến giảng viên!");
        setSentRequests((prev) => [...prev, lecturerId]);
      } else if (data.message?.includes("Team này đã có giảng viên đồng ý")) {
        toast.success("Nhóm đã có giảng viên hướng dẫn!");
        // Cập nhật ngay approvedMentor
        if (data.mentorName && data.mentorEmail) {
          setApprovedMentor({
            HoTen: data.mentorName,
            Email: data.mentorEmail,
          });
        }
      } else {
        toast.error(data.message || "Gửi yêu cầu thất bại");
      }
    } catch (err) {
      console.error("🔥 Send request error:", err);
      toast.error("Không thể gửi yêu cầu");
    } finally {
      setSending(false);
    }
  };

  // ----------- useEffect luôn fetch lecturers khi mount hoặc teamId thay đổi -----------
  useEffect(() => {
    if (teamId) {
      fetchLecturers();
    }
  }, [teamId]);

  return {
    lecturers,
    loading,
    sending,
    sentRequests,
    approvedMentor,
    sendRequest,
    refetchLecturers: fetchLecturers,
  };
}
