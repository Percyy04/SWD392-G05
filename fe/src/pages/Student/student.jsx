import { useState } from "react";
import { Layout, Menu, Button, Avatar, Dropdown } from "antd";
import { MenuFoldOutlined, MenuUnfoldOutlined, DashboardOutlined, TeamOutlined, FileTextOutlined, LogoutOutlined } from "@ant-design/icons";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import { useStudentDashboard } from "../../../hooks/useStudentDashboard";

import Dashboard from "./Dashboard";
import Teams from "./Teams";
import Posts from "./posts"; // import Posts student version

const { Header, Sider, Content } = Layout;

export default function Student() {
  const [collapsed, setCollapsed] = useState(false);
  const [selectedMenu, setSelectedMenu] = useState("1");
  const navigate = useNavigate();

  const { student, teams, loading, error } = useStudentDashboard(true);

  // ---------------- Logout ----------------
  const handleLogout = async () => {
    try {
      const token = localStorage.getItem("token");
      const res = await fetch("http://localhost:5000/api/logout", {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (data.success) toast.success(data.message || "Đăng xuất thành công", { duration: 2000 });
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
      { key: "1", label: "Profile" },
      { key: "2", label: "Logout", danger: true, icon: <LogoutOutlined /> },
    ],
    onClick: ({ key }) => { if (key === "2") handleLogout(); },
  };

  const menuItems = [
    { key: "1", icon: <DashboardOutlined />, label: "Dashboard" },
    { key: "2", icon: <TeamOutlined />, label: "Teams" },
    { key: "3", icon: <FileTextOutlined />, label: "Posts" }, // đổi label cho rõ
  ];

  const renderContent = () => {
    if (loading) return <p>Loading...</p>;
    if (error) return <p className="text-red-600">{error}</p>;

    switch (selectedMenu) {
      case "1":
        return <Dashboard student={student} />;
      case "2":
        return <Teams student={student} teams={teams} />;
      case "3":
        return (
          <Posts
            token={localStorage.getItem("token")}
            currentStudentId={student?.id || student?.MaSV} // đảm bảo lấy đúng id
          />
        );
      default:
        return null;
    }
  };

  return (
    <Layout className="min-h-screen">
      <Sider collapsible collapsed={collapsed} className="bg-white border-r border-gray-200">
        <div className="h-16 flex items-center justify-center border-b border-gray-200">
          <h1 className="text-gray-900 font-bold text-xl">{collapsed ? "ST" : "Student"}</h1>
        </div>
        <Menu
          theme="light"
          mode="inline"
          selectedKeys={[selectedMenu]}
          items={menuItems}
          onClick={({ key }) => setSelectedMenu(key)}
        />
      </Sider>

      <Layout>
        <Header className="bg-white border-b border-gray-200 px-4 flex items-center justify-between shadow-sm">
          <Button type="text" icon={collapsed ? <MenuUnfoldOutlined /> : <MenuFoldOutlined />} onClick={() => setCollapsed(!collapsed)} />
          <Dropdown menu={dropdownMenu} placement="bottomRight" trigger={["click"]}>
            <Avatar className="cursor-pointer bg-green-600">{student?.HoTen?.[0]}</Avatar>
          </Dropdown>
        </Header>

        <Content className="m-6 p-6 bg-gray-50 rounded-lg min-h-[calc(100vh-88px)]">
          {renderContent()}
        </Content>
      </Layout>
    </Layout>
  );
}
