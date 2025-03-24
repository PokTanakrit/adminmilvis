import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import "./AdminLogin.css";
import { useUser } from "./UserContext"; // ✅ นำเข้า Context

const AdminLogin = () => {
  const navigate = useNavigate();
  const { username, setUsername } = useUser(); // ✅ ใช้ username และ setUsername จาก Context
  const [formData, setFormData] = useState({ username: "", password: "" }); // ✅ จัดการ state ของ username และ password
  const [error, setError] = useState(""); // เพิ่ม state สำหรับแสดงข้อผิดพลาด

  // ฟังก์ชันจัดการการเปลี่ยนแปลงของ input
  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value, // อัปเดตค่า username หรือ password ตามชื่อ input
    });
  };

  // ✅ ฟังก์ชัน Login
  const handleLogin = async () => {
    setError(""); // ล้างข้อความผิดพลาดก่อนส่งข้อมูล

    try {
      const response = await fetch("https://5b17-202-44-40-186.ngrok-free.app/api/admin_login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Accept": "application/json",
        },
        body: JSON.stringify(formData), // ส่งข้อมูลผ่าน formData
      });

      const data = await response.json();

      if (response.ok && data.success) {
        setUsername(formData.username); // ✅ อัปเดตค่า username ใน Context
        navigate("/history", { state: { username: formData.username } }); // ส่ง username ไปที่หน้า history
      } else {
        setError("Username หรือ Password ไม่ถูกต้อง"); // แสดงข้อความผิดพลาด
      }
    } catch (error) {
      setError("ไม่สามารถเชื่อมต่อเซิร์ฟเวอร์ได้");
      
    }
  };

  // ✅ ฟังก์ชัน Logout
  const handleLogout = async () => {
    try {
      const response = await fetch("https://5b17-202-44-40-186.ngrok-free.app/logout", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ username }), // ส่ง username ไปที่ API logout
      });

      const data = await response.json();

      if (response.ok && data.success) {
        setUsername(""); // ✅ ล้างค่า username ใน Context
        navigate("/"); // ✅ กลับไปที่หน้า login
      } else {
        console.error("Logout failed:", data.message);
      }
    } catch (error) {
      console.error("Error during logout:", error);
    }
  };

  return (
    <div className="admin-login-container">
      <div className="admin-login-box">
        <img src="/logokmutnb.jpg" alt="KMUTNB Logo" className="admin-logo" />

        <div className="input-container">
          <input
            type="text"
            name="username" // เพิ่ม name attribute
            placeholder="Username"
            className="input-field"
            value={formData.username} // ใช้ค่าจาก formData
            onChange={handleChange} // ใช้ฟังก์ชัน handleChange
          />
        </div>

        <div className="input-container">
          <input
            type="password"
            name="password" // เพิ่ม name attribute
            placeholder="Password"
            className="input-field"
            value={formData.password} // ใช้ค่าจาก formData
            onChange={handleChange} // ใช้ฟังก์ชัน handleChange
          />
        </div>

        {error && <p className="error-message">{error}</p>} {/* แสดงข้อความผิดพลาด */}

        <button className="login-button"  onClick={handleLogin}>LOGIN</button>
      </div>
    </div>
  );
};

export default AdminLogin;
