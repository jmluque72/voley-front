import jsPDF from 'jspdf';
import 'jspdf-autotable';
import { Payment } from './paymentsService';

// Extender el tipo jsPDF para incluir autoTable
declare module 'jspdf' {
  interface jsPDF {
    autoTable: (options: any) => jsPDF;
  }
}

export interface ReceiptData {
  payment: Payment;
  companyInfo?: {
    name: string;
    address: string;
    phone: string;
    email: string;
  };
  receiptNumber?: string;
}

class ReceiptService {
  private defaultCompanyInfo = {
    name: 'CLUB DE VOLLEYBALL',
    address: 'Av. Principal 123, Ciudad',
    phone: '+54 9 11 1234-5678',
    email: 'info@volleyball.com'
  };

  // Función para convertir números a palabras (español)
  private numberToWords(num: number): string {
    if (num === 0) return 'cero';
    
    const ones = ['', 'uno', 'dos', 'tres', 'cuatro', 'cinco', 'seis', 'siete', 'ocho', 'nueve', 'diez',
      'once', 'doce', 'trece', 'catorce', 'quince', 'dieciséis', 'diecisiete', 'dieciocho', 'diecinueve'];
    const tens = ['', '', 'veinte', 'treinta', 'cuarenta', 'cincuenta', 'sesenta', 'setenta', 'ochenta', 'noventa'];
    const hundreds = ['', 'ciento', 'doscientos', 'trescientos', 'cuatrocientos', 'quinientos', 'seiscientos', 'setecientos', 'ochocientos', 'novecientos'];

    const integerPart = Math.floor(num);
    const decimalPart = Math.round((num - integerPart) * 100);

    let result = '';

    if (integerPart >= 1000) {
      const thousands = Math.floor(integerPart / 1000);
      if (thousands === 1) {
        result += 'mil ';
      } else {
        result += this.convertHundreds(thousands, ones, tens, hundreds) + ' mil ';
      }
      result += this.convertHundreds(integerPart % 1000, ones, tens, hundreds);
    } else {
      result = this.convertHundreds(integerPart, ones, tens, hundreds);
    }

    if (decimalPart > 0) {
      result += ` con ${decimalPart}/100`;
    }

    return result.trim();
  }

  private convertHundreds(num: number, ones: string[], tens: string[], hundreds: string[]): string {
    let result = '';
    
    if (num >= 100) {
      if (num === 100) {
        result += 'cien ';
      } else {
        result += hundreds[Math.floor(num / 100)] + ' ';
      }
      num %= 100;
    }
    
    if (num >= 20) {
      result += tens[Math.floor(num / 10)];
      if (num % 10 !== 0) {
        result += ' y ' + ones[num % 10];
      }
    } else if (num > 0) {
      result += ones[num];
    }
    
    return result.trim();
  }

  generateReceiptPDF(data: ReceiptData): void {
    const { payment, companyInfo = this.defaultCompanyInfo } = data;
    
    // Crear nuevo documento PDF
    const doc = new jsPDF({
      orientation: 'portrait',
      unit: 'mm',
      format: 'a4'
    });

    // Generar número de recibo
    const receiptNumber = data.receiptNumber || `${String(Math.floor(Math.random() * 999999) + 1).padStart(6, '0')}`;
    
    // Obtener fecha del pago
    const paymentDate = new Date(payment.createdAt);
    const day = paymentDate.getDate().toString().padStart(2, '0');
    const month = (paymentDate.getMonth() + 1).toString().padStart(2, '0');
    const year = paymentDate.getFullYear().toString();

    // Configuración de bordes y colores
    doc.setDrawColor(0, 0, 0);
    doc.setLineWidth(0.5);

    // === BORDE PRINCIPAL DEL RECIBO ===
    doc.rect(15, 15, 180, 160);

    // === ENCABEZADO CON FECHA Y NÚMERO ===
    let yPos = 25;

    // Cuadros de fecha (DIA, MES, AÑO)
    doc.rect(20, yPos, 15, 8);
    doc.rect(35, yPos, 15, 8);
    doc.rect(50, yPos, 15, 8);
    
    // Labels de fecha
    doc.setFontSize(8);
    doc.text('DIA', 22, yPos + 6);
    doc.text('MES', 37, yPos + 6);
    doc.text('AÑO', 52, yPos + 6);

    // Valores de fecha
    doc.setFontSize(10);
    doc.text(day, 27.5 - (day.length * 1), yPos + 12);
    doc.text(month, 42.5 - (month.length * 1), yPos + 12);
    doc.text(year, 57.5 - (year.length * 1.5), yPos + 12);

    // Número de recibo (centrado)
    doc.setFontSize(14);
    doc.setTextColor(255, 0, 0);
    doc.text(`№ ${receiptNumber}`, 105, yPos + 7, { align: 'center' });

    // Cuadro de moneda (derecha)
    doc.setTextColor(0, 0, 0);
    doc.rect(160, yPos, 30, 12);
    doc.setFontSize(10);
    doc.text('$', 165, yPos + 6);
    doc.setFontSize(8);
    doc.text('Pesos', 170, yPos + 5);
    doc.text('Arg.', 170, yPos + 9);

    yPos += 20;

    // === TÍTULO RECIBO ===
    doc.setFontSize(20);
    doc.setTextColor(0, 0, 255);
    doc.text('RECIBO', 105, yPos, { align: 'center' });

    yPos += 15;

    // === RECIBÍ DE ===
    doc.setFontSize(12);
    doc.setTextColor(0, 0, 0);
    doc.text('Recibí de:', 20, yPos);
    
    // Línea para el nombre
    doc.line(42, yPos, 190, yPos);
    doc.setFontSize(10);
    const playerName = payment.player ? payment.player.fullName : 'N/A';
    doc.text(playerName, 45, yPos - 1);

    yPos += 15;

    // === LA SUMA DE ===
    doc.setFontSize(12);
    doc.text('La suma de:', 20, yPos);
    
    // Línea para el monto en letras
    doc.line(50, yPos, 190, yPos);
    doc.setFontSize(10);
    const amountInWords = this.numberToWords(payment.amount).toUpperCase();
    doc.text(amountInWords, 52, yPos - 1);

    yPos += 10;

    // Texto "Pesos" al final de la línea
    doc.setFontSize(10);
    doc.text('Pesos Argentinos', 160, yPos);

    yPos += 15;

    // === POR CONCEPTO DE ===
    doc.setFontSize(12);
    doc.text('Por concepto de:', 20, yPos);
    
    // Línea para el concepto
    doc.line(60, yPos, 190, yPos);
    doc.setFontSize(10);
    const concept = `Cuota mensual ${this.getMonthName(payment.month)} ${payment.year} - ${payment.category?.name || 'N/A'} ${payment.category?.gender || ''}`;
    doc.text(concept, 62, yPos - 1);

    yPos += 20;

    // === FORMA DE PAGO ===
    doc.setFontSize(10);
    
    // Checkbox para efectivo
    doc.rect(20, yPos - 3, 4, 4);
    if (payment.paymentMethod === 'efectivo') {
      doc.text('✓', 21, yPos);
    }
    doc.text('En efectivo', 28, yPos);

    // Checkbox para cheque
    doc.rect(80, yPos - 3, 4, 4);
    if (payment.paymentMethod === 'banco') {
      doc.text('✓', 81, yPos);
    }
    doc.text('Cheque N°', 88, yPos);
    
    // Líneas para datos del cheque
    doc.line(110, yPos, 140, yPos);
    doc.text('N° de Cuenta', 145, yPos);
    doc.line(168, yPos, 190, yPos);

    yPos += 10;
    doc.text('Banco', 145, yPos);
    doc.line(158, yPos, 190, yPos);

    yPos += 15;

    // === A CUENTA Y SALDO ===
    // A Cuenta
    doc.text('A Cuenta', 20, yPos);
    doc.rect(45, yPos - 8, 30, 10);
    doc.setFontSize(12);
    doc.text(`$${payment.amount.toFixed(2)}`, 47, yPos - 2);

    // Saldo
    doc.setFontSize(10);
    doc.text('Saldo', 130, yPos);
    doc.rect(145, yPos - 8, 30, 10);
    doc.text('$0.00', 147, yPos - 2);

    yPos += 20;

    // === FIRMAS ===
    doc.line(20, yPos, 80, yPos);
    doc.line(120, yPos, 180, yPos);
    
    yPos += 5;
    doc.text('Recibí conforme', 30, yPos);
    doc.text('Entregué Conforme', 135, yPos);

    yPos += 15;

    // === TOTAL ===
    doc.setFontSize(14);
    doc.text('TOTAL', 20, yPos);
    doc.rect(45, yPos - 8, 40, 12);
    doc.setFontSize(16);
    doc.text(`$${payment.amount.toFixed(2)}`, 47, yPos - 1);

    // Descargar el PDF
    const fileName = `recibo_${payment.player?.fullName?.replace(/\s+/g, '_') || 'jugador'}_${this.getMonthName(payment.month)}_${payment.year}.pdf`;
    doc.save(fileName);
  }

  generateSimpleReceipt(payment: Payment): void {
    // Nuevo diseño simple y responsive
    this.generateMobileReceipt({ payment });
  }

  // Nuevo método para recibo optimizado para móviles
  generateMobileReceipt(data: ReceiptData): void {
    const { payment, companyInfo = this.defaultCompanyInfo } = data;
    
    // Crear nuevo documento PDF optimizado para móviles
    const doc = new jsPDF({
      orientation: 'portrait',
      unit: 'mm',
      format: 'a4'
    });

    // Configuración para móviles
    doc.setDrawColor(0, 0, 0);
    doc.setLineWidth(0.3);

    // === ENCABEZADO SIMPLE ===
    let yPos = 20;

    // Título principal
    doc.setFontSize(18);
    doc.setTextColor(0, 0, 0);
    doc.text('RECIBO DE PAGO', 105, yPos, { align: 'center' });

    yPos += 10;

    // Número de recibo
    const receiptNumber = data.receiptNumber || payment.receiptNumber || `REC-${String(Math.floor(Math.random() * 999999) + 1).padStart(6, '0')}`;
    doc.setFontSize(12);
    doc.setTextColor(255, 0, 0);
    doc.text(`N° ${receiptNumber}`, 105, yPos, { align: 'center' });

    yPos += 8;

    // Fecha
    const paymentDate = new Date(payment.createdAt);
    const formattedDate = paymentDate.toLocaleDateString('es-AR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    });
    doc.setFontSize(10);
    doc.setTextColor(0, 0, 0);
    doc.text(`Fecha: ${formattedDate}`, 105, yPos, { align: 'center' });

    yPos += 15;

    // === INFORMACIÓN DEL JUGADOR ===
    doc.setFontSize(12);
    doc.setTextColor(0, 0, 0);
    doc.text('JUGADOR:', 20, yPos);
    
    yPos += 8;
    doc.setFontSize(14);
    const playerName = payment.player ? payment.player.fullName : 'N/A';
    doc.text(playerName, 20, yPos);

    yPos += 10;

    // === DETALLES DEL PAGO ===
    doc.setFontSize(12);
    doc.text('DETALLES:', 20, yPos);
    
    yPos += 8;
    doc.setFontSize(10);
    
    // Período
    const period = `${this.getMonthName(payment.month)} ${payment.year}`;
    doc.text(`Período: ${period}`, 20, yPos);
    
    yPos += 6;
    
    // Categoría
    const category = payment.playerCategory ? 
      `${payment.playerCategory.name} ${payment.playerCategory.gender}` : 
      (payment.player?.category ? `${payment.player.category.name} ${payment.player.category.gender}` : 'N/A');
    doc.text(`Categoría: ${category}`, 20, yPos);
    
    yPos += 6;
    
    // Método de pago
    const paymentMethod = payment.paymentMethod === 'efectivo' ? 'Efectivo' : 'Transferencia Bancaria';
    doc.text(`Método: ${paymentMethod}`, 20, yPos);

    yPos += 15;

    // === MONTO ===
    doc.setFontSize(16);
    doc.setTextColor(0, 0, 0);
    doc.text('IMPORTE:', 20, yPos);
    
    yPos += 8;
    doc.setFontSize(20);
    doc.setTextColor(255, 0, 0);
    const formattedAmount = `$${payment.amount.toLocaleString('es-AR', { minimumFractionDigits: 2 })}`;
    doc.text(formattedAmount, 20, yPos);

    yPos += 10;
    
    // Monto en palabras
    doc.setFontSize(8);
    doc.setTextColor(0, 0, 0);
    const amountInWords = this.numberToWords(payment.amount).toUpperCase();
    doc.text(`(${amountInWords} PESOS)`, 20, yPos);

    yPos += 20;

    // === FIRMA ===
    doc.setFontSize(10);
    doc.setTextColor(0, 0, 0);
    doc.text('Firma:', 20, yPos);
    
    yPos += 5;
    doc.line(20, yPos, 80, yPos);

    yPos += 15;

    // === INFORMACIÓN DEL CLUB ===
    doc.setFontSize(8);
    doc.setTextColor(100, 100, 100);
    doc.text(companyInfo.name, 105, yPos, { align: 'center' });
    
    yPos += 4;
    doc.text(companyInfo.address, 105, yPos, { align: 'center' });
    
    yPos += 4;
    doc.text(companyInfo.phone, 105, yPos, { align: 'center' });

    // Descargar el PDF
    const fileName = `recibo_${payment.player?.fullName?.replace(/\s+/g, '_') || 'jugador'}_${this.getMonthName(payment.month)}_${payment.year}.pdf`;
    doc.save(fileName);
  }

  generateBulkReceipts(payments: Payment[], title: string = 'Recibos_Múltiples'): void {
    if (payments.length === 0) {
      alert('No hay pagos para generar recibos');
      return;
    }

    const doc = new jsPDF();
    
    payments.forEach((payment, index) => {
      if (index > 0) {
        doc.addPage();
      }
      
      // Usar el mismo formato de recibo tradicional para cada pago
      this.addTraditionalReceiptToDocument(doc, payment, index === 0);
    });

    doc.save(`${title}.pdf`);
  }

  private addTraditionalReceiptToDocument(doc: jsPDF, payment: Payment, isFirstPage: boolean): void {
    if (!isFirstPage) {
      // Limpiar la página
      doc.internal.pageSize.width = 210;
      doc.internal.pageSize.height = 297;
    }

    // Generar el recibo usando la misma lógica que generateReceiptPDF
    // pero sin crear un nuevo documento o guardarlo
    
    // Generar número de recibo
    const receiptNumber = String(Math.floor(Math.random() * 999999) + 1).padStart(6, '0');
    
    // Obtener fecha del pago
    const paymentDate = new Date(payment.createdAt);
    const day = paymentDate.getDate().toString().padStart(2, '0');
    const month = (paymentDate.getMonth() + 1).toString().padStart(2, '0');
    const year = paymentDate.getFullYear().toString();

    // Configuración de bordes y colores
    doc.setDrawColor(0, 0, 0);
    doc.setLineWidth(0.5);

    // === BORDE PRINCIPAL DEL RECIBO ===
    doc.rect(15, 15, 180, 160);

    // === ENCABEZADO CON FECHA Y NÚMERO ===
    let yPos = 25;

    // Cuadros de fecha (DIA, MES, AÑO)
    doc.rect(20, yPos, 15, 8);
    doc.rect(35, yPos, 15, 8);
    doc.rect(50, yPos, 15, 8);
    
    // Labels de fecha
    doc.setFontSize(8);
    doc.setTextColor(0, 0, 0);
    doc.text('DIA', 22, yPos + 6);
    doc.text('MES', 37, yPos + 6);
    doc.text('AÑO', 52, yPos + 6);

    // Valores de fecha
    doc.setFontSize(10);
    doc.text(day, 27.5 - (day.length * 1), yPos + 12);
    doc.text(month, 42.5 - (month.length * 1), yPos + 12);
    doc.text(year, 57.5 - (year.length * 1.5), yPos + 12);

    // Número de recibo (centrado)
    doc.setFontSize(14);
    doc.setTextColor(255, 0, 0);
    doc.text(`№ ${receiptNumber}`, 105, yPos + 7, { align: 'center' });

    // Cuadro de moneda (derecha)
    doc.setTextColor(0, 0, 0);
    doc.rect(160, yPos, 30, 12);
    doc.setFontSize(10);
    doc.text('$', 165, yPos + 6);
    doc.setFontSize(8);
    doc.text('Pesos', 170, yPos + 5);
    doc.text('Arg.', 170, yPos + 9);

    yPos += 20;

    // === TÍTULO RECIBO ===
    doc.setFontSize(20);
    doc.setTextColor(0, 0, 255);
    doc.text('RECIBO', 105, yPos, { align: 'center' });

    yPos += 15;

    // === RECIBÍ DE ===
    doc.setFontSize(12);
    doc.setTextColor(0, 0, 0);
    doc.text('Recibí de:', 20, yPos);
    
    // Línea para el nombre
    doc.line(42, yPos, 190, yPos);
    doc.setFontSize(10);
    const playerName = payment.player ? payment.player.fullName : 'N/A';
    doc.text(playerName, 45, yPos - 1);

    yPos += 15;

    // === LA SUMA DE ===
    doc.setFontSize(12);
    doc.text('La suma de:', 20, yPos);
    
    // Línea para el monto en letras
    doc.line(50, yPos, 190, yPos);
    doc.setFontSize(10);
    const amountInWords = this.numberToWords(payment.amount).toUpperCase();
    doc.text(amountInWords, 52, yPos - 1);

    yPos += 10;

    // Texto "Pesos" al final de la línea
    doc.setFontSize(10);
    doc.text('Pesos Argentinos', 160, yPos);

    yPos += 15;

    // === POR CONCEPTO DE ===
    doc.setFontSize(12);
    doc.text('Por concepto de:', 20, yPos);
    
    // Línea para el concepto
    doc.line(60, yPos, 190, yPos);
    doc.setFontSize(10);
    const concept = `Cuota mensual ${this.getMonthName(payment.month)} ${payment.year} - ${payment.category?.name || 'N/A'} ${payment.category?.gender || ''}`;
    doc.text(concept, 62, yPos - 1);

    yPos += 20;

    // === FORMA DE PAGO ===
    doc.setFontSize(10);
    
    // Checkbox para efectivo
    doc.rect(20, yPos - 3, 4, 4);
    if (payment.paymentMethod === 'efectivo') {
      doc.text('✓', 21, yPos);
    }
    doc.text('En efectivo', 28, yPos);

    // Checkbox para cheque
    doc.rect(80, yPos - 3, 4, 4);
    if (payment.paymentMethod === 'banco') {
      doc.text('✓', 81, yPos);
    }
    doc.text('Cheque N°', 88, yPos);
    
    // Líneas para datos del cheque
    doc.line(110, yPos, 140, yPos);
    doc.text('N° de Cuenta', 145, yPos);
    doc.line(168, yPos, 190, yPos);

    yPos += 10;
    doc.text('Banco', 145, yPos);
    doc.line(158, yPos, 190, yPos);

    yPos += 15;

    // === A CUENTA Y SALDO ===
    // A Cuenta
    doc.text('A Cuenta', 20, yPos);
    doc.rect(45, yPos - 8, 30, 10);
    doc.setFontSize(12);
    doc.text(`$${payment.amount.toFixed(2)}`, 47, yPos - 2);

    // Saldo
    doc.setFontSize(10);
    doc.text('Saldo', 130, yPos);
    doc.rect(145, yPos - 8, 30, 10);
    doc.text('$0.00', 147, yPos - 2);

    yPos += 20;

    // === FIRMAS ===
    doc.line(20, yPos, 80, yPos);
    doc.line(120, yPos, 180, yPos);
    
    yPos += 5;
    doc.text('Recibí conforme', 30, yPos);
    doc.text('Entregué Conforme', 135, yPos);

    yPos += 15;

    // === TOTAL ===
    doc.setFontSize(14);
    doc.text('TOTAL', 20, yPos);
    doc.rect(45, yPos - 8, 40, 12);
    doc.setFontSize(16);
    doc.text(`$${payment.amount.toFixed(2)}`, 47, yPos - 1);
  }

  private getMonthName(month: number): string {
    const months = [
      'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
      'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'
    ];
    return months[month - 1] || 'Mes inválido';
  }

  previewReceipt(payment: Payment): string {
    return `Recibo para ${payment.player?.fullName || 'Jugador'} - ${this.getMonthName(payment.month)} ${payment.year} - $${payment.amount}`;
  }
}

export default new ReceiptService(); 