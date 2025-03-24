import React, { useState, useEffect, useCallback } from "react";
import "./Adminhistory.css";
import SidebarMenu from "./SidebarMenu";

const AdminHistory = () => {
    const [logs, setLogs] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    const fetchLogs = useCallback(async () => {
        setLoading(true);
        setError(null);
        try {
            const response = await fetch("https://5b17-202-44-40-186.ngrok-free.app/api/logs",{
                headers: {
                    "ngrok-skip-browser-warning": "true"
                }});
            if (!response.ok) {
                throw new Error(`HTTP error! Status: ${response.status}`);
            }
            let data = await response.json();
    
            // ตัด "GMT" ออกจาก log_date ทุกตัว
            data = data.map(log => ({
                ...log,
                log_date: log.log_date.replace(/ GMT.*/, "") // ตัดตั้งแต่ " GMT" จนจบ
            }));
    
            setLogs(data);
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    }, []);
    

    useEffect(() => {
        fetchLogs();
    }, [fetchLogs]);
    
    return (
        <div className="admin-historypage">
            <SidebarMenu />
            <div className="admin-historycontent">
                <h2>ประวัติการใช้งาน</h2>

                {loading && <p className="loading">กำลังโหลดข้อมูล...</p>}
                {error && <p className="error">เกิดข้อผิดพลาด: {error}</p>}
                
                {!loading && !error && logs.length === 0 && (
                    <p className="no-history">ไม่มีประวัติการใช้งาน</p>
                )}

                {!loading && !error && logs.length > 0 && (
                    <table>
                        <thead>
                            <tr>
                                <th>Log id</th>
                                <th>วันเวลา</th>
                                <th>Method</th>
                                <th>รายละเอียด</th>
                                <th>Admin ID</th>
                            </tr>
                        </thead>
                        <tbody>
                            {logs.map((log) => (
                                <tr key={log.log_id}>
                                    <td>{log.log_id}</td>
                                    <td>{log.log_date}</td> {/* แสดงผลตรง ๆ */}
                                    <td>{log.log_method}</td>
                                    <td>{log.log_detail}</td>
                                    <td>{log.admin_id}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                )}
            </div>
        </div>
    );
};

export default AdminHistory;
