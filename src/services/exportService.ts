import * as XLSX from 'xlsx';
import { saveAs } from 'file-saver';

export interface ExportDebtorData {
  playerId: string;
  playerName: string;
  playerEmail: string;
  category: string;
  categoryQuota: number;
  unpaidMonthsCount: number;
  totalOwed: number;
  lastPaymentDate: string | null;
  lastPaymentMonth: string | null;
  monthsSinceLastPayment: number | null;
  unpaidMonths: Array<{
    month: number;
    year: number;
    monthName: string;
    amount: number;
  }>;
}

export interface ExportOptions {
  month?: number;
  year?: number;
  category?: string;
  minMonths?: number;
  detailed?: boolean;
}

export interface DetailedDebtorRow {
  playerId: string;
  playerName: string;
  playerEmail: string;
  category: string;
  categoryQuota: number;
  month: number;
  year: number;
  monthName: string;
  amount: number;
  totalOwed: number;
  lastPaymentDate: string | null;
  lastPaymentMonth: string | null;
  monthsSinceLastPayment: number | null;
}

class ExportService {
  /**
   * Exporta la lista de deudores a Excel
   */
  exportDebtorsToExcel(
    debtors: ExportDebtorData[] | DetailedDebtorRow[], 
    options: ExportOptions = {},
    summary?: {
      totalDebtors: number;
      totalOwed: number;
      averageMonthsUnpaid: number;
      currentYear: number;
      currentMonth: number;
      monthsChecked: number;
    }
  ) {
    try {
      console.log('📊 Exportando deudores a Excel...', { debtors: debtors.length, options });

      // Crear el libro de trabajo
      const workbook = XLSX.utils.book_new();

      // Verificar si son datos detallados o agrupados
      const isDetailed = options.detailed && debtors.length > 0 && 'month' in debtors[0];

      let mainData;
      if (isDetailed) {
        // Datos detallados (una fila por mes)
        mainData = (debtors as DetailedDebtorRow[]).map(row => ({
          'ID Jugador': row.playerId,
          'Nombre': row.playerName,
          'Email': row.playerEmail,
          'Categoría': row.category,
          'Cuota Mensual': row.categoryQuota,
          'Mes': row.monthName,
          'Año': row.year,
          'Monto del Mes': row.amount,
          'Total Adeudado': row.totalOwed,
          'Último Pago': row.lastPaymentMonth || 'Nunca',
          'Meses Desde Último Pago': row.monthsSinceLastPayment || 'N/A'
        }));
      } else {
        // Datos agrupados (una fila por jugador)
        mainData = (debtors as ExportDebtorData[]).map(debtor => ({
          'ID Jugador': debtor.playerId,
          'Nombre': debtor.playerName,
          'Email': debtor.playerEmail,
          'Categoría': debtor.category,
          'Cuota Mensual': debtor.categoryQuota,
          'Meses Sin Pagar': debtor.unpaidMonthsCount,
          'Total Adeudado': debtor.totalOwed,
          'Último Pago': debtor.lastPaymentMonth || 'Nunca',
          'Meses Desde Último Pago': debtor.monthsSinceLastPayment || 'N/A',
          'Meses Sin Pagar (Detalle)': debtor.unpaidMonths.map(m => m.monthName).join(', ')
        }));
      }

      // Crear hoja principal
      const mainWorksheet = XLSX.utils.json_to_sheet(mainData);

      // Ajustar ancho de columnas según el tipo de datos
      let columnWidths;
      if (isDetailed) {
        columnWidths = [
          { wch: 15 }, // ID Jugador
          { wch: 25 }, // Nombre
          { wch: 30 }, // Email
          { wch: 20 }, // Categoría
          { wch: 15 }, // Cuota Mensual
          { wch: 15 }, // Mes
          { wch: 10 }, // Año
          { wch: 15 }, // Monto del Mes
          { wch: 15 }, // Total Adeudado
          { wch: 15 }, // Último Pago
          { wch: 20 }  // Meses Desde Último Pago
        ];
      } else {
        columnWidths = [
          { wch: 15 }, // ID Jugador
          { wch: 25 }, // Nombre
          { wch: 30 }, // Email
          { wch: 20 }, // Categoría
          { wch: 15 }, // Cuota Mensual
          { wch: 15 }, // Meses Sin Pagar
          { wch: 15 }, // Total Adeudado
          { wch: 15 }, // Último Pago
          { wch: 20 }, // Meses Desde Último Pago
          { wch: 50 }  // Meses Sin Pagar (Detalle)
        ];
      }
      mainWorksheet['!cols'] = columnWidths;

      // Agregar hoja principal al libro
      XLSX.utils.book_append_sheet(workbook, mainWorksheet, isDetailed ? 'Detalle Mensual' : 'Deudores');

      // Crear hoja de resumen si hay datos de summary
      if (summary) {
        const summaryData = [
          { 'Métrica': 'Total de Deudores', 'Valor': summary.totalDebtors },
          { 'Métrica': 'Total Adeudado', 'Valor': `$${summary.totalOwed.toLocaleString()}` },
          { 'Métrica': 'Promedio Meses Sin Pagar', 'Valor': summary.averageMonthsUnpaid.toFixed(1) },
          { 'Métrica': 'Año Actual', 'Valor': summary.currentYear },
          { 'Métrica': 'Mes Actual', 'Valor': summary.currentMonth },
          { 'Métrica': 'Meses Analizados', 'Valor': summary.monthsChecked },
          { 'Métrica': '', 'Valor': '' },
          { 'Métrica': 'Filtros Aplicados', 'Valor': this.getFiltersDescription(options) }
        ];

        const summaryWorksheet = XLSX.utils.json_to_sheet(summaryData);
        summaryWorksheet['!cols'] = [{ wch: 25 }, { wch: 20 }];
        XLSX.utils.book_append_sheet(workbook, summaryWorksheet, 'Resumen');
      }

      // Crear hoja detallada de meses sin pagar solo si no son datos detallados
      if (!isDetailed) {
        const detailedData = [];
        (debtors as ExportDebtorData[]).forEach(debtor => {
          debtor.unpaidMonths.forEach(month => {
            detailedData.push({
              'ID Jugador': debtor.playerId,
              'Nombre': debtor.playerName,
              'Email': debtor.playerEmail,
              'Categoría': debtor.category,
              'Mes': month.monthName,
              'Año': month.year,
              'Monto Adeudado': month.amount
            });
          });
        });

        if (detailedData.length > 0) {
          const detailedWorksheet = XLSX.utils.json_to_sheet(detailedData);
          detailedWorksheet['!cols'] = [
            { wch: 15 }, // ID Jugador
            { wch: 25 }, // Nombre
            { wch: 30 }, // Email
            { wch: 20 }, // Categoría
            { wch: 15 }, // Mes
            { wch: 10 }, // Año
            { wch: 15 }  // Monto Adeudado
          ];
          XLSX.utils.book_append_sheet(workbook, detailedWorksheet, 'Detalle por Mes');
        }
      }

      // Generar nombre del archivo
      const fileName = this.generateFileName(options);

      // Convertir a blob y descargar
      const excelBuffer = XLSX.write(workbook, { bookType: 'xlsx', type: 'array' });
      const blob = new Blob([excelBuffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
      
      saveAs(blob, fileName);
      
      console.log('✅ Archivo Excel exportado exitosamente:', fileName);
      
      return fileName;
    } catch (error) {
      console.error('❌ Error exportando a Excel:', error);
      throw new Error('Error al exportar el archivo Excel');
    }
  }

  /**
   * Genera el nombre del archivo basado en las opciones de filtro
   */
  private generateFileName(options: ExportOptions): string {
    const currentDate = new Date();
    const dateStr = currentDate.toISOString().split('T')[0]; // YYYY-MM-DD
    
    let fileName = `deudores_${dateStr}`;
    
    if (options.year) {
      fileName += `_${options.year}`;
    }
    
    if (options.month) {
      const monthNames = [
        'enero', 'febrero', 'marzo', 'abril', 'mayo', 'junio',
        'julio', 'agosto', 'septiembre', 'octubre', 'noviembre', 'diciembre'
      ];
      fileName += `_${monthNames[options.month - 1]}`;
    }
    
    if (options.category) {
      fileName += `_${options.category.replace(/\s+/g, '_')}`;
    }
    
    if (options.minMonths && options.minMonths > 1) {
      fileName += `_${options.minMonths}+meses`;
    }
    
    return `${fileName}.xlsx`;
  }

  /**
   * Genera descripción de filtros aplicados
   */
  private getFiltersDescription(options: ExportOptions): string {
    const filters = [];
    
    if (options.year) {
      filters.push(`Año: ${options.year}`);
    }
    
    if (options.month) {
      const monthNames = [
        'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
        'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'
      ];
      filters.push(`Mes: ${monthNames[options.month - 1]}`);
    }
    
    if (options.category) {
      filters.push(`Categoría: ${options.category}`);
    }
    
    if (options.minMonths && options.minMonths > 1) {
      filters.push(`Mínimo ${options.minMonths} meses sin pagar`);
    }
    
    return filters.length > 0 ? filters.join(', ') : 'Sin filtros';
  }

  /**
   * Exporta datos de pagos a Excel
   */
  exportPaymentsToExcel(payments: any[], options: ExportOptions = {}) {
    try {
      console.log('📊 Exportando pagos a Excel...', { payments: payments.length, options });

      const workbook = XLSX.utils.book_new();

      // Preparar datos de pagos
      const paymentsData = payments.map(payment => ({
        'ID Pago': payment._id,
        'Jugador': payment.player?.fullName || 'N/A',
        'Email': payment.player?.email || 'N/A',
        'Categoría': payment.player?.category?.name || 'N/A',
        'Mes': payment.month,
        'Año': payment.year,
        'Monto': payment.amount,
        'Método de Pago': payment.paymentMethod,
        'Número de Recibo': payment.receiptNumber,
        'Fecha de Registro': new Date(payment.registrationDate).toLocaleDateString('es-ES'),
        'Notas': payment.notes || ''
      }));

      const worksheet = XLSX.utils.json_to_sheet(paymentsData);
      
      // Ajustar ancho de columnas
      worksheet['!cols'] = [
        { wch: 15 }, // ID Pago
        { wch: 25 }, // Jugador
        { wch: 30 }, // Email
        { wch: 20 }, // Categoría
        { wch: 10 }, // Mes
        { wch: 10 }, // Año
        { wch: 15 }, // Monto
        { wch: 15 }, // Método de Pago
        { wch: 15 }, // Número de Recibo
        { wch: 20 }, // Fecha de Registro
        { wch: 30 }  // Notas
      ];

      XLSX.utils.book_append_sheet(workbook, worksheet, 'Pagos');

      // Generar nombre del archivo
      const currentDate = new Date();
      const dateStr = currentDate.toISOString().split('T')[0];
      const fileName = `pagos_${dateStr}.xlsx`;

      // Convertir a blob y descargar
      const excelBuffer = XLSX.write(workbook, { bookType: 'xlsx', type: 'array' });
      const blob = new Blob([excelBuffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
      
      saveAs(blob, fileName);
      
      console.log('✅ Archivo de pagos exportado exitosamente:', fileName);
      
      return fileName;
    } catch (error) {
      console.error('❌ Error exportando pagos a Excel:', error);
      throw new Error('Error al exportar el archivo de pagos');
    }
  }
}

export default new ExportService();
