import React from "react";
import { BrowserRouter as Router, Routes, Route, Navigate, useLocation } from "react-router-dom";
import Login from "./components/AdminLogin";
import History from "./components/History";
import Statistics from "./components/Statistics";
import ManageAdd from "./components/manage-add";
import ManageAddPDF from "./components/manage-add-pdf";
import ManageAddURL from "./components/manage-add-url";
import ManageAddText from "./components/manage-add-text";
import ManageEdit from "./components/manage-edit";
import ViewContent from "./components/view-content";

import AdminHistory from "./components/Adminhistory"
import SidebarMenu from "./components/SidebarMenu"; 
import { UserProvider } from "./components/UserContext"; 
import { PrivateRoute } from "./components/PrivateRoute"; 
import FileDownload from "./components/Filedowload";

const AppLayout = () => {
  const location = useLocation();  // ✅ ใช้ location เพื่อตรวจสอบเส้นทางปัจจุบัน
  const hideSidebar = location.pathname === "/login";  // ✅ เช็คตรงๆ ว่าเป็นหน้า login หรือไม่

  console.log("login")
  return (
    <div className="app-container">
      {!hideSidebar && <SidebarMenu />}  {/* ✅ แสดง Sidebar ทุกหน้ายกเว้น /login */}
      <Routes>
        <Route path="/" element={<Navigate to="/login" />} />
        <Route path="/login" element={<Login />} />
        <Route path="/history" element={<PrivateRoute element={<History />} />} />
        <Route path="/admin-history" element={<PrivateRoute element={<AdminHistory />} />} />
        <Route path="/statistics" element={<PrivateRoute element={<Statistics />} />} />
        <Route path="/manage-add" element={<PrivateRoute element={<ManageAdd />} />} />
        <Route path="/manage-add-pdf" element={<PrivateRoute element={<ManageAddPDF />} />} />
        <Route path="/manage-add-url" element={<PrivateRoute element={<ManageAddURL />} />} />
        <Route path="/manage-add-text" element={<PrivateRoute element={<ManageAddText />} />} />
        <Route path="/manage-edit" element={<PrivateRoute element={<ManageEdit />} />} />
        <Route path="/view-content" element={<PrivateRoute element={<ViewContent />} />} />
        <Route path="/templatefile" element={<PrivateRoute element={<FileDownload/>}/>}/>
      </Routes>
    </div>
  );
};

const App = () => {
  return (
    <UserProvider> {/* ✅ ครอบด้วย Context API */}
      <Router>
        <AppLayout /> {/* ✅ ใช้ Layout ที่ซ่อน Sidebar เฉพาะหน้า login */}
      </Router>
    </UserProvider>
  );
};

export default App;
