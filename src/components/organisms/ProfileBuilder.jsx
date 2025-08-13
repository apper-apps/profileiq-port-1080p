import React, { useState, useEffect } from "react";
import Card from "@/components/atoms/Card";
import Button from "@/components/atoms/Button";
import Input from "@/components/atoms/Input";
import Select from "@/components/atoms/Select";
import Empty from "@/components/ui/Empty";
import ApperIcon from "@/components/ApperIcon";
import { profilesService } from "@/services/api/profiles";

const ProfileBuilder = ({ profileId, onSave }) => {
const [profile, setProfile] = useState({
    name: "",
    category: "",
    description: "",
    rules: []
  });
  const [showRuleForm, setShowRuleForm] = useState(false);
  const [editingRule, setEditingRule] = useState(null);
  const [ruleForm, setRuleForm] = useState({
    competency: "",
    operator: "",
    value: 0,
    logic: "AND"
  });

  useEffect(() => {
    if (profileId) {
      loadProfile();
    }
  }, [profileId]);

  const loadProfile = async () => {
    try {
      const data = await profilesService.getById(profileId);
      setProfile(data);
    } catch (error) {
      console.error("Error loading profile:", error);
    }
  };

  const handleSaveProfile = async () => {
    try {
      if (profileId) {
        await profilesService.update(profileId, profile);
      } else {
        await profilesService.create(profile);
      }
      onSave?.();
    } catch (error) {
      console.error("Error saving profile:", error);
    }
  };

  const handleAddRule = () => {
    setRuleForm({
      competency: "",
      operator: "",
      value: 0,
      logic: "AND"
    });
    setEditingRule(null);
    setShowRuleForm(true);
  };

  const handleSaveRule = () => {
    if (editingRule !== null) {
      setProfile(prev => ({
        ...prev,
        rules: prev.rules.map((rule, index) =>
          index === editingRule ? ruleForm : rule
        )
      }));
    } else {
      setProfile(prev => ({
        ...prev,
        rules: [...prev.rules, ruleForm]
      }));
    }
    setShowRuleForm(false);
  };

  const handleDeleteRule = (index) => {
    setProfile(prev => ({
      ...prev,
      rules: prev.rules.filter((_, i) => i !== index)
    }));
  };

  const categories = [
    { value: "excellence", label: "Excellence" },
    { value: "critical", label: "Critical" }
  ];

  const competencies = [
    { value: "leadership", label: "Leadership" },
    { value: "communication", label: "Communication" },
    { value: "problemSolving", label: "Problem Solving" },
    { value: "teamwork", label: "Teamwork" },
    { value: "organization", label: "Organization" },
    { value: "adaptability", label: "Adaptability" }
  ];

  const operators = [
    { value: "gt", label: "Greater Than (>)" },
    { value: "lt", label: "Less Than (<)" },
    { value: "eq", label: "Equal To (=)" },
    { value: "gte", label: "Greater Than or Equal (>=)" },
    { value: "lte", label: "Less Than or Equal (<=)" }
  ];

  return (
    <div className="space-y-6">
      {/* Profile Info */}
      <Card className="p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Profile Information</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
<Input
            label="Profile Name"
            value={profile.name}
            onChange={(e) => setProfile(prev => ({ ...prev, name: e.target.value }))}
            placeholder="e.g., Toxic Leader, Team Player"
            required
          />
          <Select
            label="Category"
            value={profile.category}
            onChange={(e) => setProfile(prev => ({ ...prev, category: e.target.value }))}
            options={categories}
            required
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Description
          </label>
          <textarea
            value={profile.description}
            onChange={(e) => setProfile(prev => ({ ...prev, description: e.target.value }))}
            placeholder="Detailed description of this behavioral profile..."
            rows={4}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
          />
        </div>
      </Card>

      {/* Rules Section */}
      <Card className="p-6">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-lg font-semibold text-gray-900">Identification Rules</h3>
            <p className="text-sm text-gray-500">Define conditions that identify this profile</p>
          </div>
          <Button onClick={handleAddRule} icon="Plus">
            Add Rule
          </Button>
        </div>

        {profile.rules.length === 0 ? (
          <Empty
            title="No rules defined"
            description="Create rules to automatically identify this behavioral profile."
            action={handleAddRule}
            actionText="Add First Rule"
            icon="Zap"
          />
        ) : (
          <div className="space-y-3">
            {profile.rules.map((rule, index) => (
              <div key={index} className="flex items-center justify-between p-4 border rounded-lg bg-gray-50">
                <div className="flex items-center space-x-4">
                  {index > 0 && (
                    <span className="px-2 py-1 text-xs font-medium bg-blue-100 text-blue-800 rounded">
                      {rule.logic}
                    </span>
                  )}
                  <div className="text-sm">
                    <span className="font-medium">{rule.competency}</span>
                    <span className="mx-2 text-gray-500">{rule.operator === "gt" ? ">" : rule.operator === "lt" ? "<" : "="}</span>
                    <span className="font-medium">{rule.value}%</span>
                  </div>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  icon="Trash2"
                  onClick={() => handleDeleteRule(index)}
                  className="text-red-500 hover:text-red-700"
                />
              </div>
            ))}
          </div>
        )}
      </Card>

      {/* Rule Form Modal */}
      {showRuleForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <Card className="w-full max-w-md">
            <div className="p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-gray-900">
                  {editingRule !== null ? "Edit Rule" : "Add New Rule"}
                </h3>
                <Button
                  variant="ghost"
                  size="sm"
                  icon="X"
                  onClick={() => setShowRuleForm(false)}
                />
              </div>

              <div className="space-y-4">
                <Select
                  label="Competency"
                  value={ruleForm.competency}
                  onChange={(e) => setRuleForm(prev => ({ ...prev, competency: e.target.value }))}
                  options={competencies}
                  required
                />

                <Select
                  label="Operator"
                  value={ruleForm.operator}
                  onChange={(e) => setRuleForm(prev => ({ ...prev, operator: e.target.value }))}
                  options={operators}
                  required
                />

                <Input
                  label="Value (%)"
                  type="number"
                  min="0"
                  max="100"
                  value={ruleForm.value}
                  onChange={(e) => setRuleForm(prev => ({ ...prev, value: parseInt(e.target.value) }))}
                  required
                />

                {profile.rules.length > 0 && (
                  <Select
                    label="Logic Operator"
                    value={ruleForm.logic}
                    onChange={(e) => setRuleForm(prev => ({ ...prev, logic: e.target.value }))}
                    options={[
                      { value: "AND", label: "AND - All conditions must be met" },
                      { value: "OR", label: "OR - Any condition can be met" }
                    ]}
                  />
                )}
              </div>

              <div className="flex justify-end space-x-3 mt-6 pt-6 border-t">
                <Button
                  variant="secondary"
                  onClick={() => setShowRuleForm(false)}
                >
                  Cancel
                </Button>
                <Button onClick={handleSaveRule}>
                  {editingRule !== null ? "Update Rule" : "Add Rule"}
                </Button>
              </div>
            </div>
          </Card>
        </div>
      )}

      {/* Save Button */}
      <div className="flex justify-end">
        <Button onClick={handleSaveProfile} size="lg">
          Save Profile
        </Button>
      </div>
    </div>
  );
};

export default ProfileBuilder;