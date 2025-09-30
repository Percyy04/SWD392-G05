import { useState } from "react"
import { Form, Input, Button, message } from "antd"
import { motion } from "framer-motion"
import { Lock, Shield } from "lucide-react"
import { Link } from "react-router-dom"

const ResetPassword = () => {
  const [loading, setLoading] = useState(false)

  const onFinish = (values) => {
    setLoading(true)
    console.log("Reset password values:", values)

    setTimeout(() => {
      setLoading(false)
      message.success("Password reset successful!")
    }, 1000)
  }

  return (
    <div className="flex min-h-screen">
      <div className="flex-1 flex items-center justify-center p-8 bg-gray-50">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="w-full max-w-md"
        >
          <div className="bg-white rounded-2xl shadow-xl p-8">
            <div className="mb-8">
              <h1 className="text-3xl font-bold text-blue-600 mb-2 flex items-center gap-2">
                <Shield className="w-8 h-8" />
                Reset Password
              </h1>
              <p className="text-gray-600">Enter your new password</p>
            </div>

            <Form
              name="resetPassword"
              onFinish={onFinish}
              autoComplete="off"
              layout="vertical"
              size="large"
            >
              <Form.Item
                label="New Password"
                name="password"
                rules={[
                  { required: true, message: "Please input your new password!" },
                  { min: 6, message: "Password must be at least 6 characters!" }
                ]}
              >
                <Input.Password
                  prefix={<Lock className="w-4 h-4 text-gray-400" />}
                  placeholder="Enter new password"
                />
              </Form.Item>

              <Form.Item
                label="Confirm Password"
                name="confirmPassword"
                rules={[
                  { required: true, message: "Please confirm your password!" },
                  ({ getFieldValue }) => ({
                    validator(_, value) {
                      if (!value || getFieldValue('password') === value) {
                        return Promise.resolve()
                      }
                      return Promise.reject(new Error('Passwords do not match!'))
                    },
                  }),
                ]}
              >
                <Input.Password
                  prefix={<Lock className="w-4 h-4 text-gray-400" />}
                  placeholder="Confirm new password"
                />
              </Form.Item>

              <Form.Item>
                <Button
                  type="primary"
                  htmlType="submit"
                  loading={loading}
                  className="w-full h-12 bg-blue-600 hover:bg-blue-700 border-blue-600 hover:border-blue-700"
                >
                  Reset Password
                </Button>
              </Form.Item>
            </Form>

            <div className="text-center">
              <Link
                to="/"
                className="text-blue-600 hover:text-blue-800 font-medium"
              >
                Back to Sign In
              </Link>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  )
}

export default ResetPassword
