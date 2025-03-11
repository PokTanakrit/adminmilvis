import { createContext, useContext, useState, useEffect } from "react";

// สร้าง Context
const UserContext = createContext();

// สร้าง Provider สำหรับห่อ component หลัก
export const UserProvider = ({ children }) => {
    // โหลด username จาก localStorage ถ้ามี
    const [username, setUsername] = useState(localStorage.getItem("username") || "");

    // ฟังก์ชันอัปเดต username และบันทึกลง localStorage
    const updateUsername = (name) => {
        setUsername(name);
        localStorage.setItem("username", name);
    };

    return (
        <UserContext.Provider value={{ username, setUsername: updateUsername }}>
            {children}
        </UserContext.Provider>
    );
};

// สร้าง Hook เพื่อให้ใช้งานได้ง่าย
export const useUser = () => useContext(UserContext);
