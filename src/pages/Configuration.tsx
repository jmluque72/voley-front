import React, { useState, useEffect } from 'react';
import { Settings, Plus, Trash2, Save, RotateCcw, Users, Percent, DollarSign, Building } from 'lucide-react';
import ConfigurationService, { Configuration as ConfigurationType, FamilyDiscount } from '../services/configurationService';
import Modal from '../components/Modal';
import LoadingIndicator from '../components/LoadingIndicator';
import { usePermissions } from '../hooks/usePermissions';
import './Configuration.css';

const Configuration: React.FC = () => {
  const { canManageConfiguration } = usePermissions();
  const [config, setConfig] = useState<ConfigurationType | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [showResetModal, setShowResetModal] = useState(false);
  const [editingDiscount, setEditingDiscount] = useState<FamilyDiscount | null>(null);
  const [showDiscountModal, setShowDiscountModal] = useState(false);

  useEffect(() => {
    loadConfiguration();
  }, []);

  const loadConfiguration = async () => {
    try {
      setLoading(true);
      const configuration = await ConfigurationService.getConfiguration();
      setConfig(configuration);
    } catch (error: any) {
      console.error('Error loading configuration:', error);
      alert('Error al cargar la configuración');
    } finally {
      setLoading(false);
    }
  };

  const handleSaveConfiguration = async () => {
    if (!config) return;
    
    try {
      setSaving(true);
      await ConfigurationService.updateConfiguration(config);
      alert('Configuración guardada correctamente');
    } catch (error: any) {
      console.error('Error saving configuration:', error);
      alert('Error: ' + (error.message || 'Error al guardar la configuración'));
    } finally {
      setSaving(false);
    }
  };

  const handleResetConfiguration = async () => {
    try {
      setSaving(true);
      const resetConfig = await ConfigurationService.resetConfiguration();
      setConfig(resetConfig);
      setShowResetModal(false);
      alert('Configuración reseteada a valores por defecto');
    } catch (error: any) {
      console.error('Error resetting configuration:', error);
      alert('Error: ' + (error.message || 'Error al resetear la configuración'));
    } finally {
      setSaving(false);
    }
  };

  const updateFamilyDiscounts = (field: string, value: any) => {
    if (!config) return;
    
    setConfig({
      ...config,
      familyDiscounts: {
        ...config.familyDiscounts,
        [field]: value
      }
    });
  };

  const addDiscount = () => {
    if (!config) return;
    
    const newDiscount: FamilyDiscount = {
      memberCount: 2,
      discountPercentage: 5,
      description: ''
    };
    
    setEditingDiscount(newDiscount);
    setShowDiscountModal(true);
  };

  const editDiscount = (discount: FamilyDiscount) => {
    setEditingDiscount({ ...discount });
    setShowDiscountModal(true);
  };

  const saveDiscount = () => {
    if (!config || !editingDiscount) return;
    
    const updatedDiscounts = [...config.familyDiscounts.byMemberCount];
    
    if (editingDiscount._id) {
      // Editar descuento existente
      const index = updatedDiscounts.findIndex(d => d._id === editingDiscount._id);
      if (index !== -1) {
        updatedDiscounts[index] = editingDiscount;
      }
    } else {
      // Agregar nuevo descuento
      updatedDiscounts.push(editingDiscount);
    }
    
    // Ordenar por cantidad de miembros
    updatedDiscounts.sort((a, b) => a.memberCount - b.memberCount);
    
    updateFamilyDiscounts('byMemberCount', updatedDiscounts);
    setShowDiscountModal(false);
    setEditingDiscount(null);
  };

  const deleteDiscount = (discountId: string) => {
    if (!config) return;
    
    if (confirm('¿Estás seguro de que quieres eliminar este descuento?')) {
      const updatedDiscounts = config.familyDiscounts.byMemberCount.filter(
        d => d._id !== discountId
      );
      updateFamilyDiscounts('byMemberCount', updatedDiscounts);
    }
  };

  const updateSystemConfig = (field: string, value: any) => {
    if (!config) return;
    
    setConfig({
      ...config,
      system: {
        ...config.system,
        [field]: value
      }
    });
  };

  const updateReceiptsConfig = (field: string, value: any) => {
    if (!config) return;
    
    setConfig({
      ...config,
      system: {
        ...config.system,
        receipts: {
          ...config.system.receipts,
          [field]: value
        }
      }
    });
  };

  if (loading) {
    return <LoadingIndicator />;
  }

  if (!config) {
    return <div className="error-message">No se pudo cargar la configuración</div>;
  }

  return (
    <div className="configuration-container">
      <div className="configuration-header">
        <div className="header-content">
          <h1 className="configuration-title">Configuración del Sistema</h1>
          <p className="configuration-subtitle">Gestiona la configuración general y descuentos automáticos</p>
        </div>
        <div className="header-actions">
          <button
            className="reset-button"
            onClick={() => setShowResetModal(true)}
            disabled={saving}
          >
            <RotateCcw size={16} />
            <span>Resetear</span>
          </button>
          <button
            className="save-button"
            onClick={handleSaveConfiguration}
            disabled={saving}
          >
            <Save size={16} />
            <span>{saving ? 'Guardando...' : 'Guardar'}</span>
          </button>
        </div>
      </div>

      <div className="configuration-content">
        {/* Descuentos Familiares */}
        <div className="config-section">
          <div className="section-header">
            <div className="section-icon">
              <Percent size={20} color="#3B82F6" />
            </div>
            <div className="section-content">
              <h2 className="section-title">Descuentos Familiares Automáticos</h2>
              <p className="section-description">
                Configura los descuentos automáticos según la cantidad de integrantes del grupo familiar
              </p>
            </div>
          </div>

          <div className="section-body">
            <div className="config-row">
              <label className="config-label">
                <input
                  type="checkbox"
                  checked={config.familyDiscounts.autoDiscountEnabled}
                  onChange={(e) => updateFamilyDiscounts('autoDiscountEnabled', e.target.checked)}
                  className="config-checkbox"
                />
                Habilitar descuentos automáticos
              </label>
            </div>

            <div className="config-row">
              <label className="config-label">Descuento máximo permitido:</label>
              <div className="config-input-group">
                <input
                  type="number"
                  min="0"
                  max="100"
                  value={config.familyDiscounts.maxDiscount}
                  onChange={(e) => updateFamilyDiscounts('maxDiscount', parseInt(e.target.value))}
                  className="config-input"
                />
                <span className="input-suffix">%</span>
              </div>
            </div>

            <div className="discounts-table-container">
              <div className="table-header">
                <h3>Tabla de Descuentos</h3>
                <button
                  className="add-discount-button"
                  onClick={addDiscount}
                  disabled={!config.familyDiscounts.autoDiscountEnabled}
                >
                  <Plus size={16} />
                  <span>Agregar Descuento</span>
                </button>
              </div>

              <div className="discounts-table">
                <div className="table-row header">
                  <div className="table-cell">Integrantes</div>
                  <div className="table-cell">Descuento</div>
                  <div className="table-cell">Descripción</div>
                  <div className="table-cell">Acciones</div>
                </div>

                {config.familyDiscounts.byMemberCount.map((discount) => (
                  <div key={discount._id} className="table-row">
                    <div className="table-cell">
                      <span className="member-count">{discount.memberCount}</span>
                    </div>
                    <div className="table-cell">
                      <span className="discount-percentage">{discount.discountPercentage}%</span>
                    </div>
                    <div className="table-cell">
                      <span className="discount-description">{discount.description}</span>
                    </div>
                    <div className="table-cell">
                      <div className="table-actions">
                        <button
                          className="action-button edit"
                          onClick={() => editDiscount(discount)}
                        >
                          <Settings size={14} />
                        </button>
                        <button
                          className="action-button delete"
                          onClick={() => deleteDiscount(discount._id!)}
                        >
                          <Trash2 size={14} />
                        </button>
                      </div>
                    </div>
                  </div>
                ))}

                {config.familyDiscounts.byMemberCount.length === 0 && (
                  <div className="table-row empty">
                    <div className="table-cell" colSpan={4}>
                      No hay descuentos configurados
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Configuración del Sistema */}
        <div className="config-section">
          <div className="section-header">
            <div className="section-icon">
              <Building size={20} color="#10B981" />
            </div>
            <div className="section-content">
              <h2 className="section-title">Configuración General</h2>
              <p className="section-description">
                Configuración básica del sistema y recibos
              </p>
            </div>
          </div>

          <div className="section-body">
            <div className="config-row">
              <label className="config-label">Nombre del Club:</label>
              <input
                type="text"
                value={config.system.clubName}
                onChange={(e) => updateSystemConfig('clubName', e.target.value)}
                className="config-input"
                placeholder="Nombre del club"
              />
            </div>

            <div className="config-row">
              <label className="config-label">Moneda:</label>
              <select
                value={config.system.currency}
                onChange={(e) => updateSystemConfig('currency', e.target.value)}
                className="config-select"
              >
                <option value="ARS">Pesos Argentinos (ARS)</option>
                <option value="USD">Dólares (USD)</option>
                <option value="EUR">Euros (EUR)</option>
              </select>
            </div>

            <div className="config-row">
              <label className="config-label">Texto del pie de página (recibos):</label>
              <input
                type="text"
                value={config.system.receipts.footerText}
                onChange={(e) => updateReceiptsConfig('footerText', e.target.value)}
                className="config-input"
                placeholder="Gracias por su pago"
              />
            </div>

            <div className="config-row">
              <label className="config-label">URL del logo (recibos):</label>
              <input
                type="url"
                value={config.system.receipts.logoUrl}
                onChange={(e) => updateReceiptsConfig('logoUrl', e.target.value)}
                className="config-input"
                placeholder="https://ejemplo.com/logo.png"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Modal para editar descuento */}
      <Modal
        isOpen={showDiscountModal}
        onClose={() => setShowDiscountModal(false)}
        title={editingDiscount?._id ? 'Editar Descuento' : 'Nuevo Descuento'}
      >
        <div className="discount-form">
          <div className="form-group">
            <label className="form-label">Cantidad de integrantes:</label>
            <input
              type="number"
              min="2"
              value={editingDiscount?.memberCount || 2}
              onChange={(e) => setEditingDiscount(prev => prev ? {
                ...prev,
                memberCount: parseInt(e.target.value)
              } : null)}
              className="form-input"
            />
          </div>

          <div className="form-group">
            <label className="form-label">Porcentaje de descuento:</label>
            <div className="input-group">
              <input
                type="number"
                min="0"
                max="100"
                value={editingDiscount?.discountPercentage || 0}
                onChange={(e) => setEditingDiscount(prev => prev ? {
                  ...prev,
                  discountPercentage: parseInt(e.target.value)
                } : null)}
                className="form-input"
              />
              <span className="input-suffix">%</span>
            </div>
          </div>

          <div className="form-group">
            <label className="form-label">Descripción:</label>
            <input
              type="text"
              value={editingDiscount?.description || ''}
              onChange={(e) => setEditingDiscount(prev => prev ? {
                ...prev,
                description: e.target.value
              } : null)}
              className="form-input"
              placeholder="Ej: 2 integrantes"
            />
          </div>

          <div className="form-actions">
            <button
              className="cancel-button"
              onClick={() => setShowDiscountModal(false)}
            >
              Cancelar
            </button>
            <button
              className="save-button"
              onClick={saveDiscount}
            >
              Guardar
            </button>
          </div>
        </div>
      </Modal>

      {/* Modal de confirmación para resetear */}
      <Modal
        isOpen={showResetModal}
        onClose={() => setShowResetModal(false)}
        title="Confirmar Reset"
      >
        <div className="reset-confirmation">
          <p>¿Estás seguro de que quieres resetear la configuración a los valores por defecto?</p>
          <p className="warning-text">Esta acción no se puede deshacer.</p>
          
          <div className="form-actions">
            <button
              className="cancel-button"
              onClick={() => setShowResetModal(false)}
            >
              Cancelar
            </button>
            <button
              className="reset-button"
              onClick={handleResetConfiguration}
              disabled={saving}
            >
              {saving ? 'Reseteando...' : 'Resetear'}
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default Configuration;
