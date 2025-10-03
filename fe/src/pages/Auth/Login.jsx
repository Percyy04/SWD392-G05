import { useState } from "react"
import { Form, Input, Button, Checkbox, message } from "antd"
// eslint-disable-next-line no-unused-vars
import { motion } from "framer-motion"
import { Mail, Lock, Github, Chrome, Apple, Shield } from "lucide-react"
import { Link, useNavigate } from "react-router-dom"

const Login = () => {
  const [loading, setLoading] = useState(false)
  const navigate = useNavigate()

  const onFinish = async (values) => {
    setLoading(true)
    try {
      const response = await fetch("http://localhost:5000/api/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(values),
      })

      const data = await response.json()

      if (response.ok && data.success) {
        message.success(data.message || "Login successful")

        // ✅ Lưu token + user vào localStorage
        localStorage.setItem("token", data.token)
        localStorage.setItem("user", JSON.stringify(data.user))

        // ✅ redirect
        navigate("/admin")
      } else {
        message.error(data.message || "Invalid email or password")
      }
    } catch (error) {
      console.error("Login error:", error)
      message.error("Network error. Please try again later.")
    } finally {
      setLoading(false)
    }
  }

  const handleSocialLogin = (provider) => {
    message.info(`Sign In with ${provider}`)
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
                EXE101 Squad Welcomes
              </h1>
              <h2 className="text-3xl font-bold text-gray-900 mb-2">Sign in</h2>
              <p className="text-gray-600">Please enter your information to continue</p>
            </div>

            {/* Social login */}
            <div className="grid grid-cols-3 gap-3 mb-6">
              <button
                onClick={() => handleSocialLogin("Google")}
                className="flex items-center justify-center gap-2 px-4 py-3 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
              >
                <Chrome className="w-5 h-5 text-gray-700" />
              </button>
              <button
                onClick={() => handleSocialLogin("GitHub")}
                className="flex items-center justify-center gap-2 px-4 py-3 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
              >
                <Github className="w-5 h-5 text-gray-700" />
              </button>
              <button
                onClick={() => handleSocialLogin("Apple")}
                className="flex items-center justify-center gap-2 px-4 py-3 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
              >
                <Apple className="w-5 h-5 text-gray-700" />
              </button>
            </div>

            <div className="relative mb-6">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-300"></div>
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-4 bg-white text-gray-500">
                  or sign in with your email
                </span>
              </div>
            </div>

            <Form
              name="login_form"
              layout="vertical"
              initialValues={{ remember: true }}
              onFinish={onFinish}
            >
              <Form.Item
                label={<span className="text-gray-700 font-medium">Email</span>}
                name="email"
                rules={[
                  { required: true, message: "Please enter your email!" },
                  { type: "email", message: "The email is not properly formatted!" },
                ]}
                validateTrigger="onBlur"
              >
                <Input
                  prefix={<Mail className="w-4 h-4 text-gray-400" />}
                  placeholder="user@example.com"
                  size="large"
                  className="rounded-lg"
                />
              </Form.Item>

              <Form.Item
                label={<span className="text-gray-700 font-medium">Password</span>}
                name="password"
                rules={[{ required: true, message: "Please enter your password!" }]}
              >
                <Input.Password
                  prefix={<Lock className="w-4 h-4 text-gray-400" />}
                  placeholder="password123"
                  size="large"
                  className="rounded-lg"
                />
              </Form.Item>

              <div className="flex items-center justify-between mb-6">
                <Form.Item name="remember" valuePropName="checked" className="mb-0">
                  <Checkbox>Remember me</Checkbox>
                </Form.Item>
                <Link
                  to="/forget-password"
                  className="text-blue-600 hover:text-blue-700 text-sm font-medium"
                >
                  Forgot password?
                </Link>
              </div>

              <Form.Item className="mb-4">
                <Button
                  type="primary"
                  htmlType="submit"
                  size="large"
                  loading={loading}
                  className="w-full h-12 bg-blue-600 hover:bg-blue-700 rounded-lg font-semibold text-base"
                >
                  Sign In
                </Button>
              </Form.Item>

              <div className="text-center text-sm text-gray-600">
                Don't have an account?{" "}
                <Link
                  to="/signup"
                  className="text-blue-600 hover:text-blue-700 font-semibold"
                >
                  Sign up now
                </Link>
              </div>
            </Form>
          </div>
        </motion.div>
      </div>
    </div>
  )
}

export default Login
