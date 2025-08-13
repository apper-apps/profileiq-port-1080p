// Subscription service for managing user group subscriptions using subscription_c table
const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms));

export const subscriptionService = {
  async getAll() {
    try {
      await delay(300);
      
      const { ApperClient } = window.ApperSDK;
      const apperClient = new ApperClient({
        apperProjectId: import.meta.env.VITE_APPER_PROJECT_ID,
        apperPublicKey: import.meta.env.VITE_APPER_PUBLIC_KEY
      });

      const params = {
        fields: [
          {
            field: {
              Name: "Name"
            }
          },
          {
            field: {
              Name: "user_id_c"
            }
          },
          {
            field: {
              Name: "group_id_c"
            }
          },
          {
            field: {
              Name: "CreatedOn"
            }
          }
        ],
        orderBy: [
          {
            fieldName: "CreatedOn",
            sorttype: "DESC"
          }
        ]
      };

      const response = await apperClient.fetchRecords('subscription_c', params);
      
      if (!response.success) {
        console.error(response.message);
        return [];
      }

      return response.data || [];
    } catch (error) {
      if (error?.response?.data?.message) {
        console.error("Error fetching subscriptions:", error?.response?.data?.message);
      } else {
        console.error("Error fetching subscriptions:", error.message);
      }
      return [];
    }
  },

  async getById(id) {
    try {
      await delay(200);
      
      const { ApperClient } = window.ApperSDK;
      const apperClient = new ApperClient({
        apperProjectId: import.meta.env.VITE_APPER_PROJECT_ID,
        apperPublicKey: import.meta.env.VITE_APPER_PUBLIC_KEY
      });

      const params = {
        fields: [
          {
            field: {
              Name: "Name"
            }
          },
          {
            field: {
              Name: "user_id_c"
            }
          },
          {
            field: {
              Name: "group_id_c"
            }
          },
          {
            field: {
              Name: "CreatedOn"
            }
          }
        ]
      };

      const response = await apperClient.getRecordById('subscription_c', id, params);
      
      if (!response.success) {
        console.error(response.message);
        return null;
      }

      return response.data;
    } catch (error) {
      if (error?.response?.data?.message) {
        console.error(`Error fetching subscription with ID ${id}:`, error?.response?.data?.message);
      } else {
        console.error(`Error fetching subscription with ID ${id}:`, error.message);
      }
      return null;
    }
  },

  async getByGroupId(groupId) {
    try {
      await delay(300);
      
      const { ApperClient } = window.ApperSDK;
      const apperClient = new ApperClient({
        apperProjectId: import.meta.env.VITE_APPER_PROJECT_ID,
        apperPublicKey: import.meta.env.VITE_APPER_PUBLIC_KEY
      });

      const params = {
        fields: [
          {
            field: {
              Name: "Name"
            }
          },
          {
            field: {
              Name: "user_id_c"
            }
          },
          {
            field: {
              Name: "group_id_c"
            }
          },
          {
            field: {
              Name: "CreatedOn"
            }
          }
        ],
        where: [
          {
            FieldName: "group_id_c",
            Operator: "EqualTo",
            Values: [parseInt(groupId)]
          }
        ],
        orderBy: [
          {
            fieldName: "CreatedOn",
            sorttype: "DESC"
          }
        ]
      };

      const response = await apperClient.fetchRecords('subscription_c', params);
      
      if (!response.success) {
        console.error(response.message);
        return [];
      }

      return response.data || [];
    } catch (error) {
      if (error?.response?.data?.message) {
        console.error(`Error fetching subscriptions for group ${groupId}:`, error?.response?.data?.message);
      } else {
        console.error(`Error fetching subscriptions for group ${groupId}:`, error.message);
      }
      return [];
    }
  },

  async create(subscriptionData) {
    try {
      await delay(400);
      
      const { ApperClient } = window.ApperSDK;
      const apperClient = new ApperClient({
        apperProjectId: import.meta.env.VITE_APPER_PROJECT_ID,
        apperPublicKey: import.meta.env.VITE_APPER_PUBLIC_KEY
      });

      // Prepare data with only updateable fields
      const preparedData = {
        Name: subscriptionData.Name || `Subscription ${Date.now()}`,
        user_id_c: parseInt(subscriptionData.user_id_c),
        group_id_c: parseInt(subscriptionData.group_id_c)
      };

      const params = {
        records: [preparedData]
      };

      const response = await apperClient.createRecord('subscription_c', params);

      if (!response.success) {
        console.error(response.message);
        return null;
      }

      if (response.results) {
        const failedRecords = response.results.filter(result => !result.success);
        
        if (failedRecords.length > 0) {
          console.error(`Failed to create subscription ${failedRecords.length} records:${JSON.stringify(failedRecords)}`);
          return null;
        }

        const successfulRecords = response.results.filter(result => result.success);
        return successfulRecords.length > 0 ? successfulRecords[0].data : null;
      }

      return null;
    } catch (error) {
      if (error?.response?.data?.message) {
        console.error("Error creating subscription:", error?.response?.data?.message);
      } else {
        console.error("Error creating subscription:", error.message);
      }
      return null;
    }
  },

  async update(id, subscriptionData) {
    try {
      await delay(400);
      
      const { ApperClient } = window.ApperSDK;
      const apperClient = new ApperClient({
        apperProjectId: import.meta.env.VITE_APPER_PROJECT_ID,
        apperPublicKey: import.meta.env.VITE_APPER_PUBLIC_KEY
      });

      // Prepare data with only updateable fields
      const preparedData = {
        Id: parseInt(id),
        Name: subscriptionData.Name,
        user_id_c: parseInt(subscriptionData.user_id_c),
        group_id_c: parseInt(subscriptionData.group_id_c)
      };

      const params = {
        records: [preparedData]
      };

      const response = await apperClient.updateRecord('subscription_c', params);

      if (!response.success) {
        console.error(response.message);
        return null;
      }

      if (response.results) {
        const failedRecords = response.results.filter(result => !result.success);
        
        if (failedRecords.length > 0) {
          console.error(`Failed to update subscription ${failedRecords.length} records:${JSON.stringify(failedRecords)}`);
          return null;
        }

        const successfulRecords = response.results.filter(result => result.success);
        return successfulRecords.length > 0 ? successfulRecords[0].data : null;
      }

      return null;
    } catch (error) {
      if (error?.response?.data?.message) {
        console.error("Error updating subscription:", error?.response?.data?.message);
      } else {
        console.error("Error updating subscription:", error.message);
      }
      return null;
    }
  },

  async delete(id) {
    try {
      await delay(300);
      
      const { ApperClient } = window.ApperSDK;
      const apperClient = new ApperClient({
        apperProjectId: import.meta.env.VITE_APPER_PROJECT_ID,
        apperPublicKey: import.meta.env.VITE_APPER_PUBLIC_KEY
      });

      const params = {
        RecordIds: [parseInt(id)]
      };

      const response = await apperClient.deleteRecord('subscription_c', params);

      if (!response.success) {
        console.error(response.message);
        return false;
      }

      if (response.results) {
        const failedDeletions = response.results.filter(result => !result.success);
        
        if (failedDeletions.length > 0) {
          console.error(`Failed to delete subscription ${failedDeletions.length} records:${JSON.stringify(failedDeletions)}`);
          return false;
        }

        return response.results.filter(result => result.success).length > 0;
      }

      return false;
    } catch (error) {
      if (error?.response?.data?.message) {
        console.error("Error deleting subscription:", error?.response?.data?.message);
      } else {
        console.error("Error deleting subscription:", error.message);
      }
      return false;
    }
  }
};

export default subscriptionService;