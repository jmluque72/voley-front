import React, { useState, useEffect } from 'react';
import { Plus, Edit, Trash2, Users, Phone, Mail, MapPin, Percent, UserPlus } from 'lucide-react';
import FamiliesService, { Family, CreateFamilyData } from '../services/familiesService';
import PlayersService, { Player } from '../services/playersService';
import DataTable from '../components/DataTable';
import Modal from '../components/Modal';
import LoadingIndicator from '../components/LoadingIndicator';
import { usePermissions } from '../hooks/usePermissions';
import './Families.css';

const Families: React.FC = () => {
  const { canManageFamilies } = usePermissions();
  const [families, setFamilies] = useState<Family[]>([]);
  const [players, setPlayers] = useState<Player[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showAssignModal, setShowAssignModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [editingFamily, setEditingFamily] = useState<Family | null>(null);
  const [assigningFamily, setAssigningFamily] = useState<Family | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filteredFamilies, setFilteredFamilies] = useState<Family[]>([]);
  
  // Estados para el formulario simplificado
  const [familyName, setFamilyName] = useState('');
  const [selectedPlayers, setSelectedPlayers] = useState<string[]>([]);
  
  // Estado para el buscador de jugadores
  const [playerSearchTerm, setPlayerSearchTerm] = useState('');
  const [filteredPlayers, setFilteredPlayers] = useState<Player[]>([]);

  useEffect(() => {
    loadData();
  }, []);

  useEffect(() => {
    // Filtrar familias basado en el término de búsqueda
    const filtered = families.filter(family => 
      family.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      family.primaryPlayer?.fullName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      family.members.some(member => 
        member.fullName?.toLowerCase().includes(searchTerm.toLowerCase())
      )
    );
    setFilteredFamilies(filtered);
  }, [families, searchTerm]);

  useEffect(() => {
    // Filtrar jugadores basado en el término de búsqueda
    const filtered = players.filter(player => 
      player.fullName?.toLowerCase().includes(playerSearchTerm.toLowerCase()) ||
      player.email?.toLowerCase().includes(playerSearchTerm.toLowerCase()) ||
      (player.category?.name?.toLowerCase().includes(playerSearchTerm.toLowerCase()))
    );
    setFilteredPlayers(filtered);
  }, [players, playerSearchTerm]);

  const loadData = async () => {
    try {
      setLoading(true);
      const [familiesData, playersData] = await Promise.all([
        FamiliesService.getAllFamilies(),
        PlayersService.getPlayers()
      ]);
      setFamilies(familiesData);
      setPlayers(playersData);
    } catch (error: any) {
      console.error('Error loading data:', error);
      // Mostrar error más específico
      const errorMessage = error.message || 'Error al cargar los datos';
      console.error('Error details:', error);
      alert(`Error al cargar los datos: ${errorMessage}`);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateFamily = async () => {
    if (!familyName.trim()) {
      alert('El nombre de la familia es requerido');
      return;
    }

    try {
      // Crear familia solo con nombre
      const newFamily = await FamiliesService.createFamily({
        name: familyName.trim(),
        primaryPlayerId: '', // Se asignará después
        memberIds: []
      });

      alert('Grupo familiar creado correctamente');
      setShowCreateModal(false);
      setFamilyName('');
      
      // Abrir modal para asignar jugadores
      setAssigningFamily(newFamily);
      setShowAssignModal(true);
      
      loadData();
    } catch (error: any) {
      console.error('Error creating family:', error);
      const errorMessage = error.message || 'Error al crear la familia';
      console.error('Error details:', error);
      alert(`Error al crear la familia: ${errorMessage}`);
    }
  };

  const handleAssignPlayers = async () => {
    if (!assigningFamily) return;

    try {
      // Actualizar la familia con los jugadores seleccionados
      const primaryPlayerId = selectedPlayers.length > 0 ? selectedPlayers[0] : '';
      
      await FamiliesService.updateFamily(assigningFamily._id, {
        primaryPlayerId,
        memberIds: selectedPlayers
      });

      alert('Jugadores asignados correctamente');
      setShowAssignModal(false);
      setAssigningFamily(null);
      setSelectedPlayers([]);
      loadData();
    } catch (error: any) {
      console.error('Error assigning players:', error);
      const errorMessage = error.message || 'Error al asignar jugadores';
      console.error('Error details:', error);
      alert(`Error al asignar jugadores: ${errorMessage}`);
    }
  };

  const handleEditFamily = (family: Family) => {
    setEditingFamily(family);
    setSelectedPlayers(family.members.map(m => m._id));
    setShowEditModal(true);
  };

  const handleUpdateFamily = async () => {
    if (!editingFamily) return;
    
    try {
      const primaryPlayerId = selectedPlayers.length > 0 ? selectedPlayers[0] : '';
      
      await FamiliesService.updateFamily(editingFamily._id, {
        primaryPlayerId,
        memberIds: selectedPlayers
      });

      alert('Familia actualizada correctamente');
      setShowEditModal(false);
      setEditingFamily(null);
      setSelectedPlayers([]);
      loadData();
    } catch (error: any) {
      console.error('Error updating family:', error);
      const errorMessage = error.message || 'Error al actualizar la familia';
      console.error('Error details:', error);
      alert(`Error al actualizar la familia: ${errorMessage}`);
    }
  };

  const handleDeleteFamily = async (family: Family) => {
    if (confirm(`¿Estás seguro de que quieres eliminar la familia "${family.name}"?`)) {
      try {
        await FamiliesService.deleteFamily(family._id);
        alert('Familia eliminada correctamente');
        loadData();
      } catch (error: any) {
        console.error('Error deleting family:', error);
        const errorMessage = error.message || 'Error al eliminar la familia';
        console.error('Error details:', error);
        alert(`Error al eliminar la familia: ${errorMessage}`);
      }
    }
  };

  const handlePlayerToggle = (playerId: string) => {
    setSelectedPlayers(prev => {
      if (prev.includes(playerId)) {
        return prev.filter(id => id !== playerId);
      } else {
        return [...prev, playerId];
      }
    });
  };

  const resetForm = () => {
    setFamilyName('');
    setSelectedPlayers([]);
  };

  const columns = [
    {
      key: 'name',
      label: 'Nombre',
      render: (family: Family) => (
        <div className="family-name">
          <span className="family-name-text">{family.name}</span>
          {family.familyDiscount > 0 && (
            <div className="discount-badge">
              <Percent size={12} />
              <span className="discount-text">{family.familyDiscount}%</span>
            </div>
          )}
        </div>
      )
    },
    {
      key: 'primaryPlayer',
      label: 'Jugador Principal',
      render: (family: Family) => (
        <span className="player-text">
          {family.primaryPlayer ? family.primaryPlayer.fullName : 'Sin asignar'}
        </span>
      )
    },
    {
      key: 'members',
      label: 'Miembros',
      render: (family: Family) => (
        <div className="members-container">
          <div className="members-count">
            <Users size={16} color="#666" />
            <span className="members-text">{family.members.length}</span>
          </div>
          <div className="members-list">
            {family.members.slice(0, 2).map((member, index) => (
              <span key={member._id} className="member-name">
                {member.fullName}
                {index < family.members.length - 1 && index < 1 && ', '}
              </span>
            ))}
            {family.members.length > 2 && (
              <span className="more-members">+{family.members.length - 2} más</span>
            )}
          </div>
        </div>
      )
    },


  ];

  if (loading) {
    return <LoadingIndicator />;
  }

  return (
    <div className="families-container">
      <div className="families-header">
        <div className="header-content">
          <h1 className="families-title">Grupos Familiares</h1>
          <p className="families-subtitle">Gestiona los grupos familiares y sus miembros</p>
        </div>
        {canManageFamilies() && (
          <button
            className="add-button"
            onClick={() => setShowCreateModal(true)}
          >
            <Plus size={20} color="#fff" />
            <span className="add-button-text">Nuevo Grupo Familiar</span>
          </button>
        )}
      </div>

      {/* Estadísticas */}
      <div className="stats-container">
        <div className="stat-card">
          <div className="stat-icon">
            <Users size={24} color="#3B82F6" />
          </div>
          <div className="stat-content">
            <div className="stat-number">{filteredFamilies.length}</div>
            <div className="stat-label">Grupos Familiares</div>
          </div>
        </div>
        
        <div className="stat-card">
          <div className="stat-icon">
            <Users size={24} color="#10B981" />
          </div>
          <div className="stat-content">
            <div className="stat-number">
              {filteredFamilies.reduce((total, family) => total + family.members.length, 0)}
            </div>
            <div className="stat-label">Total Miembros</div>
          </div>
        </div>
        
        <div className="stat-card">
          <div className="stat-icon">
            <Percent size={24} color="#F59E0B" />
          </div>
          <div className="stat-content">
            <div className="stat-number">
              {filteredFamilies.filter(f => f.familyDiscount > 0).length}
            </div>
            <div className="stat-label">Con Descuento</div>
          </div>
        </div>
        

      </div>


      {/* Búsqueda */}
      <div className="search-container">
        <div className="search-input-wrapper">
          <input
            type="text"
            placeholder="Buscar por nombre de familia, jugador principal o miembros..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="search-input"
          />
          {searchTerm && (
            <button
              onClick={() => setSearchTerm('')}
              className="clear-search-button"
            >
              ×
            </button>
          )}
        </div>
      </div>

      <div className="bg-white rounded-lg shadow-sm border border-gray-200">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                {columns.map((column) => (
                  <th
                    key={column.key}
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                  >
                    {column.label}
                  </th>
                ))}
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Acciones
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredFamilies.map((family, index) => (
                <tr key={family._id || index} className="hover:bg-gray-50">
                  {columns.map((column) => (
                    <td key={column.key} className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {column.render ? column.render(family) : family[column.key]}
                    </td>
                  ))}
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <div className="actions">
                      <button
                        className="action-button edit-button"
                        onClick={() => handleEditFamily(family)}
                        title="Editar familia"
                      >
                        <Edit size={16} color="#007bff" />
                      </button>
                      <button
                        className="action-button delete-button"
                        onClick={() => handleDeleteFamily(family)}
                        title="Eliminar familia"
                      >
                        <Trash2 size={16} color="#dc3545" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        
        {filteredFamilies.length === 0 && (
          <div className="text-center py-12">
            <p className="text-gray-500">No hay grupos familiares registrados</p>
          </div>
        )}
      </div>

      {/* Modal para crear familia (solo nombre) */}
      <Modal
        isOpen={showCreateModal}
        onClose={() => {
          setShowCreateModal(false);
          resetForm();
        }}
        title="Crear Nuevo Grupo Familiar"
        size="md"
      >
        <div className="family-form">
          <div className="form-group">
            <label className="form-label">Nombre del Grupo Familiar *</label>
            <input
              className="form-input"
              value={familyName}
              onChange={(e) => setFamilyName(e.target.value)}
              placeholder="Ej: Familia García"
              autoFocus
            />
          </div>
          
          <div className="form-actions">
            <button 
              className="cancel-button" 
              onClick={() => {
                setShowCreateModal(false);
                resetForm();
              }}
            >
              Cancelar
            </button>
            <button 
              className="submit-button" 
              onClick={handleCreateFamily}
              disabled={!familyName.trim()}
            >
              Crear Grupo
            </button>
          </div>
        </div>
      </Modal>

      {/* Modal para asignar jugadores */}
      <Modal
        isOpen={showAssignModal}
        onClose={() => {
          setShowAssignModal(false);
          setAssigningFamily(null);
          setSelectedPlayers([]);
          setPlayerSearchTerm('');
        }}
        title={`Asignar Jugadores ${assigningFamily ? `- ${assigningFamily.name}` : ''}`}
        size="lg"
      >
        <div className="assign-players-form">
          <div className="form-group">
            <label className="form-label">
              Selecciona los jugadores para este grupo familiar:
            </label>
            
            {/* Buscador de jugadores */}
            <div className="player-search-container">
              <input
                type="text"
                placeholder="Buscar jugadores por nombre, email o categoría..."
                value={playerSearchTerm}
                onChange={(e) => setPlayerSearchTerm(e.target.value)}
                className="player-search-input"
              />
              {playerSearchTerm && (
                <button
                  onClick={() => setPlayerSearchTerm('')}
                  className="clear-search-button"
                  type="button"
                >
                  ×
                </button>
              )}
            </div>
            
            <div className="players-selection">
              {filteredPlayers.map(player => (
                <button
                  key={player._id}
                  className={`player-option ${selectedPlayers.includes(player._id) ? 'selected' : ''}`}
                  onClick={() => handlePlayerToggle(player._id)}
                  type="button"
                >
                  <div className="player-info">
                    <span className="player-name">{player.fullName}</span>
                    <span className="player-email">{player.email}</span>
                    {player.category && (
                      <span className="player-category">{player.category.name}</span>
                    )}
                  </div>
                  {selectedPlayers.includes(player._id) && (
                    <div className="selection-order">
                      {selectedPlayers.indexOf(player._id) + 1}
                    </div>
                  )}
                </button>
              ))}
            </div>
            
            {selectedPlayers.length > 0 && (
              <div className="selection-info">
                <p>
                  <strong>Jugador principal:</strong> {players.find(p => p._id === selectedPlayers[0])?.fullName || 'N/A'}
                </p>
                <p>
                  <strong>Total de miembros:</strong> {selectedPlayers.length}
                </p>
              </div>
            )}
          </div>
          
          <div className="form-actions">
            <button 
              className="cancel-button" 
              onClick={() => {
                setShowAssignModal(false);
                setAssigningFamily(null);
                setSelectedPlayers([]);
                setPlayerSearchTerm('');
              }}
            >
              Cancelar
            </button>
            <button 
              className="submit-button" 
              onClick={handleAssignPlayers}
            >
              Asignar Jugadores
            </button>
          </div>
        </div>
      </Modal>

      {/* Modal para editar familia */}
      <Modal
        isOpen={showEditModal}
        onClose={() => {
          setShowEditModal(false);
          setEditingFamily(null);
          setSelectedPlayers([]);
          setPlayerSearchTerm('');
        }}
        title={`Editar Familia ${editingFamily ? `- ${editingFamily.name}` : ''}`}
        size="lg"
      >
        <div className="assign-players-form">
          <div className="form-group">
            <label className="form-label">
              Selecciona los jugadores para este grupo familiar:
            </label>
            
            {/* Buscador de jugadores */}
            <div className="player-search-container">
              <input
                type="text"
                placeholder="Buscar jugadores por nombre, email o categoría..."
                value={playerSearchTerm}
                onChange={(e) => setPlayerSearchTerm(e.target.value)}
                className="player-search-input"
              />
              {playerSearchTerm && (
                <button
                  onClick={() => setPlayerSearchTerm('')}
                  className="clear-search-button"
                  type="button"
                >
                  ×
                </button>
              )}
            </div>
            
            <div className="players-selection">
              {filteredPlayers.map(player => (
                <button
                  key={player._id}
                  className={`player-option ${selectedPlayers.includes(player._id) ? 'selected' : ''}`}
                  onClick={() => handlePlayerToggle(player._id)}
                  type="button"
                >
                  <div className="player-info">
                    <span className="player-name">{player.fullName}</span>
                    <span className="player-email">{player.email}</span>
                    {player.category && (
                      <span className="player-category">{player.category.name}</span>
                    )}
                  </div>
                  {selectedPlayers.includes(player._id) && (
                    <div className="selection-order">
                      {selectedPlayers.indexOf(player._id) + 1}
                    </div>
                  )}
                </button>
              ))}
            </div>
            
            {selectedPlayers.length > 0 && (
              <div className="selection-info">
                <p>
                  <strong>Jugador principal:</strong> {players.find(p => p._id === selectedPlayers[0])?.fullName || 'N/A'}
                </p>
                <p>
                  <strong>Total de miembros:</strong> {selectedPlayers.length}
                </p>
              </div>
            )}
          </div>
          
          <div className="form-actions">
            <button 
              className="cancel-button" 
              onClick={() => {
                setShowEditModal(false);
                setEditingFamily(null);
                setSelectedPlayers([]);
                setPlayerSearchTerm('');
              }}
            >
              Cancelar
            </button>
            <button 
              className="submit-button" 
              onClick={handleUpdateFamily}
            >
              Actualizar Familia
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default Families; 