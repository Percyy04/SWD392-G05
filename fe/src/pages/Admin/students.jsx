import { Card, Table, Tag, Button, Dropdown, Input, Avatar, Empty } from "antd"
import {
  SearchOutlined,
  MoreOutlined,
  EyeOutlined,
  UserAddOutlined,
  DeleteOutlined,
  TeamOutlined,
} from "@ant-design/icons"
import { useStudents } from "../../../hooks/use-students"

export function Students({ isActive }) {
  const { data, loading } = useStudents(isActive)

  const columns = [
    {
      title: "Student",
      dataIndex: "name",
      key: "name",
      width: 200,
      render: (name, record) => (
        <div className="flex items-center gap-3">
          <Avatar size="large" className="bg-gradient-to-br from-blue-500 to-cyan-500 font-semibold text-white">
            {name?.[0]?.toUpperCase()}
          </Avatar>
          <div className="flex flex-col">
            <span className="font-semibold text-gray-900">{name}</span>
            <span className="text-xs text-gray-500">{record.email}</span>
          </div>
        </div>
      ),
    },
 {
  title: "ID",
  dataIndex: "id",
  key: "id",
  width: 100,
  render: (id) => (
    <span className="font-mono text-sm text-gray-600">{id}</span>
  ),
}
,
    {
      title: "Major",
      dataIndex: "major",
      key: "major",
      width: 150,
      render: (major) =>
        major ? (
          <Tag color="blue" className="px-3 py-1">
            {major}
          </Tag>
        ) : (
          <span className="text-gray-400 text-sm">—</span>
        ),
    },
    {
      title: "Team",
      dataIndex: "team",
      key: "team",
      width: 150,
      render: (team) =>
        team ? (
          <Tag color="purple" className="px-3 py-1">
            {team}
          </Tag>
        ) : (
          <span className="text-gray-400 text-sm">—</span>
        ),
    },
    {
      title: "Role",
      dataIndex: "role",
      key: "role",
      width: 120,
      render: (role) =>
        role ? (
          <Tag color="cyan" className="px-3 py-1">
            {role}
          </Tag>
        ) : (
          <span className="text-gray-400 text-sm">—</span>
        ),
    },
   {
  title: "Class",
  dataIndex: "status", // vẫn giữ status, nhưng hiển thị như Class
  key: "status",
  width: 120,
  render: (status) => (
    status ? (
      <Tag color="blue" className="px-3 py-1 font-medium">
        {status}
      </Tag>
    ) : (
      <span className="text-gray-400 text-sm">—</span>
    )
  ),
},

    {
      title: "Actions",
      key: "action",
      width: 100,
      align: "center",
      render: () => (
        <Dropdown
          menu={{
            items: [
              { key: "1", label: "View Profile", icon: <EyeOutlined /> },
              { key: "2", label: "Assign Team", icon: <UserAddOutlined /> },
              // { key: "3", label: "Remove", danger: true, icon: <DeleteOutlined /> },
            ],
          }}
          trigger={["click"]}
        >
          <Button type="text" icon={<MoreOutlined />} className="hover:bg-gray-100 rounded-lg transition-colors" />
        </Dropdown>
      ),
    },
  ]

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 bg-blue-100 rounded-lg">
              <TeamOutlined className="text-blue-600 text-xl" />
            </div>
            <h1 className="text-3xl font-bold text-gray-900">Students Management</h1>
          </div>
          <p className="text-gray-600">Manage and organize all student information</p>
        </div>
        <Button type="primary" size="large" className="bg-blue-600 hover:bg-blue-700">
          + Add Student
        </Button>
      </div>

      {/* Search Bar */}
      <div className="flex gap-3">
        <Input
          placeholder="Search by name, email, or ID..."
          prefix={<SearchOutlined className="text-gray-400" />}
          className="rounded-lg h-10"
          size="large"
        />
      </div>

      {/* Table Card */}
      <Card className="border border-gray-200 shadow-sm rounded-lg overflow-hidden" bodyStyle={{ padding: 0 }}>
        <Table
          columns={columns}
          dataSource={data}
          loading={loading}
          pagination={{
            pageSize: 10,
            showSizeChanger: true,
            showTotal: (total) => `Total ${total} students`,
            className: "px-6 py-4",
          }}
          rowKey="id"
          locale={{
            emptyText: <Empty description="No students found" />,
          }}
          className="rounded-lg"
        />
      </Card>
    </div>
  )
}
