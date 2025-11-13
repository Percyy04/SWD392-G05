"use client"

import { useState, useEffect } from "react"
import { Layout, Menu, Table, Tag, Button, Form, message, Card, Statistic, Space, Empty, Spin } from "antd"
import {
  DesktopOutlined,
  FileOutlined,
  LogoutOutlined,
  CheckCircleOutlined,
  ClockCircleOutlined,
  CloseCircleOutlined,
} from "@ant-design/icons"
import { useNavigate } from "react-router-dom"
import axios from "axios"

const { Header, Content, Footer, Sider } = Layout

const Lecturer = () => {
  const navigate = useNavigate()
  const [collapsed, setCollapsed] = useState(false)
  const [selectedMenu, setSelectedMenu] = useState("dashboard")
  const [requests, setRequests] = useState([])
  const [loading, setLoading] = useState(false)
  const [modalVisible, setModalVisible] = useState(false)
  const [selectedRequest, setSelectedRequest] = useState(null)
  const [form] = Form.useForm()

  const token = localStorage.getItem("token")

  const fetchRequests = async () => {
    try {
      setLoading(true)
      const res = await axios.get("http://localhost:5000/api/lecturer-requests/requests", {
        headers: { Authorization: `Bearer ${token}` },
      })

      if (res.data.success) {
        const formatted = res.data.data.map((r) => ({
          ...r,
          id: r.id || r.requestId,
          teamName: r.TenTeam || r.teamName,
          leaderName: r.LeaderName || r.leaderName,
          status: r.status || "pending",
        }))
        setRequests(formatted)
      } else {
        message.error(res.data.message || "Failed to fetch requests")
      }
    } catch (err) {
      console.error(err)
      message.error(err.message || "Network error")
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    if (selectedMenu === "viewRequests") fetchRequests()
  }, [selectedMenu])

  const handleLogout = () => {
    localStorage.removeItem("token")
    localStorage.removeItem("user")
    navigate("/")
  }

  const respondRequest = async (requestId, action) => {
    try {
      setLoading(true)
      const res = await axios.patch(
        `http://localhost:5000/api/lecturer-requests/requests/${requestId}/respond`,
        { action },
        { headers: { Authorization: `Bearer ${token}` } },
      )
      if (res.data.success) {
        message.success(`Request ${action}ed successfully`)
        fetchRequests()
        setModalVisible(false)
      } else {
        message.error(res.data.message || "Failed to respond")
      }
    } catch (err) {
      console.error(err)
      message.error(err.message || "Network error")
    } finally {
      setLoading(false)
    }
  }

  const pendingCount = requests.filter((r) => r.status === "pending").length
  const acceptedCount = requests.filter((r) => r.status === "accepted").length
  const rejectedCount = requests.filter((r) => r.status === "rejected").length

  const columns = [
    {
      title: "Team Name",
      dataIndex: "teamName",
      key: "teamName",
      width: 200,
      render: (text) => <span className="font-medium">{text}</span>,
    },
    {
      title: "Leader Name",
      dataIndex: "leaderName",
      key: "leaderName",
      width: 180,
    },
    {
      title: "Status",
      dataIndex: "status",
      key: "status",
      width: 120,
      render: (status) => {
        const statusConfig = {
          pending: { color: "orange", icon: <ClockCircleOutlined /> },
          accepted: { color: "green", icon: <CheckCircleOutlined /> },
          rejected: { color: "red", icon: <CloseCircleOutlined /> },
        }
        const config = statusConfig[status] || statusConfig.pending
        return (
          <Tag color={config.color} icon={config.icon}>
            {status.toUpperCase()}
          </Tag>
        )
      },
    },
    {
      title: "Action",
      key: "action",
      width: 180,
      render: (_, record) =>
        record.status === "pending" ? (
          <Space size="small">
            <Button type="primary" size="small" onClick={() => respondRequest(record.id, "accept")}>
              Accept
            </Button>
            <Button type="default" danger size="small" onClick={() => respondRequest(record.id, "reject")}>
              Reject
            </Button>
          </Space>
        ) : (
          <span className="text-gray-400">No action</span>
        ),
    },
  ]

  const menuItems = [
    { key: "dashboard", icon: <DesktopOutlined />, label: "Dashboard" },
    { key: "viewRequests", icon: <FileOutlined />, label: "View Requests" },
    { key: "logout", icon: <LogoutOutlined />, label: "Logout", onClick: handleLogout },
  ]

  return (
    <Layout style={{ minHeight: "100vh" }}>
      <Sider collapsible collapsed={collapsed} onCollapse={setCollapsed} theme="dark">
        <div
          className="logo"
          style={{
            height: 64,
            margin: 16,
            background: "rgba(255, 255, 255, 0.1)",
            borderRadius: 8,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            color: "white",
            fontSize: 18,
            fontWeight: "600",
          }}
        >
          {!collapsed && "Lecturer Panel"}
        </div>
        <Menu
          theme="dark"
          mode="inline"
          selectedKeys={[selectedMenu]}
          onClick={(e) => setSelectedMenu(e.key)}
          items={menuItems}
        />
      </Sider>

      <Layout className="site-layout">
        <Header
          style={{
            background: "#fff",
            padding: "0 24px",
            boxShadow: "0 1px 4px rgba(0, 0, 0, 0.08)",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
          }}
        >
          <h2 style={{ margin: 0, fontSize: 24, fontWeight: 600 }}>
            {selectedMenu === "dashboard" ? "Dashboard" : "Request Management"}
          </h2>
          <span style={{ color: "#666", fontSize: 14 }}>
            {new Date().toLocaleDateString("en-US", {
              weekday: "long",
              year: "numeric",
              month: "long",
              day: "numeric",
            })}
          </span>
        </Header>

        <Content style={{ margin: "24px", minHeight: 360 }}>
          {selectedMenu === "dashboard" && (
            <div>
              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "repeat(auto-fit, minmax(250px, 1fr))",
                  gap: 20,
                  marginBottom: 32,
                }}
              >
                <Card bordered={false} style={{ boxShadow: "0 2px 8px rgba(0, 0, 0, 0.06)" }}>
                  <Statistic
                    title="Pending Requests"
                    value={pendingCount}
                    prefix={<ClockCircleOutlined style={{ color: "#faad14" }} />}
                    valueStyle={{ color: "#faad14" }}
                  />
                </Card>
                <Card bordered={false} style={{ boxShadow: "0 2px 8px rgba(0, 0, 0, 0.06)" }}>
                  <Statistic
                    title="Accepted"
                    value={acceptedCount}
                    prefix={<CheckCircleOutlined style={{ color: "#52c41a" }} />}
                    valueStyle={{ color: "#52c41a" }}
                  />
                </Card>
                <Card bordered={false} style={{ boxShadow: "0 2px 8px rgba(0, 0, 0, 0.06)" }}>
                  <Statistic
                    title="Rejected"
                    value={rejectedCount}
                    prefix={<CloseCircleOutlined style={{ color: "#f5222d" }} />}
                    valueStyle={{ color: "#f5222d" }}
                  />
                </Card>
              </div>

              <Card
                bordered={false}
                style={{
                  background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
                  color: "white",
                  textAlign: "center",
                  padding: "32px",
                  boxShadow: "0 4px 12px rgba(102, 126, 234, 0.2)",
                }}
              >
                <h3 style={{ fontSize: 20, marginBottom: 12, color: "white" }}>Welcome back, Lecturer!</h3>
                <p style={{ fontSize: 14, marginBottom: 0, color: "rgba(255, 255, 255, 0.9)" }}>
                  You have <strong>{pendingCount}</strong> pending requests waiting for your review.
                </p>
                <Button
                  type="primary"
                  size="large"
                  onClick={() => setSelectedMenu("viewRequests")}
                  style={{ marginTop: 16, background: "white", color: "#667eea", border: "none" }}
                >
                  Review Requests
                </Button>
              </Card>
            </div>
          )}

          {selectedMenu === "viewRequests" && (
            <Spin spinning={loading}>
              <Card bordered={false} style={{ boxShadow: "0 2px 8px rgba(0, 0, 0, 0.06)" }}>
                {requests.length === 0 ? (
                  <Empty description="No requests found" style={{ padding: "40px 0" }} />
                ) : (
                  <Table
                    rowKey="id"
                    columns={columns}
                    dataSource={requests}
                    loading={loading}
                    pagination={{ pageSize: 10, showSizeChanger: true }}
                    rowClassName={() => "hover:bg-gray-50"}
                    style={{ marginTop: 0 }}
                  />
                )}
              </Card>
            </Spin>
          )}
        </Content>

        <Footer
          style={{
            textAlign: "center",
            background: "#fafafa",
            borderTop: "1px solid #e8e8e8",
            color: "#666",
            fontSize: 12,
          }}
        >
          EXE101 ©2025 | Lecturer Management System
        </Footer>
      </Layout>
    </Layout>
  )
}

export default Lecturer
