import React, { useState, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import SidebarMenu from "./SidebarMenu";
import "./manage-add-text.css";

const ManageAddText = () => {
    const location = useLocation();
    const navigate = useNavigate();
    const username = location.state?.username || "Guest";
    const [option_select_cluster, setOptionSelectCluster] = useState([]);
    const [option_select_subject, setOptionSelectSubject] = useState([]);
    const [option_select_sub_subject, setOptionSelectSubSubject] = useState([]);

    const [formData, setFormData] = useState({
        source: "",
        cluster: "",
        subject: "",
        sub_subject: "",
        content: "",
    });

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData({
            ...formData,
            [name]: value,
        });
    };

    const handleViewContent = () => {
        if (!formData.content) {
            alert("กรุณาใส่เนื้อหาก่อนดูคอนเทนต์!");
            return;
        }

        const formattedData = [
            {
                metadata: {
                    source: formData.source,
                    cluster: formData.cluster,
                    subject: formData.subject,
                    sub_subject: formData.sub_subject,
                },
                page_content: formData.content,
            },
        ];

        navigate("/view-content", {
            state: {
                username,
                contentData: formattedData, // แก้จาก resultData เป็น formattedData
                fromPage: "/manage-add-text",
            },
        });
    };

    useEffect(() => {
        fetch("https://9b50-202-44-40-186.ngrok-free.app/api/cluster")
            .then((response) => {
                if (!response.ok) {
                    throw new Error("Network response was not ok");
                }
                return response.json();
            })
            .then((data) => {
                setOptionSelectCluster(data);  // เก็บข้อมูลใน option_select_subject
            })
            .catch((error) => console.error("Error fetching subjects:", error));
    }, []);

    useEffect(() => {
        fetch("https://9b50-202-44-40-186.ngrok-free.app/api/subjects")
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
        if (formData.subject) {
            fetch(`https://9b50-202-44-40-186.ngrok-free.app/api/sub_subjects/${formData.subject}`)
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
    }, [formData.subject]);
    

    return (
        <div className="manage-add-text-page">
            <SidebarMenu username={username} />
            <div className="manage-add-text-container">
                <h1 className="manage-add-text-title">เพิ่มข้อมูลใหม่ - ข้อความ</h1>
                <form className="manage-add-text-form">
                    <div className="form-row">
                        <div className="form-group">
                            <label htmlFor="source" className="form-label">Source :</label>
                            <input
                                type="text"
                                id="source"
                                name="source"
                                className="form-input"
                                value={formData.source}
                                onChange={handleChange}
                            />
                        </div>
                        <div className="form-group">
                            <label htmlFor="cluster" className="form-label">Cluster :</label>
                                <select
                                    id="cluster"
                                    name="cluster"
                                    className="form-select"
                                    value={formData.cluster}
                                    onChange={handleChange}
                                >
                                    <option value="">เลือก Cluster</option>
                                    {option_select_cluster.map((cluster) => (
                                        <option key={cluster.cluster_id} value={cluster.cluster_id}>
                                            {cluster.cluster_name}
                                        </option>
                                    ))}
                                </select>
                        </div>
                    </div>

                    <div className="form-row">
                        <div className="form-group">
                            <label htmlFor="subject" className="form-label">Subject :</label>
                            <select
                                id="subject"
                                name="subject"
                                className="form-select"
                                value={formData.subject}
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
                                value={formData.sub_subject}
                                onChange={handleChange}
                                disabled={!formData.subject}  // ปิดการเลือกถ้ายังไม่ได้เลือก subject
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
                                name="content"
                                className="form-textarea"
                                value={formData.content}
                                onChange={handleChange}
                                placeholder="กรุณากรอกเนื้อหาที่นี่"
                            />
                        </div>
                    </div>

                    <div className="form-row submit-button-row">
                        <button
                            type="button"
                            className="submit-button"
                            onClick={handleViewContent}
                        >
                            ดูคอนเทนต์
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default ManageAddText;
