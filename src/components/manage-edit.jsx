import React, { useState, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import SidebarMenu from "./SidebarMenu";
import "./manage-edit.css";
import { useUser } from "./UserContext";

const filterOptions = ["Keyword", "Source", "Category", "Subject"];

const ManageEdit = () => {
    const location = useLocation();
    const navigate = useNavigate();
    const [searchText, setSearchText] = useState("");
    const [selectedFilter, setSelectedFilter] = useState(filterOptions[0]);
    const [contentData, setContentData] = useState([]);
    const [logData, setLogData] = useState([]);
    const [showWarningModal, setShowWarningModal] = useState(false);
    const [showPasswordModal, setShowPasswordModal] = useState(false);
    const [password, setPassword] = useState("");
    const [errorMessage, setErrorMessage] = useState("");
    const { username } = useUser(); 

    // ✅ เคลียร์ข้อมูลทั้งหมดเมื่อรีเฟรชหน้าเว็บ
    useEffect(() => {
        const handleBeforeUnload = () => {
            clearAllData();
        };
        window.addEventListener("beforeunload", handleBeforeUnload);

        return () => {
            window.removeEventListener("beforeunload", handleBeforeUnload);
        };
    }, []);

    const clearAllData = () => {
        setSearchText("");
        setSelectedFilter(filterOptions[0]);
        setContentData([]);
        setLogData([]);
        setPassword("");
        setErrorMessage("");
        console.log("clear all data already")
    };

    const handleSearch = async () => {
        try {
            const response = await fetch("http://127.0.0.1:5000/searchkeyword", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ text: searchText, filter: selectedFilter }),
            });

            if (!response.ok) throw new Error("เกิดข้อผิดพลาดในการค้นหา");

            const data = await response.json();
            setContentData(data.results || []);
            console.log(data.results)
        } catch (error) {
            alert("ไม่สามารถเชื่อมต่อกับเซิร์ฟเวอร์ได้");
        }
    };


    const updateLog = (id, method, newContent, statusChange) => {
        const date = new Date().toISOString().replace(/T/, '-').replace(/\..+/, '').replace(/:/g, '-');
    
        setLogData((prevLogs) => {
            const existingLogIndex = prevLogs.findIndex(log => log.id === id);
            let updatedLogs = [...prevLogs];
    
            if (existingLogIndex !== -1) {
                const existingLog = prevLogs[existingLogIndex];
    
                if (existingLog.method === "delete" && method === "edit") {
                    return prevLogs; // ไม่อัปเดต log ถ้าเป็น edit หลัง delete
                }
    
                if (method === "delete") {
                    updatedLogs[existingLogIndex] = { id, method: "delete", date, new_content: "", status_change: statusChange };
                } else {
                    updatedLogs[existingLogIndex] = { id, method, date, new_content: newContent, status_change: statusChange };
                }
            } else {
                updatedLogs.push({ id, method, date, new_content: newContent, status_change: statusChange });
            }
    
            console.log("Updated Logs:", updatedLogs); // ✅ Log ที่อัปเดตแล้ว
            return updatedLogs;
        });
    };
    

    useEffect(() => {
        console.log("Updated logData:", logData);
    }, [logData]);
    

    const handleEdit = (index, field, value) => {
        const updatedData = [...contentData];
        updatedData[index][field] = value;
        setContentData(updatedData);
        
        updateLog(updatedData[index].id, "edit", value, "yes"); // ✅ อัปเดต log หลังจากแก้ไข
    };
    
    
    const handleDelete = (index) => {
        console.log("Deleting item at index:", index);
        
        const deletedItem = contentData[index];
        if (!deletedItem) return; // ✅ ตรวจสอบว่า item มีค่าจริง
        
        const updatedData = contentData.filter((_, i) => i !== index);
        setContentData(updatedData);
        
        updateLog(deletedItem.id, "delete", "", "yes"); // ✅ อัปเดต log หลังจากลบ
    };
    
    

    const handleWarningConfirm = () => {
        setShowWarningModal(false);
        setShowPasswordModal(true);
    };

    const handlePasswordSubmit = async () => {
        console.log(logData)
        if (!password.trim()) {
            setErrorMessage("กรุณากรอกรหัสผ่าน");
            return;
        }
    
        try {
            const response = await fetch("http://127.0.0.1:5000/update", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    username,  // ✅ ส่ง username
                    password,  // ✅ ส่ง password
                    logData,   // ✅ ส่ง logData
                }),
            });
    
            const data = await response.json();
    
            if (response.ok && data.success) {
                console.log("ข้อมูลถูกส่งสำเร็จ!");
                clearAllData();
                setShowPasswordModal(false);
                console.log("Modal close");
            } else {
                setErrorMessage(data.message || "เกิดข้อผิดพลาดในการส่งข้อมูล");
            }
        } catch (error) {
            setErrorMessage("ไม่สามารถเชื่อมต่อกับเซิร์ฟเวอร์ได้");
        }
        setPassword("");
    };
    

    const handleAdvancedSearch = () => {
        navigate("/manage-edit-advance");
    };

    return (
        <div className="manage-edit-page">
            <SidebarMenu />
            <div className="manage-edit-container">
                <h2 className="manage-edit-title">แก้ไขข้อมูล</h2>

                <div className="search-container">
                    <input
                        type="text"
                        placeholder="ใส่ข้อมูลที่จะค้นหา"
                        value={searchText}
                        onChange={(e) => setSearchText(e.target.value)}
                    />
                    <select value={selectedFilter} onChange={(e) => setSelectedFilter(e.target.value)}>
                        {filterOptions.map((option, index) => (
                            <option key={index} value={option}>{option}</option>
                        ))}
                    </select>
                    <button onClick={handleSearch}>ค้นหา</button>
                    <button onClick={handleAdvancedSearch}>ค้นหา-advance</button>
                </div>

                <div className="content-list">
                    {contentData.map((item, index) => (
                        <div key={index} className="content-item">
                            <div className="content-info">
                                <p><strong>ID:</strong> {item.id}</p>
                                <p><strong>Date:</strong> {item.date}</p>
                                <p><strong>Score:</strong> {item.score}</p>
                                <p><strong>Subject:</strong> {item.subject}</p>
                            </div>
                            <div className="content-details">
                                <label>
                                    Page Content:
                                    <textarea
                                        value={item.text}
                                        onFocus={() => updateLog(item.id, "edit", item.text, "yes")}
                                        onChange={(e) => handleEdit(index, "text", e.target.value)}
                                    />
                                </label>
                            </div>
                            <button className="delete-button" onClick={() => handleDelete(index)}>ลบ</button>
                        </div>
                    ))}
                </div>

                {contentData.length > 0 && (
                    <div style={{ display: "flex", justifyContent: "flex-end", gap: "10px" }}>
                        <button
                            className="save-button"
                            onClick={() => setShowWarningModal(true)}
                        >
                            บันทึกการเปลี่ยนแปลง
                        </button>
                        <button
                            className="cancel-button"
                            onClick={clearAllData}  // ✅ เคลียร์ข้อมูลเมื่อกดยกเลิก
                        >
                            ยกเลิก
                        </button>
                    </div>
                )}

                {showWarningModal && (
                    <div className="modal-overlay">
                        <div className="modal-container">
                            <div className="modal-header-warning">
                                <span>WARNING !!!</span>
                                <button className="close-button" onClick={() => setShowWarningModal(false)}>×</button>
                            </div>
                            <div className="modal-content">
                                {logData.length > 0 ? (
                                    logData.map((log, index) => (
                                        <p key={index}>
                                            {log.method === "delete" 
                                                ? `ลบ id ${log.id}` 
                                                : `แก้ไข id ${log.id}`}
                                        </p>
                                    ))
                                ) : (
                                    <p>ไม่มีการเปลี่ยนแปลงใด ๆ</p>
                                )}
                            </div>
                            <div className="modal-buttons">
                                <button className="modal-confirm" onClick={handleWarningConfirm}>ยืนยัน</button>
                                <button className="modal-cancel" onClick={() => setShowWarningModal(false)}>ย้อนกลับ</button>
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
                                <button className="modal-confirm" onClick={handlePasswordSubmit}>ยืนยัน</button>
                                <button className="modal-cancel" onClick={() => setShowPasswordModal(false)}>ย้อนกลับ</button>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default ManageEdit;
