import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Card, List, Tag, Button, Popconfirm, Modal, Radio } from "antd";
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
          toast.error(data.message || "Failed to load team details");
        }
      } catch (err) {
        console.error("Fetch team detail error:", err);
        toast.error("Server error while fetching team details");
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
      return toast.error("Please select a leader to vote!");
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
        toast.success("Vote recorded!");
      } else if (data.status === "leader_chosen") {
        toast.success("Leader selected successfully!");
      } else {
        toast.error(data.msg);
      }

      setIsVoteModalOpen(false);
    } catch (err) {
      console.error(err);
      toast.error("Failed to vote!");
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
      toast.success("Vote results loaded!");
      Modal.info({
        title: "Team Vote Results",
        content: (
          <div>
            <p><b>Total Votes:</b> {data.totalVotes}</p>
            <ul>
              {data.votes.map((v, idx) => (
                <li key={idx}>
                  ✅ {v.voterName} → <b>{v.candidateName}</b>
                </li>
              ))}
            </ul>
          </div>
        ),
        width: 500
      });
    } else {
      toast.error(data.msg || "Failed to load vote results");
    }
  } catch (err) {
    console.error("Load votes error:", err);
    toast.error("Server error!");
  }
};


  const handleLeave = async () => {
    await leaveTeam(teamId);
    navigate("/student", { state: { selectedMenu: "2" } });
  };

  if (loading) return <p>Loading team details...</p>;
  if (!team) return <p>Team not found</p>;

  return (
    <div className="p-4">
      <Card title={team.name} extra={<Tag color="blue">{team.status}</Tag>}>
        <p><b>Description:</b> {team.description}</p>
        <p><b>Leader:</b> {team.leaderName}</p>
        <p><b>Members:</b> {team.currentMembers} / {team.maxMembers}</p>

        {/* ✅ Vote Leader Section */}
        {isMember && (
          <div className="mb-3">
            {!hasVoted ? (
              <Button type="primary" onClick={() => setIsVoteModalOpen(true)}>
                Vote Leader
              </Button>
            ) : (
              <Tag color="green">✅ You have already voted for leader</Tag>
            )}
            <Button className="mt-2 ml-2" onClick={handleViewVotes}>
  Xem kết quả vote
</Button>

          </div>
        )}

        <h3 className="mt-4 mb-2">Team Members:</h3>
        <List
          bordered
          dataSource={team.members}
          renderItem={(member) => (
            <List.Item>
              <div>
                <b>{member.fullName}</b> — {member.email}
              </div>
              {member.studentId === team.leaderId && <Tag color="gold">Leader</Tag>}
            </List.Item>
          )}
        />

        <div className="mt-4 flex gap-3">
          <Button onClick={() => navigate(-1)}>Back</Button>
          {isMember && (
            <Popconfirm
              title="Are you sure you want to leave this team?"
              onConfirm={handleLeave}
              okText="Yes, leave"
              cancelText="Cancel"
            >
              <Button danger>Leave Team</Button>
            </Popconfirm>
          )}
        </div>
      </Card>

      {/* ✅ Vote Modal */}
      <Modal
        title="Vote for Team Leader"
        open={isVoteModalOpen}
        onCancel={() => setIsVoteModalOpen(false)}
        onOk={handleVoteSubmit}
      >
        <Radio.Group
          onChange={(e) => setCandidateId(e.target.value)}
          style={{ width: "100%" }}
        >
          <List
            dataSource={team.members.filter(m => m.studentId !== studentId)}
            renderItem={(member) => (
              <List.Item>
                <Radio value={member.studentId}>
                  {member.fullName}
                </Radio>
              </List.Item>
            )}
          />
        </Radio.Group>
      </Modal>
    </div>
  );
}
