import { useState } from "react"
import { Form, Input, Button, message } from "antd"
import { motion } from "framer-motion"
import { Mail, Shield } from "lucide-react"
import { Link } from "react-router-dom"

const ForgetPassword = () => {
  const [loading, setLoading] = useState(false)

  const onFinish = (values) => {
    setLoading(true)
    console.log("Forget password email:", values.email)

    // Giả lập gửi email reset
    setTimeout(() => {
      setLoading(false)
      if (values.email === "admin@example.com") {
        message.success("Password reset link has been sent to your email!")
      } else {
        message.error("Email not found, please try again")
      }
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
              <h1 className="text-3xl font-bold text-blue-600 mb-2 flex items-center gap-2 whitespace-nowrap">
                <Shield className="w-10 h-8" />
                EXE101 Squad Support
              </h1>
              <h2 className="text-3xl font-bold text-gray-900 mb-2">Forgot Password</h2>
              <p className="text-gray-600">
                Enter your registered email and we’ll send you a reset link
              </p>
            </div>

            <Form
              name="forget_form"
              layout="vertical"
              onFinish={onFinish}
              validateTrigger="onBlur"
            >
              <Form.Item
                label={<span className="text-gray-700 font-medium">Email</span>}
                name="email"
                rules={[
                  { required: true, message: "Please enter your email!" },
                  { type: "email", message: "The email format is invalid!" },
                ]}
              >
                <Input
                  prefix={<Mail className="w-4 h-4 text-gray-400" />}
                  placeholder="your@email.com"
                  size="large"
                  className="rounded-lg"
                />
              </Form.Item>

              <Form.Item className="mb-4">
                <Button
                  type="primary"
                  htmlType="submit"
                  size="large"
                  loading={loading}
                  className="w-full h-12 bg-blue-600 hover:bg-blue-700 rounded-lg font-semibold text-base"
                >
                  Send Reset Link
                </Button>
              </Form.Item>

              <div className="text-center text-sm text-gray-600">
                Remember your password?{" "}
                <Link to="/" className="text-blue-600 hover:text-blue-700 font-semibold">
                  Back to Sign In
                </Link>
              </div>
            </Form>
          </div>

          <p className="text-center text-xs text-gray-500 mt-6">
            By resetting your password, you agree to{" "}
            <a href="#" className="text-blue-600 hover:underline">
              Terms of Service
            </a>{" "}
            and{" "}
            <a href="#" className="text-blue-600 hover:underline">
              Privacy Policy
            </a>
          </p>
        </motion.div>
      </div>
    </div>
  )
}

export default ForgetPassword
