import { forwardRef } from "react";
import { NavLink } from "react-router-dom";
import { navbarLinks } from "@/constants";
import logoDark from "../assets/image 2.png";
import { cn } from "@/utils/cn";
import PropTypes from "prop-types";

export const Sidebar = forwardRef(({ collapsed }, ref) => {
    return (
        <aside
            ref={ref}
            className={cn(
                "fixed z-[100] flex h-full w-[240px] flex-col overflow-x-hidden border-r border-slate-300 bg-white transition-all duration-300 ease-in-out",
                collapsed ? "md:w-[70px] md:items-center" : "md:w-[240px]",
                collapsed ? "max-md:-left-full" : "max-md:left-0",
            )}
        >
            {/* Logo */}
            <div className="flex items-center justify-start gap-x-3 p-3">
                <img
                    src={logoDark}
                    alt="Logo"
              
                />
            </div>

            {/* Navigation */}
            <div className="flex w-full flex-col gap-y-4 overflow-y-auto p-3 scrollbar-thin scrollbar-thumb-slate-300 scrollbar-track-transparent">
                {navbarLinks.map((navbarLink) => (
                    <nav
                        key={navbarLink.title}
                        className={cn("flex flex-col gap-y-1", collapsed && "md:items-center")}
                    >
                        <p
                            className={cn(
                                "text-slate-600 text-sm font-semibold uppercase tracking-wide px-2",
                                collapsed && "md:w-[45px] text-center"
                            )}
                        >
                            {navbarLink.title}
                        </p>
                        {navbarLink.links.map((link) => (
                            <NavLink
                                key={link.label}
                                to={link.path}
                                className={({ isActive }) =>
                                    cn(
                                        "flex items-center gap-x-3 px-3 py-2 rounded-md text-slate-700 hover:bg-slate-100 transition-colors",
                                        collapsed && "md:w-[45px] justify-center",
                                        isActive && "text-[#3F8CFF] bg-[#EBF3FF]"
                                    )
                                }
                            >
                                <link.icon size={22} className="flex-shrink-0" />
                                {!collapsed && (
                                    <p className="whitespace-nowrap">{link.label}</p>
                                )}
                            </NavLink>
                        ))}
                    </nav>
                ))}
            </div>
        </aside>
    );
});

Sidebar.displayName = "Sidebar";

Sidebar.propTypes = {
    collapsed: PropTypes.bool,
};