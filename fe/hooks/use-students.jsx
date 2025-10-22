import { useState, useEffect } from "react"
import { message } from "antd"

export function useStudents(shouldFetch) {
  const [data, setData] = useState([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  useEffect(() => {
    if (!shouldFetch) return

    const fetchStudents = async () => {
      setLoading(true)
      setError(null)
      try {
        const response = await fetch("http://localhost:5000/api/students", {
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('token')}`,
          },
        })
        const result = await response.json()

        if (result.success) {
          const studentsOnly = result.students.filter(s => s.role === "Student"); // chỉ lấy Student
          const transformed = studentsOnly.map((student, index) => ({
            key: student.id || index,
            id: student.maSV || student.id || `SV-${index}`, // đảm bảo cột ID
            name: student.full_name,
            email: student.email,
            major: student.major || "-",
            team: student.team,
            role: student.role,
            status: student.status,
          }))
          setData(transformed)
        } else {
          setError("Failed to load students")
          message.error("Failed to load students")
        }

        // eslint-disable-next-line no-unused-vars
      } catch (err) {
        setError("Error connecting to server")
        message.error("Error loading students data")
      } finally {
        setLoading(false)
      }
    }

    fetchStudents()
  }, [shouldFetch])

  return { data, loading, error }
}
