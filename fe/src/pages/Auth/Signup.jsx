import { useState } from "react"
import { Form, Input, Button, Checkbox, message } from "antd"
import { motion } from "framer-motion"
import { Mail, Lock, User, Github, Chrome, Apple, Shield } from "lucide-react"
import { Link } from "react-router-dom"

const SignUp = () => {
  const [loading, setLoading] = useState(false)

  const onFinish = (values) => {
    setLoading(true)
    console.log("SignUp values:", values)

    setTimeout(() => {
      setLoading(false)
      if (values.email && values.password) {
        message.success("Account created successfully!")
      } else {
        message.error("Please fill all required fields")
      }
    }, 1000)
  }

  const handleSocialLogin = (provider) => {
    message.info(`Sign Up with ${provider}`)
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
              <h2 className="text-3xl font-bold text-gray-900 mb-2">Create account</h2>
              <p className="text-gray-600">Please fill in your information to sign up</p>
            </div>

            {/* Social buttons */}
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
                <span className="px-4 bg-white text-gray-500">or sign up with your email</span>
              </div>
            </div>

            {/* Form */}
            <Form name="signup_form" layout="vertical" onFinish={onFinish}>
              <Form.Item
                label={<span className="text-gray-700 font-medium">Full Name</span>}
                name="fullname"
                rules={[{ required: true, message: "Please enter your name!" }]}
              >
                <Input
                  prefix={<User className="w-4 h-4 text-gray-400" />}
                  placeholder="John Doe"
                  size="large"
                  className="rounded-lg"
                />
              </Form.Item>

              <Form.Item
                label={<span className="text-gray-700 font-medium">Email</span>}
                name="email"
                rules={[
                  { required: true, message: "Please enter your email!" },
                  { type: "email", message: "Invalid email format!" },
                ]}
                validateTrigger="onBlur"
              >
                <Input
                  prefix={<Mail className="w-4 h-4 text-gray-400" />}
                  placeholder="admin@example.com"
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
                  placeholder="••••••••"
                  size="large"
                  className="rounded-lg"
                />
              </Form.Item>

              <Form.Item
                label={<span className="text-gray-700 font-medium">Confirm Password</span>}
                name="confirmPassword"
                dependencies={["password"]}
                rules={[
                  { required: true, message: "Please confirm your password!" },
                  ({ getFieldValue }) => ({
                    validator(_, value) {
                      if (!value || getFieldValue("password") === value) {
                        return Promise.resolve()
                      }
                      return Promise.reject(new Error("Passwords do not match!"))
                    },
                  }),
                ]}
              >
                <Input.Password
                  prefix={<Lock className="w-4 h-4 text-gray-400" />}
                  placeholder="••••••••"
                  size="large"
                  className="rounded-lg"
                />
              </Form.Item>

              <Form.Item name="agreement" valuePropName="checked" rules={[{ required: true }]}>
                <Checkbox>
                  I agree to the{" "}
                  <a href="#" className="text-blue-600 hover:underline">
                    Terms
                  </a>{" "}
                  and{" "}
                  <a href="#" className="text-blue-600 hover:underline">
                    Privacy Policy
                  </a>
                </Checkbox>
              </Form.Item>

              <Form.Item className="mb-4">
                <Button
                  type="primary"
                  htmlType="submit"
                  size="large"
                  loading={loading}
                  className="w-full h-12 bg-blue-600 hover:bg-blue-700 rounded-lg font-semibold text-base"
                >
                  Sign Up
                </Button>
              </Form.Item>

              <div className="text-center text-sm text-gray-600">
                Already have an account?{" "}
                <Link to="/" className="text-blue-600 hover:text-blue-700 font-semibold">
                  Sign in
                </Link>
              </div>
            </Form>
          </div>
        </motion.div>
      </div>
    </div>
  )
}

export default SignUp
