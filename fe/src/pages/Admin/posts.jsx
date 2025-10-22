import { Card, Button, Dropdown } from "antd"
import { FileAddOutlined, MoreOutlined, EditOutlined, DeleteOutlined } from "@ant-design/icons"
import { postsData } from "../../data/mockData";

export function Posts() {
  return (
    <Card
      title="Posts & Announcements"
      extra={
        <Button type="primary" icon={<FileAddOutlined />} className="bg-green-600">
          Create Post
        </Button>
      }
      className="bg-white border border-gray-200 shadow-sm"
    >
      <div className="space-y-4">
        {postsData.map((post) => (
          <Card key={post.key} size="small" className="bg-gray-50 border border-gray-200">
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <h4 className="text-gray-900 font-semibold">{post.title}</h4>
                <p className="text-gray-600 text-sm mt-1">{post.content}</p>
                <div className="flex items-center gap-4 mt-2">
                  <span className="text-gray-500 text-xs">teams: {post.teams}</span>
                  <span className="text-gray-500 text-xs">{post.date}</span>
                </div>
              </div>
              <Dropdown
                menu={{
                  items: [
                    { key: "1", label: "Edit", icon: <EditOutlined /> },
                    { key: "2", label: "Delete", danger: true, icon: <DeleteOutlined /> },
                  ],
                }}
              >
                <Button type="text" icon={<MoreOutlined />} />
              </Dropdown>
            </div>
          </Card>
        ))}
      </div>
    </Card>
  )
}
