import React, { useState, useEffect } from "react";
import Card from "@/components/atoms/Card";
import Button from "@/components/atoms/Button";
import Loading from "@/components/ui/Loading";
import Error from "@/components/ui/Error";
import ApperIcon from "@/components/ApperIcon";
import { clientsService } from "@/services/api/clients";
import { format } from "date-fns";

const Credits = () => {
  const [clients, setClients] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [selectedTimeframe, setSelectedTimeframe] = useState("30");

  useEffect(() => {
    loadClients();
  }, []);

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

  const getTotalCredits = () => {
    return clients.reduce((sum, client) => sum + client.credits, 0);
  };

  const getTotalUsageThisMonth = () => {
    const now = new Date();
    const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);
    
    return clients.reduce((sum, client) => {
      const monthlyUsage = client.usage
        .filter(u => new Date(u.timestamp) >= monthStart && u.amount < 0)
        .reduce((usageSum, u) => usageSum + Math.abs(u.amount), 0);
      return sum + monthlyUsage;
    }, 0);
  };

  const getAllTransactions = () => {
    const transactions = [];
    clients.forEach(client => {
      client.usage.forEach(usage => {
        transactions.push({
          ...usage,
          clientName: client.name,
          clientId: client.Id
        });
      });
    });
    return transactions.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
  };

  const getFilteredTransactions = () => {
    const days = parseInt(selectedTimeframe);
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - days);
    
    return getAllTransactions().filter(t => new Date(t.timestamp) >= cutoffDate);
  };

  const getTransactionIcon = (type) => {
    switch (type) {
      case "questionnaire_analyzed": return "FileText";
      case "credit_purchase": return "CreditCard";
      case "credit_added": return "Plus";
      default: return "Activity";
    }
  };

  const getTransactionColor = (amount) => {
    return amount > 0 ? "text-green-600 bg-green-100" : "text-red-600 bg-red-100";
  };

  const formatTransactionDescription = (transaction) => {
    switch (transaction.type) {
      case "questionnaire_analyzed":
        return `Analysis for ${transaction.candidateName} - ${transaction.profileDetected}`;
      case "credit_purchase":
        return `Credit purchase - ${transaction.reason}`;
      case "credit_added":
        return `Manual credit addition - ${transaction.reason}`;
      default:
        return transaction.reason || "Unknown activity";
    }
  };

  if (loading) return <Loading />;
  if (error) return <Error message={error} onRetry={loadClients} />;

  const totalCredits = getTotalCredits();
  const monthlyUsage = getTotalUsageThisMonth();
  const transactions = getFilteredTransactions();

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Credit Management</h1>
        <p className="text-gray-600">Monitor credit usage and transactions across all clients</p>
      </div>

      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600 mb-1">Total Credits</p>
              <p className="text-2xl font-bold text-gray-900">{totalCredits.toLocaleString()}</p>
            </div>
            <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
              <ApperIcon name="Coins" size={24} className="text-blue-600" />
            </div>
          </div>
        </Card>

        <Card className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600 mb-1">Monthly Usage</p>
              <p className="text-2xl font-bold text-gray-900">{monthlyUsage}</p>
            </div>
            <div className="w-12 h-12 bg-red-100 rounded-lg flex items-center justify-center">
              <ApperIcon name="TrendingDown" size={24} className="text-red-600" />
            </div>
          </div>
        </Card>

        <Card className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600 mb-1">Active Clients</p>
              <p className="text-2xl font-bold text-gray-900">{clients.length}</p>
            </div>
            <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
              <ApperIcon name="Building2" size={24} className="text-green-600" />
            </div>
          </div>
        </Card>

        <Card className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600 mb-1">Avg. Balance</p>
              <p className="text-2xl font-bold text-gray-900">
                {clients.length > 0 ? Math.round(totalCredits / clients.length) : 0}
              </p>
            </div>
            <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
              <ApperIcon name="BarChart3" size={24} className="text-purple-600" />
            </div>
          </div>
        </Card>
      </div>

      {/* Client Credit Overview */}
      <Card className="p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Client Credit Status</h3>
        
        <div className="space-y-4">
          {clients.map((client) => (
            <div key={client.Id} className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
              <div className="flex items-center space-x-4">
                <div className="w-10 h-10 bg-gradient-primary bg-opacity-10 rounded-lg flex items-center justify-center">
                  <ApperIcon name="Building2" size={20} className="text-primary-600" />
                </div>
                <div>
<h4 className="font-medium text-gray-900">{client.Name}</h4>
                  <p className="text-sm text-gray-500">{client.email}</p>
                </div>
              </div>
              
              <div className="flex items-center space-x-4">
                <div className="text-right">
                  <p className="text-lg font-semibold text-gray-900">{client.credits}</p>
                  <p className="text-sm text-gray-500">credits</p>
                </div>
                <div className={`w-3 h-3 rounded-full ${
                  client.credits > 100 
                    ? "bg-green-500" 
                    : client.credits > 20 
                    ? "bg-yellow-500" 
                    : "bg-red-500"
                }`} />
              </div>
            </div>
          ))}
        </div>
      </Card>

      {/* Transaction History */}
      <Card className="p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-gray-900">Transaction History</h3>
          <div className="flex items-center space-x-2">
            <label className="text-sm font-medium text-gray-700">Show last:</label>
            <select
              value={selectedTimeframe}
              onChange={(e) => setSelectedTimeframe(e.target.value)}
              className="px-3 py-1 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
            >
              <option value="7">7 days</option>
              <option value="30">30 days</option>
              <option value="90">90 days</option>
              <option value="365">1 year</option>
            </select>
          </div>
        </div>

        <div className="space-y-3 max-h-96 overflow-y-auto">
          {transactions.length === 0 ? (
            <div className="text-center py-8">
              <ApperIcon name="Receipt" size={48} className="mx-auto text-gray-400 mb-4" />
              <p className="text-gray-500">No transactions found for the selected timeframe</p>
            </div>
          ) : (
            transactions.map((transaction) => (
              <div key={`${transaction.clientId}-${transaction.Id}`} className="flex items-start space-x-3 p-4 border border-gray-200 rounded-lg">
                <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${getTransactionColor(transaction.amount)}`}>
                  <ApperIcon name={getTransactionIcon(transaction.type)} size={16} />
                </div>
                
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between mb-1">
<p className="font-medium text-gray-900">{transaction.clientName}</p>
                    <div className="flex items-center space-x-2">
                      <span className={`text-lg font-semibold ${
                        transaction.amount > 0 ? "text-green-600" : "text-red-600"
                      }`}>
                        {transaction.amount > 0 ? "+" : ""}{transaction.amount}
                      </span>
                      <span className="text-sm text-gray-500">credits</span>
                    </div>
                  </div>
                  <p className="text-sm text-gray-600 mb-1">
                    {formatTransactionDescription(transaction)}
                  </p>
                  <div className="flex items-center justify-between text-xs text-gray-500">
                    <span>{format(new Date(transaction.timestamp), "MMM d, yyyy 'at' h:mm a")}</span>
                    <span>Balance: {transaction.balance}</span>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </Card>
    </div>
  );
};

export default Credits;