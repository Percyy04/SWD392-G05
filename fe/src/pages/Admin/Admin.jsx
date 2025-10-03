"use client"

import { useState, useEffect } from "react"
// eslint-disable-next-line no-unused-vars
import { motion } from "framer-motion"
import {
  Layout,
  Menu,
  Card,
  Table,
  Tag,
  Button,
  Badge,
  Dropdown,
  Modal,
  Form,
  Input,
  Select,
  message,
  Avatar,
  Tabs,
} from "antd"
import {
  MenuFoldOutlined,
  MenuUnfoldOutlined,
  DashboardOutlined,
  TeamOutlined,
  UserOutlined,
  FileTextOutlined,
  SettingOutlined,
  CheckCircleOutlined,
  ClockCircleOutlined,
  CloseCircleOutlined,
  MoreOutlined,
  PlusOutlined,
  SearchOutlined,
} from "@ant-design/icons"
import { TrendingUp } from "lucide-react"

const { Header, Sider, Content } = Layout
const { TabPane } = Tabs

export default function Admin() {
  const [collapsed, setCollapsed] = useState(false)
  const [selectedMenu, setSelectedMenu] = useState("1")
  const [isModalVisible, setIsModalVisible] = useState(false)
  const [form] = Form.useForm()

  const statsData = []

  const teamsData = []

  const pendingRequestsData = []

  const [studentsData, setStudentsData] = useState([])
  const [studentsLoading, setStudentsLoading] = useState(false)
  const [studentsError, setStudentsError] = useState(null)

  useEffect(() => {
    const fetchStudents = async () => {
      setStudentsLoading(true)
      setStudentsError(null)
      try {
        const response = await fetch("http://localhost:5000/api/students")
        const data = await response.json()

        if (data.success) {
          // Transform API data to match table format
          const transformedData = data.students.map((student, index) => ({
            key: student.id || index,
            id: student.id,
            name: student.full_name,
            email: student.email,
            major: "-", // Not provided by API
            team: null, // Not provided by API
            role: null, // Not provided by API
            status: "active", // Default status
          }))
          setStudentsData(transformedData)
        } else {
          setStudentsError("Failed to load students")
          message.error("Failed to load students")
        }
      } catch (error) {
        console.error("[v0] Error fetching students:", error)
        setStudentsError("Error connecting to server")
        message.error("Error loading students data")
      } finally {
        setStudentsLoading(false)
      }
    }

    // Fetch students when Students menu is selected
    if (selectedMenu === "3") {
      fetchStudents()
    }
  }, [selectedMenu])

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

  const studentsColumns = [
    {
      title: "ID",
      dataIndex: "id",
      key: "id",
      render: (text) => <span className="text-gray-900 font-mono">{text}</span>,
    },
    {
      title: "Name",
      dataIndex: "name",
      key: "name",
      render: (text) => (
        <div className="flex items-center gap-2">
          <Avatar size="small">{text ? text[0] : "?"}</Avatar>
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
      render: (major) => major || <span className="text-gray-400">Not set</span>,
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
      render: (role) => (role ? <Tag color="blue">{role}</Tag> : <span className="text-gray-400">-</span>),
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
            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {statsData.map((stat, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                >
                  <Card className="bg-white border-gray-200 hover:border-green-500 transition-all duration-300 shadow-sm">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-gray-600 text-sm mb-1">{stat.title}</p>
                        <p className="text-3xl font-bold text-gray-900">{stat.value}</p>
                        <p className="text-green-500 text-sm mt-1 flex items-center gap-1">
                          <TrendingUp className="w-4 h-4" />
                          {stat.change}
                        </p>
                      </div>
                      <div className={`${stat.color} p-3 rounded-lg text-white`}>{stat.icon}</div>
                    </div>
                  </Card>
                </motion.div>
              ))}
            </div>

            {/* Recent Activity */}
            <Card
              title={<span className="text-gray-900 font-semibold">Recent Activity</span>}
              className="bg-white border-gray-200 shadow-sm"
            >
              <div className="space-y-4">
                <p className="text-gray-500 text-center py-8">No recent activity</p>
              </div>
            </Card>
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
              loading={studentsLoading}
              className="custom-table"
              pagination={{ pageSize: 10 }}
              locale={{
                emptyText: studentsError ? (
                  <div className="text-center py-8">
                    <p className="text-red-500 mb-2">{studentsError}</p>
                    <Button
                      type="primary"
                      onClick={() => setSelectedMenu("3")}
                      className="bg-green-600 hover:bg-green-700"
                    >
                      Retry
                    </Button>
                  </div>
                ) : (
                  "No students found"
                ),
              }}
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
        return (
          <Card
            title={<span className="text-gray-900 font-semibold">Settings</span>}
            className="bg-white border-gray-200 shadow-sm"
          >
            <Tabs defaultActiveKey="1">
              <TabPane tab="General" key="1">
                <div className="space-y-4">
                  <div>
                    <label className="text-gray-900 block mb-2">Course Name</label>
                    <Input defaultValue="EXE101" />
                  </div>
                  <div>
                    <label className="text-gray-900 block mb-2">Semester</label>
                    <Select defaultValue="Spring 2025" className="w-full">
                      <Select.Option value="Spring 2025">Spring 2025</Select.Option>
                      <Select.Option value="Fall 2024">Fall 2024</Select.Option>
                    </Select>
                  </div>
                  <div>
                    <label className="text-gray-900 block mb-2">Max Team Size</label>
                    <Input type="number" defaultValue="6" />
                  </div>
                </div>
              </TabPane>
              <TabPane tab="Permissions" key="2">
                <p className="text-gray-600">Permission settings coming soon...</p>
              </TabPane>
            </Tabs>
          </Card>
        )
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
            <Badge count={pendingRequestsData.length} offset={[-5, 5]}>
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

      {/* Create Team Modal */}
      <Modal
        title={<span className="text-gray-900">Create New Team</span>}
        open={isModalVisible}
        onOk={handleModalOk}
        onCancel={handleModalCancel}
        okText="Create"
        okButtonProps={{ className: "bg-green-600 hover:bg-green-700" }}
        className="light-modal"
      >
        <Form form={form} layout="vertical" className="mt-4">
          <Form.Item
            name="teamName"
            label={<span className="text-gray-900">Team Name</span>}
            rules={[{ required: true, message: "Please input team name!" }]}
          >
            <Input placeholder="Enter team name" />
          </Form.Item>
          <Form.Item
            name="major"
            label={<span className="text-gray-900">Major</span>}
            rules={[{ required: true, message: "Please select major!" }]}
          >
            <Select placeholder="Select major">
              <Select.Option value="SE">Software Engineering</Select.Option>
              <Select.Option value="IS">Information Systems</Select.Option>
              <Select.Option value="AI">Artificial Intelligence</Select.Option>
            </Select>
          </Form.Item>
          <Form.Item
            name="maxMembers"
            label={<span className="text-gray-900">Max Members</span>}
            rules={[{ required: true, message: "Please input max members!" }]}
          >
            <Input type="number" placeholder="Enter max members" defaultValue="6" />
          </Form.Item>
        </Form>
      </Modal>

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
