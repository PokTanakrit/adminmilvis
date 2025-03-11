import React from "react";
import { useLocation } from "react-router-dom";

import "./History.css";

const History = () => {
    const location = useLocation();
    const data = [
        {
            time: "2024-01-22 10:30:55",
            category: "ข้อมูลเกี่ยวกับภาควิชา",
            subject: "หลักสูตรการเรียนการสอน",
            question: "วิชาWeb Development เรียนเกี่ยวกับอะไร",
            answer: "เรียนเกี่ยวกับ HTML CSS การเชื่อมต่อฐานข้อมูล ลูกค้าและเซิร์ฟเวอร์ การออกแบบโครงสร้างทุกอุปกรณ์ เป็นต้น",
            review: "like",
        },
        {
            time: "2024-01-22 10:31:00",
            category: "-",
            subject: "-",
            question: "วันนี้มีอะไร",
            answer: "ข้อมูลอยู่นอกเหนือขอบเขต",
            review: "dislike",
        },
        {
            time: "2024-01-22 10:40:00",
            category: "ข่าวประชาสัมพันท์",
            subject: "ข่าวภาควิชา",
            question: "งาน SCIENCE EXHIBITION จัดวันไหน?",
            answer: "งาน SCIENCE EXHIBITION จัดวันที่ 11 มีนาคม 2568 เวลา 08.00 - 15.00 น. ณ หอประชุมประดู่แดง ชั้น 2 อาคารอเนกประสงค์ มหาวิทยาลัยเทคโนโลยีพระจอมเกล้าพระนครเหนือ",
            review: "like",
        },
    ];

    return (
        <div className="history-page">


            {/* Main Content */}
            <div className="history-content">
                <h2>ประวัติการใช้งาน</h2>
                {data.length === 0 ? (
                    <p className="no-history">ไม่มีประวัติการใช้งาน</p>
                ) : (
                    <table>
                        <thead>
                            <tr>
                                <th>วันเวลา</th>
                                <th>Cluster</th>
                                <th>Subject</th>
                                <th>คำถาม</th>
                                <th>คำตอบ</th>
                                <th>รีวิว</th>
                            </tr>
                        </thead>
                        <tbody>
                            {data.map((row, index) => (
                                <tr key={index}>
                                    <td>{row.time}</td>
                                    <td>{row.category}</td>
                                    <td>{row.subject}</td>
                                    <td>{row.question}</td>
                                    <td>{row.answer}</td>
                                    <td>{row.review === "like" ? "👍" : "👎"}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                )}
            </div>
        </div>
    );
};

export default History;
