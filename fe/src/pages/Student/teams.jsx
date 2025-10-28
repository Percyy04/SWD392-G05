import { Card, Button, Modal } from "antd";
import { ExclamationCircleOutlined } from "@ant-design/icons";
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
        toast.success(data.message || "You have joined the team!");

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
        toast.error(data.message || "Failed to join team");
      }
    } catch (err) {
      console.error("Join team error:", err);
      toast.error("Server error while joining team");
    } finally {
      setLoadingTeamId(null);
    }
  };

const showJoinConfirm = (team) => {
  Modal.confirm({
    title: "Confirm to Join This Team",
    icon: <ExclamationCircleOutlined />,
    content: (
      <div>
        <p><b>Description:</b></p>
        <p style={{ whiteSpace: "pre-line", marginTop: 4 }}>
          {team.description || "No description provided."}
        </p>

        <p className="mt-3">
          Are you sure you want to join this team?
        </p>
      </div>
    ),
    okText: "Yes, Join Team",
    cancelText: "Cancel",
    centered: true,
    onOk: () => handleJoinTeam(team.teamId),
  });
};


  if (loading) return <p>Loading teams...</p>;
  if (error) return <p style={{ color: "red" }}>{error}</p>;

  const displayTeams = student?.Team
    ? teams.filter(team => String(team.teamId) === String(student.Team))
    : teams;

  return (
    <div>
      {displayTeams.map((team) => (
        <Card
          key={team.teamId}
          title={team.name}
          extra={
            !student?.Team ? (
              <Button
                type="primary"
                onClick={() => showJoinConfirm(team)}
                loading={loadingTeamId === team.teamId}
                disabled={loadingTeamId === team.teamId}
              >
                Join Team
              </Button>
            ) : (
              <Button
                type="link"
                onClick={() => navigate(`/student/team/${team.teamId}`)}
              >
                View Team
              </Button>
            )

            
          }
          style={{ marginBottom: 16 }}
        >
          <p><b>Description:</b> {team.description}</p>
          <p><b>Members:</b> {team.membersCount} / {team.maxMembers}</p>
          <p><b>Leader:</b> {team.leaderName}</p>
        </Card>
      ))}
    </div>
  );
}
