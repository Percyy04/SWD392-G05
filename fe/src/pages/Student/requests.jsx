import { Table, Button } from "antd";
import { useStudentDashboard } from "../../../hooks/useStudentDashboard";

export default function RequestsWrapper() {
  const { requests, cancelRequest } = useStudentDashboard(true); // shouldFetch = true

  const columns = [
    { title: "Team", dataIndex: "teamName", key: "teamName" },
    { title: "Status", dataIndex: "status", key: "status" },
    { 
      title: "Requested At", 
      dataIndex: "requested_at", 
      key: "requested_at",
      render: (text) => (text ? new Date(text).toLocaleString() : "")
    },
    {
      title: "Action",
      key: "action",
      render: (_, record) => (
        <Button 
          type="link" 
          danger 
          onClick={() => cancelRequest(record.id)}
        >
          Cancel
        </Button>
      ),
    },
  ];

  return (
    <Table
      dataSource={requests.map((r, i) => ({ key: i, ...r }))}
      columns={columns}
      pagination={{ pageSize: 10 }}
      bordered
    />
  );
}
