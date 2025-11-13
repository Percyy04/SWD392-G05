import { Table, Button, Modal, Form, Input, Space, Popconfirm, message, Card, Tag, Avatar, Tooltip, Empty } from "antd"
import { useState } from "react"
import { useLecturers } from "../../../hooks/use-lectures";
import { PlusOutlined, EditOutlined, DeleteOutlined, MailOutlined, UserOutlined } from "@ant-design/icons"

export function Lecturers() {
  const { data, loading, createLecturer, updateLecturer, deleteLecturer } = useLecturers(true)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [editingLecturer, setEditingLecturer] = useState(null)
  const [form] = Form.useForm()

  const openAddModal = () => {
    setEditingLecturer(null)
    form.resetFields()
    setIsModalOpen(true)
  }

  const openEditModal = (lecturer) => {
    setEditingLecturer(lecturer)
    form.setFieldsValue({
      maGV: lecturer.id,
      full_name: lecturer.name,
      email: lecturer.email,
      password: "",
    })
    setIsModalOpen(true)
  }

  const handleCancel = () => setIsModalOpen(false)

  const handleSubmit = async () => {
    try {
      const values = await form.validateFields()
      if (editingLecturer) {
        const payload = {
          hoTen: values.full_name,
          email: values.email,
        }
        const result = await updateLecturer(editingLecturer.id, payload)
        if (!result.success) message.error(result.message || "Failed to update lecturer")
        else message.success("Lecturer updated successfully")
      } else {
        const payload = {
          maGV: values.maGV,
          full_name: values.full_name,
          email: values.email,
          password: values.password,
        }
        const result = await createLecturer(payload)
        if (!result.success) message.error(result.message || "Failed to create lecturer")
        else message.success("Lecturer created successfully")
      }
      setIsModalOpen(false)
    } catch (err) {
      console.error("Form submit error:", err)
    }
  }

  const columns = [
    {
      title: "Lecturer",
      dataIndex: "name",
      key: "name",
      width: 220,
      render: (name, record) => (
        <div className="flex items-center gap-3">
          <Avatar size="large" className="bg-gradient-to-br from-purple-500 to-pink-500 font-semibold text-white">
            {name?.[0]?.toUpperCase()}
          </Avatar>
          <div className="flex flex-col">
            <span className="font-semibold text-gray-900">{name}</span>
            <span className="text-xs text-gray-500 flex items-center gap-1">
              <MailOutlined className="text-xs" />
              {record.email}
            </span>
          </div>
        </div>
      ),
    },
    {
      title: "ID",
      dataIndex: "id",
      key: "id",
      width: 100,
      render: (id) => <span className="font-mono text-sm text-gray-600">{id}</span>,
    },
    {
      title: "Role",
      dataIndex: "role",
      key: "role",
      width: 120,
      render: (role) =>
        role ? (
          <Tag color="blue" className="px-3 py-1">
            {role}
          </Tag>
        ) : (
          <span className="text-gray-400 text-sm">—</span>
        ),
    },
    // {
    //   title: "Team",
    //   dataIndex: "team",
    //   key: "team",
    //   width: 150,
    //   render: (team) =>
    //     team ? (
    //       <Tag color="purple" className="px-3 py-1">
    //         {team}
    //       </Tag>
    //     ) : (
    //       <span className="text-gray-400 text-sm">—</span>
    //     ),
    // },
    {
      title: "Actions",
      key: "actions",
      width: 150,
      align: "center",
      render: (_, record) => (
        <Space size="small">
          <Tooltip title="Edit lecturer">
            <Button
              type="primary"
              size="small"
              icon={<EditOutlined />}
              onClick={() => openEditModal(record)}
              className="bg-blue-600 hover:bg-blue-700 border-0"
            />
          </Tooltip>
          <Popconfirm
            title="Delete Lecturer"
            description="Are you sure you want to delete this lecturer?"
            onConfirm={async () => {
              const result = await deleteLecturer(record.id)
              if (!result.success) message.error(result.message || "Failed to delete lecturer")
              else message.success("Lecturer deleted successfully")
            }}
            okText="Yes"
            cancelText="No"
            okButtonProps={{ danger: true }}
          >
            <Tooltip title="Delete lecturer">
              <Button danger size="small" icon={<DeleteOutlined />} />
            </Tooltip>
          </Popconfirm>
        </Space>
      ),
    },
  ]

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 bg-purple-100 rounded-lg">
              <UserOutlined className="text-purple-600 text-xl" />
            </div>
            <h1 className="text-3xl font-bold text-gray-900">Lecturers Management</h1>
          </div>
          <p className="text-gray-600">Manage and organize all lecturer information</p>
        </div>
        <Button
          type="primary"
          size="large"
          icon={<PlusOutlined />}
          onClick={openAddModal}
          className="bg-purple-600 hover:bg-purple-700 border-0"
        >
          Add Lecturer
        </Button>
      </div>

      {/* Table Card */}
      <Card className="border border-gray-200 shadow-sm rounded-lg overflow-hidden" bodyStyle={{ padding: 0 }}>
        <Table
          columns={columns}
          dataSource={data.map((item, index) => ({
            ...item,
            key: item.id || `lecturer-${index}`,
          }))}
          loading={loading}
          pagination={{
            pageSize: 10,
            showSizeChanger: true,
            showTotal: (total) => `Total ${total} lecturers`,
            className: "px-6 py-4",
          }}
          rowKey={(record) => record.id || record.key}
          locale={{
            emptyText: <Empty description="No lecturers found" />,
          }}
        />
      </Card>

      {/* Modal */}
      <Modal
        title={
          <div className="flex items-center gap-2">
            <div className="p-1.5 bg-purple-100 rounded">
              <UserOutlined className="text-purple-600" />
            </div>
            <span>{editingLecturer ? "Edit Lecturer" : "Add New Lecturer"}</span>
          </div>
        }
        open={isModalOpen}
        onCancel={handleCancel}
        onOk={handleSubmit}
        okText={editingLecturer ? "Update" : "Create"}
        cancelText="Cancel"
        width={500}
        okButtonProps={{ className: "bg-purple-600 hover:bg-purple-700 border-0" }}
        className="rounded-lg"
      >
        <Form form={form} layout="vertical" className="mt-6">
          {!editingLecturer && (
            <Form.Item
              label={<span className="font-semibold text-gray-700">Lecturer ID</span>}
              name="maGV"
              rules={[{ required: true, message: "Please input lecturer ID" }]}
            >
              <Input placeholder="e.g., GV001" size="large" className="rounded-lg" />
            </Form.Item>
          )}

          <Form.Item
            label={<span className="font-semibold text-gray-700">Full Name</span>}
            name="full_name"
            rules={[{ required: true, message: "Please input full name" }]}
          >
            <Input placeholder="Enter full name" size="large" className="rounded-lg" />
          </Form.Item>

          <Form.Item
            label={<span className="font-semibold text-gray-700">Email</span>}
            name="email"
            rules={[
              { required: true, message: "Please input email" },
              { type: "email", message: "Please enter a valid email" },
            ]}
          >
            <Input
              placeholder="Enter email address"
              size="large"
              className="rounded-lg"
              prefix={<MailOutlined className="text-gray-400" />}
            />
          </Form.Item>

          {!editingLecturer && (
            <Form.Item
              label={<span className="font-semibold text-gray-700">Password</span>}
              name="password"
              rules={[{ required: true, message: "Please input password" }]}
            >
              <Input.Password placeholder="Enter password" size="large" className="rounded-lg" />
            </Form.Item>
          )}
        </Form>
      </Modal>
    </div>
  )
}
