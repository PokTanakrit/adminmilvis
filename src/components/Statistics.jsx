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

    const fetchWeeklyData = (offset) => {
        fetch(`http://127.0.0.1:5000/api/weekly-data?offset=${offset}`)
            .then((response) => response.json())
            .then((data) => {
                const todayIndex = new Date().getDay();
                setWeeklyData({
                    labels: ["M", "T", "W", "T", "F", "S", "S"],
                    datasets: [
                        {
                            label: "จำนวนการใช้งาน",
                            data: data.weekly_data,
                            backgroundColor: data.weekly_data.map((_, index) => index === todayIndex - 1 ? "#F97316" : "#3B82F6"),
                            borderRadius: 5,
                        },
                    ],
                });
                setDateRange({ start_date: data.start_date, end_date: data.end_date });
            })
            .catch((error) => console.error("Error fetching weekly data:", error));
    };

    useEffect(() => {
        fetchWeeklyData(weekOffset);
    }, [weekOffset]);

    const weeklyOptions = {
        plugins: {
            legend: { display: false },
            datalabels: {
                color: "#FFFFF", // เปลี่ยนสีตัวเลขเป็นสีส้ม
                font: { size: 14, weight: "bold" },
            },
        },
        scales: {
            x: { grid: { display: false } },
            y: { ticks: { stepSize: 10 } },
        },
    };

    const monthlyData = {
        labels: ["course_information", "location", "department_faculty", "News"],
        datasets: [
            {
                data: [40, 20, 20, 20],
                backgroundColor: ["#F59E0B", "#EF4444", "#3B82F6", "#EAB308"],
            },
        ],
    };

    const monthlyOptions = {
        plugins: {
            legend: { position: "right" },
            datalabels: {
                color: "#000",
                font: { size: 14, weight: "bold" },
                formatter: (value) => `${value}%`,
            },
        },
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
                        <h2>Jan 2024</h2>
                        <Doughnut data={monthlyData} options={monthlyOptions} />
                        <p>สัดส่วนของข้อมูลในเดือน ม.ค.</p>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Statistics;
