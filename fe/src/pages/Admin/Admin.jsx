"use client"

import { useState } from "react"
import {
  Layout,
  Menu,
  Card,
  Table,
  Button,
  Badge,
  Dropdown,
  Form,
  Input,
  message,
  Avatar,
  Tag,
} from "antd"
import {
  MenuFoldOutlined,
  MenuUnfoldOutlined,
  SearchOutlined,
  PlusOutlined,
  ClockCircleOutlined,
  MoreOutlined,
  CheckCircleOutlined,
  CloseCircleOutlined,
} from "@ant-design/icons"


import StatsCard from "../../components/admin/StatsCard"
import RecentActivity from "../../components/admin/RecentActivity"
import CreateTeamModal from "../../components/admin/CreateTeamModal"
import Settings from "../../components/admin/Settings"
import { DashboardOutlined, TeamOutlined, UserOutlined, FileTextOutlined, SettingOutlined } from "@ant-design/icons"
import { Users, UserCheck, Clock, AlertCircle } from "lucide-react"

const { Header, Sider, Content } = Layout

export default function Admin() {
  const [collapsed, setCollapsed] = useState(false)
  const [selectedMenu, setSelectedMenu] = useState("1")
  const [isModalVisible, setIsModalVisible] = useState(false)
  const [form] = Form.useForm()

  // Mock data
  const statsData = [
    { title: "Total Teams", value: 24, icon: <Users className="w-6 h-6" />, color: "bg-blue-500", change: "+12%" },
    {
      title: "Active Students",
      value: 156,
      icon: <UserCheck className="w-6 h-6" />,
      color: "bg-green-500",
      change: "+8%",
    },
    { title: "Pending Requests", value: 8, icon: <Clock className="w-6 h-6" />, color: "bg-yellow-500", change: "+3" },
    { title: "Issues", value: 2, icon: <AlertCircle className="w-6 h-6" />, color: "bg-red-500", change: "-2" },
  ]

  const teamsData = [
    {
      key: "1",
      teamName: "Team Alpha",
      leader: "Nguyen Van A",
      members: 5,
      status: "active",
      major: "Software Engineering",
      createdAt: "2025-01-15",
    },
    {
      key: "2",
      teamName: "Team Beta",
      leader: "Tran Thi B",
      members: 4,
      status: "voting",
      major: "Software Engineering",
      createdAt: "2025-01-18",
    },
    {
      key: "3",
      teamName: "Team Gamma",
      leader: "Le Van C",
      members: 6,
      status: "locked",
      major: "Information Systems",
      createdAt: "2025-01-10",
    },
    {
      key: "4",
      teamName: "Team Delta",
      leader: null,
      members: 3,
      status: "open",
      major: "Software Engineering",
      createdAt: "2025-01-20",
    },
  ]

  const pendingRequestsData = [
    {
      key: "1",
      student: "Pham Van D",
      type: "Join Request",
      team: "Team Alpha",
      reason: "Want to join as Backend Developer",
      date: "2025-01-25",
    },
    {
      key: "2",
      student: "Hoang Thi E",
      type: "Transfer Request",
      team: "Team Beta → Team Gamma",
      reason: "Better skill match",
      date: "2025-01-24",
    },
    {
      key: "3",
      student: "Vo Van F",
      type: "Leave Request",
      team: "Team Delta",
      reason: "Personal reasons",
      date: "2025-01-23",
    },
  ]

  const studentsData = [
    {
      key: "1",
      name: "Nguyen Van A",
      email: "nguyenvana@fpt.edu.vn",
      major: "Software Engineering",
      team: "Team Alpha",
      role: "Leader",
      status: "active",
    },
    {
      key: "2",
      name: "Tran Thi B",
      email: "tranthib@fpt.edu.vn",
      major: "Software Engineering",
      team: "Team Beta",
      role: "Leader",
      status: "active",
    },
    {
      key: "3",
      name: "Le Van C",
      email: "levanc@fpt.edu.vn",
      major: "Information Systems",
      team: "Team Gamma",
      role: "Leader",
      status: "active",
    },
    {
      key: "4",
      name: "Pham Van D",
      email: "phamvand@fpt.edu.vn",
      major: "Software Engineering",
      team: null,
      role: null,
      status: "pending",
    },
  ]

  const menuItems = [
    {
      key: "1",
      icon: <DashboardOutlined />,
      label: "Dashboard",
    },
    {
      key: "2",
      icon: <TeamOutlined />,
      label: "Teams",
    },
    {
      key: "3",
      icon: <UserOutlined />,
      label: "Students",
    },
    {
      key: "4",
      icon: <FileTextOutlined />,
      label: "Requests",
    },
    {
      key: "5",
      icon: <SettingOutlined />,
      label: "Settings",
    },
  ]

  const teamsColumns = [
    {
      title: "Team Name",
      dataIndex: "teamName",
      key: "teamName",
      render: (text) => <span className="font-semibold text-gray-900">{text}</span>,
    },
    {
      title: "Leader",
      dataIndex: "leader",
      key: "leader",
      render: (text) => text || <span className="text-gray-400">No leader</span>,
    },
    {
      title: "Members",
      dataIndex: "members",
      key: "members",
      render: (count) => <Badge count={count} showZero style={{ backgroundColor: "#10b981" }} />,
    },
    {
      title: "Status",
      dataIndex: "status",
      key: "status",
      render: (status) => {
        const statusConfig = {
          active: { color: "green", text: "Active" },
          voting: { color: "blue", text: "Voting" },
          locked: { color: "red", text: "Locked" },
          open: { color: "orange", text: "Open" },
        }
        const config = statusConfig[status]
        return <Tag color={config.color}>{config.text}</Tag>
      },
    },
    {
      title: "Major",
      dataIndex: "major",
      key: "major",
    },
    {
      title: "Created",
      dataIndex: "createdAt",
      key: "createdAt",
    },
    {
      title: "Action",
      key: "action",
      render: () => (
        <Dropdown
          menu={{
            items: [
              { key: "1", label: "View Details" },
              { key: "2", label: "Edit Team" },
              { key: "3", label: "Assign Leader" },
              { key: "4", label: "Lock Team", danger: true },
            ],
          }}
        >
          <Button type="text" icon={<MoreOutlined />} />
        </Dropdown>
      ),
    },
  ]

  const requestsColumns = [
    {
      title: "Student",
      dataIndex: "student",
      key: "student",
      render: (text) => (
        <div className="flex items-center gap-2">
          <Avatar size="small">{text[0]}</Avatar>
          <span className="text-gray-900">{text}</span>
        </div>
      ),
    },
    {
      title: "Type",
      dataIndex: "type",
      key: "type",
      render: (type) => {
        const typeConfig = {
          "Join Request": "blue",
          "Transfer Request": "orange",
          "Leave Request": "red",
        }
        return <Tag color={typeConfig[type]}>{type}</Tag>
      },
    },
    {
      title: "Team",
      dataIndex: "team",
      key: "team",
    },
    {
      title: "Reason",
      dataIndex: "reason",
      key: "reason",
    },
    {
      title: "Date",
      dataIndex: "date",
      key: "date",
    },
    {
      title: "Action",
      key: "action",
      render: () => (
        <div className="flex gap-2">
          <Button
            type="primary"
            size="small"
            icon={<CheckCircleOutlined />}
            className="bg-green-600 hover:bg-green-700"
            onClick={() => message.success("Request approved")}
          >
            Approve
          </Button>
          <Button danger size="small" icon={<CloseCircleOutlined />} onClick={() => message.error("Request rejected")}>
            Reject
          </Button>
        </div>
      ),
    },
  ]

  const studentsColumns = [
    {
      title: "Name",
      dataIndex: "name",
      key: "name",
      render: (text) => (
        <div className="flex items-center gap-2">
          <Avatar size="small">{text[0]}</Avatar>
          <span className="text-gray-900">{text}</span>
        </div>
      ),
    },
    {
      title: "Email",
      dataIndex: "email",
      key: "email",
    },
    {
      title: "Major",
      dataIndex: "major",
      key: "major",
    },
    {
      title: "Team",
      dataIndex: "team",
      key: "team",
      render: (team) => team || <span className="text-gray-400">No team</span>,
    },
    {
      title: "Role",
      dataIndex: "role",
      key: "role",
      render: (role) => (role ? <Tag color="blue">{role}</Tag> : "-"),
    },
    {
      title: "Status",
      dataIndex: "status",
      key: "status",
      render: (status) => (
        <Tag color={status === "active" ? "green" : "orange"}>{status === "active" ? "Active" : "Pending"}</Tag>
      ),
    },
    {
      title: "Action",
      key: "action",
      render: () => (
        <Dropdown
          menu={{
            items: [
              { key: "1", label: "View Profile" },
              { key: "2", label: "Assign to Team" },
              { key: "3", label: "Remove", danger: true },
            ],
          }}
        >
          <Button type="text" icon={<MoreOutlined />} />
        </Dropdown>
      ),
    },
  ]

  const handleCreateTeam = () => {
    setIsModalVisible(true)
  }

  const handleModalOk = () => {
    form.validateFields().then((values) => {
      console.log("New team:", values)
      message.success("Team created successfully!")
      setIsModalVisible(false)
      form.resetFields()
    })
  }

  const handleModalCancel = () => {
    setIsModalVisible(false)
    form.resetFields()
  }

  const renderContent = () => {
    switch (selectedMenu) {
      case "1":
        return (
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {statsData.map((stat, index) => (
                <StatsCard key={index} stat={stat} index={index} />
              ))}
            </div>
            <RecentActivity />
          </div>
        )
      case "2":
        return (
          <Card
            title={<span className="text-gray-900 font-semibold">Teams Management</span>}
            extra={
              <Button
                type="primary"
                icon={<PlusOutlined />}
                className="bg-green-600 hover:bg-green-700"
                onClick={handleCreateTeam}
              >
                Create Team
              </Button>
            }
            className="bg-white border-gray-200 shadow-sm"
          >
            <Table
              columns={teamsColumns}
              dataSource={teamsData}
              className="custom-table"
              pagination={{ pageSize: 10 }}
            />
          </Card>
        )
      case "3":
        return (
          <Card
            title={<span className="text-gray-900 font-semibold">Students Management</span>}
            extra={<Input placeholder="Search students..." prefix={<SearchOutlined />} className="w-64" />}
            className="bg-white border-gray-200 shadow-sm"
          >
            <Table
              columns={studentsColumns}
              dataSource={studentsData}
              className="custom-table"
              pagination={{ pageSize: 10 }}
            />
          </Card>
        )
      case "4":
        return (
          <Card
            title={<span className="text-gray-900 font-semibold">Pending Requests</span>}
            extra={<Badge count={pendingRequestsData.length} style={{ backgroundColor: "#f59e0b" }} />}
            className="bg-white border-gray-200 shadow-sm"
          >
            <Table
              columns={requestsColumns}
              dataSource={pendingRequestsData}
              className="custom-table"
              pagination={{ pageSize: 10 }}
            />
          </Card>
        )
      case "5":
        return <Settings />
      default:
        return null
    }
  }

  return (
    <Layout className="min-h-screen">
      <Sider
        trigger={null}
        collapsible
        collapsed={collapsed}
        className="bg-white border-r border-gray-200"
        breakpoint="lg"
        onBreakpoint={(broken) => {
          setCollapsed(broken)
        }}
      >
        <div className="h-16 flex items-center justify-center border-b border-gray-200">
          <h1 className="text-gray-900 font-bold text-xl">{collapsed ? "TM" : "Team Manager"}</h1>
        </div>
        <Menu
          theme="light"
          mode="inline"
          selectedKeys={[selectedMenu]}
          items={menuItems}
          onClick={({ key }) => setSelectedMenu(key)}
          className="bg-white border-r-0"
        />
      </Sider>
      <Layout>
        <Header className="bg-white border-b border-gray-200 px-4 flex items-center justify-between shadow-sm">
          <Button
            type="text"
            icon={collapsed ? <MenuUnfoldOutlined /> : <MenuFoldOutlined />}
            onClick={() => setCollapsed(!collapsed)}
            className="text-gray-900 text-lg w-16 h-16"
          />
          <div className="flex items-center gap-4">
            <Badge count={8} offset={[-5, 5]}>
              <Button type="text" icon={<ClockCircleOutlined className="text-gray-900 text-lg" />} />
            </Badge>
            <Dropdown
              menu={{
                items: [
                  { key: "1", label: "Profile" },
                  { key: "2", label: "Settings" },
                  { key: "3", label: "Logout", danger: true },
                ],
              }}
            >
              <Avatar className="cursor-pointer bg-green-600">A</Avatar>
            </Dropdown>
          </div>
        </Header>
        <Content className="m-6 p-6 bg-gray-50 rounded-lg min-h-[calc(100vh-88px)]">{renderContent()}</Content>
      </Layout>

      <CreateTeamModal
        isVisible={isModalVisible}
        onOk={handleModalOk}
        onCancel={handleModalCancel}
        form={form}
      />

      <style jsx global>{`
        .ant-layout {
          background: #f9fafb;
        }
        .ant-menu-light {
          background: #ffffff;
        }
        .ant-menu-light .ant-menu-item-selected {
          background: #10b981 !important;
          color: #ffffff !important;
        }
        .ant-menu-light .ant-menu-item-selected .anticon {
          color: #ffffff !important;
        }
        .ant-card {
          background: #ffffff;
          border-color: #e5e7eb;
        }
        .ant-card-head {
          border-color: #e5e7eb;
        }
        .custom-table .ant-table {
          background: transparent;
        }
        .custom-table .ant-table-thead > tr > th {
          background: #f9fafb;
          color: #6b7280;
          border-color: #e5e7eb;
        }
        .custom-table .ant-table-tbody > tr > td {
          border-color: #e5e7eb;
          color: #374151;
        }
        .custom-table .ant-table-tbody > tr:hover > td {
          background: #f9fafb;
        }
        .ant-input {
          background: #ffffff;
          border-color: #e5e7eb;
          color: #111827;
        }
        .ant-input:hover, .ant-input:focus {
          border-color: #10b981;
        }
        .ant-select-selector {
          background: #ffffff !important;
          border-color: #e5e7eb !important;
          color: #111827 !important;
        }
        .ant-modal-content {
          background: #ffffff;
        }
        .ant-modal-header {
          background: #ffffff;
          border-color: #e5e7eb;
        }
      `}</style>
    </Layout>
  )
}
