import React, { useState, useEffect } from "react";
import { Bar, Doughnut } from "react-chartjs-2";
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, ArcElement, Tooltip, Legend } from "chart.js";
import ChartDataLabels from "chartjs-plugin-datalabels";
import { useLocation } from "react-router-dom";
import SidebarMenu from "./SidebarMenu";
import "./Statistics.css";

ChartJS.register(CategoryScale, LinearScale, BarElement, ArcElement, Tooltip, Legend, ChartDataLabels);

const Statistics = () => {
    const location = useLocation();
    const username = location.state?.username || "Guest";
    const [weeklyData, setWeeklyData] = useState({ labels: ["M", "T", "W", "T", "F", "S", "S"], datasets: [] });
    const [dateRange, setDateRange] = useState({ start_date: "", end_date: "" });
    const [weekOffset, setWeekOffset] = useState(0);
    const [monthOffset, setMonthOffset] = useState(0); // ✅ เพิ่มตัวแปรนี้
    console.log(monthOffset)
    const [monthlyData, setMonthlyData] = useState({
        labels: [],
        datasets: [
            {
                data: [0,0,0,0,0],
                backgroundColor: ["#59f50b", "#EF4444", "#3B82F6", "#EAB308", "#10B981", "#8B5CF6"],
            },
        ],
    });

    useEffect(() => {
        fetchWeeklyData(weekOffset);
    }, [weekOffset]);

    useEffect(() => {
        console.log("Fetching monthly data for offset:", monthOffset);
        fetchSubjectsAndMonthlyData(monthOffset);
    }, [monthOffset]); 
    

    const fetchSubjectsAndMonthlyData = async (offset) => {
        try {
            const subjectsResponse = await fetch("https://5b17-202-44-40-186.ngrok-free.app/api/subjects", {
                headers: { "ngrok-skip-browser-warning": "true" }
            });
            const subjectsData = await subjectsResponse.json();
            const subjectMap = subjectsData.reduce((acc, item) => {
                acc[item.subject_id] = item.subject_name;
                return acc;
            }, {});
    
            // ✅ ส่งค่า offset ไป API อย่างถูกต้อง
            const monthlyResponse = await fetch(`https://5b17-202-44-40-186.ngrok-free.app/api/monthly-data?offset=${offset}`, {
                headers: { "ngrok-skip-browser-warning": "true" }
            });
            const monthlyDataRaw = await monthlyResponse.json();
            console.log("Raw API Response:", monthlyDataRaw); // ✅ Debug ดูค่าที่ได้
    
            if (!monthlyDataRaw.datasets || !monthlyDataRaw.labels) {
                throw new Error("API monthly-data คืนค่าผิดโครงสร้าง");
            }
    
            const labels = monthlyDataRaw.labels.map(subject_id => subjectMap[subject_id] || `รหัส ${subject_id}`);
            const data = monthlyDataRaw.datasets[0].data;
    
            // ✅ เช็กว่าไม่มีข้อมูล
            const isAllZero = data.every(value => value === 0);
            if (isAllZero || data.length === 0) {
                setMonthlyData(null); // ❌ ไม่เซ็ตค่า Doughnut ถ้าไม่มีข้อมูล
                return;
            }
    
            setMonthlyData({
                labels,
                datasets: [
                    {
                        data,
                        backgroundColor: ["#59f50b", "#EF4444", "#3B82F6", "#EAB308", "#10B981", "#8B5CF6"], 
                    }
                ]
            });
    
        } catch (error) {
            console.error("Error fetching data:", error);
        }
    };
    
    
    

    const fetchWeeklyData = (offset) => {
        fetch(`https://5b17-202-44-40-186.ngrok-free.app/api/weekly-data?offset=${offset}`, {
            headers: { "ngrok-skip-browser-warning": "true" }
        })
        .then((response) => response.json())
        .then((data) => {
            const todayIndex = new Date().getDay();
            setWeeklyData({
                labels: ["M", "T", "W", "T", "F", "S", "S"],
                datasets: [
                    {
                        label: "จำนวนการใช้งาน",
                        data: data.weekly_data || [],
                        backgroundColor: (data.weekly_data || []).map((_, index) => 
                            index === todayIndex - 1 ? "#F97316" : "#3B82F6"
                        ),
                        borderRadius: 5,
                    },
                ],
            });
            setDateRange({ start_date: data.start_date, end_date: data.end_date });
        })
        .catch((error) => console.error("Error fetching weekly data:", error));
    };

    const weeklyOptions = {
        plugins: {
            legend: { display: false },
            datalabels: {
                color: "#FFFFF",
                font: { size: 14, weight: "bold" },
            },
        },
        scales: {
            x: { grid: { display: false } },
            y: { ticks: { stepSize: 10 } },
        },
    };

    const monthlyOptions = {
        plugins: {
            legend: { position: "right" },
            datalabels: {
                color: "#000",
                font: { size: 14, weight: "bold" },
                formatter: (value) => `${value}`,
            },
        },
    };

    const getCurrentMonth = () => {
        const now = new Date();
        now.setMonth(now.getMonth() + monthOffset);
        return now.toLocaleString("default", { month: "long", year: "numeric" });
    };

    return (
        <div className="statistics-page">
            <SidebarMenu username={username} className="sidebar-menu" />
            <div className="statistics-container">
                <div className="charts-container">
                    <div className="chart-box">
                        <div className="chart-controls">
                            <button className="chart-control-button" onClick={() => setWeekOffset(weekOffset - 1)}>{"<"}</button>
                            <button className="chart-control-button" onClick={() => setWeekOffset(weekOffset + 1)}>{">"}</button>
                        </div>
                        <h2>Weekly Overview</h2>
                        <p>{dateRange.start_date} - {dateRange.end_date}</p>
                        <Bar data={weeklyData} options={weeklyOptions} />
                        <p>จำนวนการใช้งานใน 1 สัปดาห์</p>
                    </div>
                    <div className="chart-box">
                        <div className="chart-controls">
                            <button className="chart-control-button" onClick={() => setMonthOffset(monthOffset - 1)}>{"<"}</button>
                            <button className="chart-control-button" onClick={() => setMonthOffset(monthOffset + 1)}>{">"}</button>
                        </div>
                        {/* ✅ ซ่อน Doughnut ถ้าไม่มีข้อมูล */}
                        <h2>{getCurrentMonth()}</h2>
                        {monthlyData ? (
                            <Doughnut data={monthlyData} options={monthlyOptions} />
                        ) : (
                            <p style={{ textAlign: "center", fontSize: "18px", color: "#6b7280" }}>
                                ไม่มีข้อมูลสำหรับเดือนนี้
                            </p>
                        )}
                        <p>สัดส่วนของข้อมูลใน {getCurrentMonth()}</p>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Statistics;
