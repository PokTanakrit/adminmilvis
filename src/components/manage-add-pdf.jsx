import React, { useState, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import SidebarMenu from "./SidebarMenu";
import "./manage-add-pdf.css";

const ManageAddPDF = () => {
    const location = useLocation();
    const navigate = useNavigate();
    const username = location.state?.username || "Guest";
    const [option_select_cluster, setOptionSelectCluster] = useState([]);
    const [option_select_subject, setOptionSelectSubject] = useState([]);
    const [option_select_sub_subject, setOptionSelectSubSubject] = useState([]);

    const [formData, setFormData] = useState({
        file: null,
        source: "",
        cluster: "",
        subject: "",
        collection_name: "",
        sub_subject: "",
        totalPages: 0,
    });

    const [isLoading, setIsLoading] = useState(false);
    const [resultData, setResultData] = useState(null);

    const handleChange = (e) => {
        const { name, value, files } = e.target;
        setFormData({
            ...formData,
            [name]: files ? files[0] : value,
        });
    };

    const handleFileChange = (event) => {
        const file = event.target.files[0];
        setFormData({ ...formData, file: file || null });
    };

    const handleReadFile = async () => {
        if (!formData.file) {
            alert("กรุณาเลือกไฟล์ก่อน!");
            return;
        }

        const formDataToSend = new FormData();
        formDataToSend.append("file", formData.file);

        try {
            setIsLoading(true);
            const response = await fetch("http://localhost:3500/api/upload_pdf", {
                method: "POST",
                body: formDataToSend,
            });

            if (response.ok) {
                const result = await response.json();
                console.log("อ่านไฟล์สำเร็จ!");

                setFormData({
                                    ...formData,
                                    source: result.data[0]?.metadata?.source || "",
                                    title: result.data[0]?.metadata?.title || "",
                                    totalPages: result.data.length,
                });

                const formattedData = result.data.map((page) => ({
                    metadata: {
                        source: page.metadata?.source || "",
                        cluster: formData.cluster || "",
                        subject: formData.subject || "",
                        sub_subject: formData.sub_subject || "",
                        totalPages: page.metadata?.total_pages,
                        page: page.metadata?.page || 0,
                    },
                    page_content: page.page_content || "",
                }));

                setResultData(formattedData);
                
            } else {
                alert("เกิดข้อผิดพลาดในการอ่านไฟล์");
            }
        } catch (error) {
            console.error("Error uploading file:", error);
            alert("เกิดข้อผิดพลาดในการเชื่อมต่อกับเซิร์ฟเวอร์");
        } finally {
            setIsLoading(false);
        }
    }; // เพิ่มปีกกาปิดฟังก์ชัน

    const handleViewContent = () => {
        if (!resultData) {
            alert("กรุณาอ่านไฟล์ก่อนดูคอนเทนต์!");
            return;
        }

        navigate("/view-content", {
            state: {
                username,
                contentData: resultData,
                fromPage: "/manage-add-pdf", // ✅ ส่งค่าถูกต้อง
            },
        });
    };

    useEffect(() => {
        fetch("http://localhost:5000/api/cluster")
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
        <div className="manage-add-pdf-page">
            <SidebarMenu username={username} />
            <div className="manage-add-pdf-container">
                <h1 className="manage-add-pdf-title">เพิ่มข้อมูลใหม่ - PDF</h1>
                <form className="manage-add-pdf-form">
                    <div className="file-upload-row">
                        <input
                            type="file"
                            name="file"
                            id="file"
                            onChange={handleFileChange}
                            style={{ display: "none" }}
                        />
                        <input
                            type="text"
                            className="file-name-display"
                            value={formData.file ? formData.file.name : ""}
                            readOnly
                            placeholder="ยังไม่ได้เลือกไฟล์"
                        />
                        {!formData.file ? (
                            <label htmlFor="file" className="file-select-button">
                                เลือกไฟล์
                            </label>
                        ) : (
                            <button
                                type="button"
                                className="file-select-button"
                                onClick={handleReadFile}
                                disabled={isLoading}
                            >
                                {isLoading ? "กำลังอ่านไฟล์..." : "อ่านไฟล์"}
                            </button>
                        )}
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
                                placeholder="ใส่ข้อมูลแหล่งที่มา"
                                readOnly
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
                        <div className="form-group total-pages-group">
                            <label htmlFor="totalPages" className="form-label">Total page :</label>
                            <input
                                type="number"
                                id="totalPages"
                                name="totalPages"
                                className="form-input"
                                value={formData.totalPages}
                                onChange={handleChange}
                                placeholder="ระบุจำนวนหน้า"
                                readOnly
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

export default ManageAddPDF;

