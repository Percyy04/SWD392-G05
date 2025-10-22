import { Card, Row, Col, Progress, Statistic } from "antd"

export function Reports() {
  return (
    <div className="space-y-4">
      <Row gutter={[16, 16]}>
        <Col xs={24} lg={12}>
          <Card title="teams by Major" className="bg-white border border-gray-200 shadow-sm">
            <div className="space-y-3">
              {[
                { name: "Software Engineering", count: 8, percent: 67 },
                { name: "Artificial Intelligence", count: 4, percent: 33 },
              ].map((item, i) => (
                <div key={i}>
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-gray-700">{item.name}</span>
                    <span className="font-semibold text-gray-900">{item.count} teams</span>
                  </div>
                  <Progress percent={item.percent} strokeColor="#10b981" />
                </div>
              ))}
            </div>
          </Card>
        </Col>

        <Col xs={24} lg={12}>
          <Card title="Members by Role" className="bg-white border border-gray-200 shadow-sm">
            <div className="space-y-3">
              {[
                { name: "Leader", count: 18 },
                { name: "Member", count: 138 },
              ].map((item, i) => (
                <div key={i} className="flex items-center justify-between">
                  <span className="text-gray-700">{item.name}</span>
                  <span className="font-semibold text-gray-900">{item.count}</span>
                </div>
              ))}
            </div>
          </Card>
        </Col>
      </Row>

      <Card title="Request Statistics" className="bg-white border border-gray-200 shadow-sm">
        <Row gutter={[16, 16]}>
          <Col xs={24} sm={8}>
            <Statistic title="Approved" value={45} valueStyle={{ color: "#10b981" }} />
          </Col>
          <Col xs={24} sm={8}>
            <Statistic title="Rejected" value={12} valueStyle={{ color: "#ef4444" }} />
          </Col>
          <Col xs={24} sm={8}>
            <Statistic title="Pending" value={8} valueStyle={{ color: "#f59e0b" }} />
          </Col>
        </Row>
      </Card>
    </div>
  )
}
