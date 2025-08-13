import React, { useState, useEffect } from "react";
import Card from "@/components/atoms/Card";
import Button from "@/components/atoms/Button";
import SearchBar from "@/components/molecules/SearchBar";
import Loading from "@/components/ui/Loading";
import Error from "@/components/ui/Error";
import Empty from "@/components/ui/Empty";
import ApperIcon from "@/components/ApperIcon";
import { profilesService } from "@/services/api/profiles";
import { format } from "date-fns";
import { toast } from "react-toastify";

const Profiles = () => {
  const [profiles, setProfiles] = useState([]);
  const [filteredProfiles, setFilteredProfiles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [showBuilder, setShowBuilder] = useState(false);
  const [editingId, setEditingId] = useState(null);

  useEffect(() => {
    loadProfiles();
  }, []);

  useEffect(() => {
    let filtered = profiles;

    // Filter by search term
    if (searchTerm) {
filtered = filtered.filter(p =>
        p.Name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        p.description?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Filter by category
    if (categoryFilter !== "all") {
      filtered = filtered.filter(p => p.category === categoryFilter);
    }

    setFilteredProfiles(filtered);
  }, [profiles, searchTerm, categoryFilter]);

  const loadProfiles = async () => {
    try {
      setLoading(true);
      setError("");
      const data = await profilesService.getAll();
      setProfiles(data);
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
    if (!window.confirm("Are you sure you want to delete this profile?")) {
      return;
    }

    try {
      await profilesService.delete(id);
      setProfiles(prev => prev.filter(p => p.Id !== id));
      toast.success("Profile deleted successfully");
    } catch (error) {
      toast.error("Failed to delete profile");
    }
  };

  const handleDuplicate = async (id) => {
    try {
const original = await profilesService.getById(id);
      const duplicate = {
        ...original,
        name: `${original.Name} (Copy)`,
        Id: undefined
      };
      const created = await profilesService.create(duplicate);
      setProfiles(prev => [created, ...prev]);
      toast.success("Profile duplicated successfully");
    } catch (error) {
      toast.error("Failed to duplicate profile");
    }
  };

  if (loading) return <Loading />;
  if (error) return <Error message={error} onRetry={loadProfiles} />;

  if (showBuilder) {
    const ProfileBuilder = React.lazy(() => import("@/components/organisms/ProfileBuilder"));
    return (
      <React.Suspense fallback={<Loading />}>
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">
                {editingId ? "Edit Profile" : "Create Profile"}
              </h1>
              <p className="text-gray-600">
                {editingId ? "Modify your existing behavioral profile" : "Define a new behavioral profile type"}
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
          
          <ProfileBuilder
            profileId={editingId}
            onSave={() => {
              setShowBuilder(false);
              loadProfiles();
              toast.success(`Profile ${editingId ? 'updated' : 'created'} successfully`);
            }}
          />
        </div>
      </React.Suspense>
    );
  }

  const getCategoryIcon = (category) => {
    return category === "excellence" ? "Star" : "AlertTriangle";
  };

  const getCategoryColor = (category) => {
    return category === "excellence" 
      ? "text-green-600 bg-green-100" 
      : "text-red-600 bg-red-100";
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Behavioral Profiles</h1>
          <p className="text-gray-600">Define and manage behavioral profile types</p>
        </div>
        <Button onClick={handleCreate} icon="Plus">
          Create Profile
        </Button>
      </div>

      {/* Search and Filters */}
      <div className="flex flex-col sm:flex-row gap-4">
        <SearchBar
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          placeholder="Search profiles..."
          className="flex-1"
        />
        <div className="flex gap-2">
          {["all", "excellence", "critical"].map((category) => (
            <Button
              key={category}
              variant={categoryFilter === category ? "primary" : "secondary"}
              size="sm"
              onClick={() => setCategoryFilter(category)}
              className="capitalize"
            >
              {category === "all" ? "All Categories" : category}
            </Button>
          ))}
        </div>
      </div>

      {/* Stats Summary */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="p-4">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
              <ApperIcon name="Users" size={20} className="text-blue-600" />
            </div>
            <div>
              <p className="text-sm text-gray-600">Total Profiles</p>
              <p className="text-xl font-bold text-gray-900">{profiles.length}</p>
            </div>
          </div>
        </Card>
        
        <Card className="p-4">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
              <ApperIcon name="Star" size={20} className="text-green-600" />
            </div>
            <div>
              <p className="text-sm text-gray-600">Excellence</p>
              <p className="text-xl font-bold text-gray-900">
                {profiles.filter(p => p.category === "excellence").length}
              </p>
            </div>
          </div>
        </Card>
        
        <Card className="p-4">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-red-100 rounded-lg flex items-center justify-center">
              <ApperIcon name="AlertTriangle" size={20} className="text-red-600" />
            </div>
            <div>
              <p className="text-sm text-gray-600">Critical</p>
              <p className="text-xl font-bold text-gray-900">
                {profiles.filter(p => p.category === "critical").length}
              </p>
            </div>
          </div>
        </Card>
      </div>

      {/* Profiles List */}
      {filteredProfiles.length === 0 ? (
        <Empty
          title="No profiles found"
          description="Create your first behavioral profile to start categorizing assessment results."
          action={handleCreate}
          actionText="Create First Profile"
          icon="Users"
        />
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {filteredProfiles.map((profile) => (
            <Card key={profile.Id} hover className="p-6">
              <div className="flex items-start justify-between mb-4">
                <div className="flex-1">
                  <div className="flex items-center space-x-2 mb-2">
<h3 className="text-lg font-semibold text-gray-900">
                      {profile.Name}
                    </h3>
                    <span className={`px-2 py-1 text-xs font-medium rounded-full flex items-center space-x-1 ${getCategoryColor(profile.category)}`}>
                      <ApperIcon name={getCategoryIcon(profile.category)} size={12} />
                      <span className="capitalize">{profile.category}</span>
                    </span>
                  </div>
                  <p className="text-gray-600 text-sm mb-3 line-clamp-2">
                    {profile.description}
                  </p>
                  <div className="flex items-center space-x-4 text-sm text-gray-500">
                    <div className="flex items-center space-x-1">
                      <ApperIcon name="Zap" size={16} />
                      <span>{profile.rules?.length || 0} rules</span>
                    </div>
                    <div className="flex items-center space-x-1">
                      <ApperIcon name="Calendar" size={16} />
                      <span>{format(new Date(profile.createdAt), "MMM d, yyyy")}</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Rules Preview */}
              {profile.rules && profile.rules.length > 0 && (
                <div className="mb-4">
                  <div className="text-xs text-gray-500 mb-2">Identification Rules:</div>
                  <div className="flex flex-wrap gap-1">
                    {profile.rules.slice(0, 2).map((rule, index) => (
                      <span
                        key={index}
                        className="px-2 py-1 text-xs bg-gray-100 text-gray-700 rounded"
                      >
                        {rule.competency} {rule.operator === "gt" ? ">" : rule.operator === "lt" ? "<" : "="} {rule.value}%
                      </span>
                    ))}
                    {profile.rules.length > 2 && (
                      <span className="px-2 py-1 text-xs bg-gray-100 text-gray-500 rounded">
                        +{profile.rules.length - 2} more
                      </span>
                    )}
                  </div>
                </div>
              )}

              <div className="flex items-center justify-between pt-4 border-t">
                <div className="flex items-center space-x-2">
                  <Button
                    variant="ghost"
                    size="sm"
                    icon="Edit2"
                    onClick={() => handleEdit(profile.Id)}
                  >
                    Edit
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    icon="Copy"
                    onClick={() => handleDuplicate(profile.Id)}
                  >
                    Duplicate
                  </Button>
                </div>
                
                <Button
                  variant="ghost"
                  size="sm"
                  icon="Trash2"
                  onClick={() => handleDelete(profile.Id)}
                  className="text-red-600 hover:text-red-700"
                >
                  Delete
                </Button>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};

export default Profiles;