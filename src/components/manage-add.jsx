import React from "react";
import { useLocation, useNavigate } from "react-router-dom";
import SidebarMenu from "./SidebarMenu"; // import SidebarMenu
import "./manage-add.css"; // สร้างไฟล์ CSS แยกสำหรับจัดการ UI

const ManageAdd = () => {
    const location = useLocation();
    const navigate = useNavigate(); // ใช้ useNavigate สำหรับเปลี่ยนหน้า
    const username = location.state?.username || "Guest";

    // ฟังก์ชันนำทางไปยังหน้าเฉพาะ
    const handleNavigate = (path) => {
        navigate(path, { state: { username } });
    };

    return (
        <div className="manage-add-page">
            <SidebarMenu username={username} className="sidebar-menu" />
            <div className="manage-add-container">
                <h1 className="manage-add-title">เพิ่มข้อมูลใหม่</h1>
                <div className="manage-add-buttons">
                    {/* ปุ่มไปหน้าการนำเข้าไฟล์ */}
                    <button
                        className="manage-add-button"
                        onClick={() => handleNavigate("/manage-add-pdf")}
                    >
                        <div className="manage-add-button-text">
                            เข้าไฟล์ pdf 
                        </div>
                        <span className="manage-add-arrow">{">"}</span>
                    </button>

                    {/* ปุ่มไปหน้าการอ่านจากเว็บไซต์ */}
                    <button
                        className="manage-add-button"
                        onClick={() => handleNavigate("/manage-add-url")}
                    >
                        <div className="manage-add-button-text">
                            อ่านจาก url เว็บไซต์  
                        </div>
                        <span className="manage-add-arrow">{">"}</span>
                    </button>

                    {/* ปุ่มไปหน้าการพิมพ์ข้อความใหม่ */}
                    <button
                        className="manage-add-button"
                        onClick={() => handleNavigate("/manage-add-text")}
                    >
                        <div className="manage-add-button-text">
                            พิมพ์ข้อความใหม่
                        </div>
                        <span className="manage-add-arrow">{">"}</span>
                    </button>
                </div>
            </div>
        </div>
    );
};

export default ManageAdd;
