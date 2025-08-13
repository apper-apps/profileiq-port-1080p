import React from "react";
import ApperIcon from "@/components/ApperIcon";

const Empty = ({ 
  title = "No data available", 
  description = "Get started by creating your first item.",
  action,
  actionText = "Get Started",
  icon = "Inbox",
  className = "" 
}) => {
  return (
    <div className={`flex flex-col items-center justify-center p-12 text-center ${className}`}>
      <div className="w-16 h-16 bg-gradient-primary bg-opacity-10 rounded-full flex items-center justify-center mb-4">
        <ApperIcon name={icon} size={32} className="text-primary-500" />
      </div>
      <h3 className="text-lg font-semibold text-gray-900 mb-2">{title}</h3>
      <p className="text-gray-600 mb-6 max-w-md">{description}</p>
      {action && (
        <button
          onClick={action}
          className="bg-gradient-primary text-white px-6 py-3 rounded-lg font-medium hover:opacity-90 transition-opacity flex items-center space-x-2"
        >
          <ApperIcon name="Plus" size={20} />
          <span>{actionText}</span>
        </button>
      )}
    </div>
  );
};

export default Empty;