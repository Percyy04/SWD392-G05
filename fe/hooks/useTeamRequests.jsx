import { useState, useEffect, useCallback, useRef } from "react";
import { io } from "socket.io-client";
import toast from "react-hot-toast";

const API_URL = "http://localhost:5000/api";
const SOCKET_URL = "http://localhost:5000";

export function useTeamRequests(teamId) {
  const [lecturers, setLecturers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [sending, setSending] = useState(false);
  const [sentRequests, setSentRequests] = useState([]);
  const [approvedMentor, setApprovedMentor] = useState(null);

  const socketRef = useRef(null);
  const hasConnectedRef = useRef(false); // tránh kết nối nhiều lần

  const token = localStorage.getItem("token");
  const user = JSON.parse(localStorage.getItem("user"));

  // ---------------- SOCKET ----------------
  useEffect(() => {
    if (!token || !user || user.role.toLowerCase() !== "student") return;

    // Chỉ connect 1 lần
    if (hasConnectedRef.current) return;
    hasConnectedRef.current = true;

    console.log("🔌 Initializing socket connection...");

    const socket = io(SOCKET_URL, {
      auth: { token },
      transports: ["websocket"],
      reconnectionAttempts: 5,
    });
    socketRef.current = socket;

    socket.on("connect", () => console.log("✅ Socket connected:", socket.id));
    socket.on("connect_error", (err) => {
      console.error("❌ Socket connection error:", err);
      toast.error("Socket connection failed. Check server or token.");
    });
    socket.on("disconnect", (reason) => console.log("❌ Socket disconnected. Reason:", reason));
    socket.onAny((event, data) => console.log("📥 Socket event received:", event, data));

    const studentId = user.id || user._id;
    socket.emit("join_student_room", { studentId }, (ack) => {
      if (ack?.status === "ok") console.log(`🎓 Joined room student_${studentId}`);
      else console.warn("⚠️ Join room ack:", ack);
    });

    socket.on("lecturer_response", (data) => {
      if (!data) return console.warn("⚠️ lecturer_response empty");

      if (data.status === "accept") {
        toast.success(data.message || "Giảng viên chấp nhận hướng dẫn!");
        setApprovedMentor({
          HoTen: data.lecturerName || "Giảng viên",
          Email: data.lecturerEmail || "",
        });
      } else {
        toast.error(data.message || "Giảng viên từ chối yêu cầu");
      }

      setSentRequests((prev) => prev.filter((id) => id !== data.lecturerId));
      fetchLecturers();
    });

    return () => {
      console.log("🛑 Cleaning up socket...");
      socketRef.current?.disconnect();
      socketRef.current = null;
      hasConnectedRef.current = false;
    };
  }, [token, user, teamId]);

  // ---------------- FETCH LECTURERS ----------------
  const fetchLecturers = useCallback(async () => {
    if (!token) return;
    try {
      setLoading(true);
      const res = await fetch(`${API_URL}/lecturer-requests/lecturers`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (data.success) setLecturers(data.data || []);
      else toast.error(data.message || "Không thể tải danh sách giảng viên");
    } catch (err) {
      console.error("🔥 Fetch lecturers error:", err);
      toast.error("Lỗi khi tải danh sách giảng viên");
    } finally {
      setLoading(false);
    }
  }, [token]);

  // ---------------- SEND REQUEST ----------------
  const sendRequest = useCallback(
    async (lecturerId) => {
      if (!token || !teamId) return;

      try {
        setSending(true);
        const res = await fetch(`${API_URL}/team-requests/${teamId}/request/${lecturerId}`, {
          method: "POST",
          headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        });
        const data = await res.json();

        if (data.success) {
          toast.success("✅ Đã gửi yêu cầu đến giảng viên!");
          setSentRequests((prev) => [...prev, lecturerId]);
        } else if (data.message?.includes("Team này đã có giảng viên đồng ý")) {
          toast.success("Nhóm đã có giảng viên hướng dẫn!");
          if (data.mentorName && data.mentorEmail)
            setApprovedMentor({ HoTen: data.mentorName, Email: data.mentorEmail });
        } else toast.error(data.message || "Gửi yêu cầu thất bại");
      } catch (err) {
        console.error("🔥 Send request error:", err);
        toast.error("Không thể gửi yêu cầu");
      } finally {
        setSending(false);
      }
    },
    [token, teamId]
  );

  // ---------------- useEffect fetch lecturers ----------------
  useEffect(() => {
    if (teamId) fetchLecturers();
  }, [teamId, fetchLecturers]);

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
