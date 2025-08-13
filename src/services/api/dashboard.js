class DashboardService {
  async getStats() {
    await new Promise(resolve => setTimeout(resolve, 400));
    
    // Mock dashboard statistics
    return {
      activeQuestionnaires: 12,
      totalProfiles: 8,
      monthlyResponses: 247,
      creditsRemaining: 1850,
      recentActivity: [
        {
          Id: 1,
          type: "questionnaire_created",
          title: "Leadership Assessment v2.0",
          timestamp: "2024-01-15T10:30:00Z",
          user: "Admin"
        },
        {
          Id: 2,
          type: "profile_identified",
          title: "Toxic Leader profile detected",
          timestamp: "2024-01-15T09:15:00Z",
          user: "System"
        },
        {
          Id: 3,
          type: "credit_purchase",
          title: "500 credits added to account",
          timestamp: "2024-01-14T16:45:00Z",
          user: "Billing"
        }
      ],
      creditUsage: [
        { month: "Dec", used: 180, purchased: 500 },
        { month: "Jan", used: 220, purchased: 0 },
        { month: "Feb", used: 195, purchased: 300 },
        { month: "Mar", used: 240, purchased: 0 },
        { month: "Apr", used: 180, purchased: 250 },
        { month: "May", used: 200, purchased: 0 }
      ]
    };
  }
}

export const dashboardService = new DashboardService();