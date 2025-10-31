import { useState } from "react";
import { Form, Input, Button, Checkbox, Select } from "antd";
// eslint-disable-next-line no-unused-vars
import { motion } from "framer-motion";
import { Mail, Lock, User, IdCard, Github, Chrome, Apple, Shield } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import toast, { Toaster } from "react-hot-toast";

const { Option } = Select;

const SignUp = () => {
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const majors = ["SE", "AI", "SA", "SS", "IB"];
  const statuses = ["K15", "K16", "K17", "K18", "K19", "K20", "K21", "K22"];

  const onFinish = async (values) => {
    console.log("Form values:", values);
    setLoading(true);

    try {
      const res = await fetch("http://localhost:5000/api/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          maSV: values.maSV,
          full_name: values.fullname,
          email: values.email,
          password: values.password,
          major: values.major,
          status: values.status,
        }),
      });

      let data;
      try {
        data = await res.json();
        console.log("Signup response:", data); // debug
      } catch {
        data = { success: false, message: `Server returned ${res.status}` };
      }

      if (data.success) {
        toast.success(data.message || "Account created successfully!", { duration: 2000 });
        setTimeout(() => navigate("/"), 1000);
      } else {
        toast.error(data.message || `Error ${res.status}`, { duration: 2000 });
      }
    } catch (err) {
      console.error("Signup error:", err);
      toast.error(err.message || "Network error");
    } finally {
      setLoading(false);
    }
  };

  const handleSocialLogin = (provider) => {
    toast(`Sign Up with ${provider}`);
  };

  return (
    <div className="flex min-h-screen">
      <Toaster position="top-right" reverseOrder={false} />
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
                <Shield className="w-10 h-8" /> EXE101 Squad Welcomes
              </h1>
              <h2 className="text-3xl font-bold text-gray-900 mb-2">Create account</h2>
              <p className="text-gray-600">Please fill in your information to sign up</p>
            </div>

            <div className="grid grid-cols-3 gap-3 mb-6">
              <button onClick={() => handleSocialLogin("Google")} className="flex items-center justify-center gap-2 px-4 py-3 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors">
                <Chrome className="w-5 h-5 text-gray-700" />
              </button>
              <button onClick={() => handleSocialLogin("GitHub")} className="flex items-center justify-center gap-2 px-4 py-3 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors">
                <Github className="w-5 h-5 text-gray-700" />
              </button>
              <button onClick={() => handleSocialLogin("Apple")} className="flex items-center justify-center gap-2 px-4 py-3 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors">
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

            <Form name="signup_form" layout="vertical" onFinish={onFinish}>
              <Form.Item label="Student ID (Mã số SV)" name="maSV" rules={[{ required: true, message: "Please enter your student ID!" }]}>
                <Input prefix={<IdCard className="w-4 h-4 text-gray-400" />} placeholder="SE123456" size="large" className="rounded-lg" />
              </Form.Item>

              <Form.Item label="Full Name" name="fullname" rules={[{ required: true, message: "Please enter your name!" }]}>
                <Input prefix={<User className="w-4 h-4 text-gray-400" />} placeholder="John Doe" size="large" className="rounded-lg" />
              </Form.Item>

              <Form.Item
                label="Email"
                name="email"
                rules={[
                  { required: true, message: "Please enter your email!" },
                  { type: "email", message: "Invalid email format!" },
                ]}
                validateTrigger="onBlur"
              >
                <Input prefix={<Mail className="w-4 h-4 text-gray-400" />} placeholder="user@example.com" size="large" className="rounded-lg" />
              </Form.Item>

              <Form.Item label="Major" name="major" initialValue={majors[0]} rules={[{ required: true, message: "Please select your major!" }]}>
                <Select placeholder="Select your major" size="large" className="rounded-lg">
                  {majors.map((m) => <Option key={m} value={m}>{m}</Option>)}
                </Select>
              </Form.Item>

              <Form.Item label="Status" name="status" initialValue={statuses[0]} rules={[{ required: true, message: "Please select your status!" }]}>
                <Select placeholder="Select your status" size="large" className="rounded-lg">
                  {statuses.map((s) => <Option key={s} value={s}>{s}</Option>)}
                </Select>
              </Form.Item>


              <Form.Item label="Password" name="password" rules={[{ required: true, message: "Please enter your password!" }]}>
                <Input.Password prefix={<Lock className="w-4 h-4 text-gray-400" />} placeholder="••••••••" size="large" className="rounded-lg" />
              </Form.Item>

              <Form.Item
                label="Confirm Password"
                name="confirmPassword"
                dependencies={["password"]}
                rules={[
                  { required: true, message: "Please confirm your password!" },
                  ({ getFieldValue }) => ({
                    validator(_, value) {
                      if (!value || getFieldValue("password") === value) return Promise.resolve();
                      return Promise.reject(new Error("Passwords do not match!"));
                    },
                  }),
                ]}
              >
                <Input.Password prefix={<Lock className="w-4 h-4 text-gray-400" />} placeholder="••••••••" size="large" className="rounded-lg" />
              </Form.Item>

              <Form.Item
                name="agreement"
                valuePropName="checked"
                rules={[
                  {
                    validator: (_, value) =>
                      value ? Promise.resolve() : Promise.reject(new Error("You must accept the agreement")),
                  },
                ]}
              >
                <Checkbox>
                  I agree to the <a href="#" className="text-blue-600 hover:underline">Terms</a> and <a href="#" className="text-blue-600 hover:underline">Privacy Policy</a>
                </Checkbox>
              </Form.Item>

              <Form.Item className="mb-4">
                <Button type="primary" htmlType="submit" size="large" loading={loading} className="w-full h-12 bg-blue-600 hover:bg-blue-700 rounded-lg font-semibold text-base">
                  Sign Up
                </Button>
              </Form.Item>

              <div className="text-center text-sm text-gray-600">
                Already have an account? <Link to="/" className="text-blue-600 hover:text-blue-700 font-semibold">Sign in</Link>
              </div>
            </Form>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default SignUp;
