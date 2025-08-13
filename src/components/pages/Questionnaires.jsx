import React, { useEffect, useState } from "react";
import { questionnairesService } from "@/services/api/questionnaires";
import { format } from "date-fns";
import { toast } from "react-toastify";
import ApperIcon from "@/components/ApperIcon";
import QuestionnaireBuilder from "@/components/organisms/QuestionnaireBuilder";
import SearchBar from "@/components/molecules/SearchBar";
import Loading from "@/components/ui/Loading";
import Error from "@/components/ui/Error";
import Empty from "@/components/ui/Empty";
import Button from "@/components/atoms/Button";
import Card from "@/components/atoms/Card";

const Questionnaires = () => {
  const [questionnaires, setQuestionnaires] = useState([]);
  const [filteredQuestionnaires, setFilteredQuestionnaires] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [showBuilder, setShowBuilder] = useState(false);
  const [editingId, setEditingId] = useState(null);

  useEffect(() => {
    loadQuestionnaires();
  }, []);

  useEffect(() => {
const filtered = questionnaires.filter(q =>
      q.title_c?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      q.description_c?.toLowerCase().includes(searchTerm.toLowerCase())
    );
    setFilteredQuestionnaires(filtered);
  }, [questionnaires, searchTerm]);

  const loadQuestionnaires = async () => {
    try {
      setLoading(true);
      setError("");
      const data = await questionnairesService.getAll();
      setQuestionnaires(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleCreate = () => {
    setEditingId(null);
    setShowBuilder(true);
  };

  const handleEdit = (id) => {
    setEditingId(id);
    setShowBuilder(true);
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this questionnaire?")) {
      return;
    }

    try {
      await questionnairesService.delete(id);
      setQuestionnaires(prev => prev.filter(q => q.Id !== id));
      toast.success("Questionnaire deleted successfully");
    } catch (error) {
      toast.error("Failed to delete questionnaire");
    }
  };

  const handleDuplicate = async (id) => {
    try {
const original = await questionnairesService.getById(id);
      const duplicate = {
        ...original,
        title_c: `${original.title_c} (Copy)`,
        Id: undefined
      };
      const created = await questionnairesService.create(duplicate);
      setQuestionnaires(prev => [created, ...prev]);
      toast.success("Questionnaire duplicated successfully");
    } catch (error) {
      toast.error("Failed to duplicate questionnaire");
    }
  };

  const handleToggleStatus = async (id) => {
    try {
const questionnaire = questionnaires.find(q => q.Id === id);
      const updated = await questionnairesService.update(id, {
        ...questionnaire,
        is_active_c: !questionnaire.is_active_c
      });
setQuestionnaires(prev =>
        prev.map(q => q.Id === id ? updated : q)
      );
      toast.success(`Questionnaire ${updated.is_active_c ? 'activated' : 'deactivated'}`);
    } catch (error) {
      toast.error("Failed to update questionnaire status");
    }
  };

  if (loading) return <Loading />;
  if (error) return <Error message={error} onRetry={loadQuestionnaires} />;

if (showBuilder) {
    return (
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">
                {editingId ? "Edit Questionnaire" : "Create Questionnaire"}
              </h1>
              <p className="text-gray-600">
                {editingId ? "Modify your existing questionnaire" : "Build a new behavioral assessment"}
              </p>
            </div>
            <Button
              variant="secondary"
              onClick={() => setShowBuilder(false)}
              icon="ArrowLeft"
            >
              Back to List
            </Button>
          </div>
          
<QuestionnaireBuilder
            questionnaireId={editingId}
            onSave={() => {
              setShowBuilder(false);
              loadQuestionnaires();
              toast.success(`Questionnaire ${editingId ? 'updated' : 'created'} successfully`);
}}
          />
        </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Questionnaires</h1>
          <p className="text-gray-600">Create and manage behavioral assessments</p>
        </div>
        <Button onClick={handleCreate} icon="Plus">
          Create Questionnaire
        </Button>
      </div>

      {/* Search and Filters */}
      <div className="flex flex-col sm:flex-row gap-4">
        <SearchBar
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          placeholder="Search questionnaires..."
          className="flex-1"
        />
      </div>

      {/* Questionnaires List */}
      {filteredQuestionnaires.length === 0 ? (
        <Empty
          title="No questionnaires found"
          description="Create your first behavioral assessment questionnaire to get started."
          action={handleCreate}
          actionText="Create First Questionnaire"
          icon="FileText"
        />
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {filteredQuestionnaires.map((questionnaire) => (
            <Card key={questionnaire.Id} hover className="p-6">
              <div className="flex items-start justify-between mb-4">
                <div className="flex-1">
<div className="flex items-center space-x-2 mb-2">
                    <h3 className="text-lg font-semibold text-gray-900">
                      {questionnaire.title_c}
                    </h3>
                    <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                      questionnaire.is_active_c
                        ? "bg-green-100 text-green-800"
                        : "bg-gray-100 text-gray-800"
                    }`}>
                      {questionnaire.is_active_c ? "Active" : "Inactive"}
                    </span>
                  </div>
<p className="text-gray-600 text-sm mb-3">
                    {questionnaire.description_c}
                  </p>
                  <div className="flex items-center space-x-4 text-sm text-gray-500">
                    <div className="flex items-center space-x-1">
                      <ApperIcon name="FileQuestion" size={16} />
                      <span>{questionnaire.questions?.length || 0} questions</span>
                    </div>
<div className="flex items-center space-x-1">
                      <ApperIcon name="Calendar" size={16} />
                      <span>{format(new Date(questionnaire.created_at_c), "MMM d, yyyy")}</span>
                    </div>
                  </div>
                </div>
              </div>

              <div className="flex items-center justify-between pt-4 border-t">
                <div className="flex items-center space-x-2">
                  <Button
                    variant="ghost"
                    size="sm"
                    icon="Edit2"
                    onClick={() => handleEdit(questionnaire.Id)}
                  >
                    Edit
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    icon="Copy"
                    onClick={() => handleDuplicate(questionnaire.Id)}
                  >
                    Duplicate
                  </Button>
                </div>
                
                <div className="flex items-center space-x-2">
                  <Button
                    variant="ghost"
                    size="sm"
icon={questionnaire.is_active_c ? "Pause" : "Play"}
                    onClick={() => handleToggleStatus(questionnaire.Id)}
                    className={questionnaire.is_active_c ? "text-orange-600 hover:text-orange-700" : "text-green-600 hover:text-green-700"}
                  >
                    {questionnaire.is_active_c ? "Deactivate" : "Activate"}
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    icon="Trash2"
                    onClick={() => handleDelete(questionnaire.Id)}
                    className="text-red-600 hover:text-red-700"
                  >
                    Delete
                  </Button>
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};

export default Questionnaires;