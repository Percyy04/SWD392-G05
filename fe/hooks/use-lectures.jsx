import { useState, useEffect } from "react";
import { message } from "antd";

export function useLecturers(shouldFetch) {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!shouldFetch) return;

    const fetchLecturers = async () => {
      setLoading(true);
      setError(null);
      try {
        const response = await fetch("http://localhost:5000/api/admin/lecturers", {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        });
        const result = await response.json();

        if (result.success) {
          // Chuyển đổi dữ liệu API thành format dùng trong Table
          const transformed = result.lecturers.map((lecturer, index) => ({
            key: lecturer.MaGV || `lecturer-${index}`, // key duy nhất
            id: lecturer.MaGV,
            name: lecturer.HoTen,
            email: lecturer.Email,
            role: lecturer.Role || "-",
            department: lecturer.Department || "-", // nếu API chưa có department
            createdAt: lecturer.CreatedAt ? new Date(lecturer.CreatedAt).toLocaleString() : "-",
          }));
          setData(transformed);
        } else {
          setError("Failed to load lecturers");
          message.error("Failed to load lecturers");
        }
      // eslint-disable-next-line no-unused-vars
      } catch (err) {
        setError("Error connecting to server");
        message.error("Error loading lecturers data");
      } finally {
        setLoading(false);
      }
    };

    fetchLecturers();
  }, [shouldFetch]);

  const createLecturer = async (payload) => {
    try {
      const res = await fetch("http://localhost:5000/api/admin/create-lecturer", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
        body: JSON.stringify(payload),
      });
      const result = await res.json();
      if (result.success) {
        const lecturer = result.lecturer;
        setData((prev) => [
          ...prev,
          {
            key: lecturer.MaGV,
            id: lecturer.MaGV,
            name: lecturer.HoTen,
            email: lecturer.Email,
            role: lecturer.Role || "-",
            department: lecturer.Department || "-",
            createdAt: lecturer.CreatedAt ? new Date(lecturer.CreatedAt).toLocaleString() : "-",
          },
        ]);
      } else {
        message.error(result.message || "Failed to create lecturer");
      }
      return result;
    } catch (err) {
      message.error("Failed to create lecturer");
      throw err;
    }
  };

  const updateLecturer = async (maGV, payload) => {
    try {
      const res = await fetch(`http://localhost:5000/api/admin/lecturers/${maGV}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
        body: JSON.stringify(payload),
      });
      const result = await res.json();
      if (result.success) {
        setData((prev) =>
          prev.map((lec) =>
            lec.id === maGV
              ? {
                  ...lec,
                  name: payload.hoTen || lec.name,
                  email: payload.email || lec.email,
                  role: payload.role || lec.role,
                }
              : lec
          )
        );
      } else {
        message.error(result.message || "Failed to update lecturer");
      }
      return result;
    } catch (err) {
      message.error("Failed to update lecturer");
      throw err;
    }
  };

  const deleteLecturer = async (maGV) => {
    try {
      const res = await fetch(`http://localhost:5000/api/admin/lecturers/${maGV}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      });
      const result = await res.json();
      if (result.success) {
        setData((prev) => prev.filter((lec) => lec.id !== maGV));
      } else {
        message.error(result.message || "Failed to delete lecturer");
      }
      return result;
    } catch (err) {
      message.error("Failed to delete lecturer");
      throw err;
    }
  };

  return { data, loading, error, createLecturer, updateLecturer, deleteLecturer };
}
