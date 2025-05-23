// routes/ProtectedRoute.jsx
import { Navigate, Outlet } from "react-router-dom";

const ProtectedRoute = () => {
    const res = localStorage.getItem("successResponse");
    return res ? <Outlet /> : <Navigate to="/" replace />;
};

export default ProtectedRoute;
