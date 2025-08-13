class ProfilesService {
  constructor() {
    this.tableName = 'profile_c';
    this.rulesTableName = 'rule_c';
    this.apperClient = null;
    this.initializeApperClient();
  }

initializeApperClient() {
    if (typeof window !== 'undefined' && window.ApperSDK) {
      try {
        const { ApperClient } = window.ApperSDK;
        this.apperClient = new ApperClient({
          apperProjectId: import.meta.env.VITE_APPER_PROJECT_ID,
          apperPublicKey: import.meta.env.VITE_APPER_PUBLIC_KEY
        });
        return true;
      } catch (error) {
        console.error("Failed to initialize ApperClient:", error);
        return false;
      }
    }
    return false;
  }

  async getAll() {
    try {
if (!this.apperClient) {
        const initialized = this.initializeApperClient();
        if (!initialized) {
          throw new Error("ApperSDK not available. Please ensure the application is properly loaded.");
        }
      }

      const params = {
        fields: [
          { field: { Name: "Name" } },
{ field: { Name: "category_c" } },
          { field: { Name: "description_c" } },
          { field: { Name: "created_at_c" } },
          { field: { Name: "role_c" } },
          { field: { Name: "CreatedOn" } }
        ]
      };

      const response = await this.apperClient.fetchRecords(this.tableName, params);

      if (!response.success) {
        console.error(response.message);
        throw new Error(response.message);
      }

      // Get rules for each profile
const profilesWithRules = await Promise.all(response.data.map(async (profile) => {
        const rules = await this.getRulesByProfile(profile.Id);
        return {
          ...profile,
          category: profile.category_c,
          description: profile.description_c,
          createdAt: profile.created_at_c || profile.CreatedOn,
          role: profile.role_c,
          rules: rules
        };
      }));

      return profilesWithRules;
    } catch (error) {
      console.error("Error fetching profiles:", error.message);
      throw error;
    }
  }

  async getRulesByProfile(profileId) {
    try {
if (!this.apperClient) {
        const initialized = this.initializeApperClient();
        if (!initialized) {
          throw new Error("ApperSDK not available. Please ensure the application is properly loaded.");
        }
      }

      const params = {
        fields: [
          { field: { Name: "competency_c" } },
          { field: { Name: "operator_c" } },
          { field: { Name: "value_c" } },
          { field: { Name: "logic_c" } }
        ],
        where: [
          {
            FieldName: "profile_id_c",
            Operator: "EqualTo",
            Values: [profileId.toString()]
          }
        ]
      };

      const response = await this.apperClient.fetchRecords(this.rulesTableName, params);

      if (!response.success) {
        return [];
      }

      return response.data.map(rule => ({
        competency: rule.competency_c,
        operator: rule.operator_c,
        value: rule.value_c,
        logic: rule.logic_c
      }));
    } catch (error) {
      console.error("Error fetching rules:", error.message);
      return [];
    }
  }

  async getById(id) {
    try {
      if (!this.apperClient) this.initializeApperClient();

      const params = {
        fields: [
{ field: { Name: "Name" } },
          { field: { Name: "category_c" } },
          { field: { Name: "description_c" } },
          { field: { Name: "created_at_c" } },
          { field: { Name: "role_c" } }
        ]
      };

      const response = await this.apperClient.getRecordById(this.tableName, id, params);

      if (!response.success) {
        console.error(response.message);
        throw new Error(response.message);
      }

      const rules = await this.getRulesByProfile(id);

      return {
        ...response.data,
category: response.data.category_c,
        description: response.data.description_c,
        createdAt: response.data.created_at_c,
        role: response.data.role_c,
        rules: rules
      };
    } catch (error) {
      console.error(`Error fetching profile with ID ${id}:`, error.message);
      throw error;
    }
  }

  async create(profile) {
    try {
if (!this.apperClient) {
        const initialized = this.initializeApperClient();
        if (!initialized) {
          throw new Error("ApperSDK not available. Please ensure the application is properly loaded.");
        }
      }

      const params = {
        records: [
          {
Name: profile.name,
            category_c: profile.category,
            description_c: profile.description,
            created_at_c: new Date().toISOString(),
            role_c: profile.role
          }
        ]
      };

      const response = await this.apperClient.createRecord(this.tableName, params);

      if (!response.success) {
        console.error(response.message);
        throw new Error(response.message);
      }

      if (response.results) {
        const successfulRecords = response.results.filter(result => result.success);
        const failedRecords = response.results.filter(result => !result.success);

        if (failedRecords.length > 0) {
          console.error(`Failed to create profiles ${failedRecords.length} records:${JSON.stringify(failedRecords)}`);
          failedRecords.forEach(record => {
            record.errors?.forEach(error => {
              console.error(`${error.fieldLabel}: ${error.message}`);
            });
          });
        }

        if (successfulRecords.length > 0) {
          const createdProfile = successfulRecords[0].data;
          const profileId = createdProfile.Id;

          // Create rules if provided
          if (profile.rules && profile.rules.length > 0) {
            await this.createRules(profileId, profile.rules);
          }

          return {
            ...createdProfile,
category: createdProfile.category_c,
            description: createdProfile.description_c,
            createdAt: createdProfile.created_at_c,
            role: createdProfile.role_c,
            rules: profile.rules || []
          };
        }
      }

      throw new Error("Failed to create profile");
    } catch (error) {
      console.error("Error creating profile:", error.message);
      throw error;
    }
  }

  async createRules(profileId, rules) {
    try {
      const ruleRecords = rules.map(rule => ({
        Name: `Rule for ${rule.competency}`,
        competency_c: rule.competency,
        operator_c: rule.operator,
        value_c: rule.value,
        logic_c: rule.logic,
        profile_id_c: profileId
      }));

      const params = {
        records: ruleRecords
      };

      await this.apperClient.createRecord(this.rulesTableName, params);
    } catch (error) {
      console.error("Error creating rules:", error.message);
    }
  }

  async update(id, profile) {
    try {
if (!this.apperClient) {
        const initialized = this.initializeApperClient();
        if (!initialized) {
          throw new Error("ApperSDK not available. Please ensure the application is properly loaded.");
        }
      }

      const params = {
        records: [
          {
            Id: id,
Name: profile.name,
            category_c: profile.category,
            description_c: profile.description,
            role_c: profile.role
          }
        ]
      };

      const response = await this.apperClient.updateRecord(this.tableName, params);

      if (!response.success) {
        console.error(response.message);
        throw new Error(response.message);
      }

      // Update rules if provided
      if (profile.rules) {
        await this.updateRules(id, profile.rules);
      }

      return await this.getById(id);
    } catch (error) {
      console.error("Error updating profile:", error.message);
      throw error;
    }
  }

  async updateRules(profileId, rules) {
    try {
      // Delete existing rules
      await this.deleteRulesByProfile(profileId);

      // Create new rules
      if (rules.length > 0) {
        await this.createRules(profileId, rules);
      }
    } catch (error) {
      console.error("Error updating rules:", error.message);
    }
  }

  async deleteRulesByProfile(profileId) {
    try {
      // First get all rule IDs for this profile
      const params = {
        fields: [{ field: { Name: "Id" } }],
        where: [
          {
            FieldName: "profile_id_c",
            Operator: "EqualTo",
            Values: [profileId.toString()]
          }
        ]
      };

      const response = await this.apperClient.fetchRecords(this.rulesTableName, params);

      if (response.success && response.data.length > 0) {
        const ruleIds = response.data.map(rule => rule.Id);
        const deleteParams = {
          RecordIds: ruleIds
        };

        await this.apperClient.deleteRecord(this.rulesTableName, deleteParams);
      }
    } catch (error) {
      console.error("Error deleting rules:", error.message);
    }
  }

  async delete(id) {
    try {
if (!this.apperClient) {
        const initialized = this.initializeApperClient();
        if (!initialized) {
          throw new Error("ApperSDK not available. Please ensure the application is properly loaded.");
        }
      }

      // Delete associated rules first
      await this.deleteRulesByProfile(id);

      // Delete profile
      const params = {
        RecordIds: [id]
      };

      const response = await this.apperClient.deleteRecord(this.tableName, params);

      if (!response.success) {
        console.error(response.message);
        throw new Error(response.message);
      }

      return true;
    } catch (error) {
      console.error("Error deleting profile:", error.message);
      throw error;
    }
  }
}

export const profilesService = new ProfilesService();