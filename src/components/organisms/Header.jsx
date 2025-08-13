import React from "react";
import Button from "@/components/atoms/Button";
import ApperIcon from "@/components/ApperIcon";

const Header = ({ onMenuClick, title, subtitle, action, actionText, actionIcon = "Plus" }) => {
  return (
    <div className="bg-white border-b border-gray-200 px-4 sm:px-6 lg:px-8">
      <div className="flex items-center justify-between h-16">
        <div className="flex items-center">
          <Button
            variant="ghost"
            size="sm"
            icon="Menu"
            onClick={onMenuClick}
            className="lg:hidden -ml-2"
          />
          <div className="ml-4 lg:ml-0">
            <h1 className="text-xl font-semibold text-gray-900">{title}</h1>
            {subtitle && (
              <p className="text-sm text-gray-500">{subtitle}</p>
            )}
          </div>
        </div>

        {action && (
          <Button
            onClick={action}
            icon={actionIcon}
            className="bg-gradient-primary"
          >
            {actionText}
          </Button>
        )}
      </div>
    </div>
  );
};

export default Header;