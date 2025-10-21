// components/dashboard.js
import { Row, Col, Card } from "antd";
import { TrendingUp } from "lucide-react";
import { statsData } from "../../data/mockData";

export function Dashboard() {
  const alerts = [
    { color: "orange", icon: "⚠️", title: "Team Delta exceeded limit", desc: "6 members in a team with max 6" },
    { color: "red", icon: "❌", title: "Pending requests overdue", desc: "3 requests waiting for approval" },
    { color: "blue", icon: "ℹ️", title: "Voting in progress", desc: "2 teams need leader election" },
  ];

  const getAlertStyles = (color) => {
    switch (color) {
      case "orange": return { bg: "#FFF7ED", border: "#FEEBC8", text: "#C2410C", subText: "#9A3412" };
      case "red": return { bg: "#FEE2E2", border: "#FCA5A5", text: "#B91C1C", subText: "#991B1B" };
      case "blue": return { bg: "#EFF6FF", border: "#BFDBFE", text: "#1D4ED8", subText: "#2563EB" };
      default: return {};
    }
  };

  return (
    <div className="space-y-6">
      {/* Stats Cards */}
      <Row gutter={[16, 16]}>
        {statsData.map((stat, i) => (
          <Col xs={24} sm={12} lg={6} key={i}>
            <Card className="bg-white border border-gray-200 hover:border-green-500 transition-all shadow-sm h-full">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-600 text-sm mb-1">{stat.title}</p>
                  <p className="text-3xl font-bold text-gray-900">{stat.value}</p>
                  <p className="text-green-600 text-sm mt-1 flex items-center gap-1">
                    <TrendingUp className="w-4 h-4" />
                    {stat.change}
                  </p>
                </div>
                <div className="p-3 rounded-lg text-white text-2xl bg-gray-400">📊</div>
              </div>
            </Card>
          </Col>
        ))}
      </Row>

      {/* Recent Activity & Alerts */}
      <Row gutter={[16, 16]}>
        <Col xs={24} lg={12}>
          <Card title="Recent Activity" className="bg-white border border-gray-200 shadow-sm">
            <div className="space-y-3 max-h-80 overflow-y-auto">
              {[
                { title: "Team Alpha formed", desc: "5 members joined", time: "2 hours ago" },
                { title: "Leader elected", desc: "John Doe selected as leader", time: "4 hours ago" },
                { title: "Request approved", desc: "Alice joined Team Beta", time: "6 hours ago" },
              ].map((item, i) => (
                <div key={i} className="flex items-center justify-between p-3 bg-gray-50 rounded">
                  <div>
                    <p className="text-gray-900 font-medium">{item.title}</p>
                    <p className="text-gray-500 text-sm">{item.desc}</p>
                  </div>
                  <span className="text-gray-400 text-sm">{item.time}</span>
                </div>
              ))}
            </div>
          </Card>
        </Col>

        <Col xs={24} lg={12}>
          <Card title="Alerts & Notifications" className="bg-white border border-gray-200 shadow-sm">
            <div className="space-y-3 max-h-80 overflow-y-auto">
              {alerts.map((alert, i) => {
                const styles = getAlertStyles(alert.color);
                return (
                  <div
                    key={i}
                    className="p-3 rounded border"
                    style={{ backgroundColor: styles.bg, borderColor: styles.border }}
                  >
                    <p className="font-medium text-sm" style={{ color: styles.text }}>
                      {alert.icon} {alert.title}
                    </p>
                    <p className="text-xs mt-1" style={{ color: styles.subText }}>
                      {alert.desc}
                    </p>
                  </div>
                );
              })}
            </div>
          </Card>
        </Col>
      </Row>
    </div>
  );
}
