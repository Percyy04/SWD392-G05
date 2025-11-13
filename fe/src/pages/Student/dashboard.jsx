import { Card, Avatar, Button, Modal, Input, InputNumber } from "antd";
import { useState } from "react";
import toast from "react-hot-toast";
import { socket } from "../../../src/sockets/studentSocket";
import { useStudentDashboard } from "../../../hooks/useStudentDashboard";

export default function Dashboard() {
  const { student, createTeam } = useStudentDashboard(true);

  const [createTeamModalOpen, setCreateTeamModalOpen] = useState(false);
  const [newTeamName, setNewTeamName] = useState("");
  const [newTeamDesc, setNewTeamDesc] = useState("");
  const [maxMembers, setMaxMembers] = useState(5);
  const [loading, setLoading] = useState(false);

  const handleCreateTeam = async () => {
    if (!newTeamName.trim()) {
      toast.error("Team name cannot be empty");
      return;
    }

    if (!maxMembers || maxMembers < 2) {
      toast.error("Team must have at least 2 members");
      return;
    }

    setLoading(true);
    try {
      const team = await createTeam(newTeamName.trim(), newTeamDesc.trim(), maxMembers);

      socket.emit("student_request", {
        type: "create_team",
        teamName: team.name,
        studentId: student?.MaSV,
        full_name: student?.HoTen,
        requested_at: new Date().toISOString(),
      });

      toast.success(`✅ Team "${team.name}" created successfully!`);

      setCreateTeamModalOpen(false);
      setNewTeamName("");
      setNewTeamDesc("");
      setMaxMembers(5);
    } catch (err) {
      console.error("Error creating team:", err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <Card title="My Profile" className="max-w-md">
        <p><b>Name:</b> {student?.HoTen}</p>
        <p><b>Email:</b> {student?.Email}</p>
        <p><b>Role:</b> {student?.Role}</p>
        <p><b>Team:</b> {student?.Team ? `Team #${student.Team}` : "Not in any team"}</p>

        <Avatar
          style={{
            backgroundColor: "#1677ff",
            color: "#fff",
            marginTop: 8,
          }}
        >
          {student?.HoTen?.[0] || "?"}
        </Avatar>

        {/* {!student?.Team && (
          <Button
            type="primary"
            className="mt-4"
            onClick={() => setCreateTeamModalOpen(true)}
          >
            Create Team
          </Button>
        )} */}
      </Card>

      <Modal
        title="Create Team"
        open={createTeamModalOpen}
        onOk={handleCreateTeam}
        onCancel={() => setCreateTeamModalOpen(false)}
        confirmLoading={loading}
      >
        <Input
          placeholder="Team Name"
          value={newTeamName}
          onChange={(e) => setNewTeamName(e.target.value)}
          className="mb-2"
        />
        <Input.TextArea
          placeholder="Team Description"
          value={newTeamDesc}
          onChange={(e) => setNewTeamDesc(e.target.value)}
          rows={3}
          className="mb-2"
        />
        <InputNumber
          min={2}
          max={10}
          value={maxMembers}
          onChange={(value) => setMaxMembers(value)}
          className="w-full"
          placeholder="Max Members"
        />
      </Modal>
    </>
  );
}
