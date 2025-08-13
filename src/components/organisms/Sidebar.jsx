import React from "react";
import { NavLink, useLocation } from "react-router-dom";
import ApperIcon from "@/components/ApperIcon";

const Sidebar = ({ isOpen, onClose }) => {
  const location = useLocation();
  
  const navigation = [
    { name: "Dashboard", href: "/", icon: "LayoutDashboard" },
    { name: "Questionnaires", href: "/questionnaires", icon: "FileText" },
    { name: "Profiles", href: "/profiles", icon: "Users" },
    { name: "Chatbot", href: "/chatbot", icon: "MessageCircle" },
    { name: "Clients", href: "/clients", icon: "Building2" },
    { name: "Credits", href: "/credits", icon: "Coins" },
  ];

  const SidebarContent = () => (
    <div className="flex flex-col h-full">
      {/* Logo */}
      <div className="px-6 py-6">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 bg-gradient-primary rounded-lg flex items-center justify-center">
            <ApperIcon name="Brain" size={24} className="text-white" />
          </div>
          <div>
<h1 className="text-xl font-bold text-gray-900">Talent Scanner</h1>
            <p className="text-xs text-gray-500">Analisi Comportamentale</p>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-4 pb-4 space-y-1">
        {navigation.map((item) => (
          <NavLink
            key={item.name}
            to={item.href}
            className={({ isActive }) =>
              `flex items-center px-3 py-2.5 text-sm font-medium rounded-lg transition-colors group ${
                isActive
                  ? "bg-gradient-primary text-white"
                  : "text-gray-700 hover:text-gray-900 hover:bg-gray-100"
              }`
            }
            onClick={() => onClose?.()}
          >
            <ApperIcon 
              name={item.icon} 
              size={20} 
              className="mr-3 flex-shrink-0" 
            />
            {item.name}
          </NavLink>
        ))}
      </nav>
    </div>
  );

  return (
    <>
      {/* Desktop Sidebar */}
      <div className="hidden lg:block fixed inset-y-0 left-0 w-64 bg-white border-r border-gray-200">
        <SidebarContent />
      </div>

      {/* Mobile Sidebar */}
      <div className={`lg:hidden fixed inset-0 z-50 ${isOpen ? "" : "pointer-events-none"}`}>
        {/* Backdrop */}
        <div
          className={`fixed inset-0 bg-gray-600 transition-opacity ${
            isOpen ? "opacity-50" : "opacity-0"
          }`}
          onClick={onClose}
        />

        {/* Sidebar */}
        <div
          className={`fixed inset-y-0 left-0 w-64 bg-white shadow-xl transition-transform ${
            isOpen ? "translate-x-0" : "-translate-x-full"
          }`}
        >
          <div className="absolute top-0 right-0 -mr-12 pt-2">
            <button
              type="button"
              className="ml-1 flex items-center justify-center h-10 w-10 rounded-full focus:outline-none focus:ring-2 focus:ring-inset focus:ring-white"
              onClick={onClose}
            >
              <ApperIcon name="X" size={24} className="text-white" />
            </button>
          </div>
          <SidebarContent />
        </div>
      </div>
    </>
  );
};

export default Sidebar;