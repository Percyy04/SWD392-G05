import { Card, Table, Tag, Button, Dropdown, Input, Avatar } from "antd"
import { SearchOutlined, MoreOutlined, EyeOutlined, UserAddOutlined, DeleteOutlined } from "@ant-design/icons"
import { useStudents } from "../../../hooks/use-students";

export function Students({ isActive }) {
  const { data, loading } = useStudents(isActive)

  const columns = [
    { title: "ID", dataIndex: "id", key: "id", render: (t) => <span className="font-mono text-sm">{t}</span> },
    {
      title: "Name",
      dataIndex: "name",
      key: "name",
      render: (t) => (
        <div className="flex items-center gap-2">
          <Avatar size="small" className="bg-green-600">
            {t?.[0]}
          </Avatar>
          <span>{t}</span>
        </div>
      ),
    },
    { title: "Email", dataIndex: "email", key: "email" },
    {
      title: "Major",
      dataIndex: "major",
      key: "major",
      render: (m) => m || <span className="text-gray-400">Not set</span>,
    },
    {
      title: "Team",
      dataIndex: "team",
      key: "team",
      render: (t) => t || <span className="text-gray-400">No team</span>,
    },
    {
      title: "Role",
      dataIndex: "role",
      key: "role",
      render: (r) => (r ? <Tag color="blue">{r}</Tag> : <span className="text-gray-400">-</span>),
    },
    {
      title: "Status",
      dataIndex: "status",
      key: "status",
      render: (s) => <Tag color={s === "active" ? "green" : "orange"}>{s}</Tag>,
    },
    {
      title: "Action",
      key: "action",
      render: () => (
        <Dropdown
          menu={{
            items: [
              { key: "1", label: "View Profile", icon: <EyeOutlined /> },
              { key: "2", label: "Assign to Team", icon: <UserAddOutlined /> },
              { key: "3", label: "Remove", danger: true, icon: <DeleteOutlined /> },
            ],
          }}
        >
          <Button type="text" icon={<MoreOutlined />} />
        </Dropdown>
      ),
    },
  ]

  return (
    <Card
      title="Students Management"
      extra={<Input placeholder="Search students..." prefix={<SearchOutlined />} className="w-64" />}
      className="bg-white border border-gray-200 shadow-sm"
    >
      <Table columns={columns} dataSource={data} loading={loading} pagination={{ pageSize: 10 }} />
    </Card>
  )
}
