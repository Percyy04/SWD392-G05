import { Card, Row, Col, Table, Tabs, Empty, Button } from "antd"
import {
  DatabaseOutlined,
  FileTextOutlined,
  BgColorsOutlined,
  CalendarOutlined,
  EditOutlined,
  DeleteOutlined,
} from "@ant-design/icons"

export function MasterData() {
  const items = [
    { key: "1", name: "Majors", count: 5, icon: <DatabaseOutlined /> },
    { key: "2", name: "Subjects", count: 12, icon: <FileTextOutlined /> },
    { key: "3", name: "Courses", count: 8, icon: <BgColorsOutlined /> },
    { key: "4", name: "Semesters", count: 3, icon: <CalendarOutlined /> },
  ]

  return (
    <div className="space-y-4">
      <Row gutter={[16, 16]}>
        {items.map((item) => (
          <Col xs={24} sm={12} lg={6} key={item.key}>
            <Card className="bg-white border border-gray-200 shadow-sm cursor-pointer hover:border-green-500 transition-all">
              <div className="text-center">
                <div className="text-3xl text-green-600 mb-2">{item.icon}</div>
                <h3 className="text-gray-900 font-semibold">{item.name}</h3>
                <p className="text-2xl font-bold text-gray-900 mt-2">{item.count}</p>
              </div>
            </Card>
          </Col>
        ))}
      </Row>

      <Card title="Manage Data" className="bg-white border border-gray-200 shadow-sm">
        <Tabs
          defaultActiveKey="1"
          items={[
            {
              key: "1",
              label: "Majors",
              children: (
                <Table
                  columns={[
                    { title: "Name", dataIndex: "name", key: "name" },
                    { title: "Code", dataIndex: "code", key: "code" },
                    {
                      title: "Action",
                      key: "action",
                      render: () => (
                        <div className="flex gap-2">
                          <Button type="text" size="small" icon={<EditOutlined />} />
                          <Button type="text" size="small" danger icon={<DeleteOutlined />} />
                        </div>
                      ),
                    },
                  ]}
                  dataSource={[
                    { key: "1", name: "Software Engineering", code: "SE" },
                    { key: "2", name: "Artificial Intelligence", code: "AI" },
                  ]}
                  pagination={false}
                />
              ),
            },
            { key: "2", label: "Subjects", children: <Empty description="No subjects yet" /> },
            { key: "3", label: "Courses", children: <Empty description="No courses yet" /> },
          ]}
        />
      </Card>
    </div>
  )
}
