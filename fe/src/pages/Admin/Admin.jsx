import { useState } from "react";
import { Layout, Menu, Button, Badge, Avatar, Dropdown } from "antd";
import {
  MenuFoldOutlined,
  MenuUnfoldOutlined,
  DashboardOutlined,
  TeamOutlined,
  UserOutlined,
  ClockCircleOutlined,
  ThunderboltOutlined,
  FileTextOutlined,
  DatabaseOutlined,
  BulbOutlined,
  BarChartOutlined,
  SettingOutlined,
  BellOutlined,
  LogoutOutlined,
  IdcardOutlined,
} from "@ant-design/icons";

import { Dashboard } from "../Admin/dashboard";
import { Teams } from "../Admin/teams";
import { Students } from "../Admin/students";
import { Requests } from "../Admin/requests";
import { LeaderVoting } from "../Admin/leader-voting";
import { Posts } from "../Admin/posts";
// import { MasterData } from "../Admin/master-data";
import { Suggestions } from "../Admin/suggestions";
import { Reports } from "../Admin/reports";
import { Settings } from "../Admin/settings";
import { pendingRequestsData } from "../../data/mockData";
import { Lecturers } from "../Admin/lecturers";
import { useNavigate } from "react-router-dom";
import toast, { Toaster } from "react-hot-toast";

const { Header, Sider, Content } = Layout;

export default function Admin() {
  const [collapsed, setCollapsed] = useState(false);
  const [selectedMenu, setSelectedMenu] = useState("1");
  const navigate = useNavigate();
  const token = localStorage.getItem("token");

const handleLogout = async () => {
  try {
    const token = localStorage.getItem("token");
    const res = await fetch("http://localhost:5000/api/logout", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
    });
    const data = await res.json();

    // ✅ Hiển thị đúng thông báo từ backend
    if (data.success) {
      toast.success(data.message || "Đăng xuất thành công", {
        duration: 2000,
        position: "top-center", // 👈 vị trí hiển thị
      });
      
    } else {
      toast.error("Đăng xuất thất bại");
    }
  } catch (err) {
    console.error("Logout error:", err);
    toast.error("Logout failed");
  } finally {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    sessionStorage.removeItem("token");
    setTimeout(() => navigate("/"), 1000);
  }
};


const menuItems = [
  { key: "1", icon: <DashboardOutlined />, label: "Dashboard" },
  // { key: "2", icon: <DatabaseOutlined />, label: "Master Data" },
  { key: "3", icon: <IdcardOutlined />, label: "Lecturers" },
  { key: "4", icon: <UserOutlined />, label: "Students" },
  { key: "5", icon: <TeamOutlined />, label: "Teams" },
  // { key: "6", icon: <ClockCircleOutlined />, label: "Requests" },
  // { key: "7", icon: <ThunderboltOutlined />, label: "Leader Voting" },
  { key: "8", icon: <FileTextOutlined />, label: "Posts" },
  // { key: "9", icon: <BulbOutlined />, label: "Smart Suggestions" },
  // { key: "10", icon: <BarChartOutlined />, label: "Reports" },
  // { key: "11", icon: <SettingOutlined />, label: "Settings" }
];

const renderContent = () => {
  switch (selectedMenu) {
    case "1": return <Dashboard />;
    // case "2": return <MasterData />;
    case "3": return <Lecturers />;
    case "4": return <Students isActive={selectedMenu === "4"} />;
    case "5": return <Teams/>;
    case "6": return <Requests />;
    case "7": return <LeaderVoting />;
    case "8": return <Posts token={token} />;
    case "9": return <Suggestions />;
    case "10": return <Reports />;
    case "11": return <Settings />;
    default: return null;
  }
};


  const dropdownMenu = {
    items: [
      // { key: "1", label: "Profile" },
      // { key: "2", label: "Settings" },
      { key: "3", label: "Logout", danger: true, icon: <LogoutOutlined /> },
    ],
    onClick: ({ key }) => {
      if (key === "3") handleLogout();
    },
  };

  return (
    <Layout className="min-h-screen">
      <Sider
        trigger={null}
        collapsible
        collapsed={collapsed}
        className="bg-white border-r border-gray-200"
        breakpoint="lg"
        onBreakpoint={(broken) => setCollapsed(broken)}
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
              <Button type="text" icon={<BellOutlined className="text-gray-900 text-lg" />} />
            </Badge>
            <Dropdown menu={dropdownMenu} placement="bottomRight" trigger={["click"]}>
              <Avatar className="cursor-pointer bg-green-600">A</Avatar>
            </Dropdown>



          </div>
        </Header>

        <Content className="m-6 p-6 bg-gray-50 rounded-lg min-h-[calc(100vh-88px)]">{renderContent()}</Content>
      </Layout>

      <style jsx global>{`
        .ant-layout { background: #f9fafb; }
        .ant-menu-light { background: #ffffff; }
        .ant-menu-light .ant-menu-item-selected { background: #10b981 !important; color: #ffffff !important; }
        .ant-menu-light .ant-menu-item-selected .anticon { color: #ffffff !important; }
        .ant-card { background: #ffffff; border-color: #e5e7eb; }
        .ant-card-head { border-color: #e5e7eb; }
        .custom-table .ant-table { background: transparent; }
        .custom-table .ant-table-thead > tr > th { background: #f9fafb; color: #6b7280; border-color: #e5e7eb; }
        .custom-table .ant-table-tbody > tr > td { border-color: #e5e7eb; color: #374151; }
        .custom-table .ant-table-tbody > tr:hover > td { background: #f9fafb; }
        .ant-input { background: #ffffff; border-color: #e5e7eb; color: #111827; }
        .ant-input:hover, .ant-input:focus { border-color: #10b981; }
        .ant-select-selector { background: #ffffff !important; border-color: #e5e7eb !important; color: #111827 !important; }
        .ant-modal-content { background: #ffffff; }
        .ant-modal-header { background: #ffffff; border-color: #e5e7eb; }
      `}</style>
    </Layout>
  );
}
