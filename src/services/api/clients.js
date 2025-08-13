class ClientsService {
  constructor() {
    this.tableName = 'client_c';
    this.usageTableName = 'usage_c';
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
          { field: { Name: "email_c" } },
          { field: { Name: "credits_c" } },
          { field: { Name: "api_key_c" } },
          { field: { Name: "created_at_c" } },
          { field: { Name: "brand_slug_c" } },
          { field: { Name: "custom_url_c" } },
          { field: { Name: "CreatedOn" } }
        ]
      };

      const response = await this.apperClient.fetchRecords(this.tableName, params);

      if (!response.success) {
        console.error(response.message);
        throw new Error(response.message);
      }

      // Get usage data for each client
      const clientsWithUsage = await Promise.all(response.data.map(async (client) => {
        const usageData = await this.getUsageByClient(client.Id);
        return {
          ...client,
          email: client.email_c,
          credits: client.credits_c || 0,
          apiKey: client.api_key_c,
          createdAt: client.created_at_c || client.CreatedOn,
          brandSlug: client.brand_slug_c,
          customUrl: client.custom_url_c,
          usage: usageData
        };
      }));

      return clientsWithUsage;
    } catch (error) {
      console.error("Error fetching clients:", error.message);
      throw error;
    }
  }

  async getUsageByClient(clientId) {
    try {
if (!this.apperClient) {
        const initialized = this.initializeApperClient();
        if (!initialized) {
          throw new Error("ApperSDK not available. Please ensure the application is properly loaded.");
        }
      }

      const params = {
        fields: [
          { field: { Name: "type_c" } },
          { field: { Name: "amount_c" } },
          { field: { Name: "candidate_name_c" } },
          { field: { Name: "profile_detected_c" } },
          { field: { Name: "reason_c" } },
          { field: { Name: "timestamp_c" } },
          { field: { Name: "balance_c" } }
        ],
        where: [
          {
            FieldName: "client_id_c",
            Operator: "EqualTo",
            Values: [clientId.toString()]
          }
        ],
        orderBy: [
          {
            fieldName: "timestamp_c",
            sorttype: "DESC"
          }
        ]
      };

      const response = await this.apperClient.fetchRecords(this.usageTableName, params);

      if (!response.success) {
        return [];
      }

      return response.data.map(usage => ({
        Id: usage.Id,
        type: usage.type_c,
        amount: usage.amount_c,
        candidateName: usage.candidate_name_c,
        profileDetected: usage.profile_detected_c,
        reason: usage.reason_c,
        timestamp: usage.timestamp_c,
        balance: usage.balance_c
      }));
    } catch (error) {
      console.error("Error fetching usage:", error.message);
      return [];
    }
  }

  async getById(id) {
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
          { field: { Name: "email_c" } },
          { field: { Name: "credits_c" } },
          { field: { Name: "api_key_c" } },
          { field: { Name: "created_at_c" } },
          { field: { Name: "brand_slug_c" } },
          { field: { Name: "custom_url_c" } }
        ]
      };

      const response = await this.apperClient.getRecordById(this.tableName, id, params);

      if (!response.success) {
        console.error(response.message);
        throw new Error(response.message);
      }

      const usageData = await this.getUsageByClient(id);

      return {
        ...response.data,
        email: response.data.email_c,
        credits: response.data.credits_c || 0,
        apiKey: response.data.api_key_c,
        createdAt: response.data.created_at_c,
        brandSlug: response.data.brand_slug_c,
        customUrl: response.data.custom_url_c,
        usage: usageData
      };
    } catch (error) {
      console.error(`Error fetching client with ID ${id}:`, error.message);
      throw error;
    }
  }

  async create(client) {
    try {
if (!this.apperClient) {
        const initialized = this.initializeApperClient();
        if (!initialized) {
          throw new Error("ApperSDK not available. Please ensure the application is properly loaded.");
        }
      }

      const brandSlug = client.brand?.toLowerCase()
        .replace(/[^a-z0-9]/g, '-')
        .replace(/-+/g, '-')
        .replace(/^-|-$/g, '') || '';

      const params = {
        records: [
          {
            Name: client.name,
            email_c: client.email,
            credits_c: 100,
            api_key_c: this.generateApiKey(),
            created_at_c: new Date().toISOString(),
            brand_slug_c: brandSlug,
            custom_url_c: `talentscanner.app/${brandSlug}/questionario`
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
          console.error(`Failed to create clients ${failedRecords.length} records:${JSON.stringify(failedRecords)}`);
          failedRecords.forEach(record => {
            record.errors?.forEach(error => {
              console.error(`${error.fieldLabel}: ${error.message}`);
            });
          });
        }

        if (successfulRecords.length > 0) {
          const createdClient = successfulRecords[0].data;
          return {
            ...createdClient,
            email: createdClient.email_c,
            credits: createdClient.credits_c || 0,
            apiKey: createdClient.api_key_c,
            createdAt: createdClient.created_at_c,
            brandSlug: createdClient.brand_slug_c,
            customUrl: createdClient.custom_url_c,
            usage: []
          };
        }
      }

      throw new Error("Failed to create client");
    } catch (error) {
      console.error("Error creating client:", error.message);
      throw error;
    }
  }

  async addCredits(id, credits, reason) {
    try {
if (!this.apperClient) {
        const initialized = this.initializeApperClient();
        if (!initialized) {
          throw new Error("ApperSDK not available. Please ensure the application is properly loaded.");
        }
      }

      // First get current client data
      const client = await this.getById(id);
      const newBalance = client.credits + credits;

      // Update client credits
      const updateParams = {
        records: [
          {
            Id: id,
            credits_c: newBalance
          }
        ]
      };

      const updateResponse = await this.apperClient.updateRecord(this.tableName, updateParams);

      if (!updateResponse.success) {
        console.error(updateResponse.message);
        throw new Error(updateResponse.message);
      }

      // Add usage record
      const usageParams = {
        records: [
          {
            Name: `Credit Addition - ${client.Name}`,
            type_c: "credit_added",
            amount_c: credits,
            reason_c: reason,
            timestamp_c: new Date().toISOString(),
            balance_c: newBalance,
            client_id_c: id
          }
        ]
      };

      await this.apperClient.createRecord(this.usageTableName, usageParams);

      // Return updated client data
      return await this.getById(id);
    } catch (error) {
      console.error("Error adding credits:", error.message);
      throw error;
    }
  }

  generateApiKey() {
    return "profileiq_" + Math.random().toString(36).substr(2, 9) + Math.random().toString(36).substr(2, 9);
  }
}

export const clientsService = new ClientsService();