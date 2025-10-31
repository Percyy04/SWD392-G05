import { Card, Tabs, Input, Select, Button } from "antd"

export function Settings() {
  return (
    <Card title="Settings" className="bg-white border border-gray-200 shadow-sm">
      <Tabs
        defaultActiveKey="1"
        items={[
          {
            key: "1",
            label: "General",
            children: (
              <div className="space-y-4">
                <div>
                  <label className="text-gray-900 block mb-2 font-medium">Course Name</label>
                  <Input defaultValue="EXE101" />
                </div>
                <div>
                  <label className="text-gray-900 block mb-2 font-medium">Semester</label>
                  <Select defaultValue="Spring 2025" className="w-full">
                    <Select.Option value="Spring 2025">Spring 2025</Select.Option>
                    <Select.Option value="Fall 2024">Fall 2024</Select.Option>
                  </Select>
                </div>
                <div>
                  <label className="text-gray-900 block mb-2 font-medium">Max Team Size</label>
                  <Input type="number" defaultValue="6" />
                </div>
                <Button type="primary" className="bg-green-600">
                  Save Changes
                </Button>
              </div>
            ),
          },
          {
            key: "2",
            label: "Permissions",
            children: <p className="text-gray-600">Permission settings coming soon...</p>,
          },
        ]}
      />
    </Card>
  )
}
