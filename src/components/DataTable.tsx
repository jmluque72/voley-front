import React from 'react';
import { Edit, Trash2, Search } from 'lucide-react';

interface Column {
  key: string;
  label: string;
  sortable?: boolean;
  render?: (value: any, item: any) => React.ReactNode;
}

interface DataTableProps {
  data: any[];
  columns: Column[];
  onEdit: (item: any) => void;
  onDelete: (item: any) => void;
  searchTerm: string;
  onSearchChange: (term: string) => void;
  customActions?: (item: any) => React.ReactNode;
}

const DataTable: React.FC<DataTableProps> = ({
  data,
  columns,
  onEdit,
  onDelete,
  searchTerm,
  onSearchChange,
  customActions,
}) => {
  const renderCellValue = (column: Column, item: any) => {
    const value = item[column.key];
    
    // Si hay una función render personalizada, usarla
    if (column.render) {
      try {
        return column.render(value, item);
      } catch (error) {
        console.error(`Error rendering column ${column.key}:`, error);
        return 'Error de renderizado';
      }
    }
    
    // Si el valor es null o undefined, retornar string vacío
    if (value === null || value === undefined) {
      return '';
    }
    
    // Si el valor es un objeto, convertirlo a string
    if (value && typeof value === 'object') {
      if (value.name && value.gender) {
        return `${value.name} - ${value.gender}`;
      }
      return JSON.stringify(value);
    }
    
    // Para fechas, formatearlas
    if (value instanceof Date || (typeof value === 'string' && value.includes('T'))) {
      const date = new Date(value);
      return date.toLocaleDateString('es-ES');
    }
    
    // Para otros valores, convertirlos a string
    return String(value);
  };

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200">
      <div className="p-4 border-b border-gray-200">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
          <input
            type="text"
            placeholder="Buscar..."
            value={searchTerm}
            onChange={(e) => onSearchChange(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          />
        </div>
      </div>
      
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
            {data.map((item, index) => (
              <tr key={item._id || item.id || index} className="hover:bg-gray-50">
                {columns.map((column) => (
                  <td key={column.key} className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {renderCellValue(column, item)}
                  </td>
                ))}
                <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                  {customActions ? (
                    customActions(item)
                  ) : (
                    <>
                      <button
                        onClick={() => onEdit(item)}
                        className="text-blue-600 hover:text-blue-900 mr-4 transition-colors"
                      >
                        <Edit className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => onDelete(item)}
                        className="text-red-600 hover:text-red-900 transition-colors"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      
      {data.length === 0 && (
        <div className="text-center py-12">
          <p className="text-gray-500">No hay datos disponibles</p>
        </div>
      )}
    </div>
  );
};

export default DataTable;