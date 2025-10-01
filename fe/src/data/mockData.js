import { Users, UserCheck, Clock, AlertCircle } from "lucide-react"

export const statsData = [
  { title: "Total Teams", value: 24, icon: <Users className="w-6 h-6" />, color: "bg-blue-500", change: "+12%" },
  { title: "Active Students", value: 156, icon: <UserCheck className="w-6 h-6" />, color: "bg-green-500", change: "+8%" },
  { title: "Pending Requests", value: 8, icon: <Clock className="w-6 h-6" />, color: "bg-yellow-500", change: "+3" },
  { title: "Issues", value: 2, icon: <AlertCircle className="w-6 h-6" />, color: "bg-red-500", change: "-2" },
]

export const teamsData = [
  {
    key: "1",
    teamName: "Team Alpha",
    leader: "Nguyen Van A",
    members: 5,
    status: "active",
    major: "Software Engineering",
    createdAt: "2025-01-15",
  },
  {
    key: "2",
    teamName: "Team Beta",
    leader: "Tran Thi B",
    members: 4,
    status: "voting",
    major: "Software Engineering",
    createdAt: "2025-01-18",
  },
  {
    key: "3",
    teamName: "Team Gamma",
    leader: "Le Van C",
    members: 6,
    status: "locked",
    major: "Information Systems",
    createdAt: "2025-01-10",
  },
  {
    key: "4",
    teamName: "Team Delta",
    leader: null,
    members: 3,
    status: "open",
    major: "Software Engineering",
    createdAt: "2025-01-20",
  },
]

export const pendingRequestsData = [
  {
    key: "1",
    student: "Pham Van D",
    type: "Join Request",
    team: "Team Alpha",
    reason: "Want to join as Backend Developer",
    date: "2025-01-25",
  },
  {
    key: "2",
    student: "Hoang Thi E",
    type: "Transfer Request",
    team: "Team Beta → Team Gamma",
    reason: "Better skill match",
    date: "2025-01-24",
  },
  {
    key: "3",
    student: "Vo Van F",
    type: "Leave Request",
    team: "Team Delta",
    reason: "Personal reasons",
    date: "2025-01-23",
  },
]

export const studentsData = [
  {
    key: "1",
    name: "Nguyen Van A",
    email: "nguyenvana@fpt.edu.vn",
    major: "Software Engineering",
    team: "Team Alpha",
    role: "Leader",
    status: "active",
  },
  {
    key: "2",
    name: "Tran Thi B",
    email: "tranthib@fpt.edu.vn",
    major: "Software Engineering",
    team: "Team Beta",
    role: "Leader",
    status: "active",
  },
  {
    key: "3",
    name: "Le Van C",
    email: "levanc@fpt.edu.vn",
    major: "Information Systems",
    team: "Team Gamma",
    role: "Leader",
    status: "active",
  },
  {
    key: "4",
    name: "Pham Van D",
    email: "phamvand@fpt.edu.vn",
    major: "Software Engineering",
    team: null,
    role: null,
    status: "pending",
  },
]

export const menuItems = [
  {
    key: "1",
    icon: <DashboardOutlined />,
    label: "Dashboard",
  },
  {
    key: "2",
    icon: <TeamOutlined />,
    label: "Teams",
  },
  {
    key: "3",
    icon: <UserOutlined />,
    label: "Students",
  },
  {
    key: "4",
    icon: <FileTextOutlined />,
    label: "Requests",
  },
  {
    key: "5",
    icon: <SettingOutlined />,
    label: "Settings",
  },
]