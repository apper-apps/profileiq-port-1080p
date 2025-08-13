import React from "react";
import StatCard from "@/components/molecules/StatCard";

const DashboardStats = ({ stats }) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      <StatCard
        title="Active Questionnaires"
        value={stats?.activeQuestionnaires || 0}
        icon="FileText"
        change="+12%"
        changeType="increase"
        iconBg="bg-blue-100"
        iconColor="text-blue-600"
      />
      <StatCard
        title="Total Profiles"
        value={stats?.totalProfiles || 0}
        icon="Users"
        change="+8%"
        changeType="increase"
        iconBg="bg-purple-100"
        iconColor="text-purple-600"
      />
      <StatCard
        title="Responses This Month"
        value={stats?.monthlyResponses || 0}
        icon="BarChart3"
        change="+23%"
        changeType="increase"
        iconBg="bg-green-100"
        iconColor="text-green-600"
      />
      <StatCard
        title="Credits Remaining"
        value={stats?.creditsRemaining || 0}
        icon="Coins"
        change="-5%"
        changeType="decrease"
        iconBg="bg-orange-100"
        iconColor="text-orange-600"
      />
    </div>
  );
};

export default DashboardStats;