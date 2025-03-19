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
    const [selectedPageInput, setSelectedPageInput] = useState("");  // ✅ เพิ่มตัวแปรเก็บค่าที่ผู้ใช้ป้อน
    const [selectedPages, setSelectedPages] = useState([]);  // ✅ เก็บรายการหน้าที่ใช้จริง


    const [formData, setFormData] = useState({
        file: null,
        source: "",
        cluster: 0,
        subject: 0,
        sub_subject: 0,
        totalPages: 0,
    });

    const [isLoading, setIsLoading] = useState(false);
    const [resultData, setResultData] = useState(null);

    const parsePageNumbers = (input) => {
        console.log("📌 Raw Input to Parse:", input);
    
        if (!input || input.trim() === "") {
            console.warn("⚠️ ไม่มีค่า input ให้ parse");
            return [];
        }
    
        const pages = new Set();
        const regex = /^\d+(-\d+)?(,\d+(-\d+)?)*$/;
    
        if (!regex.test(input.replace(/\s/g, ""))) {
            alert("รูปแบบตัวเลขไม่ถูกต้อง กรุณาใช้รูปแบบ: 1,3,5-7");
            return [];
        }
    
        input.split(",").forEach((part) => {
            if (part.includes("-")) {
                let [start, end] = part.split("-").map(num => parseInt(num, 10) - 1);
                if (isNaN(start) || isNaN(end) || start > end) {
                    console.warn(`⚠️ ค่าไม่ถูกต้อง: ${part}`);
                    return;
                }
                for (let i = start; i <= end; i++) pages.add(i);
            } else {
                const pageNum = parseInt(part, 10) - 1;
                if (!isNaN(pageNum)) pages.add(pageNum);
            }
        });
    
        return [...pages].sort((a, b) => a - b);
    };
    

    useEffect(() => {
        console.log("📌 Updated formData:", formData);
    }, [formData]);

    useEffect(() => {
        if (!resultData) return;
    
        setResultData((prevData) => 
            prevData.map((page) => ({
                ...page,
                metadata: {
                    ...page.metadata,
                    cluster: formData.cluster,  
                    subject: formData.subject,  
                    sub_subject: formData.sub_subject,
                    totalPages: formData.totalPages,
                    source: formData.source,
                }
            }))
        );
    }, [formData]); // ✅ Run only when `formData` changes
    

    const handleChange = (e) => {
        const { name, value } = e.target;
    
        setFormData((prevData) => {
            const updatedData = { ...prevData, [name]: value };
            console.log("📌 Updated formData:", updatedData);
            return updatedData;
        });
    };
    

    const handleFileChange = (event) => {
        const file = event.target.files[0];
        setFormData({ ...formData, file: file || null });
    };

    const handleInputChange = (e) => {
        setSelectedPageInput(e.target.value);
        console.log("📌 Updated Input:", e.target.value);
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
                console.log("📌 อ่านไฟล์สำเร็จ!", result);
    
                setFormData((prev) => ({
                    ...prev,
                    source: formData.file.name || "",
                    totalPages: result.data.length,
                }));
    
                const filteredPages = parsePageNumbers(selectedPageInput);
                setSelectedPages(filteredPages);
    
                setResultData((prev) => {
                    const filteredData = filteredPages.length > 0
                        ? result.data.filter(page => filteredPages.includes(page.metadata.page))
                        : result.data;
                
                    return filteredData
                        .filter((page) => page.page_content && page.page_content.trim() !== "") // กรองเฉพาะข้อมูลที่มี page_content ที่ไม่ว่าง
                        .map((page) => ({
                            metadata: {
                                source: formData.file.name || "",
                                cluster: formData.cluster || 0,
                                subject: formData.subject || 0,
                                sub_subject: formData.sub_subject || 0,
                                totalPages: page.metadata?.total_pages,
                                page: page.metadata?.page || 0,
                            },
                            page_content: page.page_content || "",
                        }));
                });
            } else {
                alert("เกิดข้อผิดพลาดในการอ่านไฟล์");
            }
        } catch (error) {
            console.error("Error uploading file:", error);
            alert("เกิดข้อผิดพลาดในการเชื่อมต่อกับเซิร์ฟเวอร์");
        } finally {
            setIsLoading(false);
        }
    };
    

    
    
    

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
                    <div className="form-group">
                            <label htmlFor="selectedPages" className="form-label">เลือกหน้า (เช่น 1,3,5-7):</label>
                            <input
                                type="text"
                                id="selectedPages"
                                name="selectedPages"
                                className="form-input"
                                value={selectedPageInput}
                                onChange={handleInputChange}
                                placeholder="ระบุหน้าที่ต้องการ หรือเว้นว่างเพื่อใช้ทั้งหมด"
                            />
                    </div>
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
                                id="fileName"
                                name="fileName"
                                className="form-input"
                                value={formData.file ? formData.file.name : ""}
                                placeholder="ชื่อไฟล์จะปรากฏที่นี่"
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

