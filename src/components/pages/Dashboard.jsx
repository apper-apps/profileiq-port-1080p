import React, { useState, useEffect } from "react";
import DashboardStats from "@/components/organisms/DashboardStats";
import Card from "@/components/atoms/Card";
import Button from "@/components/atoms/Button";
import Loading from "@/components/ui/Loading";
import Error from "@/components/ui/Error";
import ApperIcon from "@/components/ApperIcon";
import { dashboardService } from "@/services/api/dashboard";
import { format } from "date-fns";

const Dashboard = () => {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    loadStats();
  }, []);

  const loadStats = async () => {
    try {
      setLoading(true);
      setError("");
      const data = await dashboardService.getStats();
      setStats(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <Loading />;
  if (error) return <Error message={error} onRetry={loadStats} />;

  const getActivityIcon = (type) => {
    switch (type) {
      case "questionnaire_created": return "FileText";
      case "profile_identified": return "Users";
      case "credit_purchase": return "Coins";
      default: return "Activity";
    }
  };

  const getActivityColor = (type) => {
    switch (type) {
      case "questionnaire_created": return "text-blue-600 bg-blue-100";
      case "profile_identified": return "text-purple-600 bg-purple-100";
      case "credit_purchase": return "text-green-600 bg-green-100";
      default: return "text-gray-600 bg-gray-100";
    }
  };

  return (
    <div className="space-y-6">
      {/* Welcome Header */}
      <div className="bg-gradient-primary rounded-xl p-6 text-white">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold mb-2">Welcome back!</h1>
            <p className="text-purple-100">
              Manage your behavioral assessment platform from here
            </p>
          </div>
          <div className="hidden md:block">
            <ApperIcon name="BarChart3" size={48} className="text-purple-200" />
          </div>
        </div>
      </div>

      {/* Stats Grid */}
      <DashboardStats stats={stats} />

      {/* Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Activity */}
        <Card className="p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900">Recent Activity</h3>
            <Button variant="ghost" size="sm" icon="MoreHorizontal" />
          </div>
          
          <div className="space-y-4">
            {stats?.recentActivity?.map((activity) => (
              <div key={activity.Id} className="flex items-start space-x-3">
                <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${getActivityColor(activity.type)}`}>
                  <ApperIcon name={getActivityIcon(activity.type)} size={16} />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-900 truncate">
                    {activity.title}
                  </p>
                  <p className="text-xs text-gray-500">
                    {format(new Date(activity.timestamp), "MMM d, yyyy 'at' h:mm a")}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </Card>

        {/* Credit Usage Chart */}
        <Card className="p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900">Credit Usage</h3>
            <Button variant="ghost" size="sm" icon="TrendingUp" />
          </div>
          
          <div className="space-y-4">
            {stats?.creditUsage?.slice(-6).map((month, index) => (
              <div key={index} className="flex items-center justify-between">
                <span className="text-sm font-medium text-gray-600 w-12">
                  {month.month}
                </span>
                <div className="flex-1 mx-4">
                  <div className="flex items-center space-x-2">
                    <div className="flex-1 bg-gray-200 rounded-full h-2">
                      <div
                        className="bg-gradient-primary h-2 rounded-full transition-all duration-300"
                        style={{ width: `${Math.min((month.used / 300) * 100, 100)}%` }}
                      />
                    </div>
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-sm font-medium text-gray-900">
                    {month.used}
                  </div>
                  <div className="text-xs text-gray-500">
                    +{month.purchased}
                  </div>
                </div>
              </div>
            ))}
          </div>
          
          <div className="mt-4 pt-4 border-t">
            <div className="flex items-center justify-between text-sm">
              <span className="text-gray-600">This month</span>
              <span className="font-medium text-gray-900">
                {stats?.creditsRemaining} credits remaining
              </span>
            </div>
          </div>
        </Card>
      </div>

      {/* Quick Actions */}
      <Card className="p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h3>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="flex items-center space-x-3 p-4 border border-gray-200 rounded-lg hover:border-primary-300 transition-colors">
            <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
              <ApperIcon name="FileText" size={24} className="text-blue-600" />
            </div>
            <div>
              <h4 className="font-medium text-gray-900">Create Questionnaire</h4>
              <p className="text-sm text-gray-500">Build new assessment</p>
            </div>
          </div>
          
          <div className="flex items-center space-x-3 p-4 border border-gray-200 rounded-lg hover:border-primary-300 transition-colors">
            <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
              <ApperIcon name="Users" size={24} className="text-purple-600" />
            </div>
            <div>
              <h4 className="font-medium text-gray-900">Add Profile</h4>
              <p className="text-sm text-gray-500">Define new behavior type</p>
            </div>
          </div>
          
          <div className="flex items-center space-x-3 p-4 border border-gray-200 rounded-lg hover:border-primary-300 transition-colors">
            <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
              <ApperIcon name="MessageCircle" size={24} className="text-green-600" />
            </div>
            <div>
              <h4 className="font-medium text-gray-900">Configure Chatbot</h4>
              <p className="text-sm text-gray-500">Set up AI responses</p>
            </div>
          </div>
        </div>
      </Card>
    </div>
  );
};

export default Dashboard;