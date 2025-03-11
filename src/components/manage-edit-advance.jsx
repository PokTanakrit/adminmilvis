import React, { useState, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import SidebarMenu from "./SidebarMenu";
import "./manage-edit-advance.css";
import { useUser } from "./UserContext";  // ✅ ใช้ Context

const ManageEditAdvance = () => {
    const { username } = useUser(); // ✅ ดึง username
    const location = useLocation();
    const navigate = useNavigate();
    const [searchText, setSearchText] = useState("");
    const [contentData, setContentData] = useState([]);
    const [logData, setLogData] = useState([]);
    const [showWarningModal, setShowWarningModal] = useState(false);
    const [showPasswordModal, setShowPasswordModal] = useState(false);
    const [password, setPassword] = useState("");
    const [errorMessage, setErrorMessage] = useState("");
    const [formData, setContent] = useState({
        metadata: {
            source: "",
            cluster: "",
            subject: "",
            sub_subject: "",
        },
        page_content: "",
    });
    const [option_select_subject, setOptionSelectSubject] = useState([]);
    const [option_select_sub_subject, setOptionSelectSubSubject] = useState([]);
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
        setContentData([]);
        setLogData([]);
        setPassword("");
        setErrorMessage("");
        console.log("clear all data already")
    };

    const handleSearch = async () => {
        try {
            const response = await fetch("http://localhost:5000/searchkeyword", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ text: formData }),
            });

            if (!response.ok) throw new Error("เกิดข้อผิดพลาดในการค้นหา");

            const data = await response.json();
            setContentData(data.results || []);
        } catch (error) {
            alert("ไม่สามารถเชื่อมต่อกับเซิร์ฟเวอร์ได้");
        }
    };

    const updateLog = (id, method, newContent, statusChange) => {
        const date = new Date().toISOString().replace(/T/, '-').replace(/\..+/, '').replace(/:/g, '-');

        setLogData((prevLogs) => {
            const existingLogIndex = prevLogs.findIndex(log => log.id === id);

            if (existingLogIndex !== -1) {
                const existingLog = prevLogs[existingLogIndex];

                if (existingLog.method === "delete" && method === "edit") {
                    return prevLogs;
                }

                if (method === "delete") {
                    const updatedLogs = [...prevLogs];
                    updatedLogs[existingLogIndex] = { id, method: "delete", date, new_content: "", status_change: statusChange };
                    return updatedLogs;
                }

                const updatedLogs = [...prevLogs];
                updatedLogs[existingLogIndex] = { id, method, date, new_content: newContent, status_change: statusChange };
                return updatedLogs;
            }

            return [...prevLogs, { id, method, date, new_content: newContent, status_change: statusChange }];
        });
    };

    const handleEdit = (index, field, value) => {
        const updatedData = [...contentData];
        updatedData[index][field] = value;
        setContentData(updatedData);
        updateLog(updatedData[index].id, "edit", value, "yes");
    };

    const handleDelete = (index) => {
        const deletedItem = contentData[index];
        setContentData(contentData.filter((_, i) => i !== index));
        updateLog(deletedItem.id, "delete", "", "yes");
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
            const response = await fetch("http://localhost:5000/update", {
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
    
    
    const handleChange = (e) => {
        const { name, value } = e.target;

        setContent((prevData) => ({
            ...prevData,
            metadata: {
                ...prevData.metadata,
                ...(name in prevData.metadata ? { [name]: value } : {}),
            },
            ...(name === "page_content" ? { page_content: value } : {}),
        }));
    };

    useEffect(() => {
        fetch("http://localhost:5000/api/subjects")
            .then((response) => {
                if (!response.ok) {
                    throw new Error("Network response was not ok");
                }
                return response.json();
            })
            .then((data) => {
                setOptionSelectSubject(data);  // เก็บข้อมูลใน option_select_subject
            })
            .catch((error) => console.error("Error fetching subjects:", error));
    }, []);

    useEffect(() => {
        if (formData.metadata.subject) {
            fetch(`http://localhost:5000/api/sub_subjects/${formData.metadata.subject}`)
                .then((response) => {
                    if (!response.ok) {
                        throw new Error("Network response was not ok");
                    }
                    return response.json();
                })
                .then((data) => {
                    setOptionSelectSubSubject(data);  // เก็บข้อมูลใน option_select_sub_subject
                })
                .catch((error) => console.error("Error fetching sub_subjects:", error));
        } else {
            setOptionSelectSubSubject([]);  // รีเซ็ตเมื่อไม่ได้เลือก subject
        }
    }, [formData.metadata.subject]);

    return (
        <div className="manage-edit-advance-page">
            <SidebarMenu />
            <div className="manage-edit-advance-container">
                <h1 className="manage-edit-advance-title">แก้ไขข้อมูล - Advance</h1>
                <form className="manage-edit-advance-form">
                    <div className="form-row">
                        <div className="form-group">
                            <label htmlFor="source" className="form-label">Source :</label>
                            <input
                                type="text"
                                id="source"
                                name="source"
                                className="form-input"
                                value={formData.metadata.source}
                                onChange={handleChange}
                            />
                        </div>
                        <div className="form-group">
                            <label htmlFor="cluster" className="form-label">Cluster :</label>
                            <input
                                type="text"
                                id="cluster"
                                name="cluster"
                                className="form-input"
                                value={formData.metadata.cluster}
                                onChange={handleChange}
                            />
                        </div>
                    </div>

                    <div className="form-row">
                        <div className="form-group">
                            <label htmlFor="subject" className="form-label">Subject :</label>
                            <select
                                id="subject"
                                name="subject"
                                className="form-select"
                                value={formData.metadata.subject}  // Corrected binding
                                onChange={handleChange}
                            >
                                <option value="">เลือกหมวดหมู่</option>
                                {option_select_subject.map((subject) => (
                                    <option key={subject.subject_id} value={subject.subject_id}>
                                        {subject.subject_name}
                                    </option>
                                ))}
                            </select>
                        </div>
                        <div className="form-group">
                            <label htmlFor="sub_subject" className="form-label">Sub_Subject :</label>
                            <select
                                id="sub_subject"
                                name="sub_subject"
                                className="form-select"
                                value={formData.metadata.sub_subject}  // Corrected binding
                                onChange={handleChange}
                                disabled={!formData.metadata.subject}  // Corrected condition
                            >
                                <option value="">เลือกหัวข้อย่อย</option>
                                {option_select_sub_subject.map((subSubject) => (
                                    <option key={subSubject.sub_subject_id} value={subSubject.sub_subject_id}>
                                        {subSubject.sub_subject_name}
                                    </option>
                                ))}
                            </select>
                        </div>
                    </div>

                    <div className="form-row">
                        <div className="form-group">
                            <label htmlFor="content" className="form-label">Content :</label>
                            <textarea
                                id="content"
                                name="page_content"
                                className="form-textarea"
                                value={formData.page_content}
                                placeholder="กรุณากรอกเนื้อหาที่นี่"
                                onChange={handleChange}
                            />
                        </div>
                    </div>
                    <div className="search-container">
                        <button type="button" className="search-button" onClick={handleSearch}>ค้นหา</button>
                    </div>
                </form>

                <div className="content-list">
                    {contentData.map((item, index) => (
                        <div key={index} className="content-item">
                            <div className="content-details">
                                <label>
                                    Page Content:
                                    <textarea
                                        value={item.text}
                                        className="content-textarea"
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
                            <div className="modal-header modal-header-warning">
                                <span>WARNING !!!</span>
                                <button className="close-button" onClick={() => setShowWarningModal(false)}>×</button>
                            </div>
                            <div className="modal-content">
                                {logData.length > 0 ? (
                                    logData.map((log, index) => (
                                        <p key={index} className="log-item">
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
                            <div className="modal-header modal-header-password">
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

export default ManageEditAdvance;
