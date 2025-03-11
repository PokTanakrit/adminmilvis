import React from "react";
import { Route, Navigate } from "react-router-dom";
import { useUser } from "./UserContext"; // ใช้ UserContext

// สร้าง PrivateRoute ให้รองรับ React Router v6
export const PrivateRoute = ({ element, ...rest }) => {
  const { username } = useUser(); // ตรวจสอบ username จาก Context

  // ถ้าไม่มี username จะ redirect ไปที่หน้า /login
  return username ? element : <Navigate to="/login" />;
};
