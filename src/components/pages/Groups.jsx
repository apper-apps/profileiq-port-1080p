import React, { useState, useEffect } from 'react';
import { toast } from 'react-toastify';
import { groupService } from '@/services/api/groups';
import { subscriptionService } from '@/services/api/subscriptions';
import { clientsService } from '@/services/api/clients';
import ApperIcon from '@/components/ApperIcon';
import Button from '@/components/atoms/Button';
import Card from '@/components/atoms/Card';
import Input from '@/components/atoms/Input';
import Loading from '@/components/ui/Loading';
import Error from '@/components/ui/Error';
import Empty from '@/components/ui/Empty';

const Groups = () => {
  // State management
  const [groups, setGroups] = useState([]);
  const [clients, setClients] = useState([]);
  const [subscriptions, setSubscriptions] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [selectedGroup, setSelectedGroup] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [modalType, setModalType] = useState(''); // 'create', 'edit', 'manage-subscriptions'
  const [formData, setFormData] = useState({
    Name: '',
    description_c: '',
    Tags: ''
  });

  // Load initial data
  useEffect(() => {
    loadGroups();
    loadClients();
  }, []);

  const loadGroups = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await groupService.getAll();
      setGroups(data || []);
    } catch (err) {
      setError('Errore nel caricamento dei gruppi');
      console.error('Error loading groups:', err);
    } finally {
      setLoading(false);
    }
  };

  const loadClients = async () => {
try {
      const data = await clientsService.getAll();
      setClients(data || []);
    } catch (err) {
      console.error('Error loading clients:', err);
    }
  };

  const loadSubscriptionsForGroup = async (groupId) => {
    try {
      const data = await subscriptionService.getByGroupId(groupId);
      setSubscriptions(data || []);
    } catch (err) {
      console.error('Error loading subscriptions:', err);
    }
  };

  const handleCreateGroup = () => {
    setFormData({ Name: '', description_c: '', Tags: '' });
    setModalType('create');
    setShowModal(true);
  };

  const handleEditGroup = (group) => {
    setFormData({
      Name: group.Name || '',
      description_c: group.description_c || '',
      Tags: group.Tags || ''
    });
    setSelectedGroup(group);
    setModalType('edit');
    setShowModal(true);
  };

  const handleManageSubscriptions = async (group) => {
    setSelectedGroup(group);
    await loadSubscriptionsForGroup(group.Id);
    setModalType('manage-subscriptions');
    setShowModal(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!formData.Name.trim()) {
      toast.error('Il nome del gruppo è obbligatorio');
      return;
    }

    setLoading(true);
    try {
      let result;
      if (modalType === 'create') {
        result = await groupService.create(formData);
        if (result) {
          toast.success('Gruppo creato con successo!');
          loadGroups();
        }
      } else if (modalType === 'edit') {
        result = await groupService.update(selectedGroup.Id, formData);
        if (result) {
          toast.success('Gruppo aggiornato con successo!');
          loadGroups();
        }
      }
      
      if (result) {
        setShowModal(false);
        setSelectedGroup(null);
      }
    } catch (err) {
      toast.error('Errore durante il salvataggio del gruppo');
      console.error('Error saving group:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteGroup = async (groupId) => {
    if (!confirm('Sei sicuro di voler eliminare questo gruppo?')) {
      return;
    }

    setLoading(true);
    try {
      const result = await groupService.delete(groupId);
      if (result) {
        toast.success('Gruppo eliminato con successo!');
        loadGroups();
      }
    } catch (err) {
      toast.error('Errore durante l\'eliminazione del gruppo');
      console.error('Error deleting group:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleAddSubscription = async (userId) => {
    if (!selectedGroup) return;

    // Check if user is already subscribed
    const existingSubscription = subscriptions.find(sub => 
      sub.user_id_c?.Id === parseInt(userId) || sub.user_id_c === parseInt(userId)
    );
    
    if (existingSubscription) {
      toast.error('L\'utente è già iscritto a questo gruppo');
      return;
    }

    setLoading(true);
    try {
      const subscriptionData = {
        Name: `Subscription ${Date.now()}`,
        user_id_c: userId,
        group_id_c: selectedGroup.Id
      };

      const result = await subscriptionService.create(subscriptionData);
      if (result) {
        toast.success('Utente iscritto con successo!');
        await loadSubscriptionsForGroup(selectedGroup.Id);
      }
    } catch (err) {
      toast.error('Errore durante l\'iscrizione');
      console.error('Error creating subscription:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleRemoveSubscription = async (subscriptionId) => {
    if (!confirm('Sei sicuro di voler rimuovere questa iscrizione?')) {
      return;
    }

    setLoading(true);
    try {
      const result = await subscriptionService.delete(subscriptionId);
      if (result) {
        toast.success('Iscrizione rimossa con successo!');
        await loadSubscriptionsForGroup(selectedGroup.Id);
      }
    } catch (err) {
      toast.error('Errore durante la rimozione dell\'iscrizione');
      console.error('Error removing subscription:', err);
    } finally {
      setLoading(false);
    }
  };

  const getAvailableClients = () => {
    if (!clients || !subscriptions) return [];
    
    const subscribedUserIds = subscriptions.map(sub => 
      sub.user_id_c?.Id || sub.user_id_c
    );
    
    return clients.filter(client => !subscribedUserIds.includes(client.Id));
  };

  if (loading && groups.length === 0) {
    return <Loading />;
  }

  if (error) {
    return <Error message={error} />;
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Gestione Gruppi</h1>
          <p className="text-gray-600 mt-1">
            Gestisci i gruppi e le iscrizioni degli utenti
          </p>
        </div>
        <Button onClick={handleCreateGroup}>
          <ApperIcon name="Plus" size={16} />
          Nuovo Gruppo
        </Button>
      </div>

      {/* Groups List */}
      {groups.length === 0 ? (
        <Empty message="Nessun gruppo trovato" />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {groups.map((group) => (
            <Card key={group.Id} className="p-6">
              <div className="flex justify-between items-start mb-4">
                <div className="flex-1">
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">
                    {group.Name}
                  </h3>
                  {group.description_c && (
                    <p className="text-gray-600 text-sm mb-3 line-clamp-3">
                      {group.description_c}
                    </p>
                  )}
                  {group.Tags && (
                    <div className="flex flex-wrap gap-1 mb-3">
                      {group.Tags.split(',').map((tag, index) => (
                        <span
                          key={index}
                          className="px-2 py-1 bg-primary-100 text-primary-700 rounded-full text-xs"
                        >
                          {tag.trim()}
                        </span>
                      ))}
                    </div>
                  )}
                </div>
                <div className="flex space-x-1">
                  <button
                    onClick={() => handleEditGroup(group)}
                    className="p-2 text-gray-500 hover:text-primary hover:bg-primary-50 rounded-lg transition-colors"
                    title="Modifica gruppo"
                  >
                    <ApperIcon name="Edit2" size={16} />
                  </button>
                  <button
                    onClick={() => handleDeleteGroup(group.Id)}
                    className="p-2 text-gray-500 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                    title="Elimina gruppo"
                  >
                    <ApperIcon name="Trash2" size={16} />
                  </button>
                </div>
              </div>
              
              <div className="flex justify-between items-center pt-4 border-t border-gray-200">
                <span className="text-sm text-gray-500">
                  Creato: {group.CreatedOn ? new Date(group.CreatedOn).toLocaleDateString() : 'N/A'}
                </span>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleManageSubscriptions(group)}
                >
                  <ApperIcon name="Users" size={14} />
                  Gestisci Utenti
                </Button>
              </div>
            </Card>
          ))}
        </div>
      )}

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-xl font-bold text-gray-900">
                  {modalType === 'create' && 'Nuovo Gruppo'}
                  {modalType === 'edit' && 'Modifica Gruppo'}
                  {modalType === 'manage-subscriptions' && `Gestisci Utenti - ${selectedGroup?.Name}`}
                </h2>
                <button
                  onClick={() => setShowModal(false)}
                  className="text-gray-500 hover:text-gray-700"
                >
                  <ApperIcon name="X" size={20} />
                </button>
              </div>

              {/* Create/Edit Form */}
              {(modalType === 'create' || modalType === 'edit') && (
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Nome Gruppo *
                    </label>
                    <Input
                      value={formData.Name}
                      onChange={(e) => setFormData(prev => ({ ...prev, Name: e.target.value }))}
                      placeholder="Inserisci il nome del gruppo"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Descrizione
                    </label>
                    <textarea
                      value={formData.description_c}
                      onChange={(e) => setFormData(prev => ({ ...prev, description_c: e.target.value }))}
                      placeholder="Inserisci la descrizione del gruppo"
                      className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent resize-none"
                      rows={3}
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Tags (separate con virgole)
                    </label>
                    <Input
                      value={formData.Tags}
                      onChange={(e) => setFormData(prev => ({ ...prev, Tags: e.target.value }))}
                      placeholder="tag1, tag2, tag3"
                    />
                  </div>

                  <div className="flex space-x-3 pt-4">
                    <Button type="submit" className="flex-1" disabled={loading}>
                      {loading ? 'Salvando...' : 'Salva'}
                    </Button>
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => setShowModal(false)}
                      className="flex-1"
                    >
                      Annulla
                    </Button>
                  </div>
                </form>
              )}

              {/* Manage Subscriptions */}
              {modalType === 'manage-subscriptions' && (
                <div className="space-y-6">
                  {/* Add User Section */}
                  <div>
                    <h3 className="text-lg font-medium text-gray-900 mb-3">
                      Aggiungi Utente
                    </h3>
                    {getAvailableClients().length > 0 ? (
                      <div className="space-y-2">
                        {getAvailableClients().map((client) => (
                          <div
                            key={client.Id}
                            className="flex justify-between items-center p-3 border border-gray-200 rounded-lg"
                          >
                            <div>
                              <span className="font-medium text-gray-900">
                                {client.Name || client.email_c}
                              </span>
                              {client.email_c && (
                                <span className="text-gray-500 text-sm ml-2">
                                  ({client.email_c})
                                </span>
                              )}
                            </div>
                            <Button
                              size="sm"
                              onClick={() => handleAddSubscription(client.Id)}
                              disabled={loading}
                            >
                              <ApperIcon name="UserPlus" size={14} />
                              Aggiungi
                            </Button>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <p className="text-gray-500 text-sm">
                        Tutti gli utenti sono già iscritti a questo gruppo
                      </p>
                    )}
                  </div>

                  {/* Current Subscriptions */}
                  <div>
                    <h3 className="text-lg font-medium text-gray-900 mb-3">
                      Utenti Iscritti ({subscriptions.length})
                    </h3>
                    {subscriptions.length > 0 ? (
                      <div className="space-y-2">
                        {subscriptions.map((subscription) => (
                          <div
                            key={subscription.Id}
                            className="flex justify-between items-center p-3 border border-gray-200 rounded-lg"
                          >
                            <div>
                              <span className="font-medium text-gray-900">
                                {subscription.user_id_c?.Name || 'Utente sconosciuto'}
                              </span>
                              <span className="text-gray-500 text-sm ml-2">
                                Iscritto: {subscription.CreatedOn ? new Date(subscription.CreatedOn).toLocaleDateString() : 'N/A'}
                              </span>
                            </div>
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => handleRemoveSubscription(subscription.Id)}
                              disabled={loading}
                              className="text-red-600 hover:text-red-700 hover:bg-red-50"
                            >
                              <ApperIcon name="UserMinus" size={14} />
                              Rimuovi
                            </Button>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <Empty message="Nessun utente iscritto a questo gruppo" />
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Groups;