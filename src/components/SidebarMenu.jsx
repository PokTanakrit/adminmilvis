import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { FaChevronDown, FaUserCircle } from "react-icons/fa";
import "./SidebarMenu.css";
import { useUser } from "./UserContext"; // ✅ นำเข้า Context

const SidebarMenu = () => {
    const [activeMenu, setActiveMenu] = useState(null);
    const navigate = useNavigate();
    const { username, setUsername } = useUser(); // ✅ ใช้ Context

    const handleMenuClick = (menu) => {
        setActiveMenu(activeMenu === menu ? null : menu);
    };

    const handleLogout = async () => {
        try {
            const response = await fetch("http://localhost:5000/logout", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({ username }), // ส่ง username ไปที่ API logout
            });
    
            const data = await response.json();
    
            if (response.ok && data.success) {
                setUsername(""); // ✅ ล้างค่า username ใน Context
                navigate("/login"); // ✅ กลับไปที่หน้า login
            } else {
                console.error("Logout failed:", data.message);
            }
        } catch (error) {
            console.error("Error during logout:", error);
        }
    };

    const menuItems = [
        { label: "ประวัติการใช้งาน", link: "/history", subItems: [] },
        { label: "ข้อมูลสถิติ", link: "/statistics", subItems: [] },
        {
            label: "จัดการข้อมูล",
            subItems: [
                { label: "เพิ่มข้อมูล", link: "/manage-add" },
                { label: "แก้ไขข้อมูล", link: "/manage-edit" },
            ],
        },
        { label: "ประวัติ admin", link: "/admin-history", subItems: [] },
        { label: "แบบฟอร์มการเพิ่มข้อมูล", link: "/templatefile", subItems: [] },
        { label: "Logout", link: "/login", subItems: [], action: handleLogout }, // ✅ ใช้ action logout
    ];

    return (
        <div className="sidebar-menu">
            {/* Admin Section */}
            <h1>ADMIN</h1>
            <div className="admin-info">
                <FaUserCircle className="admin-icon" />
                <div className="admin-text">
                    <div>Username: </div>
                    <div className="username">{username || "Guest"}</div> {/* ✅ แสดง username */}
                </div>
            </div>

            {/* Menu Items */}
            {menuItems.map((item, index) => (
                <div key={index} className="menu-item">
                    <div
                        className={`menu-label ${item.subItems.length > 0 ? "has-submenu" : ""}`}
                        onClick={() =>
                            item.subItems.length > 0
                                ? handleMenuClick(item.label)
                                : item.action
                                ? item.action()
                                : navigate(item.link || "#")
                        }
                    >
                        {item.label}
                        {item.subItems.length > 0 && (
                            <FaChevronDown
                                className={`submenu-icon ${activeMenu === item.label ? "open" : ""}`}
                            />
                        )}
                    </div>
                    {item.subItems.length > 0 && activeMenu === item.label && (
                        <div className="submenu">
                            {item.subItems.map((subItem, subIndex) => (
                                <div
                                    key={subIndex}
                                    className="submenu-item"
                                    onClick={() => navigate(subItem.link)}
                                >
                                    {subItem.label}
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            ))}
        </div>
    );
};

export default SidebarMenu;
