import { useState, useEffect } from "react";
import { message } from "antd";

/**
 * 🧩 Hook quản lý Teams cho Admin
 * - Tự động fetch danh sách nhóm từ API
 * - Quản lý CRUD + loading + error
 */
export function useTeams(shouldFetch = true) {
  const [data, setData] = useState([]); // Danh sách team
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const API_URL = "http://localhost:5000/api/teams";

  // =========================
  // 🧩 FETCH TẤT CẢ TEAMS
  // =========================
  const fetchTeams = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(API_URL, {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      });

      const result = await res.json();
      if (!res.ok) throw new Error(result.message || "Failed to fetch");

      if (result.success && Array.isArray(result.data)) {
        // Chuyển dữ liệu từ DB sang format cho bảng React
        const transformed = result.data.map((team, index) => ({
          key: team.MaTeam || `team-${index}`,
          id: team.MaTeam,
          name: team.TenTeam,
          status: team.TrangThaiNhom,
          description: team.MoTaNhom || "-",
          membersCount: team.SoLuongThanhVienHienTai ?? 0,
          leaderID: team.LeaderID || null,
          leaderName: team.LeaderName || null,
        }));

        setData(transformed);
      } else {
        setError("Không có dữ liệu nhóm");
        message.warning("No teams found");
        setData([]);
      }
    } catch (err) {
      console.error("❌ Error fetching teams:", err);
      setError(err.message);
      message.error("Error loading team data");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!shouldFetch) return;
    fetchTeams();
  }, [shouldFetch]);

  // =========================
  // 🧩 TẠO TEAM MỚI
  // =========================
  const createTeam = async (payload) => {
    try {
      const res = await fetch(API_URL, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
        body: JSON.stringify(payload),
      });

      const result = await res.json();

      if (!result.success) {
        message.error(result.message || "Failed to create team");
        return result;
      }

      message.success("✅ Team created successfully");

      // ✅ REFETCH toàn bộ danh sách từ DB
      await fetchTeams();

      return result;
    } catch (err) {
      console.error("❌ Error creating team:", err);
      message.error("Error creating team");
      throw err;
    }
  };

  // =========================
  // 🧩 CẬP NHẬT TEAM
  // =========================
  const updateTeam = async (maTeam, payload) => {
    try {
      const res = await fetch(`${API_URL}/${maTeam}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
        body: JSON.stringify(payload),
      });

      const result = await res.json();

      if (result.success) {
        message.success("✅ Team updated successfully");

        // ✅ REFETCH để đồng bộ dữ liệu
        await fetchTeams();
      } else {
        message.error(result.message || "Failed to update team");
      }

      return result;
    } catch (err) {
      console.error("❌ Error updating team:", err);
      message.error("Error updating team");
      throw err;
    }
  };

  // =========================
  // 🧩 XOÁ TEAM
  // =========================
  const deleteTeam = async (maTeam) => {
    try {
      const res = await fetch(`${API_URL}/${maTeam}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      });

      const result = await res.json();

      if (result.success) {
        message.success("🗑️ Team deleted successfully");
        
        // ✅ REFETCH để đồng bộ dữ liệu
        await fetchTeams();
      } else {
        message.error(result.message || "Failed to delete team");
      }

      return result;
    } catch (err) {
      console.error("❌ Error deleting team:", err);
      message.error("Error deleting team");
      throw err;
    }
  };

  // =========================
  // ✅ LẤY KẾT QUẢ VOTE CỦA TEAM (CHO ADMIN)
  // =========================
  const getTeamVotes = async (teamId) => {
    try {
      const token = localStorage.getItem("token");
      const res = await fetch(
        `http://localhost:5000/api/vote/leader/${teamId}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      const dataRes = await res.json();

      if (!res.ok) {
        message.error(dataRes.msg || "Không lấy được kết quả vote");
        return null;
      }

      // ✅ Gắn kết quả vote vào đúng team trong table UI
      setData((prev) =>
        prev.map((team) =>
          String(team.id) === String(teamId)
            ? {
                ...team,
                votes: dataRes.votes,
                totalVotes: dataRes.totalVotes,
                voteViewed: true,
              }
            : team
        )
      );

      return dataRes;
    } catch (err) {
      console.error("❌ Error fetching team votes:", err);
      message.error("Lỗi server khi lấy dữ liệu vote");
      return null;
    }
  };

  return { 
    data, 
    loading, 
    error, 
    createTeam, 
    updateTeam, 
    deleteTeam, 
    getTeamVotes,
    refetch: fetchTeams // ✅ Expose refetch để dùng khi cần
  };
} 