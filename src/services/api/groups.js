// Groups service for managing groups using group_c table
const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms));

export const groupService = {
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
              Name: "description_c"
            }
          },
          {
            field: {
              Name: "Tags"
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

      const response = await apperClient.fetchRecords('group_c', params);
      
      if (!response.success) {
        console.error(response.message);
        return [];
      }

      return response.data || [];
    } catch (error) {
      if (error?.response?.data?.message) {
        console.error("Error fetching groups:", error?.response?.data?.message);
      } else {
        console.error("Error fetching groups:", error.message);
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
              Name: "description_c"
            }
          },
          {
            field: {
              Name: "Tags"
            }
          },
          {
            field: {
              Name: "CreatedOn"
            }
          }
        ]
      };

      const response = await apperClient.getRecordById('group_c', id, params);
      
      if (!response.success) {
        console.error(response.message);
        return null;
      }

      return response.data;
    } catch (error) {
      if (error?.response?.data?.message) {
        console.error(`Error fetching group with ID ${id}:`, error?.response?.data?.message);
      } else {
        console.error(`Error fetching group with ID ${id}:`, error.message);
      }
      return null;
    }
  },

  async create(groupData) {
    try {
      await delay(400);
      
      const { ApperClient } = window.ApperSDK;
      const apperClient = new ApperClient({
        apperProjectId: import.meta.env.VITE_APPER_PROJECT_ID,
        apperPublicKey: import.meta.env.VITE_APPER_PUBLIC_KEY
      });

      // Prepare data with only updateable fields
      const preparedData = {
        Name: groupData.Name,
        description_c: groupData.description_c || "",
        Tags: groupData.Tags || ""
      };

      const params = {
        records: [preparedData]
      };

      const response = await apperClient.createRecord('group_c', params);

      if (!response.success) {
        console.error(response.message);
        return null;
      }

      if (response.results) {
        const failedRecords = response.results.filter(result => !result.success);
        
        if (failedRecords.length > 0) {
          console.error(`Failed to create group ${failedRecords.length} records:${JSON.stringify(failedRecords)}`);
          return null;
        }

        const successfulRecords = response.results.filter(result => result.success);
        return successfulRecords.length > 0 ? successfulRecords[0].data : null;
      }

      return null;
    } catch (error) {
      if (error?.response?.data?.message) {
        console.error("Error creating group:", error?.response?.data?.message);
      } else {
        console.error("Error creating group:", error.message);
      }
      return null;
    }
  },

  async update(id, groupData) {
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
        Name: groupData.Name,
        description_c: groupData.description_c || "",
        Tags: groupData.Tags || ""
      };

      const params = {
        records: [preparedData]
      };

      const response = await apperClient.updateRecord('group_c', params);

      if (!response.success) {
        console.error(response.message);
        return null;
      }

      if (response.results) {
        const failedRecords = response.results.filter(result => !result.success);
        
        if (failedRecords.length > 0) {
          console.error(`Failed to update group ${failedRecords.length} records:${JSON.stringify(failedRecords)}`);
          return null;
        }

        const successfulRecords = response.results.filter(result => result.success);
        return successfulRecords.length > 0 ? successfulRecords[0].data : null;
      }

      return null;
    } catch (error) {
      if (error?.response?.data?.message) {
        console.error("Error updating group:", error?.response?.data?.message);
      } else {
        console.error("Error updating group:", error.message);
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

      const response = await apperClient.deleteRecord('group_c', params);

      if (!response.success) {
        console.error(response.message);
        return false;
      }

      if (response.results) {
        const failedDeletions = response.results.filter(result => !result.success);
        
        if (failedDeletions.length > 0) {
          console.error(`Failed to delete group ${failedDeletions.length} records:${JSON.stringify(failedDeletions)}`);
          return false;
        }

        return response.results.filter(result => result.success).length > 0;
      }

      return false;
    } catch (error) {
      if (error?.response?.data?.message) {
        console.error("Error deleting group:", error?.response?.data?.message);
      } else {
        console.error("Error deleting group:", error.message);
      }
      return false;
    }
  }
};

export default groupService;