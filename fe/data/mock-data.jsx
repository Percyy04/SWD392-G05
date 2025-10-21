import { TeamOutlined, UserOutlined, ClockCircleOutlined, ThunderboltOutlined } from "@ant-design/icons"

// Mock data for the admin dashboard
export const statsData = [
  {
    title: "Active Groups",
    value: 24,
    change: "+12%",
    color: "bg-green-600",
    icon: <TeamOutlined className="text-2xl" />,
  },
  {
    title: "Total Students",
    value: 156,
    change: "+8%",
    color: "bg-blue-600",
    icon: <UserOutlined className="text-2xl" />,
  },
  {
    title: "Pending Requests",
    value: 8,
    change: "-5%",
    color: "bg-orange-600",
    icon: <ClockCircleOutlined className="text-2xl" />,
  },
  {
    title: "Leaders Assigned",
    value: 18,
    change: "+3%",
    color: "bg-purple-600",
    icon: <ThunderboltOutlined className="text-2xl" />,
  },
]

export const teamsData = [
  {
    key: "1",
    teamName: "Team Alpha",
    leader: "John Doe",
    members: 5,
    status: "active",
    major: "SE",
    createdAt: "2025-01-15",
  },
  {
    key: "2",
    teamName: "Team Beta",
    leader: "Jane Smith",
    members: 6,
    status: "voting",
    major: "AI",
    createdAt: "2025-01-14",
  },
  {
    key: "3",
    teamName: "Team Gamma",
    leader: null,
    members: 4,
    status: "open",
    major: "IS",
    createdAt: "2025-01-13",
  },
  {
    key: "4",
    teamName: "Team Delta",
    leader: "Mike Johnson",
    members: 6,
    status: "locked",
    major: "SE",
    createdAt: "2025-01-12",
  },
]

export const pendingRequestsData = [
  {
    key: "1",
    student: "Alice Brown",
    type: "Join Request",
    team: "Team Alpha",
    reason: "Interested in SE",
    date: "2025-01-20",
  },
  {
    key: "2",
    student: "Bob Wilson",
    type: "Transfer Request",
    team: "Team Beta",
    reason: "Schedule conflict",
    date: "2025-01-19",
  },
  {
    key: "3",
    student: "Carol Davis",
    type: "Leave Request",
    team: "Team Gamma",
    reason: "Personal reasons",
    date: "2025-01-18",
  },
]

export const leaderVotingData = [
  {
    key: "1",
    teamName: "Team Beta",
    candidates: ["Alice", "Bob", "Carol"],
    votes: { Alice: 3, Bob: 2, Carol: 1 },
    status: "voting",
  },
  {
    key: "2",
    teamName: "Team Epsilon",
    candidates: ["David", "Eve"],
    votes: { David: 2, Eve: 2 },
    status: "voting",
  },
]

export const postsData = [
  {
    key: "1",
    title: "Team Formation Rules",
    content: "Please follow the guidelines...",
    groups: "All",
    date: "2025-01-20",
  },
  {
    key: "2",
    title: "Deadline Extension",
    content: "Project deadline extended to...",
    groups: "SE, AI",
    date: "2025-01-19",
  },
]

export const suggestionsData = [
  {
    key: "1",
    teamName: "Team Alpha",
    matchScore: 95,
    members: 4,
    rolesNeeded: ["Backend", "Frontend"],
  },
  {
    key: "2",
    teamName: "Team Beta",
    matchScore: 87,
    members: 5,
    rolesNeeded: ["DevOps"],
  },
  {
    key: "3",
    teamName: "Team Gamma",
    matchScore: 78,
    members: 3,
    rolesNeeded: ["Frontend", "QA"],
  },
]
