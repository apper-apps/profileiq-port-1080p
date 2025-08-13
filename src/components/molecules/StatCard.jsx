import React from "react";
import Card from "@/components/atoms/Card";
import ApperIcon from "@/components/ApperIcon";

const StatCard = ({ 
  title, 
  value, 
  icon, 
  change, 
  changeType = "increase",
  iconBg = "bg-primary-100",
  iconColor = "text-primary-600"
}) => {
  return (
    <Card className="p-6">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-medium text-gray-600 mb-1">{title}</p>
          <p className="text-2xl font-bold text-gray-900">{value}</p>
          {change && (
            <div className="flex items-center mt-2">
              <ApperIcon 
                name={changeType === "increase" ? "TrendingUp" : "TrendingDown"}
                size={16}
                className={changeType === "increase" ? "text-green-500" : "text-red-500"}
              />
              <span className={`ml-1 text-sm font-medium ${
                changeType === "increase" ? "text-green-600" : "text-red-600"
              }`}>
                {change}
              </span>
            </div>
          )}
        </div>
        <div className={`w-12 h-12 rounded-lg flex items-center justify-center ${iconBg}`}>
          <ApperIcon name={icon} size={24} className={iconColor} />
        </div>
      </div>
    </Card>
  );
};

export default StatCard;