import { Card } from "antd"
import { CheckCircleOutlined, ClockCircleOutlined } from "@ant-design/icons"
import { Activity } from "lucide-react"

const RecentActivity = () => {
  const activities = [
    {
      action: "Team Alpha locked",
      time: "5 minutes ago",
      icon: <CheckCircleOutlined className="text-green-500" />,
    },
    {
      action: "New join request from Pham Van D",
      time: "15 minutes ago",
      icon: <ClockCircleOutlined className="text-yellow-500" />,
    },
    {
      action: "Team Beta started voting",
      time: "1 hour ago",
      icon: <Activity className="w-4 h-4 text-blue-500" />,
    },
    {
      action: "Transfer request approved",
      time: "2 hours ago",
      icon: <CheckCircleOutlined className="text-green-500" />,
    },
  ]

  return (
    <Card
      title={<span className="text-gray-900 font-semibold">Recent Activity</span>}
      className="bg-white border-gray-200 shadow-sm"
    >
      <div className="space-y-4">
        {activities.map((activity, index) => (
          <div
            key={index}
            className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
          >
            {activity.icon}
            <div className="flex-1">
              <p className="text-gray-900 text-sm">{activity.action}</p>
              <p className="text-gray-500 text-xs">{activity.time}</p>
            </div>
          </div>
        ))}
      </div>
    </Card>
  )
}

export default RecentActivity