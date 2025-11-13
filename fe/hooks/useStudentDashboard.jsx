import { useState, useEffect } from "react";
import { message } from "antd";
import { socket } from "../src/sockets/studentSocket";
import jwtDecode from "jwt-decode";

export function useStudentDashboard(shouldFetch = true) {
  const [student, setStudent] = useState(null);
  const [teams, setTeams] = useState([]);
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // ✅ Luôn cố gắng lấy studentId từ token (dù không fetch)
  useEffect(() => {
    const token = localStorage.getItem("token");
    if (token) {
      try {
        const decoded = jwtDecode(token);
        setStudent(prev => prev || { id: decoded.id || decoded.studentId || decoded._id });
      } catch (e) {
        console.warn("⚠️ Cannot decode token:", e.message);
      }
    }
  }, []);

  // ---------------- Fetch data + socket ----------------
  useEffect(() => {
    if (!shouldFetch) return;

    const fetchData = async () => {
      setLoading(true);
      setError(null);
      try {
        const token = localStorage.getItem("token");

        // 1️⃣ Student info
        const resStudent = await fetch("http://localhost:5000/api/students/me", {
          headers: { Authorization: `Bearer ${token}` },
        });
        const dataStudent = await resStudent.json();
        if (!resStudent.ok) throw new Error(dataStudent.message || "Failed to fetch student");
        setStudent(dataStudent.student);

        // 2️⃣ Teams
        const resTeams = await fetch("http://localhost:5000/api/students/teams", {
          headers: { Authorization: `Bearer ${token}` },
        });
        const dataTeams = await resTeams.json();
        if (!resTeams.ok) throw new Error(dataTeams.message || "Failed to fetch teams");
        setTeams(dataTeams.teams);

        // 3️⃣ Join requests
        const resRequests = await fetch("http://localhost:5000/api/students/requests", {
          headers: { Authorization: `Bearer ${token}` },
        });
        const dataRequests = await resRequests.json();
        if (!resRequests.ok) throw new Error(dataRequests.message || "Failed to fetch requests");
        setRequests(dataRequests.requests);

        // 4️⃣ Nếu student.Team không tồn tại trong teams, reset
        if (dataStudent.student.Team) {
          const teamExists = dataTeams.teams.some(
            t => String(t.teamId) === String(dataStudent.student.Team)
          );
          if (!teamExists) {
            setStudent(prev => ({ ...prev, Team: null }));
          }
        }

        // ✅ Fetch voting status if student has a team
        if (dataStudent.student.Team) {
          const resVotes = await fetch(
            `http://localhost:5000/api/vote/leader/${dataStudent.student.Team}`,
            { headers: { Authorization: `Bearer ${token}` } }
          );
          const dataVotes = await resVotes.json();

          if (resVotes.ok && dataVotes.votes) {
            setTeams(prev =>
              prev.map(t =>
                String(t.teamId) === String(dataStudent.student.Team)
                  ? { ...t, votes: dataVotes.votes, status: "voting" }
                  : t
              )
            );
          }
        }

      } catch (err) {
        setError(err.message || "Server error");
        message.error(err.message || "Server error");
      } finally {
        setLoading(false);
      }
    };

    fetchData();

    // ---------------- Socket.IO realtime ----------------
    const studentId = localStorage.getItem("user");
    if (studentId) socket.emit("join_student_room", { studentId });

    const handleRequestUpdate = (newRequest) => {
      setRequests(prev => [newRequest, ...prev]);
    };

    const handleTeamUpdate = (updatedTeam) => {
      setTeams(prev =>
        prev.map(team =>
          team.teamId === updatedTeam.MaTeam || team.teamId === updatedTeam.teamId
            ? {
              ...team,
              membersCount: updatedTeam.SoLuongThanhVienHienTai || team.membersCount,
              status: updatedTeam.TrangThaiNhom || team.status,
            }
            : team
        )
      );
    };

    socket.on("new_request", handleRequestUpdate);
    socket.on("team_updated", handleTeamUpdate);

    return () => {
      socket.off("new_request", handleRequestUpdate);
      socket.off("team_updated", handleTeamUpdate);
    };
  }, [shouldFetch]);

  // ---------------- Cancel request ----------------
  const cancelRequest = async (requestId) => {
    try {
      const token = localStorage.getItem("token");
      const res = await fetch(`http://localhost:5000/api/students/requests/${requestId}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (data.success) {
        setRequests(prev => prev.filter(r => r.id !== parseInt(requestId)));
        message.success(data.message || "Request cancelled successfully");
      } else {
        message.error(data.message || "Failed to cancel request");
      }
    } catch (err) {
      console.error(err);
      message.error("Server error while cancelling request");
    }
  };

  // ---------------- Join team ----------------
  const joinTeam = async (teamId) => {
    try {
      const token = localStorage.getItem("token");
      const res = await fetch(`http://localhost:5000/api/students/join-team/${teamId}`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`
        },
      });
      const data = await res.json();

      if (data.success && data.team) {
        const updatedTeam = data.team;

        // Cập nhật student ngay lập tức
        setStudent(prev => ({ ...prev, Team: updatedTeam.MaTeam || updatedTeam.teamId }));

        // Cập nhật danh sách team
        setTeams(prev =>
          prev.map(team =>
            team.teamId === updatedTeam.MaTeam || team.teamId === updatedTeam.teamId
              ? {
                ...team,
                membersCount: updatedTeam.SoLuongThanhVienHienTai || team.membersCount,
                status: updatedTeam.TrangThaiNhom || team.status,
              }
              : team
          )
        );

        message.success(data.message || "You have joined the team successfully");
      } else {
        message.error(data.message || "Failed to join team");
      }
    } catch (err) {
      console.error(err);
      message.error("Server error while joining team");
    }
  };

  // ---------------- Leave team ----------------
  const leaveTeam = async (teamId) => {
    try {
      const token = localStorage.getItem("token");
      const res = await fetch(`http://localhost:5000/api/students/leave-team/${teamId}`, {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();

      if (data.success) {
        setStudent(prev => ({ ...prev, Team: null }));

        setTeams(prev =>
          prev.map(t =>
            String(t.teamId) === String(teamId)
              ? { ...t, membersCount: Math.max(0, (t.membersCount || 1) - 1) }
              : t
          )
        );

        socket.emit("student_left_team", { teamId, studentId: student?.id });
        message.success(data.message || "You have left the team successfully");
      } else {
        message.error(data.message || "Failed to leave team");
      }
    } catch (err) {
      console.error(err);
      message.error("Server error while leaving team");
    }
  };

  // ---------------- Create team ----------------
  const createTeam = async (teamName, description = "", maxMembers = 5) => {
    try {
      const token = localStorage.getItem("token");
      const res = await fetch("http://localhost:5000/api/students/create-team", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          name: teamName,      // ✅ Đúng key theo backend
          description,
          maxMembers,
        }),
      });

      const data = await res.json();

      if (data.success && data.team) {
        const newTeam = data.team;

        // ✅ Cập nhật student + team list
        setStudent((prev) => ({ ...prev, Team: newTeam.teamId }));
        setTeams((prev) => [newTeam, ...prev]);

        message.success(data.message || "Team created successfully");
        socket.emit("team_created", { teamId: newTeam.teamId, leaderId: student?.id });
        return newTeam; // ✅ để Dashboard nhận được team trả về
      } else {
        message.error(data.message || "Failed to create team");
        throw new Error(data.message);
      }
    } catch (err) {
      console.error(err);
      message.error("Server error while creating team");
      throw err;
    }
  };

  // ---------------- Vote Leader ----------------
  const voteLeader = async (candidateId) => {
    try {
      const token = localStorage.getItem("token");
      if (!student?.Team) {
        return message.warning("You are not in a team");
      }

      const res = await fetch("http://localhost:5000/api/vote/leader", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          teamId: student.Team,
          candidateId,
        }),
      });

      const data = await res.json();

      if (res.ok) {
        message.success(data.msg || "Vote successfully!");

        // ✅ Cập nhật ngay trạng thái vote vào team state
        setTeams(prev =>
          prev.map(t =>
            String(t.teamId) === String(student.Team)
              ? {
                ...t,
                votes: data.data?.votes || t.votes,
                status: data.status, // "leader_chosen" nếu đủ phiếu
              }
              : t
          )
        );

        // ✅ Nếu muốn notify realtime sau này
        socket.emit("leader_vote_update", {
          teamId: student.Team,
          voterId: student.id,
          candidateId,
        });

      } else {
        message.error(data.msg || "Vote failed");
      }
    } catch (err) {
      console.error(err);
      message.error("Server error while voting leader");
    }
  };

  // ---------------- View Team Vote Result ----------------
const getTeamVotes = async (teamId) => {
  try {
    const token = localStorage.getItem("token");
    const res = await fetch(
      `http://localhost:5000/api/vote/leader/${teamId}`,
      { headers: { Authorization: `Bearer ${token}` } }
    );

    const data = await res.json();
    if (!res.ok) {
      message.error(data.msg || "Cannot get vote result");
      return null;
    }

    // ✅ Gắn kết quả vote vào team tương ứng
    setTeams(prev =>
      prev.map(t =>
        String(t.teamId) === String(teamId)
          ? {
              ...t,
              votes: data.votes,
              totalVotes: data.totalVotes,
              voteStatus: "voting", // Có thể dùng để UI thay đổi màu
            }
          : t
      )
    );

    return data; // ✅ UI nhận về data để hiển thị
  } catch (err) {
    console.error(err);
    message.error("Server error while fetching vote result");
    return null;
  }
};


  return {
    student,
    setStudent,
    teams,
    setTeams,
    requests,
    loading,
    error,
    cancelRequest,
    joinTeam,
    leaveTeam,
    createTeam,
    getTeamVotes,
    voteLeader,
  };
}
