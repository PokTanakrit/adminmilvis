import React from "react";
import "./Filedowload.css";

const FileDownload = () => {
    return (
        <div className="template-page">
            <div className="template-content">
                <h2>ดาวน์โหลดไฟล์</h2>
                <a href="/templatefile/แบบฟอร์มขบวนวิชา.pdf" download>ดาวน์โหลด แบบฟอร์มขบวนวิชา.pdf</a>
                <br />        
                <h2>แสดงตัวอย่างการเพิ่มข้อมูลขบวนวิชา</h2>
                <iframe src="/templatefile/แบบฟอร์มขบวนวิชา.pdf" width="100%" height="600px"></iframe>
            </div>
        </div>
    );
};

export default FileDownload;
