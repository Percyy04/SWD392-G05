// src/screens/Lecturer.jsx
import React, { useState, useEffect } from "react";
import { Layout, Menu, Table, Tag, Button, message } from "antd";
import { DesktopOutlined, FileOutlined, LogoutOutlined } from "@ant-design/icons";
import { useNavigate } from "react-router-dom";
import axios from "axios";

const { Header, Content, Footer, Sider } = Layout;

const Lecturer = () => {
  const navigate = useNavigate();
  const [collapsed, setCollapsed] = useState(false);
  const [selectedMenu, setSelectedMenu] = useState("dashboard");
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(false);

  const token = localStorage.getItem("token");
  console.log("Token sent:", token);

  const fetchRequests = async () => {
    try {
      setLoading(true);
      const res = await axios.get(
        "http://localhost:5000/api/lecturer-requests/requests",
        { headers: { Authorization: `Bearer ${token}` } }
      );

      if (res.data.success) {
        // Map backend fields to frontend Table keys
        const formatted = res.data.data.map((r) => ({
          ...r,
          id: r.id || r.requestId, // đảm bảo rowKey
          teamName: r.TenTeam || r.teamName,
          leaderName: r.LeaderName || r.leaderName,
          status: r.status || "pending",
        }));
        setRequests(formatted);
      } else {
        message.error(res.data.message || "Failed to fetch requests");
      }
    } catch (err) {
      console.error(err);
      message.error(err.message || "Network error");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (selectedMenu === "viewRequests") fetchRequests();
  }, [selectedMenu]);

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    navigate("/");
  };

  const respondRequest = async (requestId, action) => {
    try {
      setLoading(true);
      const res = await axios.patch(
        `http://localhost:5000/api/lecturer-requests/requests/${requestId}/respond`,
        { action },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      if (res.data.success) {
        message.success(`Request ${action}ed successfully`);
        fetchRequests(); // reload
      } else {
        message.error(res.data.message || "Failed to respond");
      }
    } catch (err) {
      console.error(err);
      message.error(err.message || "Network error");
    } finally {
      setLoading(false);
    }
  };

 const columns = [
  {
    title: "Team Name",
    dataIndex: "teamName",
    key: "teamName",
  },
  {
    title: "Leader Name",
    dataIndex: "leaderName",
    key: "leaderName",
  },
  {
    title: "Status",
    dataIndex: "status",
    key: "status",
    render: (status) => {
      let color = "blue";
      if (status === "accepted") color = "green";
      else if (status === "rejected") color = "red";
      else if (status === "pending") color = "orange";
      return <Tag color={color}>{status.toUpperCase()}</Tag>;
    },
  },
  {
    title: "Action",
    key: "action",
    render: (_, record) =>
      record.status === "pending" ? (
        <div>
          <Button
            type="primary"
            onClick={() => respondRequest(record.id, "accept")}
            style={{ marginRight: 8 }}
          >
            Accept
          </Button>
          <Button
            type="default"
            danger
            onClick={() => respondRequest(record.id, "reject")}
          >
            Reject
          </Button>
        </div>
      ) : null,
  },
];


  const menuItems = [
    { key: "dashboard", icon: <DesktopOutlined />, label: "Dashboard" },
    { key: "viewRequests", icon: <FileOutlined />, label: "View Requests" },
    { key: "logout", icon: <LogoutOutlined />, label: "Logout", onClick: handleLogout },
  ];

  return (
    <Layout style={{ minHeight: "100vh" }}>
      <Sider collapsible collapsed={collapsed} onCollapse={setCollapsed}>
        <div
          className="logo"
          style={{ height: 32, margin: 16, color: "white", textAlign: "center" }}
        >
          Lecturer
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
        <Header style={{ padding: 0, background: "#fff", textAlign: "center" }}>
          <h2>{selectedMenu === "dashboard" ? "Dashboard" : "View Requests"}</h2>
        </Header>
        <Content style={{ margin: "16px" }}>
          {selectedMenu === "viewRequests" && (
            <Table rowKey="id" columns={columns} dataSource={requests} loading={loading} />
          )}
          {selectedMenu === "dashboard" && (
            <div>Welcome, Lecturer! Select "View Requests" to see incoming requests.</div>
          )}
        </Content>
        <Footer style={{ textAlign: "center" }}>EXE101 ©2025</Footer>
      </Layout>
    </Layout>
  );
};

export default Lecturer;
