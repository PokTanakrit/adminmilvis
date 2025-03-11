import React, { useState, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import SidebarMenu from "./SidebarMenu";
import "./manage-add-url.css";

const ManageAddURL = () => {
    const location = useLocation();
    const navigate = useNavigate();
    const username = location.state?.username || "Guest";
    
    const [formData, setFormData] = useState({
            source: "",
            cluster: "",
            subject: "",
            collection_name: "",
            sub_subject: "",
            totalPages: 0,
        });
    
    const [isLoading, setIsLoading] = useState(false);
    const [resultData, setResultData] = useState(null);
    const [option_select_subject, setOptionSelectSubject] = useState([]);
    const [option_select_sub_subject, setOptionSelectSubSubject] = useState([]);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData({
            ...formData,
            [name]: value,
        });
    };

    const handleFetchURL = async () => {
        if (!formData.url) {
            alert("กรุณาใส่ URL ก่อน!");
            return;
        }

        try {
            setIsLoading(true);
            const response = await fetch("http://localhost:3500/api/load_web", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({ url: formData.url }),
            });

            if (response.ok) {
                const result = await response.json();
                console.log("ดึงข้อมูลจาก URL สำเร็จ!");
                
                setFormData({
                    ...formData,
                    source: result.data[0]?.metadata?.source || "",
                    title: result.data[0]?.metadata?.title || "",
                    totalPages: result.data.length,
                });
                const formattedData = result.data.map((page) => ({
                    metadata: {
                        source: result.data[0]["metadata"]["source"] || "",
                        cluster: formData.cluster || "",
                        subject: formData.subject || "",
                        sub_subject: formData.sub_subject || "",
                        page: page.metadata?.page || 0,
                    },
                    page_content : result.data[0]["content"]|| ""
                }));
                setResultData(formattedData);
            } else {
                alert("เกิดข้อผิดพลาดในการดึงข้อมูล");
            }
        } catch (error) {
            console.error("Error fetching URL:", error);
            alert("เกิดข้อผิดพลาดในการเชื่อมต่อกับเซิร์ฟเวอร์");
        } finally {
            setIsLoading(false);
        }
    };

    const handleViewContent = () => {
        if (!resultData) {
            alert("กรุณาดึงข้อมูลก่อนดูคอนเทนต์!");
            return;
        }
        console.log(resultData)

        navigate("/view-content", {
            state: {
                username,
                contentData: resultData,
                fromPage: "/manage-add-url", // ✅ ส่งค่าถูกต้อง
            },
        });
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
        if (formData.subject) {
            fetch(`http://localhost:5000/api/sub_subjects/${formData.subject}`)
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
        <div className="manage-add-url-page">
            <SidebarMenu username={username} />
            <div className="manage-add-url-container">
                <h1 className="manage-add-url-title">เพิ่มข้อมูลใหม่ - URL</h1>
                <form className="manage-add-url-form">
                    <div className="url-input-row">
                        <input
                            type="text"
                            name="url"
                            className="url-input"
                            value={formData.url}
                            onChange={handleChange}
                            placeholder="ใส่ URL ของแหล่งข้อมูล"
                        />
                        <button
                            type="button"
                            className="url-submit-button"
                            onClick={handleFetchURL}
                            disabled={isLoading}
                        >
                            {isLoading ? "กำลังดึงข้อมูล..." : "ดึงข้อมูล"}
                        </button>
                    </div>

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
                                readOnly
                            />
                        </div>
                        <div className="form-group">
                            <label htmlFor="cluster" className="form-label">Cluster :</label>
                            <input
                                type="text"
                                id="cluster"
                                name="cluster"
                                className="form-input"
                                value={formData.cluster}
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

export default ManageAddURL;