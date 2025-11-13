import { useState } from "react"
import { Form, Input, Button, Modal } from "antd"
// eslint-disable-next-line no-unused-vars
import { motion } from "framer-motion"
import { Mail, Shield, Lock } from "lucide-react"
import { Link, useNavigate } from "react-router-dom"
import toast, { Toaster } from "react-hot-toast"

const ForgetPassword = () => {
  const [loading, setLoading] = useState(false)
  const [email, setEmail] = useState("")
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [step, setStep] = useState(1) // 1: verify code, 2: reset password
  const [resetToken, setResetToken] = useState("")
  const navigate = useNavigate() // <-- thêm navigate

  // Step 0: gửi email
  const handleSendEmail = async (values) => {
    setLoading(true)
    try {
      setEmail(values.email)
      const res = await fetch("http://localhost:5000/api/forgot-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: values.email }),
      })

      const text = await res.text()
      const data = text ? JSON.parse(text) : {}

      if (!res.ok) throw new Error(data.message || "Something went wrong")
      toast.success(data.message)
      setIsModalOpen(true)
      setStep(1)
      
    } catch (err) {
      toast.error(err.message)
    } finally {
      setLoading(false)
    }
  }

  // Step 1: verify code
  const handleVerifyCode = async (values) => {
    setLoading(true)
    try {
      const res = await fetch("http://localhost:5000/api/verify-reset-code", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, resetCode: values.code }),
      })

      const text = await res.text()
      const data = text ? JSON.parse(text) : {}

      if (!res.ok) throw new Error(data.message || "Invalid code")
      toast.success(data.message)
      setResetToken(data.resetToken)
      setStep(2)
    } catch (err) {
      toast.error(err.message)
    } finally {
      setLoading(false)
    }
  }

const handleResetPassword = async (values) => {
  setLoading(true)
  try {
    const res = await fetch("http://localhost:5000/api/reset-password", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${resetToken}`,
      },
      body: JSON.stringify({
        newPassword: values.newPassword,
        confirmPassword: values.confirmPassword,
      }),
    })

    const text = await res.text()
    const data = text ? JSON.parse(text) : {}

    if (!res.ok) throw new Error(data.message || "Failed to reset password")

    // ✅ Hiển thị toast và chuyển trang khi toast kết thúc
    const duration = 2000 // 2 giây
    toast.success(data.message, { duration })
    setTimeout(() => {
      setIsModalOpen(false)
      setStep(1)
      navigate("/") // quay về login sau khi toast tắt
    }, duration)

  } catch (err) {
    toast.error(err.message)
  } finally {
    setLoading(false)
  }
}


  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-50 p-8">
      <Toaster position="top-right" />
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
          </div>

          <Form name="forget_form" layout="vertical" onFinish={handleSendEmail}>
            <Form.Item
              label="Email"
              name="email"
              rules={[
                { required: true, message: "Please enter your email!" },
                { type: "email", message: "Invalid email format" },
              ]}
            >
              <Input prefix={<Mail className="w-4 h-4 text-gray-400" />} placeholder="your@email.com" />
            </Form.Item>
            <Form.Item>
              <Button type="primary" htmlType="submit" block loading={loading}>
                Send Reset Code
              </Button>
            </Form.Item>
          </Form>

          <div className="text-center text-sm text-gray-600 mt-4">
            <Link to="/" className="text-blue-600 hover:text-blue-700 font-semibold">
              Back to Sign In
            </Link>
          </div>
        </div>
      </motion.div>

      {/* Modal for verify code and reset password */}
      <Modal
        open={isModalOpen}
        footer={null}
        closable={false}
        title={step === 1 ? "Enter Verification Code" : "Reset Password"}
      >
        {step === 1 && (
          <Form layout="vertical" onFinish={handleVerifyCode}>
            <Form.Item
              label="Reset Code"
              name="code"
              rules={[{ required: true, message: "Please enter the reset code!" }]}
            >
              <Input size="large" placeholder="12345" />
            </Form.Item>
            <Form.Item>
              <Button type="primary" htmlType="submit" block loading={loading}>
                Verify Code
              </Button>
            </Form.Item>
          </Form>
        )}
        {step === 2 && (
          <Form layout="vertical" onFinish={handleResetPassword}>
            <Form.Item
              label="New Password"
              name="newPassword"
              rules={[{ required: true, message: "Please enter new password!" }]}
            >
              <Input.Password prefix={<Lock />} placeholder="New Password" />
            </Form.Item>
            <Form.Item
              label="Confirm Password"
              name="confirmPassword"
              rules={[{ required: true, message: "Please confirm new password!" }]}
            >
              <Input.Password prefix={<Lock />} placeholder="Confirm Password" />
            </Form.Item>
            <Form.Item>
              <Button type="primary" htmlType="submit" block loading={loading}>
                Reset Password
              </Button>
            </Form.Item>
          </Form>
        )}
      </Modal>
    </div>
  )
}

export default ForgetPassword
