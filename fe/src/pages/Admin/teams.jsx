/* eslint-disable no-unused-vars */
import { Card, Table, Tag, Button, Dropdown, Modal, Form, Input, Select, message, Badge, Empty, Avatar } from "antd"
import {
  PlusOutlined,
  MoreOutlined,
  EyeOutlined,
  EditOutlined,
  UserAddOutlined,
  DeleteOutlined,
  TeamOutlined,
  SearchOutlined,
} from "@ant-design/icons"
import { useState, useEffect, useMemo } from "react"
import { useTeams } from "../../../hooks/use-teams";
import { debounce } from "lodash";

export function Teams() {
  const [isModalVisible, setIsModalVisible] = useState(false)
  const [assignLeaderModal, setAssignLeaderModal] = useState({ visible: false, team: null })
  const [form] = Form.useForm()
  const [leaderForm] = Form.useForm()
  const [viewTeamModal, setViewTeamModal] = useState({ visible: false, team: null })
  const [searchText, setSearchText] = useState("")
  const { data: teams, loading, createTeam, updateTeam, deleteTeam } = useTeams(true)
  const [editModal, setEditModal] = useState({ visible: false, team: null });
  const [editForm] = Form.useForm();
  const [voteResultModal, setVoteResultModal] = useState({
    visible: false,
    team: null,
    votes: [],
    totalVotes: 0,
  });

  // ✅ State cho pagination
  const [pagination, setPagination] = useState({
    current: 1,
    pageSize: 10,
  });

  const openEditModal = (team) => {
    setEditModal({ visible: true, team });
    editForm.setFieldsValue({
      teamName: team.name,
      description: team.description,
      status: team.status,
    });
  };

  const handleEditTeam = async () => {
    try {
      const values = await editForm.validateFields();
      const payload = {
        tenTeam: values.teamName.trim(),
        moTaNhom: values.description || "",
        trangThaiNhom: values.status,
      };
      const result = await updateTeam(editModal.team.id, payload);
      if (result.success) {
        message.success("Team updated successfully!");
        setEditModal({ visible: false, team: null });
      } else {
        message.error(result.message || "Failed to update team");
      }
    } catch (err) {
      message.error("Please fill in all required fields.");
    }
  };

  const [debouncedText, setDebouncedText] = useState("");
  const handleSearch = useMemo(
    () =>
      debounce((value) => {
        setDebouncedText(value);
      }, 300),
    []
  );

  const openViewTeamModal = (team) => {
    setViewTeamModal({ visible: true, team })
  }

  const closeViewTeamModal = () => {
    setViewTeamModal({ visible: false, team: null })
  }

  const filteredTeams = useMemo(() => {
    if (!teams) return [];
    const text = debouncedText.toLowerCase();
    return teams.filter((team) => {
      const id = String(team.id || "").toLowerCase();
      const name = String(team.name || "").toLowerCase();
      const leader = String(team.leaderName || "").toLowerCase();
      return id.includes(text) || name.includes(text) || leader.includes(text);
    });
  }, [teams, debouncedText]);

  const getNextTeamId = () => {
    if (!teams || teams.length === 0) return "T01"
    const maxId = teams.reduce((max, t) => {
      const num = Number.parseInt(String(t.id || "").replace(/\D/g, ""), 10) || 0
      return Math.max(max, num)
    }, 0)
    return `T${String(maxId + 1).padStart(2, "0")}`
  }

  useEffect(() => {
    if (isModalVisible) {
      form.setFieldsValue({ maTeam: getNextTeamId() })
    }
  }, [isModalVisible, teams])

  const handleDelete = (maTeam) => {
    Modal.confirm({
      title: "Confirm delete",
      content: "Are you sure you want to delete this team?",
      okText: "Yes, delete",
      okButtonProps: { className: "bg-red-600" },
      onOk: async () => {
        const res = await deleteTeam(maTeam)
        if (res.success) message.success("Team deleted successfully!")
      },
    })
  }

  const handleCreate = async () => {
    try {
      const values = await form.validateFields()
      
      const payload = {
        maTeam: values.maTeam.trim(),
        tenTeam: values.teamName.trim(),
        trangThaiNhom: values.status || "Open",
        moTaNhom: values.description || "",
        soLuongThanhVienToiDa: Number(values.maxMembers),
      }
      
      const result = await createTeam(payload)
      
      if (result.success) {
        message.success("Team created successfully!")
        setIsModalVisible(false)
        form.resetFields()
      }
    } catch (err) {
      console.error("Error creating team:", err);
      message.error("Please fill in all required fields.")
    }
  }

  const openAssignLeaderModal = (team) => {
    setAssignLeaderModal({ visible: true, team })
    leaderForm.setFieldsValue({
      leaderID: team.leaderID || "",
      leaderName: team.leaderName || "",
    })
  }

  const handleAssignLeader = async () => {
    try {
      const values = await leaderForm.validateFields()
      const payload = {
        leaderID: values.leaderID.trim(),
        leaderName: values.leaderName.trim(),
      }
      const result = await updateTeam(assignLeaderModal.team.id, payload)
      if (result.success) {
        message.success("Leader assigned successfully!")
        setAssignLeaderModal({ visible: false, team: null })
      }
    } catch (err) {
      message.error("Please fill in both Leader ID and Name.")
    }
  }

  const openVoteResultModal = async (team) => {
    try {
      const token = localStorage.getItem("token");
      const res = await fetch(`http://localhost:5000/api/vote/leader/${team.id}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const data = await res.json();

      if (!res.ok) return message.error(data.message || "Failed to fetch vote results");

      const voteCount = {};
      (data.votes || []).forEach(vote => {
        voteCount[vote.candidateId] = (voteCount[vote.candidateId] || 0) + 1;
      });

      let winnerId = null;
      let maxVotes = 0;
      for (const cid in voteCount) {
        if (voteCount[cid] > maxVotes) {
          maxVotes = voteCount[cid];
          winnerId = cid;
        }
      }

      const winnerName =
        winnerId && data.votes.length > 0
          ? data.votes.find(v => v.candidateId === winnerId)?.candidateName
          : null;

      setVoteResultModal({
        visible: true,
        team,
        votes: data.votes || [],
        totalVotes: data.totalVotes || 0,
        winner: winnerName,
        winnerVotes: maxVotes,
      });

    } catch (err) {
      message.error("Failed to load vote results");
    }
  };

  const DropdownAction = ({ record }) => {
    const menu = {
      items: [
        { key: "1", label: "View Details", icon: <EyeOutlined />, onClick: () => openViewTeamModal(record) },
        { key: "2", label: "Edit Team", icon: <EditOutlined />, onClick: () => openEditModal(record) },
        { key: "3", label: "Assign Leader", icon: <UserAddOutlined />, onClick: () => openAssignLeaderModal(record) },
        { key: "5", label: "View Votes", icon: <TeamOutlined />, onClick: () => openVoteResultModal(record) },
        { key: "4", label: "Delete Team", danger: true, icon: <DeleteOutlined /> },
      ],
      onClick: ({ key }) => {
        if (key === "4") handleDelete(record.id);
      },
    };

    return (
      <Dropdown menu={menu} trigger={["click"]}>
        <Button type="text" icon={<MoreOutlined />} className="hover:bg-gray-100 rounded-lg transition-colors" />
      </Dropdown>
    )
  }

  // ✅ Columns với cột # tự động
  const columns = [
    {
      title: "#",
      key: "index",
      width: 60,
      align: "center",
      fixed: "left",
      render: (_, __, index) => {
        // ✅ Tính index theo pagination
        const currentIndex = (pagination.current - 1) * pagination.pageSize + index + 1;
        return (
          <span className="font-semibold text-gray-600">
            {currentIndex}
          </span>
        );
      },
    },
    {
      title: "Team",
      dataIndex: "name",
      key: "name",
      width: 200,
      render: (name, record) => (
        <div className="flex items-center gap-3">
          <Avatar size="large" className="bg-gradient-to-br from-purple-500 to-pink-500 font-semibold text-white">
            {name?.[0]?.toUpperCase()}
          </Avatar>
          <div className="flex flex-col">
            <span className="font-semibold text-gray-900">{name}</span>
            <span className="text-xs text-gray-500">{record.id}</span>
          </div>
        </div>
      ),
    },
    {
      title: "Leader",
      dataIndex: "leaderName",
      key: "leader",
      width: 180,
      render: (leaderName, record) =>
        leaderName ? (
          <div className="flex items-center gap-2">
            <Avatar size="small" className="bg-gradient-to-br from-blue-500 to-cyan-500 font-semibold text-white">
              {leaderName?.[0]?.toUpperCase()}
            </Avatar>
            <div className="flex flex-col">
              <span className="font-medium text-gray-900">{leaderName}</span>
              <span className="text-xs text-gray-500">{record.leaderID}</span>
            </div>
          </div>
        ) : (
          <span className="text-gray-400 text-sm">—</span>
        ),
    },
    {
      title: "Members",
      dataIndex: "membersCount",
      key: "membersCount",
      width: 120,
      render: (count) => <Badge count={count} style={{ backgroundColor: "#10b981" }} />,
    },
    {
      title: "Status",
      dataIndex: "status",
      key: "status",
      width: 120,
      render: (status) => {
        const config = { Active: "green", Locked: "red", Voting: "blue", Open: "orange" }
        return (
          <Tag color={config[status] || "default"} className="px-3 py-1">
            {status}
          </Tag>
        )
      },
    },
    {
      title: "Description",
      dataIndex: "description",
      key: "description",
      width: 200,
      render: (desc) =>
        desc ? <span className="text-gray-600 text-sm">{desc}</span> : <span className="text-gray-400 text-sm">—</span>,
    },
    {
      title: "Actions",
      key: "action",
      width: 100,
      align: "center",
      render: (_, record) => <DropdownAction record={record} />,
    },
  ]

  return (
    <>
      <div className="space-y-6">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <div className="p-2 bg-purple-100 rounded-lg">
                <TeamOutlined className="text-purple-600 text-xl" />
              </div>
              <h1 className="text-3xl font-bold text-gray-900">Teams Management</h1>
            </div>
            <p className="text-gray-600">Manage and organize all team information</p>
          </div>
          <Button
            type="primary"
            size="large"
            icon={<PlusOutlined />}
            className="bg-purple-600 hover:bg-purple-700"
            onClick={() => setIsModalVisible(true)}
          >
            Create Team
          </Button>
        </div>

        <div className="flex gap-3">
          <Input
            placeholder="Search by team name, leader, or ID..."
            prefix={<SearchOutlined className="text-gray-400" />}
            className="rounded-lg h-10"
            size="large"
            value={searchText}
            onChange={(e) => {
              setSearchText(e.target.value);
              handleSearch(e.target.value);
            }}
          />
        </div>

        <Card className="border border-gray-200 shadow-sm rounded-lg overflow-hidden" styles={{ body: { padding: 0 } }}>
          <Table
            columns={columns}
            dataSource={filteredTeams}
            loading={loading}
            pagination={{
              current: pagination.current,
              pageSize: pagination.pageSize,
              showSizeChanger: true,
              showTotal: (total) => `Total ${total} teams`,
              className: "px-6 py-4",
              onChange: (page, pageSize) => {
                setPagination({ current: page, pageSize });
              },
            }}
            rowKey="id"
            locale={{
              emptyText: <Empty description="No teams found" />,
            }}
            className="rounded-lg"
          />
        </Card>
      </div>

      {/* Create Team Modal */}
      <Modal
        title="Create New Team"
        open={isModalVisible}
        onOk={handleCreate}
        onCancel={() => setIsModalVisible(false)}
        okButtonProps={{ className: "bg-purple-600" }}
      >
        <Form form={form} layout="vertical">
          <Form.Item name="maTeam" label="Team ID">
            <Input disabled />
          </Form.Item>
          <Form.Item name="teamName" label="Team Name" rules={[{ required: true, message: "Team name is required" }]}>
            <Input />
          </Form.Item>
          <Form.Item name="description" label="Description">
            <Input.TextArea rows={3} />
          </Form.Item>
          <Form.Item name="status" label="Status" initialValue="Open">
            <Select>
              <Select.Option value="Active">Active</Select.Option>
              <Select.Option value="Locked">Locked</Select.Option>
              <Select.Option value="Voting">Voting</Select.Option>
              <Select.Option value="Open">Open</Select.Option>
            </Select>
          </Form.Item>
          <Form.Item
            name="maxMembers"
            label="Number of Members"
            rules={[
              { required: true, message: "Please enter number of members" },
              {
                validator: (_, value) =>
                  value < 1 || value > 5 ? Promise.reject("Members must be between 1 and 5") : Promise.resolve(),
              },
            ]}
          >
            <Input type="number" min={1} max={5} />
          </Form.Item>
        </Form>
      </Modal>

      {/* Assign Leader Modal */}
      <Modal
        title={`Assign Leader to ${assignLeaderModal.team?.name || ""}`}
        open={assignLeaderModal.visible}
        onOk={handleAssignLeader}
        onCancel={() => setAssignLeaderModal({ visible: false, team: null })}
        okButtonProps={{ className: "bg-blue-600" }}
      >
        <Form form={leaderForm} layout="vertical">
          <Form.Item name="leaderID" label="Leader ID" rules={[{ required: true, message: "Leader ID is required" }]}>
            <Input />
          </Form.Item>
          <Form.Item
            name="leaderName"
            label="Leader Name"
            rules={[{ required: true, message: "Leader Name is required" }]}
          >
            <Input />
          </Form.Item>
        </Form>
      </Modal>

      {/* View Team Modal */}
      <Modal
        title={`Team Details: ${viewTeamModal.team?.name || ""}`}
        open={viewTeamModal.visible}
        onCancel={closeViewTeamModal}
        footer={[
          <Button key="close" onClick={closeViewTeamModal}>
            Close
          </Button>,
        ]}
      >
        <p><strong>Team ID:</strong> {viewTeamModal.team?.id}</p>
        <p><strong>Team Name:</strong> {viewTeamModal.team?.name}</p>
        <p><strong>Status:</strong> {viewTeamModal.team?.status}</p>
        <p><strong>Description:</strong> {viewTeamModal.team?.description}</p>
        <p><strong>Members Count:</strong> {viewTeamModal.team?.membersCount}</p>
        <p><strong>Leader ID:</strong> {viewTeamModal.team?.leaderID || "-"}</p>
        <p><strong>Leader Name:</strong> {viewTeamModal.team?.leaderName || "-"}</p>
      </Modal>

      {/* Edit Team Modal */}
      <Modal
        title={`Edit Team: ${editModal.team?.name || ""}`}
        open={editModal.visible}
        onOk={handleEditTeam}
        onCancel={() => setEditModal({ visible: false, team: null })}
        okButtonProps={{ className: "bg-green-600" }}
      >
        <Form form={editForm} layout="vertical">
          <Form.Item
            name="teamName"
            label="Team Name"
            rules={[{ required: true, message: "Team name is required" }]}
          >
            <Input />
          </Form.Item>
          <Form.Item name="description" label="Description">
            <Input.TextArea rows={3} />
          </Form.Item>
          <Form.Item name="status" label="Status">
            <Select>
              <Select.Option value="Active">Active</Select.Option>
              <Select.Option value="Locked">Locked</Select.Option>
              <Select.Option value="Voting">Voting</Select.Option>
              <Select.Option value="Open">Open</Select.Option>
            </Select>
          </Form.Item>
        </Form>
      </Modal>

      {/* Vote Result Modal */}
      <Modal
        title={`Vote Results — Team ${voteResultModal.team?.name || ""}`}
        open={voteResultModal.visible}
        onCancel={() => setVoteResultModal({ visible: false, team: null, votes: [], totalVotes: 0 })}
        footer={[
          <Button key="close" onClick={() => setVoteResultModal({ visible: false, team: null, votes: [], totalVotes: 0 })}>
            Close
          </Button>,
        ]}
      >
        <p><strong>Total Votes:</strong> {voteResultModal.totalVotes}</p>
        {voteResultModal.winner ? (
          <p style={{ marginTop: "10px", fontSize: "16px" }}>
            🏆 <strong>Leader được chọn:</strong> {voteResultModal.winner} 
            ({voteResultModal.winnerVotes} votes)
          </p>
        ) : (
          <p style={{ marginTop: "10px", fontSize: "16px" }}>
            ⏳ Chưa có kết quả đủ điều kiện xác định Leader
          </p>
        )}

        {voteResultModal.votes.length > 0 ? (
          <Table
            dataSource={voteResultModal.votes}
            rowKey={(vote, idx) => idx}
            pagination={false}
            columns={[
              { title: "Voter", dataIndex: "voterName", key: "voterName" },
              { title: "Candidate", dataIndex: "candidateName", key: "candidateName" },
            ]}
          />
        ) : (
          <Empty description="No votes yet" />
        )}
      </Modal>
    </>
  )
} 