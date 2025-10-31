"use client"

import { Card, Table, Tag, Button, Badge, message } from "antd"
import { CheckCircleOutlined, CloseCircleOutlined } from "@ant-design/icons"
import { Avatar } from "antd"
import { pendingRequestsData } from "../../data/mockData";

export function Requests() {
  const columns = [
    {
      title: "Student",
      dataIndex: "student",
      key: "student",
      render: (t) => (
        <div className="flex items-center gap-2">
          <Avatar size="small" className="bg-blue-600">
            {t[0]}
          </Avatar>
          <span>{t}</span>
        </div>
      ),
    },
    {
      title: "Type",
      dataIndex: "type",
      key: "type",
      render: (t) => {
        const config = { "Join Request": "blue", "Transfer Request": "orange", "Leave Request": "red" }
        return <Tag color={config[t]}>{t}</Tag>
      },
    },
    { title: "Team", dataIndex: "team", key: "team" },
    { title: "Reason", dataIndex: "reason", key: "reason" },
    { title: "Date", dataIndex: "date", key: "date" },
    {
      title: "Action",
      key: "action",
      render: () => (
        <div className="flex gap-2">
          <Button
            type="primary"
            size="small"
            icon={<CheckCircleOutlined />}
            className="bg-green-600"
            onClick={() => message.success("Approved")}
          />
          <Button danger size="small" icon={<CloseCircleOutlined />} onClick={() => message.error("Rejected")} />
        </div>
      ),
    },
  ]

  return (
    <Card
      title="Pending Requests"
      extra={<Badge count={pendingRequestsData.length} style={{ backgroundColor: "#f59e0b" }} />}
      className="bg-white border border-gray-200 shadow-sm"
    >
      <Table columns={columns} dataSource={pendingRequestsData} pagination={{ pageSize: 10 }} />
    </Card>
  )
}
