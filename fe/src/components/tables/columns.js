import { Tag, Button, Badge, Dropdown, Avatar, message } from "antd"
import { MoreOutlined, CheckCircleOutlined, CloseCircleOutlined } from "@ant-design/icons"

export const teamsColumns = [
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

export const requestsColumns = [
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

export const studentsColumns = [
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