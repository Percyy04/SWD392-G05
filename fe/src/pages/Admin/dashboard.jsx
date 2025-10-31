// components/dashboard.jsx
import { Row, Col, Card, Spin, Table, Avatar } from "antd"
import { TrendingUp, Users, BookOpen, Award } from "lucide-react"
import { useStudents } from "../../../hooks/use-students"
import { useTeams } from "../../../hooks/use-teams"
import { useLecturers } from "../../../hooks/use-lectures"

export function Dashboard() {
  const { data: teams, loading: teamsLoading } = useTeams(true)
  const { data: students, loading: studentsLoading } = useStudents(true)
  const { data: lecturers, loading: lecturersLoading } = useLecturers(true)

  const statusList = ["Active", "Locked", "Voting", "Open"]
  const statusColors = { Active: "#10b981", Locked: "#ef4444", Voting: "#3b82f6", Open: "#f97316" }

  const columns = [
    {
      title: "STT",
      key: "index",
      width: 60,
      align: "center",
      render: (_, __, index) => <span className="font-medium text-gray-700">{index + 1}</span>,
    },
    {
      title: "Team",
      dataIndex: "name",
      key: "name",
      render: (name, record) => (
        <div className="flex items-center gap-3">
          <Avatar size="large" className="bg-gradient-to-br from-blue-500 to-blue-600 text-white font-semibold">
            {name?.[0]?.toUpperCase()}
          </Avatar>
          <div className="flex flex-col">
            <span className="font-semibold text-gray-900">{name}</span>
            <span className="text-xs text-gray-500">{record.id}</span>
          </div>
        </div>
      ),
    },
    {
      title: "Leader",
      dataIndex: "leaderName",
      key: "leader",
      render: (leaderName, record) =>
        leaderName ? (
          <div className="flex items-center gap-2">
            <Avatar size="small" className="bg-gradient-to-br from-emerald-500 to-emerald-600 text-white font-semibold">
              {leaderName?.[0]?.toUpperCase()}
            </Avatar>
            <div className="flex flex-col">
              <span className="font-medium text-gray-900">{leaderName}</span>
              <span className="text-xs text-gray-500">{record.leaderID}</span>
            </div>
          </div>
        ) : (
          <span className="text-gray-400 text-sm">—</span>
        ),
    },
    {
      title: "Members",
      dataIndex: "membersCount",
      key: "membersCount",
      align: "center",
      render: (count) => (
        <span className="inline-flex items-center justify-center w-8 h-8 rounded-full bg-blue-100 text-blue-700 font-semibold text-sm">
          {count}
        </span>
      ),
    },
    {
      title: "Status",
      dataIndex: "status",
      key: "status",
      render: (status) => {
        const statusConfig = {
          Active: { bg: "bg-emerald-50", text: "text-emerald-700", border: "border-emerald-200" },
          Locked: { bg: "bg-red-50", text: "text-red-700", border: "border-red-200" },
          Voting: { bg: "bg-blue-50", text: "text-blue-700", border: "border-blue-200" },
          Open: { bg: "bg-orange-50", text: "text-orange-700", border: "border-orange-200" },
        }
        const config = statusConfig[status] || { bg: "bg-gray-50", text: "text-gray-700", border: "border-gray-200" }
        return (
          <span
            className={`px-3 py-1 rounded-full text-sm font-medium border ${config.bg} ${config.text} ${config.border}`}
          >
            {status}
          </span>
        )
      },
    },
    {
      title: "Description",
      dataIndex: "description",
      key: "description",
      render: (desc) => <span className="text-gray-700">{desc ? desc : <span className="text-gray-400">—</span>}</span>,
    },
  ]

  if (teamsLoading || studentsLoading || lecturersLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <Spin size="large" />
      </div>
    )
  }

  const statsData = [
    { title: "Total Teams", value: teams?.length || 0, icon: Award, color: "bg-blue-50", iconColor: "text-blue-600" },
    {
      title: "Active Students",
      value: students?.length || 0,
      icon: Users,
      color: "bg-emerald-50",
      iconColor: "text-emerald-600",
    },
    {
      title: "Total Lecturers",
      value: lecturers?.length || 0,
      icon: BookOpen,
      color: "bg-purple-50",
      iconColor: "text-purple-600",
    },
  ]

  return (
    <div className="space-y-8 p-6">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
        <p className="text-gray-600 mt-2">Overview of teams, students, and lecturers</p>
      </div>

      {/* Stats Cards */}
      <Row gutter={[24, 24]}>
        {statsData.map((stat, i) => {
          const IconComponent = stat.icon
          return (
            <Col xs={24} sm={12} lg={8} key={i}>
              <Card
                className="h-full shadow-sm hover:shadow-md transition-all border-gray-200 bg-white"
                bordered={true}
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <p className="text-gray-600 text-sm font-medium mb-2">{stat.title}</p>
                    <p className="text-4xl font-bold text-gray-900 mb-3">{stat.value}</p>
                    <div className="flex items-center gap-1 text-emerald-600 text-sm font-medium">
                      <TrendingUp className="w-4 h-4" />
                      <span>On track</span>
                    </div>
                  </div>
                  <div className={`${stat.color} p-4 rounded-lg flex items-center justify-center`}>
                    <IconComponent className={`w-8 h-8 ${stat.iconColor}`} />
                  </div>
                </div>
              </Card>
            </Col>
          )
        })}
      </Row>

      {/* Status Tables Section */}
      <div className="space-y-6">
        <div>
          <h2 className="text-xl font-bold text-gray-900 mb-4">Teams by Status</h2>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {statusList.map((status) => {
              const teamsByStatus = teams.filter((t) => t.status === status)
              const statusConfig = {
                Active: { color: "emerald", icon: "✓" },
                Locked: { color: "red", icon: "🔒" },
                Voting: { color: "blue", icon: "📊" },
                Open: { color: "orange", icon: "📂" },
              }
              const config = statusConfig[status]
              return (
                <Card key={status} bordered={true} className="shadow-sm hover:shadow-md transition-all bg-white">
                  <div className="mb-4 flex items-center gap-2">
                    <span className="text-xl">{config.icon}</span>
                    <h3 className="text-lg font-semibold text-gray-900">{status} Teams</h3>
                    <span className="ml-auto inline-flex items-center justify-center px-2 py-1 rounded bg-gray-100 text-gray-700 text-sm font-medium">
                      {teamsByStatus.length}
                    </span>
                  </div>
                  <Table
                    columns={columns}
                    dataSource={teamsByStatus}
                    rowKey="id"
                    pagination={{ pageSize: 5 }}
                    className="bg-white"
                    style={{
                      fontFamily: "inherit",
                    }}
                  />
                </Card>
              )
            })}
          </div>
        </div>
      </div>
    </div>
  )
}
