/**
 * Export to PDF Service
 * Genera documentos PDF en el navegador sin backend
 * Usa jsPDF + jspdf-autotable
 */

import jsPDF from 'jspdf';
import 'jspdf-autotable';

const GRADE_LABELS = {
  pre_k: 'Pre-K',
  K: 'Kindergarten',
  1: 'Grade 1',
  2: 'Grade 2',
  3: 'Grade 3',
  4: 'Grade 4',
  5: 'Grade 5',
  6: 'Grade 6',
  7: 'Grade 7',
  8: 'Grade 8',
  9: 'Grade 9',
  10: 'Grade 10',
  11: 'Grade 11',
  12: 'Grade 12',
};

/**
 * Función principal de exportación
 */
export const exportPlannerToPDF = (plannerData) => {
  try {
    console.log('🚀 Iniciando exportación a PDF...');
    
    const doc = new jsPDF('p', 'mm', 'letter');
    let yPos = 20;
    
    // Header MEDUCA
    yPos = addMEDUCAHeader(doc, yPos);
    
    // Theme Planner
    yPos = addThemePlanner(doc, plannerData, yPos);
    
    // Lesson Planners
    addLessonPlanners(doc, plannerData);
    
    // Guardar
    const filename = `planner_${plannerData.grade}_${plannerData.scenario || 'lesson'}.pdf`;
    doc.save(filename);
    
    console.log('✅ PDF generado exitosamente');
    return true;
    
  } catch (error) {
    console.error('❌ Error generando PDF:', error);
    throw error;
  }
};

/**
 * Header MEDUCA
 */
function addMEDUCAHeader(doc, yPos) {
  doc.setFontSize(12);
  doc.setFont('helvetica', 'bold');
  doc.text('MINISTERIO DE EDUCACIÓN', doc.internal.pageSize.width / 2, yPos, { align: 'center' });
  
  doc.setFontSize(10);
  doc.setFont('helvetica', 'normal');
  doc.text('Dirección Nacional de Currículo de Lengua Extranjera', doc.internal.pageSize.width / 2, yPos + 6, { align: 'center' });
  
  return yPos + 20;
}

/**
 * Theme Planner completo
 */
function addThemePlanner(doc, data, yPos) {
  const theme = data.theme_planner || {};
  
  // Título
  doc.setFontSize(14);
  doc.setFont('helvetica', 'bold');
  doc.text('Theme Planner - Overview', doc.internal.pageSize.width / 2, yPos, { align: 'center' });
  yPos += 10;
  
  // 1. General Information
  yPos = addSection(doc, '1. General Information:', yPos);
  yPos = addGeneralInfoTable(doc, theme.general_information || {}, yPos);
  
  // 2. Standards and Learning Outcomes
  yPos = checkAddPage(doc, yPos, 60);
  yPos = addSection(doc, '2. Specific Standards and Learning Outcomes:', yPos);
  yPos = addStandardsTable(doc, theme.standards_and_learning_outcomes || {}, yPos);
  
  // 3. Communicative Competences
  yPos = checkAddPage(doc, yPos, 50);
  yPos = addSection(doc, '3. Communicative Competences', yPos);
  yPos = addCompetencesTable(doc, theme.communicative_competences || {}, yPos);
  
  // Project
  if (data.project) {
    yPos = checkAddPage(doc, yPos, 30);
    yPos = addProjectSection(doc, data.project, yPos);
  }
  
  // 4. Specific Objectives
  yPos = checkAddPage(doc, yPos, 50);
  yPos = addSection(doc, '4. Specific Objectives', yPos);
  yPos = addObjectivesTable(doc, theme.specific_objectives || {}, yPos);
  
  // 5. Materials
  yPos = checkAddPage(doc, yPos, 40);
  yPos = addSection(doc, '5. Materials and Teaching Strategies', yPos);
  yPos = addMaterialsTable(doc, theme.materials_and_strategies || {}, yPos);
  
  // 6. Learning Sequence
  yPos = checkAddPage(doc, yPos, 50);
  yPos = addSection(doc, '6. Learning Sequence', yPos);
  yPos = addLearningSequenceTable(doc, data.lesson_planners || [], theme.learning_sequence || {}, yPos);
  
  return yPos;
}

/**
 * Agregar sección con título
 */
function addSection(doc, title, yPos) {
  doc.setFontSize(11);
  doc.setFont('helvetica', 'bold');
  doc.text(title, 15, yPos);
  return yPos + 8;
}

/**
 * Verificar si necesita nueva página
 */
function checkAddPage(doc, yPos, spaceNeeded) {
  if (yPos + spaceNeeded > doc.internal.pageSize.height - 20) {
    doc.addPage();
    return 20;
  }
  return yPos;
}

/**
 * Tabla 1: General Information
 */
function addGeneralInfoTable(doc, general, yPos) {
  const data = [
    ['1. Teacher(s):', general.teachers || '_______________'],
    ['2. Grade:', GRADE_LABELS[general.grade] || general.grade || '', '3. CEFR Level:', general.cefr_level || '______'],
    ['4. Trimester:', general.trimester || '______', '5. Weekly Hour(s):', general.weekly_hours || '______'],
    ['6. Week(s):', general.week_range || 'From week ____ to week ____'],
    ['7. Scenario __:', general.scenario || '', '8. Theme __:', general.theme || ''],
  ];
  
  doc.autoTable({
    startY: yPos,
    head: [],
    body: data,
    theme: 'grid',
    styles: { fontSize: 9, cellPadding: 2 },
    columnStyles: {
      0: { fontStyle: 'bold', cellWidth: 40 },
    },
    margin: { left: 15, right: 15 },
  });
  
  return doc.lastAutoTable.finalY + 10;
}

/**
 * Tabla 2: Standards and Learning Outcomes
 */
function addStandardsTable(doc, standards, yPos) {
  const skills = ['listening', 'reading', 'speaking', 'writing', 'mediation'];
  const labels = ['1. Listening:', '2. Reading:', '3. Speaking:', '4. Writing:', '5. Mediation:'];
  
  const data = skills.map((skill, idx) => {
    const skillData = standards[skill] || {};
    
    let stdList = [];
    if (Array.isArray(skillData.specific)) {
      stdList = skillData.specific;
    } else if (Array.isArray(skillData.specific_standards)) {
      stdList = skillData.specific_standards;
    }
    
    const outcomes = skillData.learning_outcomes || [];
    
    return [
      labels[idx],
      stdList.length > 0 ? stdList.map(s => `• ${s}`).join('\n') : 'To be defined',
      outcomes.length > 0 ? outcomes.map(o => `• ${o}`).join('\n') : 'To be defined',
    ];
  });
  
  doc.autoTable({
    startY: yPos,
    head: [['Skills:', 'Specific Standards:', 'Learning Outcomes:']],
    body: data,
    theme: 'grid',
    styles: { fontSize: 8, cellPadding: 2 },
    headStyles: { fillColor: [240, 240, 240], textColor: [0, 0, 0], fontStyle: 'bold' },
    columnStyles: {
      0: { cellWidth: 30, fontStyle: 'bold' },
      1: { cellWidth: 80 },
      2: { cellWidth: 80 },
    },
    margin: { left: 15, right: 15 },
  });
  
  return doc.lastAutoTable.finalY + 10;
}

/**
 * Tabla 3: Communicative Competences
 */
function addCompetencesTable(doc, competences, yPos) {
  const ling = competences.linguistic || {};
  const prag = competences.pragmatic || '';
  const socio = competences.sociolinguistic || '';
  
  const grammar = ling.grammatical_features || ling.grammar || [];
  const vocab = ling.vocabulary || [];
  const pronun = ling.phonemic_awareness || ling.pronunciation || '';
  
  const grammarText = Array.isArray(grammar) ? grammar.join(', ') : String(grammar);
  
  let vocabText = '';
  if (Array.isArray(vocab)) {
    vocabText = vocab.slice(0, 10).join(', ');
  } else if (typeof vocab === 'object') {
    const words = [];
    for (const key of ['nouns', 'verbs', 'adjectives', 'prepositions']) {
      if (Array.isArray(vocab[key])) {
        words.push(...vocab[key]);
      }
    }
    vocabText = words.slice(0, 10).join(', ');
  }
  
  const pragText = Array.isArray(prag) ? prag.join(', ') : String(prag);
  const socioText = Array.isArray(socio) ? socio.join(', ') : String(socio);
  
  const lingText = `• Grammatical Features:\n${grammarText || '______'}\n\n• Vocabulary:\n${vocabText || '______'}\n\n• Pronunciation:\n${pronun || '______'}`;
  
  doc.autoTable({
    startY: yPos,
    head: [['Linguistic Competence\n(Learn to Know)', 'Pragmatic Competence\n(Learn to Do)', 'Sociolinguistic Competence\n(Learn to Be)']],
    body: [[lingText, pragText || '______', socioText || '______']],
    theme: 'grid',
    styles: { fontSize: 8, cellPadding: 3 },
    headStyles: { fillColor: [240, 240, 240], textColor: [0, 0, 0], fontStyle: 'bold', halign: 'center' },
    columnStyles: {
      0: { cellWidth: 63 },
      1: { cellWidth: 63 },
      2: { cellWidth: 64 },
    },
    margin: { left: 15, right: 15 },
  });
  
  return doc.lastAutoTable.finalY + 10;
}

/**
 * Sección de proyecto
 */
function addProjectSection(doc, project, yPos) {
  doc.setFontSize(10);
  doc.setFont('helvetica', 'bold');
  doc.text('21st-Century Skills Project', 15, yPos);
  
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(9);
  doc.text(`Name: ${project.name || ''}`, 20, yPos + 6);
  doc.text(`Category: ${project.category || ''}`, 20, yPos + 11);
  
  const overviewLines = doc.splitTextToSize(`Overview: ${project.overview || ''}`, 170);
  doc.text(overviewLines, 20, yPos + 16);
  
  return yPos + 16 + (overviewLines.length * 5) + 8;
}

/**
 * Tabla 4: Specific Objectives
 */
function addObjectivesTable(doc, objectives, yPos) {
  const skills = ['listening', 'reading', 'speaking', 'writing', 'mediation'];
  const labels = ['Listening', 'Reading', 'Speaking', 'Writing', 'Mediation'];
  
  const data = skills.map((skill, idx) => [
    labels[idx],
    objectives[skill] || 'To be completed'
  ]);
  
  doc.autoTable({
    startY: yPos,
    head: [],
    body: data,
    theme: 'grid',
    styles: { fontSize: 9, cellPadding: 2 },
    columnStyles: {
      0: { fontStyle: 'bold', cellWidth: 30 },
    },
    margin: { left: 15, right: 15 },
  });
  
  return doc.lastAutoTable.finalY + 10;
}

/**
 * Tabla 5: Materials
 */
function addMaterialsTable(doc, materials, yPos) {
  const matList = materials.required_materials || [];
  const diff = materials.differentiated_instruction || 'To be completed';
  
  const data = [
    ['Materials', matList.length > 0 ? matList.map(m => `• ${m}`).join('\n') : 'To be completed'],
    ['Differentiated Instruction and Accommodations for Students with Diverse Learning Needs (DLN)', diff],
  ];
  
  doc.autoTable({
    startY: yPos,
    head: [],
    body: data,
    theme: 'grid',
    styles: { fontSize: 9, cellPadding: 2 },
    columnStyles: {
      0: { fontStyle: 'bold', cellWidth: 60 },
    },
    margin: { left: 15, right: 15 },
  });
  
  return doc.lastAutoTable.finalY + 10;
}

/**
 * Tabla 6: Learning Sequence
 */
function addLearningSequenceTable(doc, lessons, learningSeq, yPos) {
  const dates = learningSeq.lesson_dates || ['', '', '', '', ''];
  
  const data = lessons.map((lesson, idx) => [
    `Lesson ${lesson.lesson_number || idx + 1}`,
    `${lesson.skill_focus || ''}\n${lesson.specific_objective || ''}`,
    dates[idx] || '______',
  ]);
  
  doc.autoTable({
    startY: yPos,
    head: [['Lesson', 'Learning Sequence', 'Date']],
    body: data,
    theme: 'grid',
    styles: { fontSize: 9, cellPadding: 2 },
    headStyles: { fillColor: [240, 240, 240], textColor: [0, 0, 0], fontStyle: 'bold' },
    columnStyles: {
      0: { fontStyle: 'bold', cellWidth: 25 },
      1: { cellWidth: 130 },
      2: { cellWidth: 35 },
    },
    margin: { left: 15, right: 15 },
  });
  
  return doc.lastAutoTable.finalY + 10;
}

/**
 * Lesson Planners
 */
function addLessonPlanners(doc, data) {
  const lessons = data.lesson_planners || [];
  
  lessons.forEach((lesson, idx) => {
    doc.addPage();
    let yPos = 20;
    
    // Header MEDUCA
    yPos = addMEDUCAHeader(doc, yPos);
    
    // Título
    doc.setFontSize(14);
    doc.setFont('helvetica', 'bold');
    doc.text(`Lesson Planner - Lesson #${lesson.lesson_number || idx + 1}`, doc.internal.pageSize.width / 2, yPos, { align: 'center' });
    yPos += 10;
    
    // Info básica
    doc.setFontSize(10);
    doc.setFont('helvetica', 'bold');
    doc.text(`Lesson #${lesson.lesson_number || idx + 1}`, 15, yPos);
    doc.text(`Skills focus: ${lesson.skill_focus || ''}`, 60, yPos);
    yPos += 8;
    
    // Tabla de info
    const infoData = [
      ['Specific Objective:', lesson.specific_objective || '______'],
      ['Learning Outcome:', lesson.learning_outcome || '______'],
    ];
    
    doc.autoTable({
      startY: yPos,
      body: infoData,
      theme: 'grid',
      styles: { fontSize: 9, cellPadding: 2 },
      columnStyles: {
        0: { fontStyle: 'bold', cellWidth: 50 },
      },
      margin: { left: 15, right: 15 },
    });
    
    yPos = doc.lastAutoTable.finalY + 10;
    
    // Stages
    doc.setFontSize(11);
    doc.setFont('helvetica', 'bold');
    doc.text('The Six Lesson Stages', 15, yPos);
    yPos += 8;
    
    const stages = lesson.lesson_stages || [];
    const stageNames = [
      'Stage 1 - Warm-up',
      'Stage 2 - Presentation',
      'Stage 3 - Preparation',
      'Stage 4 - Performance',
      'Stage 5 - Assessment',
      'Stage 6 - Reflection',
    ];
    
    const stageData = stages.map((stage, stageIdx) => {
      const activities = stage.activities || [];
      const actText = activities.map(a => `• ${a}`).join('\n');
      return [
        stageNames[stageIdx] || `Stage ${stageIdx + 1}`,
        actText || 'To be completed',
        stage.estimated_time || '___',
      ];
    });
    
    doc.autoTable({
      startY: yPos,
      head: [['Stage', 'Activities', 'Time']],
      body: stageData,
      theme: 'grid',
      styles: { fontSize: 8, cellPadding: 2 },
      headStyles: { fillColor: [240, 240, 240], textColor: [0, 0, 0], fontStyle: 'bold' },
      columnStyles: {
        0: { fontStyle: 'bold', cellWidth: 45 },
        1: { cellWidth: 125 },
        2: { cellWidth: 20, halign: 'center' },
      },
      margin: { left: 15, right: 15 },
    });
  });
}

export default exportPlannerToPDF;
