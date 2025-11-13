import { useState, useEffect } from "react";
import { Layout, Menu, Button, Avatar, Dropdown } from "antd";
import {
  MenuFoldOutlined,
  MenuUnfoldOutlined,
  TeamOutlined,
  FileTextOutlined,
  LogoutOutlined,
  UserAddOutlined,
} from "@ant-design/icons";
import { useNavigate, useLocation } from "react-router-dom";
import toast from "react-hot-toast";
import { useStudentDashboard } from "../../../hooks/useStudentDashboard";

import Teams from "./Teams";
import Posts from "./posts";
import Request from "./Request"; // ✅ import trang Request mới

const { Header, Sider, Content } = Layout;

export default function Student() {
  const [collapsed, setCollapsed] = useState(false);
  const [selectedMenu, setSelectedMenu] = useState("2");
  const navigate = useNavigate();
  const location = useLocation();

  const { student, teams, loading, error } = useStudentDashboard(true);

  // ✅ Đồng bộ menu khi navigate từ nơi khác
  useEffect(() => {
    if (location.state?.selectedMenu) {
      setSelectedMenu(location.state.selectedMenu);
      window.history.replaceState({}, document.title);
    }
  }, [location.state]);

  // ---------------- Logout ----------------
  const handleLogout = async () => {
    try {
      const token = localStorage.getItem("token");
      const res = await fetch("http://localhost:5000/api/logout", {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (data.success)
        toast.success(data.message || "Đăng xuất thành công", { duration: 2000 });
      else toast.error("Đăng xuất thất bại");
    } catch (err) {
      console.error(err);
      toast.error("Logout failed");
    } finally {
      localStorage.removeItem("token");
      localStorage.removeItem("user");
      sessionStorage.removeItem("token");
      setTimeout(() => navigate("/"), 1000);
    }
  };

  const dropdownMenu = {
    items: [
      // { key: "1", label: "Profile" },
      { key: "2", label: "Logout", danger: true, icon: <LogoutOutlined /> },
    ],
    onClick: ({ key }) => {
      if (key === "2") handleLogout();
    },
  };

  // ---------------- Menu hiển thị ----------------
  const menuItems = [
    { key: "2", icon: <TeamOutlined />, label: "Teams" },
    { key: "3", icon: <FileTextOutlined />, label: "Posts" },
    { key: "4", icon: <UserAddOutlined />, label: "Request Lecturer" }, // ✅ Luôn hiển thị
  ];

  let currentTeam; // Team mà student đã tham gia (dù có phải leader hay không)
  let isLeader = false;

  if (!loading && teams?.length > 0 && student) {
    // Tìm team mà student đã tham gia (theo student.Team)
    currentTeam = teams.find((team) => String(team.teamId) === String(student.Team));
    
    // Check xem có phải leader của team đó không
    if (currentTeam) {
      isLeader = String(currentTeam.leaderId) === String(student.MaSV);
    }
  }

  // ---------------- Render nội dung ----------------
const renderContent = () => {
    if (loading) return <p>Loading...</p>;
    if (error) return <p className="text-red-600">{error}</p>;

    switch (selectedMenu) {
      case "2":
        return <Teams student={student} teams={teams} />;
      case "3":
        return (
          <Posts
            token={localStorage.getItem("token")}
            currentStudentId={student?.MaSV} // Thống nhất dùng MaSV
          />
        );
      case "4":
        // Truyền team hiện tại (dù có phải leader hay không) và trạng thái isLeader
        return <Request teamId={currentTeam?.teamId} isLeader={isLeader} />;
      default:
        return null;
    }
  };

  return (
    <Layout className="min-h-screen">
      {/* Sidebar */}
      <Sider
        collapsible
        collapsed={collapsed}
        className="bg-white border-r border-gray-200"
      >
        <div className="h-16 flex items-center justify-center border-b border-gray-200">
          <h1 className="text-gray-900 font-bold text-xl">
            {collapsed ? "ST" : "Student"}
          </h1>
        </div>
        <Menu
          theme="light"
          mode="inline"
          selectedKeys={[selectedMenu]}
          items={menuItems}
          onClick={({ key }) => setSelectedMenu(key)}
        />
      </Sider>

      {/* Header + Content */}
      <Layout>
        <Header className="bg-white border-b border-gray-200 px-4 flex items-center justify-between shadow-sm">
          <Button
            type="text"
            icon={collapsed ? <MenuUnfoldOutlined /> : <MenuFoldOutlined />}
            onClick={() => setCollapsed(!collapsed)}
          />
          <Dropdown menu={dropdownMenu} placement="bottomRight" trigger={["click"]}>
            <Avatar className="cursor-pointer bg-green-600">
              {student?.HoTen?.[0]}
            </Avatar>
          </Dropdown>
        </Header>

        <Content className="m-6 p-6 bg-gray-50 rounded-lg min-h-[calc(100vh-88px)]">
          {renderContent()}
        </Content>
      </Layout>
    </Layout>
  );
}
