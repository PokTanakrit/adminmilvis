import React, { useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import SidebarMenu from "./SidebarMenu";
import "./view-content.css";
import { useUser } from "./UserContext";

const ViewContent = () => {
    const location = useLocation();
    const navigate = useNavigate();
    const { username } = useUser(); 
    const initialContentData = location.state?.contentData || [];
    const fromPage = location.state?.fromPage || "/manage-add"; // 

    const [contentData, setContentData] = useState(initialContentData);
    const [showWarningModal, setShowWarningModal] = useState(false);
    const [showPasswordModal, setShowPasswordModal] = useState(false);
    const [password, setPassword] = useState("");
    const [errorMessage, setErrorMessage] = useState("");

    const handleDelete = (index) => {
        const updatedContent = [...contentData];
        updatedContent.splice(index, 1);
        setContentData(updatedContent);
    };

    const handleEdit = (index, field, value) => {
        const updatedContent = [...contentData];
        updatedContent[index][field] = value;
        setContentData(updatedContent);
    };

    const handleAddClick = () => {
        setShowWarningModal(true);
    };

    const handleWarningConfirm = () => {
        setShowWarningModal(false);
        setShowPasswordModal(true);
    };

    const handlePasswordSubmit = async () => {
        if (!password.trim()) {
            setErrorMessage("กรุณากรอกรหัสผ่าน");
            return;
        }
    
        try {
            const response = await fetch("http://localhost:5000/insert", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    username,  // ✅ ส่ง username
                    password,  // ✅ ส่ง password
                    contentData ,   // ✅ ส่ง logData
                }),
            });
    
            const data = await response.json();
    
            if (response.ok) {
                console.log("ข้อมูลถูกส่งสำเร็จ!");
                setShowPasswordModal(false);
                setPassword("");
                navigate(fromPage); // 📌 กลับไปยังหน้าที่มา
                console.log("Modal close")
            } else {
                setErrorMessage(data.message || "เกิดข้อผิดพลาดในการส่งข้อมูล");
            }
        } catch (error) {
            setErrorMessage("ไม่สามารถเชื่อมต่อกับเซิร์ฟเวอร์ได้");
        }
        setPassword("");
    };

    return (
        <div className="view-content-page">
            <SidebarMenu username={username} />
            <div className="view-content-container">
                <h1 className="view-content-title">คอนเทนต์ทั้งหมด</h1>
                <div className="content-list">
                    {contentData.map((item, index) => (
                        <div key={index} className="content-item">
                            <div className="content-details">
                                <label>
                                    Metadata Page:
                                    <input
                                        type="number"
                                        value={item.metadata.page}
                                        onChange={(e) =>
                                            handleEdit(index, "metadata", {
                                                ...item.metadata,
                                                page: parseInt(e.target.value),
                                            })
                                        }
                                    />
                                </label>
                                <label>
                                    Page Content:
                                    <textarea
                                        value={item.page_content}
                                        onChange={(e) =>
                                            handleEdit(index, "page_content", e.target.value)
                                        }
                                    />
                                </label>
                            </div>
                            <div className="content-similarity">
                                พบเนื้อหาที่คล้ายกัน: {item.similarity}%
                            </div>
                            <button
                                className="delete-button"
                                onClick={() => handleDelete(index)}
                            >
                                ลบ
                            </button>
                        </div>
                    ))}
                </div>
                <div className="action-buttons">
                    <button className="back-button" onClick={() => navigate(-1)}>
                        ย้อนกลับ
                    </button>
                    <button className="add-button" onClick={handleAddClick}>
                        เพิ่มข้อมูล
                    </button>
                    <button className="cancel-button" onClick={() => navigate(fromPage)}>
                        ยกเลิก
                    </button>
                </div>
            </div>

            {showWarningModal && (
                <div className="modal-overlay">
                    <div className="modal-container">
                        <div className="modal-header-warning">
                            <span>WARNING !!!</span>
                            <button className="close-button" onClick={() => setShowWarningModal(false)}>×</button>
                        </div>
                        <div className="modal-content">
                            <p>มีเนื้อหาที่คล้ายคลึงกัน: 90%</p>
                        </div>
                        <div className="modal-footer">
                            <p>กด ยืนยัน เพื่อดำเนินการต่อ</p>
                        </div>
                        <div className="modal-buttons">
                            <button className="modal-confirm" onClick={handleWarningConfirm}>
                                ยืนยัน
                            </button>
                            <button className="modal-cancel" onClick={() => setShowWarningModal(false)}>
                                ย้อนกลับ
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {showPasswordModal && (
                <div className="modal-overlay">
                    <div className="modal-container">
                        <div className="modal-header-password">
                            <span>ยืนยันรหัสผ่าน:</span>
                            <button className="close-button" onClick={() => setShowPasswordModal(false)}>×</button>
                        </div>
                        <div className="modal-content">
                            <input
                                type="password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                placeholder="ใส่รหัสผ่าน"
                                className="password-input"
                            />
                            {errorMessage && <p className="error-message">{errorMessage}</p>}
                        </div>
                        <div className="modal-buttons">
                            <button className="modal-confirm" onClick={handlePasswordSubmit}>
                                ยืนยัน
                            </button>
                            <button className="modal-cancel" onClick={() => setShowPasswordModal(false)}>
                                ย้อนกลับ
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default ViewContent;
