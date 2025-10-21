"use client"



import { Card, Table, Tag, Button, Dropdown, Modal, Form, Input, Select, message, Badge } from "antd"
import {
  PlusOutlined,
  MoreOutlined,
  EyeOutlined,
  EditOutlined,
  UserAddOutlined,
  DeleteOutlined,
} from "@ant-design/icons"
import { useState } from "react"
import { teamsData } from "../../data/mockData";

export function Groups() {
  const [isModalVisible, setIsModalVisible] = useState(false)
  const [form] = Form.useForm()

  const columns = [
    {
      title: "Team Name",
      dataIndex: "teamName",
      key: "teamName",
      render: (t) => <span className="font-semibold">{t}</span>,
    },
    {
      title: "Leader",
      dataIndex: "leader",
      key: "leader",
      render: (t) => t || <span className="text-gray-400">No leader</span>,
    },
    {
      title: "Members",
      dataIndex: "members",
      key: "members",
      render: (c) => <Badge count={c} style={{ backgroundColor: "#10b981" }} />,
    },
    {
      title: "Status",
      dataIndex: "status",
      key: "status",
      render: (s) => {
        const config = { active: "green", voting: "blue", locked: "red", open: "orange" }
        return <Tag color={config[s]}>{s.charAt(0).toUpperCase() + s.slice(1)}</Tag>
      },
    },
    { title: "Major", dataIndex: "major", key: "major" },
    { title: "Created", dataIndex: "createdAt", key: "createdAt" },
    {
      title: "Action",
      key: "action",
      render: () => (
        <Dropdown
          menu={{
            items: [
              { key: "1", label: "View Details", icon: <EyeOutlined /> },
              { key: "2", label: "Edit Team", icon: <EditOutlined /> },
              { key: "3", label: "Assign Leader", icon: <UserAddOutlined /> },
              { key: "4", label: "Lock Team", danger: true, icon: <DeleteOutlined /> },
            ],
          }}
        >
          <Button type="text" icon={<MoreOutlined />} />
        </Dropdown>
      ),
    },
  ]

  const handleCreate = () => {
    form.validateFields().then(() => {
      message.success("Team created successfully!")
      setIsModalVisible(false)
      form.resetFields()
    })
  }

  return (
    <>
      <Card
        title="Groups Management"
        extra={
          <Button
            type="primary"
            icon={<PlusOutlined />}
            className="bg-green-600"
            onClick={() => setIsModalVisible(true)}
          >
            Create Group
          </Button>
        }
        className="bg-white border border-gray-200 shadow-sm"
      >
        <Table columns={columns} dataSource={teamsData} pagination={{ pageSize: 10 }} />
      </Card>

      <Modal
        title="Create New Group"
        open={isModalVisible}
        onOk={handleCreate}
        onCancel={() => setIsModalVisible(false)}
        okButtonProps={{ className: "bg-green-600" }}
      >
        <Form form={form} layout="vertical" className="mt-4">
          <Form.Item name="teamName" label="Group Name" rules={[{ required: true }]}>
            <Input placeholder="Enter group name" />
          </Form.Item>
          <Form.Item name="major" label="Major" rules={[{ required: true }]}>
            <Select placeholder="Select major">
              <Select.Option value="SE">Software Engineering</Select.Option>
              <Select.Option value="IS">Information Systems</Select.Option>
              <Select.Option value="AI">Artificial Intelligence</Select.Option>
            </Select>
          </Form.Item>
          <Form.Item name="maxMembers" label="Max Members" rules={[{ required: true }]}>
            <Input type="number" placeholder="Enter max members" defaultValue="6" />
          </Form.Item>
        </Form>
      </Modal>
    </>
  )
}
