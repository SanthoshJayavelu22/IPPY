import { useTheme } from "@/hooks/use-theme";
import { ChevronsLeft, Moon, Sun, LogOut } from "lucide-react";
import { useLocation, useNavigate } from "react-router-dom";
import PropTypes from "prop-types";
import { navbarLinks } from "@/constants"; // Import navbarLinks here

export const Header = ({ collapsed, setCollapsed }) => {
    const { theme, setTheme } = useTheme();
    const navigate = useNavigate();
    const location = useLocation();

    const handleLogout = () => {
        localStorage.removeItem("successResponse");
        navigate("/");
    };

    // Derive page title from current path
    const currentPath = location.pathname;
    const allLinks = navbarLinks.flatMap(group => group.links);
    const currentLink = allLinks.find(link => link.path === currentPath);
    const pageTitle = currentLink?.label || "Billing Page";

    return (
        <header className="relative z-10 flex h-[60px] items-center justify-between bg-white px-4 shadow-md transition-colors">
            <div className="flex items-center gap-x-3">
                <button
                    className="btn-ghost size-10"
                    onClick={() => setCollapsed(!collapsed)}
                >
                    <ChevronsLeft className={collapsed ? "rotate-180" : ""} />
                </button>

                <h1 className="text-xl font-semibold text-gray-800">
                    {pageTitle}
                </h1>
            </div>

            <div className="flex items-center gap-x-3">
              
                <button
                    className="btn-ghost size-10"
                    onClick={handleLogout}
                >
                    <LogOut size={20} />
                </button>
            </div>
        </header>
    );
};

Header.propTypes = {
    collapsed: PropTypes.bool,
    setCollapsed: PropTypes.func,
};
