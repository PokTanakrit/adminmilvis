import { useState, useEffect, useRef } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import SidebarMenu from "./SidebarMenu";
import "./view-content.css";
import { useUser } from "./UserContext";

const ViewContent = () => {
    const location = useLocation();
    const navigate = useNavigate();
    const { username } = useUser();
    const initialContentData = location.state?.contentData || [];
    const fromPage = location.state?.fromPage || "/manage-add";

    const [contentData, setContentData] = useState(initialContentData);
    const [showWarningModal, setShowWarningModal] = useState(false);
    const [showPasswordModal, setShowPasswordModal] = useState(false);
    const [password, setPassword] = useState("");
    const [errorMessage, setErrorMessage] = useState("");
    const [warningInfo, setWarningInfo] = useState(null); // เก็บข้อมูล index และ similarity
    const isFetching = useRef(false); // ย้ายมาไว้ข้างนอก
    const [selectedPageInput, setSelectedPageInput] = useState("");
    const [replacementMapping, setReplacementMapping] = useState({});
    const [isLoading, setIsLoading] = useState(false);
    
    const handleInputChange = (event) => {
        setSelectedPageInput(event.target.value);
    };

    const parseSelectedIndexes = (input) => {
        const selectedIndexes = new Set();
    
        // เช็คว่ามีช่องว่างระหว่างตัวเลขหรือไม่
        if (/\s/.test(input)) {
            setErrorMessage("Invalid input: Spaces between numbers are not allowed.");
            return [];
        }
    
        // แยกส่วนด้วยคอมม่าและขีด
        const parts = input.split(/[,\s]+/).map(part => part.trim());
    
        parts.forEach(part => {
            if (part.includes("-")) {
                // ตรวจสอบกรณีช่วงของตัวเลข เช่น 1-5
                const rangeParts = part.split("-").map(num => parseInt(num, 10));
                if (rangeParts.length === 2 && !isNaN(rangeParts[0]) && !isNaN(rangeParts[1])) {
                    const [start, end] = rangeParts;
                    for (let i = start; i <= end; i++) {
                        selectedIndexes.add(i);
                    }
                }
            } else if (part.includes(".")) {
                // ถ้าค่ามี . (ไม่อนุญาตให้ใช้)
                setErrorMessage("Invalid input: Periods are not allowed.");
                return [];
            } else {
                // ตรวจสอบกรณีตัวเลขเดี่ยวๆ เช่น 1, 5
                const num = parseInt(part, 10);
                if (!isNaN(num)) {
                    selectedIndexes.add(num);
                }
            }
        });
    
        return Array.from(selectedIndexes).sort((a, b) => a - b);
    };
    
    

    useEffect(() => {
        // ถ้า selectedPageInput เป็น null หรือว่าง, ล้างข้อความ error
        if (selectedPageInput == null || selectedPageInput.trim() === "") {
            setErrorMessage(''); // ล้างข้อความ error
            return; // ออกจาก useEffect เมื่อ selectedPageInput เป็น null หรือว่าง
        }
    
        // ถ้า selectedPageInput ไม่ใช่ null, ให้ parse index
        const selectedIndexes = parseSelectedIndexes(selectedPageInput);
        console.log("Parsed Indexes:", selectedIndexes);
    
        // ถ้า selectedIndexes ว่างแสดงว่ามีบางอย่างผิดพลาด
        if (selectedIndexes.length === 0) {
            setErrorMessage('Invalid input: Periods are not allowed.');
        } else {
            setErrorMessage(''); // ล้างข้อความ error หากการ parse สำเร็จ
        }
    
        // ตั้งค่าการ mapping ของ replacement
        setReplacementMapping(selectedIndexes);
    }, [selectedPageInput]);
    
    


    useEffect(() => {
        const fetchSimilarityScores = async () => {
            if (isFetching.current) return;
            isFetching.current = true;
    
            try {
                const updatedData = await Promise.all(contentData.map(async (item) => {
                    const response = await fetch("https://5b17-202-44-40-186.ngrok-free.app/searchkeyword", {
                        method: "POST",
                        headers: { "Content-Type": "application/json" },
                        body: JSON.stringify({ text: item.page_content })
                    });
    
                    if (response.ok) {
                        const result = await response.json();
                        const maxScoreItem = result.results?.reduce((maxItem, currentItem) =>
                            currentItem.hybrid_score > maxItem.hybrid_score ? currentItem : maxItem, 
                            result.results[0] || {}
                        );
                        console.log(maxScoreItem)
                        return { 
                            ...item, 
                            similarity: maxScoreItem?.hybrid_score || 0, 
                            similarContent: maxScoreItem?.text || "ไม่เจอข้อมูล", 
                            similarid: maxScoreItem?.id || null  // ถ้าไม่มี id ให้ตั้งค่าเป็น null
                        };
                    }
                    return { ...item, similarity: 0, similarContent: "ไม่เจอข้อมูล", similarid: null };
                }));
                console.log(updatedData)
                setContentData(updatedData);
            } catch (error) {
                console.error("Error fetching similarity scores:", error);
            } finally {
                isFetching.current = false;
            }
        };
    
        if (contentData.length > 0) {
            fetchSimilarityScores();
        }
    }, [JSON.stringify(contentData)]);
    
    
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
        const highSimilarityItems = contentData.map((item, index) => ({
            index, 
            similarity: item.similarity || 0,
            similarContent: item.similarContent,
            similarid:item.id
        })).filter(item => item.similarity > 7);
    
        if (highSimilarityItems.length > 0) {
            setWarningInfo(highSimilarityItems);
            setShowWarningModal(true);
        } else {
            setShowPasswordModal(true);
        }
    };

    const handleWarningConfirm = () => {
        const selectedIndexes = parseSelectedIndexes(selectedPageInput);
        console.log(selectedIndexes)

        setReplacementMapping(selectedIndexes); // แก้ให้ถูกต้อง
        setShowWarningModal(false);
        setShowPasswordModal(true);
    };
    
    

    const handlePasswordSubmit = async () => {
        if (!password.trim()) {
            setErrorMessage("กรุณากรอกรหัสผ่าน");
            return;
        }
        setIsLoading(true); // แสดง Loader เมื่อกดปุ่ม
        console.clear(); 
        console.log(contentData)
        console.log(replacementMapping)
        try {
            const response = await fetch("https://5b17-202-44-40-186.ngrok-free.app/insert", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    username,
                    password,
                    contentData,
                    warningIndexes: warningInfo?.map(item => item.index) || [],
                    replacementMapping, // ระบุว่า index ไหนแทนที่ ID ไหน
                }),
            });
    
            const data = await response.json();
            console.log(data);
    
            if (response.ok) {
                console.log("ข้อมูลถูกส่งสำเร็จ!");
                setIsLoading(false)
                setShowPasswordModal(false);
                setPassword("");
                navigate(fromPage);
            } else {
                setIsLoading(false)
                setErrorMessage(data.message || "เกิดข้อผิดพลาดในการส่งข้อมูล");
            }
        } catch (error) {
            setErrorMessage("ไม่สามารถเชื่อมต่อกับเซิร์ฟเวอร์ได้");
            setIsLoading(false)
        }
        setPassword("");
        setIsLoading(false)
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
                                พบเนื้อหาที่คล้ายกัน: {item.similarity}
                            </div>
                            <button className="delete-button" onClick={() => handleDelete(index)}>
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
                        
                        {showWarningModal && (
                            <div className="modal-overlay">
                                <div className="modal-container">
                                    <div className="modal-header-warning">
                                        <span>WARNING !!!</span>
                                        <button className="close-button" onClick={() => setShowWarningModal(false)}>×</button>
                                    </div>
                                    
                                    <div className="modal-content">
                                        <p>พบเนื้อหาที่คล้ายกันสูง:</p>
                                        <table className="comparison-table">
                                            <thead>
                                                <tr>
                                                    <th>Index</th>
                                                    <th>เนื้อหาที่จะเพิ่ม</th>
                                                    <th>เนื้อหาที่คล้ายกัน</th>
                                                    <th>Similarity Score</th>
                                                </tr>
                                            </thead>
                                            <tbody>
                                                {warningInfo.map((item) => (
                                                    <tr key={item.index}>
                                                        <td>{item.index}</td>
                                                        <td>{contentData[item.index]?.page_content}</td>
                                                        <td>{item.similarContent}</td>
                                                        <td>{item.similarity}</td>
                                                    </tr>
                                                ))}
                                            </tbody>
                                        </table>
                                        
                                        {/* Input สำหรับเลือก index */}
                                        <div className="form-group">
                                            <label htmlFor="selectedPages" className="form-label">
                                                เลือก index ที่ต้องการแทนที่ (เช่น 1,3,5-7):
                                            </label>
                                            <input
                                                type="text"
                                                id="selectedPages"
                                                className="form-input"
                                                value={selectedPageInput}
                                                onChange={handleInputChange}
                                                placeholder="ระบุ index ที่ต้องการ หรือเว้นว่างเพื่อใช้ทั้งหมด"
                                            />
                                        </div>

                                        {/* ถ้ามี error ให้แสดงข้อความ */}
                                        {errorMessage && (
                                            <div className="error-message">
                                                <p>{errorMessage}</p>
                                            </div>
                                        )}
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
                            <button className="modal-confirm" onClick={handlePasswordSubmit} disabled={isLoading}>
                                {isLoading ? "กำลังส่งข้อมูล..." : "ยืนยัน"}
                            </button>

                            {isLoading && (
                                <div className="loader-container">
                                    <div className="loader"></div>
                                </div>
                            )}
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
