class DashboardService {
  constructor() {
    this.apperClient = null;
    this.initializeApperClient();
  }

  initializeApperClient() {
    if (typeof window !== 'undefined' && window.ApperSDK) {
      const { ApperClient } = window.ApperSDK;
      this.apperClient = new ApperClient({
        apperProjectId: import.meta.env.VITE_APPER_PROJECT_ID,
        apperPublicKey: import.meta.env.VITE_APPER_PUBLIC_KEY
      });
    }
  }

  async getStats() {
    try {
      if (!this.apperClient) this.initializeApperClient();

      // Get counts from different tables
      const [questionnaires, profiles, usage, clients] = await Promise.all([
        this.getQuestionnaireStats(),
        this.getProfileStats(), 
        this.getUsageStats(),
        this.getClientStats()
      ]);

      const totalCredits = clients.reduce((sum, client) => sum + (client.credits_c || 0), 0);
      const monthlyUsage = usage.filter(u => {
        const usageDate = new Date(u.timestamp_c);
        const now = new Date();
        return usageDate.getMonth() === now.getMonth() && 
               usageDate.getFullYear() === now.getFullYear() &&
               u.amount_c < 0;
      }).length;

      return {
        activeQuestionnaires: questionnaires.filter(q => q.is_active_c).length,
        totalProfiles: profiles.length,
        monthlyResponses: monthlyUsage,
        creditsRemaining: totalCredits,
        recentActivity: this.formatRecentActivity(usage.slice(0, 5)),
        creditUsage: this.calculateCreditUsage(usage, clients)
      };
    } catch (error) {
      console.error("Error fetching dashboard stats:", error.message);
      // Return default values on error
      return {
        activeQuestionnaires: 0,
        totalProfiles: 0,
        monthlyResponses: 0,
        creditsRemaining: 0,
        recentActivity: [],
        creditUsage: []
      };
    }
  }

  async getQuestionnaireStats() {
    try {
      const params = {
        fields: [
          { field: { Name: "is_active_c" } }
        ]
      };

      const response = await this.apperClient.fetchRecords('questionnaire_c', params);
      return response.success ? response.data : [];
    } catch (error) {
      return [];
    }
  }

  async getProfileStats() {
    try {
      const params = {
        fields: [
          { field: { Name: "Name" } }
        ]
      };

      const response = await this.apperClient.fetchRecords('profile_c', params);
      return response.success ? response.data : [];
    } catch (error) {
      return [];
    }
  }

  async getUsageStats() {
    try {
      const params = {
        fields: [
          { field: { Name: "type_c" } },
          { field: { Name: "amount_c" } },
          { field: { Name: "candidate_name_c" } },
          { field: { Name: "profile_detected_c" } },
          { field: { Name: "reason_c" } },
          { field: { Name: "timestamp_c" } }
        ],
        orderBy: [
          {
            fieldName: "timestamp_c",
            sorttype: "DESC"
          }
        ]
      };

      const response = await this.apperClient.fetchRecords('usage_c', params);
      return response.success ? response.data : [];
    } catch (error) {
      return [];
    }
  }

  async getClientStats() {
    try {
      const params = {
        fields: [
          { field: { Name: "credits_c" } }
        ]
      };

      const response = await this.apperClient.fetchRecords('client_c', params);
      return response.success ? response.data : [];
    } catch (error) {
      return [];
    }
  }

  formatRecentActivity(usageData) {
    return usageData.map((usage, index) => {
      let title = "Unknown activity";
      let type = "unknown";

      switch (usage.type_c) {
        case "questionnaire_analyzed":
          title = `Analysis for ${usage.candidate_name_c} - ${usage.profile_detected_c}`;
          type = "questionnaire_created";
          break;
        case "credit_purchase":
        case "credit_added":
          title = `Credits ${usage.amount_c > 0 ? 'added' : 'used'}: ${Math.abs(usage.amount_c)}`;
          type = "credit_purchase";
          break;
        default:
          title = usage.reason_c || "System activity";
          type = "profile_identified";
      }

      return {
        Id: usage.Id || index + 1,
        type: type,
        title: title,
        timestamp: usage.timestamp_c,
        user: "System"
      };
    });
  }

  calculateCreditUsage(usageData, clients) {
    const monthlyData = {};
    
    // Initialize last 6 months
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    const now = new Date();
    
    for (let i = 5; i >= 0; i--) {
      const date = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const monthKey = months[date.getMonth()];
      monthlyData[monthKey] = { month: monthKey, used: 0, purchased: 0 };
    }

    // Process usage data
    usageData.forEach(usage => {
      const usageDate = new Date(usage.timestamp_c);
      const monthKey = months[usageDate.getMonth()];
      
      if (monthlyData[monthKey]) {
        if (usage.amount_c > 0) {
          monthlyData[monthKey].purchased += usage.amount_c;
        } else {
          monthlyData[monthKey].used += Math.abs(usage.amount_c);
        }
      }
    });

    return Object.values(monthlyData);
  }
}

export const dashboardService = new DashboardService();
export const dashboardService = new DashboardService();