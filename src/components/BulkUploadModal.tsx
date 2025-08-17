import React, { useState, useRef } from 'react';
import { Upload, X, Download, AlertCircle, CheckCircle } from 'lucide-react';
import Modal from './Modal';
import { Category } from '../services/categoriesService';

interface BulkUploadModalProps {
  isOpen: boolean;
  onClose: () => void;
  category: Category | null;
  onUpload: (data: any[]) => Promise<void>;
}

interface UploadResult {
  success: boolean;
  message: string;
  data?: any[];
  errors?: string[];
}

const BulkUploadModal: React.FC<BulkUploadModalProps> = ({
  isOpen,
  onClose,
  category,
  onUpload
}) => {
  const [file, setFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const [uploadResult, setUploadResult] = useState<UploadResult | null>(null);
  const [playerCount, setPlayerCount] = useState<number>(0);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = event.target.files?.[0];
    if (selectedFile) {
      setFile(selectedFile);
      setUploadResult(null);
      processFile(selectedFile);
    }
  };

  const processFile = async (file: File) => {
    try {
      const data = await parseExcelFile(file);
      setPlayerCount(data.length);
    } catch (error) {
      console.error('Error procesando archivo:', error);
      setUploadResult({
        success: false,
        message: 'Error procesando el archivo Excel',
        errors: [error instanceof Error ? error.message : 'Error desconocido']
      });
    }
  };

  const parseExcelFile = async (file: File): Promise<any[]> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      
      reader.onload = (e) => {
        try {
          const data = e.target?.result;
          if (typeof data === 'string') {
            const lines = data.split('\n');
            const headers = lines[0].split(',').map(h => h.trim().toLowerCase());
            
            // Validar headers requeridos (solo nombre y apellido)
            const requiredHeaders = ['nombre', 'apellido'];
            const missingHeaders = requiredHeaders.filter(h => !headers.includes(h));
            
            if (missingHeaders.length > 0) {
              reject(new Error(`Columnas faltantes: ${missingHeaders.join(', ')}`));
              return;
            }
            
            const players = lines.slice(1).filter(line => line.trim()).map((line, index) => {
              const values = line.split(',').map(v => v.trim());
              const player: any = {};
              
              headers.forEach((header, i) => {
                player[header] = values[i] || '';
              });
              
              // Validar datos requeridos (solo nombre y apellido)
              if (!player.nombre || !player.apellido) {
                throw new Error(`Fila ${index + 2}: Nombre y apellido son obligatorios`);
              }
              
              // Validar formato de email (solo si se proporciona)
              if (player.email && player.email.trim()) {
                const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
                if (!emailRegex.test(player.email)) {
                  throw new Error(`Fila ${index + 2}: Email inválido`);
                }
              }
              
              // Validar formato de fecha
              if (player.fecha_nacimiento) {
                const date = new Date(player.fecha_nacimiento);
                if (isNaN(date.getTime())) {
                  throw new Error(`Fila ${index + 2}: Fecha inválida`);
                }
              }
              
              return {
                firstName: player.nombre,
                lastName: player.apellido,
                email: player.email || '',
                birthDate: player.fecha_nacimiento || '2000-01-01',
                phone: player.telefono || '',
                categoryId: category?._id || ''
              };
            });
            
            resolve(players);
          } else {
            reject(new Error('Formato de archivo no válido'));
          }
        } catch (error) {
          reject(error);
        }
      };
      
      reader.onerror = () => reject(new Error('Error leyendo archivo'));
      reader.readAsText(file);
    });
  };

  const handleUpload = async () => {
    if (!file || !category) return;
    
    setUploading(true);
    setUploadResult(null);
    
    try {
      const data = await parseExcelFile(file);
      await onUpload(data);
      
      setUploadResult({
        success: true,
        message: `${data.length} jugadores cargados exitosamente`,
        data
      });
      
      // Limpiar después de un éxito
      setTimeout(() => {
        handleClose();
      }, 2000);
      
    } catch (error) {
      setUploadResult({
        success: false,
        message: 'Error cargando jugadores',
        errors: [error instanceof Error ? error.message : 'Error desconocido']
      });
    } finally {
      setUploading(false);
    }
  };

  const handleClose = () => {
    setFile(null);
    setUploadResult(null);
    setPlayerCount(0);
    setUploading(false);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
    onClose();
  };

  const downloadTemplate = () => {
    const template = `nombre,apellido,email,fecha_nacimiento,telefono
Juan,Pérez,juan.perez@email.com,2005-03-15,123456789
María,González,maria.gonzalez@email.com,2006-07-22,987654321
Carlos,Rodríguez,carlos.rodriguez@email.com,2005-11-08,555666777`;
    
    const blob = new Blob([template], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `plantilla_jugadores_${category?.name || 'categoria'}.csv`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    window.URL.revokeObjectURL(url);
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={handleClose}
      title={`Carga Masiva - ${category?.name || 'Categoría'}`}
      size="md"
    >
      <div className="space-y-4">
        {/* Información rápida de la categoría */}
        {category && (
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
            <p className="text-sm text-blue-800">
              <strong>{category.name}</strong> - {category.gender} (${category.cuota})
            </p>
          </div>
        )}

        {/* Descarga de plantilla */}
        <div className="flex items-center justify-between bg-gray-50 border border-gray-200 rounded-lg p-3">
          <div>
            <p className="text-sm text-gray-700">Descargar plantilla CSV</p>
          </div>
          <button
            onClick={downloadTemplate}
            className="bg-green-600 text-white px-3 py-1 rounded text-sm hover:bg-green-700 transition-colors flex items-center space-x-1"
          >
            <Download className="w-3 h-3" />
            <span>Descargar</span>
          </button>
        </div>

        {/* Carga de archivo */}
        <div className="border-2 border-dashed border-gray-300 rounded-lg p-4 text-center">
          <input
            ref={fileInputRef}
            type="file"
            accept=".csv,.xlsx,.xls"
            onChange={handleFileChange}
            className="hidden"
          />
          
          {!file ? (
            <div>
              <Upload className="w-8 h-8 text-gray-400 mx-auto mb-2" />
              <p className="text-sm text-gray-600 mb-3">
                Selecciona tu archivo CSV/Excel
              </p>
              <button
                onClick={() => fileInputRef.current?.click()}
                className="bg-blue-600 text-white px-4 py-2 rounded text-sm hover:bg-blue-700 transition-colors"
              >
                Seleccionar Archivo
              </button>
            </div>
          ) : (
            <div>
              <CheckCircle className="w-8 h-8 text-green-500 mx-auto mb-2" />
              <p className="text-sm text-gray-600 mb-2">{file.name}</p>
              <div className="flex space-x-2 justify-center">
                <button
                  onClick={() => fileInputRef.current?.click()}
                  className="bg-gray-600 text-white px-3 py-1 rounded text-sm hover:bg-gray-700 transition-colors"
                >
                  Cambiar
                </button>
                <button
                  onClick={() => setFile(null)}
                  className="bg-red-600 text-white px-3 py-1 rounded text-sm hover:bg-red-700 transition-colors"
                >
                  <X className="w-3 h-3 inline mr-1" />
                  Eliminar
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Resumen compacto */}
        {playerCount > 0 && (
          <div className="bg-green-50 border border-green-200 rounded-lg p-3">
            <p className="text-sm text-green-800">
              <strong>{playerCount} jugadores</strong> listos para cargar
            </p>
          </div>
        )}

        {/* Resultado de la carga */}
        {uploadResult && (
          <div className={`border rounded-lg p-3 ${
            uploadResult.success 
              ? 'bg-green-50 border-green-200 text-green-800' 
              : 'bg-red-50 border-red-200 text-red-800'
          }`}>
            <div className="flex items-center space-x-2">
              {uploadResult.success ? (
                <CheckCircle className="w-4 h-4" />
              ) : (
                <AlertCircle className="w-4 h-4" />
              )}
              <span className="text-sm font-medium">{uploadResult.message}</span>
            </div>
            {uploadResult.errors && uploadResult.errors.length > 0 && (
              <ul className="mt-2 list-disc list-inside text-xs">
                {uploadResult.errors.slice(0, 3).map((error, index) => (
                  <li key={index}>{error}</li>
                ))}
                {uploadResult.errors.length > 3 && (
                  <li>... y {uploadResult.errors.length - 3} errores más</li>
                )}
              </ul>
            )}
          </div>
        )}

        {/* Botones de acción */}
        <div className="flex space-x-3 pt-2">
          <button
            onClick={handleUpload}
            disabled={!file || uploading}
            className="flex-1 bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center text-sm"
          >
            {uploading ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                Cargando...
              </>
            ) : (
              <>
                <Upload className="w-4 h-4 mr-2" />
                Cargar Jugadores
              </>
            )}
          </button>
          <button
            onClick={handleClose}
            disabled={uploading}
            className="flex-1 bg-gray-300 text-gray-700 py-2 px-4 rounded-lg hover:bg-gray-400 transition-colors disabled:opacity-50 disabled:cursor-not-allowed text-sm"
          >
            Cancelar
          </button>
        </div>
      </div>
    </Modal>
  );
};

export default BulkUploadModal; 