import React, { useEffect, useState } from "react";
import "./History.css";

const History = () => {
    const [historyData, setHistoryData] = useState([]);

    useEffect(() => {
        fetch("https://5b17-202-44-40-186.ngrok-free.app/api/history", {
            headers: {
                "ngrok-skip-browser-warning": "true"
            }
        })
            .then(response => response.json())
            .then(data => setHistoryData(data))
            .catch(error => console.error("Error fetching history:", error));
    }, []);

    return (
        <div className="history-page">
            <div className="history-content">
                <h2>ประวัติการใช้งาน</h2>
                {historyData.length === 0 ? (
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
                            </tr>
                        </thead>
                        <tbody>
                            {historyData.map((row, index) => (
                                <tr key={index}>
                                    <td>{row.time}</td>
                                    <td>{row.category}</td>
                                    <td>{row.subject}</td>
                                    <td>{row.question}</td>
                                    <td>{row.answer}</td>
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
