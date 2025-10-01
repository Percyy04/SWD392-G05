import { Card, Tabs, Input, Select } from "antd"

const { TabPane } = Tabs

const Settings = () => (
  <Card
    title={<span className="text-gray-900 font-semibold">Settings</span>}
    className="bg-white border-gray-200 shadow-sm"
  >
    <Tabs defaultActiveKey="1">
      <TabPane tab="General" key="1">
        <div className="space-y-4">
          <div>
            <label className="text-gray-900 block mb-2">Course Name</label>
            <Input defaultValue="EXE101" />
          </div>
          <div>
            <label className="text-gray-900 block mb-2">Semester</label>
            <Select defaultValue="Spring 2025" className="w-full">
              <Select.Option value="Spring 2025">Spring 2025</Select.Option>
              <Select.Option value="Fall 2024">Fall 2024</Select.Option>
            </Select>
          </div>
          <div>
            <label className="text-gray-900 block mb-2">Max Team Size</label>
            <Input type="number" defaultValue="6" />
          </div>
        </div>
      </TabPane>
      <TabPane tab="Permissions" key="2">
        <p className="text-gray-600">Permission settings coming soon...</p>
      </TabPane>
    </Tabs>
  </Card>
)

export default Settings