/**
 * pdfGenerator.ts
 * Genera un diploma/certificado en PDF en el cliente usando jspdf.
 * Diseñado con la identidad visual de "Radiología con Fe".
 */

export interface CertificateData {
  studentName: string
  examTitle: string
  categoryName: string
  score: number
  certificateNumber: string
  issuedAt: string // ISO date string
}

/**
 * Genera y descarga el certificado en PDF en el navegador.
 * Solo debe llamarse en el cliente ('use client').
 */
export async function generateCertificatePDF(data: CertificateData): Promise<void> {
  // Importación dinámica para evitar errores de SSR
  const { default: jsPDF } = await import('jspdf')
  const QRCode = await import('qrcode')

  const doc = new jsPDF({
    orientation: 'landscape',
    unit: 'mm',
    format: 'a4',
  })

  const W = 297 // ancho A4 landscape
  const H = 210 // alto A4 landscape

  // ─────────────────────────────────────────────
  // FONDO
  // ─────────────────────────────────────────────
  // Fondo oscuro principal
  doc.setFillColor(10, 12, 20)
  doc.rect(0, 0, W, H, 'F')

  // Panel interior (ligeramente más claro)
  doc.setFillColor(18, 22, 36)
  doc.roundedRect(12, 12, W - 24, H - 24, 6, 6, 'F')

  // ─────────────────────────────────────────────
  // BORDES DORADOS DECORATIVOS
  // ─────────────────────────────────────────────
  // Borde exterior dorado
  doc.setDrawColor(242, 196, 0)
  doc.setLineWidth(0.8)
  doc.roundedRect(12, 12, W - 24, H - 24, 6, 6, 'S')

  // Borde interior dorado fino
  doc.setLineWidth(0.3)
  doc.roundedRect(17, 17, W - 34, H - 34, 4, 4, 'S')

  // Líneas decorativas horizontales superiores e inferiores
  doc.setLineWidth(0.5)
  doc.setDrawColor(242, 196, 0, 0.4)
  doc.line(30, 42, W - 30, 42)
  doc.line(30, H - 42, W - 30, H - 42)

  // Ornamentos de esquinas (cuadrados dorados pequeños)
  const corners = [
    [20, 20], [W - 20, 20], [20, H - 20], [W - 20, H - 20],
  ] as [number, number][]
  doc.setFillColor(242, 196, 0)
  corners.forEach(([x, y]) => {
    doc.rect(x - 2, y - 2, 4, 4, 'F')
  })

  // ─────────────────────────────────────────────
  // SECCIÓN IZQUIERDA — TEXTO PRINCIPAL
  // ─────────────────────────────────────────────
  const textCenterX = 110 // centro del bloque de texto (no llega al QR)

  // Institución/Logo Text
  doc.setFont('helvetica', 'bold')
  doc.setFontSize(9)
  doc.setTextColor(242, 196, 0)
  doc.text('RADIOLOGIA CON FE', textCenterX, 33, { align: 'center' })

  // Subtítulo institución
  doc.setFont('helvetica', 'normal')
  doc.setFontSize(7)
  doc.setTextColor(150, 160, 180)
  doc.text('Plataforma de Educación Médica en Radiología', textCenterX, 39, { align: 'center' })

  // Título "CERTIFICADO DE APROBACIÓN"
  doc.setFont('helvetica', 'bold')
  doc.setFontSize(20)
  doc.setTextColor(242, 196, 0)
  doc.text('CERTIFICADO DE APROBACIÓN', textCenterX, 64, { align: 'center' })

  // Separador pequeño
  doc.setFillColor(242, 196, 0)
  doc.rect(textCenterX - 25, 68, 50, 0.8, 'F')

  // Texto "Se otorga a:"
  doc.setFont('helvetica', 'italic')
  doc.setFontSize(10)
  doc.setTextColor(150, 160, 180)
  doc.text('Se otorga a:', textCenterX, 80, { align: 'center' })

  // Nombre del estudiante
  doc.setFont('helvetica', 'bold')
  doc.setFontSize(26)
  doc.setTextColor(255, 255, 255)
  // Nombre puede ser largo, usamos texto truncado si es necesario
  const nameToShow = data.studentName.length > 32
    ? data.studentName.substring(0, 32) + '...'
    : data.studentName
  doc.text(nameToShow, textCenterX, 96, { align: 'center' })

  // Línea decorativa bajo el nombre
  doc.setDrawColor(242, 196, 0, 0.6)
  doc.setLineWidth(0.4)
  doc.line(55, 100, 165, 100)

  // "Por haber completado satisfactoriamente"
  doc.setFont('helvetica', 'normal')
  doc.setFontSize(9)
  doc.setTextColor(150, 160, 180)
  doc.text('Por haber completado satisfactoriamente el examen de:', textCenterX, 112, { align: 'center' })

  // Nombre del examen
  doc.setFont('helvetica', 'bold')
  doc.setFontSize(14)
  doc.setTextColor(255, 255, 255)
  const examToShow = data.examTitle.length > 40
    ? data.examTitle.substring(0, 40) + '...'
    : data.examTitle
  doc.text(examToShow, textCenterX, 122, { align: 'center' })

  // Categoría
  doc.setFont('helvetica', 'normal')
  doc.setFontSize(8)
  doc.setTextColor(120, 140, 170)
  doc.text(data.categoryName.toUpperCase(), textCenterX, 129, { align: 'center' })

  // ─────────────────────────────────────────────
  // PUNTUACIÓN — Caja dorada
  // ─────────────────────────────────────────────
  const scoreX = textCenterX - 18
  doc.setFillColor(242, 196, 0, 0.15)
  doc.setDrawColor(242, 196, 0)
  doc.setLineWidth(0.5)
  doc.roundedRect(scoreX, 136, 36, 20, 3, 3, 'FD')

  doc.setFont('helvetica', 'bold')
  doc.setFontSize(18)
  doc.setTextColor(242, 196, 0)
  doc.text(`${data.score}%`, textCenterX, 149, { align: 'center' })

  doc.setFont('helvetica', 'normal')
  doc.setFontSize(6.5)
  doc.setTextColor(150, 160, 180)
  doc.text('CALIFICACIÓN OBTENIDA', textCenterX, 158, { align: 'center' })

  // ─────────────────────────────────────────────
  // FIRMA DEL DIRECTOR GENERAL
  // ─────────────────────────────────────────────
  const signatureX = textCenterX + 45
  const signatureY = 145

  // Línea de firma
  doc.setDrawColor(242, 196, 0, 0.7)
  doc.setLineWidth(0.4)
  doc.line(signatureX - 25, signatureY + 8, signatureX + 25, signatureY + 8)

  // Firma estilizada en caligrafía
  doc.setFont('helvetica', 'bolditalic')
  doc.setFontSize(10)
  doc.setTextColor(242, 196, 0)
  doc.text('Francisco Jáquez', signatureX, signatureY + 5, { align: 'center' })

  // Nombre y Cargo Oficial
  doc.setFont('helvetica', 'bold')
  doc.setFontSize(8)
  doc.setTextColor(255, 255, 255)
  doc.text('Prof. Francisco Jáquez', signatureX, signatureY + 12, { align: 'center' })

  doc.setFont('helvetica', 'normal')
  doc.setFontSize(6.5)
  doc.setTextColor(150, 160, 180)
  doc.text('Director General & Fundador', signatureX, signatureY + 16, { align: 'center' })
  doc.text('Radiología con Fe', signatureX, signatureY + 20, { align: 'center' })

  // ─────────────────────────────────────────────
  // PIE — Número de certificado y fecha
  // ─────────────────────────────────────────────
  const issueDate = new Date(data.issuedAt).toLocaleDateString('es-ES', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  })

  doc.setFont('helvetica', 'normal')
  doc.setFontSize(7)
  doc.setTextColor(100, 110, 130)
  doc.text(`Emitido el ${issueDate}`, 30, H - 22)
  doc.text(`Certificado N.° ${data.certificateNumber}`, 30, H - 17)

  // ─────────────────────────────────────────────
  // SECCIÓN DERECHA — QR CODE
  // ─────────────────────────────────────────────
  try {
    const verifyUrl = `https://radiologiaconfe.com/verify/${data.certificateNumber}`
    const qrDataUrl = await QRCode.toDataURL(verifyUrl, {
      width: 180,
      margin: 1,
      color: {
        dark: '#f2c400',  // Dorado
        light: '#12162400', // Transparente (fondo oscuro)
      },
    })

    const qrSize = 52
    const qrX = W - 82
    const qrY = H / 2 - qrSize / 2

    // Contenedor del QR
    doc.setFillColor(10, 12, 20)
    doc.setDrawColor(242, 196, 0, 0.4)
    doc.setLineWidth(0.4)
    doc.roundedRect(qrX - 6, qrY - 8, qrSize + 12, qrSize + 22, 4, 4, 'FD')

    // Imagen QR
    doc.addImage(qrDataUrl, 'PNG', qrX, qrY, qrSize, qrSize)

    // Texto bajo el QR
    doc.setFont('helvetica', 'normal')
    doc.setFontSize(6)
    doc.setTextColor(100, 110, 130)
    doc.text('Escanea para verificar', qrX + qrSize / 2, qrY + qrSize + 7, { align: 'center' })
    doc.text('autenticidad del certificado', qrX + qrSize / 2, qrY + qrSize + 12, { align: 'center' })
  } catch {
    // Si QR falla, solo mostrar texto
    doc.setFont('helvetica', 'normal')
    doc.setFontSize(7)
    doc.setTextColor(100, 110, 130)
    doc.text(`Verifica en: radiologiaconfe.com/verify`, W - 75, H / 2, { align: 'center' })
    doc.text(data.certificateNumber, W - 75, H / 2 + 6, { align: 'center' })
  }

  // ─────────────────────────────────────────────
  // GUARDAR Y DESCARGAR
  // ─────────────────────────────────────────────
  const fileName = `Certificado_RCF_${data.certificateNumber}.pdf`
  doc.save(fileName)
}
