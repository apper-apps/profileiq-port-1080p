import React, { useState, useEffect } from "react";
import Card from "@/components/atoms/Card";
import Button from "@/components/atoms/Button";
import Input from "@/components/atoms/Input";
import SearchBar from "@/components/molecules/SearchBar";
import Loading from "@/components/ui/Loading";
import Error from "@/components/ui/Error";
import Empty from "@/components/ui/Empty";
import ApperIcon from "@/components/ApperIcon";
import { clientsService } from "@/services/api/clients";
import { format } from "date-fns";
import { toast } from "react-toastify";

const Clients = () => {
  const [clients, setClients] = useState([]);
  const [filteredClients, setFilteredClients] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedClient, setSelectedClient] = useState(null);
  const [showAddCredits, setShowAddCredits] = useState(false);
  const [creditsForm, setCreditsForm] = useState({ amount: "", reason: "" });
  const [addingCredits, setAddingCredits] = useState(false);

  useEffect(() => {
    loadClients();
  }, []);

  useEffect(() => {
    const filtered = clients.filter(client =>
      client.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      client.email.toLowerCase().includes(searchTerm.toLowerCase())
    );
    setFilteredClients(filtered);
  }, [clients, searchTerm]);

  const loadClients = async () => {
    try {
      setLoading(true);
      setError("");
      const data = await clientsService.getAll();
      setClients(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleAddCredits = async () => {
    if (!creditsForm.amount || !creditsForm.reason.trim()) {
      toast.error("Please fill in all fields");
      return;
    }

    const amount = parseInt(creditsForm.amount);
    if (amount <= 0) {
      toast.error("Amount must be greater than 0");
      return;
    }

    try {
      setAddingCredits(true);
      const updated = await clientsService.addCredits(selectedClient.Id, amount, creditsForm.reason);
      setClients(prev => prev.map(client => 
        client.Id === selectedClient.Id ? updated : client
      ));
      setShowAddCredits(false);
      setCreditsForm({ amount: "", reason: "" });
      setSelectedClient(null);
      toast.success(`${amount} credits added successfully`);
    } catch (error) {
      toast.error("Failed to add credits");
    } finally {
      setAddingCredits(false);
    }
  };

  const getUsageIcon = (type) => {
    switch (type) {
      case "questionnaire_analyzed": return "FileText";
      case "credit_purchase": return "CreditCard";
      case "credit_added": return "Plus";
      default: return "Activity";
    }
  };

  const getUsageColor = (type) => {
    switch (type) {
      case "questionnaire_analyzed": return "text-blue-600 bg-blue-100";
      case "credit_purchase": return "text-green-600 bg-green-100";
      case "credit_added": return "text-purple-600 bg-purple-100";
      default: return "text-gray-600 bg-gray-100";
    }
  };

  const formatUsageDescription = (usage) => {
    switch (usage.type) {
      case "questionnaire_analyzed":
        return `Analysis for ${usage.candidateName} - ${usage.profileDetected}`;
      case "credit_purchase":
        return `Credit purchase - ${usage.reason}`;
      case "credit_added":
        return `Manual credit addition - ${usage.reason}`;
      default:
        return usage.reason || "Unknown activity";
    }
  };

  if (loading) return <Loading />;
  if (error) return <Error message={error} onRetry={loadClients} />;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Client Management</h1>
          <p className="text-gray-600">Manage client accounts and credit usage</p>
        </div>
      </div>

      {/* Search */}
      <SearchBar
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
        placeholder="Search clients..."
      />

      {/* Clients List */}
      {filteredClients.length === 0 ? (
        <Empty
          title="No clients found"
          description="Client accounts will appear here once they are created."
          icon="Building2"
        />
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
          {filteredClients.map((client) => (
            <Card key={client.Id} hover className="p-6">
              <div className="flex items-start justify-between mb-4">
                <div className="flex-1">
                  <h3 className="text-lg font-semibold text-gray-900 mb-1">
                    {client.name}
                  </h3>
                  <p className="text-gray-600 text-sm mb-2">{client.email}</p>
                  <div className="flex items-center space-x-4 text-sm text-gray-500">
                    <div className="flex items-center space-x-1">
                      <ApperIcon name="Coins" size={16} />
                      <span>{client.credits} credits</span>
                    </div>
                    <div className="flex items-center space-x-1">
                      <ApperIcon name="Calendar" size={16} />
                      <span>{format(new Date(client.createdAt), "MMM yyyy")}</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Credit Status */}
              <div className="mb-4">
                <div className={`px-3 py-2 rounded-lg ${
                  client.credits > 100 
                    ? "bg-green-100 text-green-800" 
                    : client.credits > 20 
                    ? "bg-yellow-100 text-yellow-800" 
                    : "bg-red-100 text-red-800"
                }`}>
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">
                      {client.credits > 100 ? "Good" : client.credits > 20 ? "Low" : "Critical"}
                    </span>
                    <span className="text-lg font-bold">{client.credits}</span>
                  </div>
                </div>
              </div>

              {/* Recent Usage */}
              <div className="mb-4">
                <h4 className="text-sm font-medium text-gray-700 mb-2">Recent Activity</h4>
                <div className="space-y-2 max-h-32 overflow-y-auto">
                  {client.usage.slice(0, 3).map((usage) => (
                    <div key={usage.Id} className="flex items-start space-x-2 text-xs">
                      <div className={`w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0 ${getUsageColor(usage.type)}`}>
                        <ApperIcon name={getUsageIcon(usage.type)} size={12} />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-gray-900 truncate">
                          {formatUsageDescription(usage)}
                        </p>
                        <p className="text-gray-500">
                          {format(new Date(usage.timestamp), "MMM d, h:mm a")}
                        </p>
                      </div>
                      <div className={`text-xs font-medium ${
                        usage.amount > 0 ? "text-green-600" : "text-red-600"
                      }`}>
                        {usage.amount > 0 ? "+" : ""}{usage.amount}
                      </div>
                    </div>
                  ))}
                  {client.usage.length === 0 && (
                    <p className="text-xs text-gray-500 text-center py-2">No activity yet</p>
                  )}
                </div>
              </div>

              {/* Actions */}
              <div className="flex space-x-2 pt-4 border-t">
                <Button
                  variant="ghost"
                  size="sm"
                  icon="Plus"
                  onClick={() => {
                    setSelectedClient(client);
                    setShowAddCredits(true);
                  }}
                  className="flex-1"
                >
                  Add Credits
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  icon="Eye"
                  className="flex-1"
                >
                  View Details
                </Button>
              </div>
            </Card>
          ))}
        </div>
      )}

      {/* Add Credits Modal */}
      {showAddCredits && selectedClient && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <Card className="w-full max-w-md">
            <div className="p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-gray-900">
                  Add Credits
                </h3>
                <Button
                  variant="ghost"
                  size="sm"
                  icon="X"
                  onClick={() => {
                    setShowAddCredits(false);
                    setCreditsForm({ amount: "", reason: "" });
                    setSelectedClient(null);
                  }}
                />
              </div>

              <div className="mb-4 p-4 bg-gray-50 rounded-lg">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium text-gray-900">{selectedClient.name}</p>
                    <p className="text-sm text-gray-600">Current balance: {selectedClient.credits} credits</p>
                  </div>
                </div>
              </div>

              <div className="space-y-4">
                <Input
                  label="Credits to Add"
                  type="number"
                  min="1"
                  value={creditsForm.amount}
                  onChange={(e) => setCreditsForm(prev => ({ ...prev, amount: e.target.value }))}
                  placeholder="Enter amount"
                  required
                />

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Reason
                  </label>
                  <textarea
                    value={creditsForm.reason}
                    onChange={(e) => setCreditsForm(prev => ({ ...prev, reason: e.target.value }))}
                    placeholder="Enter reason for credit addition..."
                    rows={3}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent resize-none"
                  />
                </div>
              </div>

              <div className="flex justify-end space-x-3 mt-6 pt-6 border-t">
                <Button
                  variant="secondary"
                  onClick={() => {
                    setShowAddCredits(false);
                    setCreditsForm({ amount: "", reason: "" });
                    setSelectedClient(null);
                  }}
                >
                  Cancel
                </Button>
                <Button
                  onClick={handleAddCredits}
                  loading={addingCredits}
                >
                  Add Credits
                </Button>
              </div>
            </div>
          </Card>
        </div>
      )}
    </div>
  );
};

export default Clients;