import { Form, Input, Modal, Select } from "antd"

const CreateTeamModal = ({ isVisible, onOk, onCancel, form }) => (
  <Modal
    title={<span className="text-gray-900">Create New Team</span>}
    open={isVisible}
    onOk={onOk}
    onCancel={onCancel}
    okText="Create"
    okButtonProps={{ className: "bg-green-600 hover:bg-green-700" }}
    className="light-modal"
  >
    <Form form={form} layout="vertical" className="mt-4">
      <Form.Item
        name="teamName"
        label={<span className="text-gray-900">Team Name</span>}
        rules={[{ required: true, message: "Please input team name!" }]}
      >
        <Input placeholder="Enter team name" />
      </Form.Item>
      <Form.Item
        name="major"
        label={<span className="text-gray-900">Major</span>}
        rules={[{ required: true, message: "Please select major!" }]}
      >
        <Select placeholder="Select major">
          <Select.Option value="SE">Software Engineering</Select.Option>
          <Select.Option value="IS">Information Systems</Select.Option>
          <Select.Option value="AI">Artificial Intelligence</Select.Option>
        </Select>
      </Form.Item>
      <Form.Item
        name="maxMembers"
        label={<span className="text-gray-900">Max Members</span>}
        rules={[{ required: true, message: "Please input max members!" }]}
      >
        <Input type="number" placeholder="Enter max members" defaultValue="6" />
      </Form.Item>
    </Form>
  </Modal>
)

export default CreateTeamModal