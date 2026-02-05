import React, { useState, useCallback, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { toast } from 'sonner';
import { usePlanner } from '@/context/PlannerContext';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import EditableTextarea from '@/components/EditableTextarea';
import { ArrowLeft, Download, FileText, Moon, Sun } from 'lucide-react';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

// Activity Editor component using EditableTextarea
const ActivityEditor = ({ value, onChange }) => {
  return (
    <EditableTextarea
      value={value}
      onChange={onChange}
      className="text-sm dark:bg-slate-700 dark:border-slate-600 dark:text-white"
      rows={2}
    />
  );
};

export default function PreviewPage() {
  const navigate = useNavigate();
  const { generatedPlanner, setGeneratedPlanner, language, darkMode, toggleDarkMode } = usePlanner();
  const [exporting, setExporting] = useState(false);
  const [selectedLesson, setSelectedLesson] = useState(0);
  const [editMode, setEditMode] = useState(false);
  const [editedPlanner, setEditedPlanner] = useState(null);

  const translations = {
    es: {
      back: 'Volver',
      themePlanner: 'Theme Planner',
      lessonPlanners: 'Lesson Planners',
      exportDocx: 'Exportar Word',
      exportPdf: 'Exportar PDF',
      edit: 'Editar',
      save: 'Guardar',
      cancel: 'Cancelar',
      generalInfo: 'Información General',
      grade: 'Grado',
      cefrLevel: 'Nivel CEFR',
      scenario: 'Scenario',
      theme: 'Theme',
      standards: 'Estándares y Resultados de Aprendizaje',
      competences: 'Competencias Comunicativas',
      objectives: 'Objetivos Específicos',
      lesson: 'Lección',
      skillFocus: 'Habilidad',
      learningOutcome: 'Resultado de Aprendizaje',
      lessonStages: 'Etapas de la Lección',
      listening: 'Listening',
      reading: 'Reading',
      speaking: 'Speaking',
      writing: 'Writing',
      mediation: 'Mediation',
      materials: 'Materiales Requeridos',
      homework: 'Tarea',
      assessment: 'Evaluación',
      teacherNotes: 'Notas del Docente',
    },
    en: {
      back: 'Back',
      themePlanner: 'Theme Planner',
      lessonPlanners: 'Lesson Planners',
      exportDocx: 'Export Word',
      exportPdf: 'Export PDF',
      edit: 'Edit',
      save: 'Save',
      cancel: 'Cancel',
      generalInfo: 'General Information',
      grade: 'Grade',
      cefrLevel: 'CEFR Level',
      scenario: 'Scenario',
      theme: 'Theme',
      standards: 'Standards and Learning Outcomes',
      competences: 'Communicative Competences',
      objectives: 'Specific Objectives',
      lesson: 'Lesson',
      skillFocus: 'Skill Focus',
      learningOutcome: 'Learning Outcome',
      lessonStages: 'Lesson Stages',
      listening: 'Listening',
      reading: 'Reading',
      speaking: 'Speaking',
      writing: 'Writing',
      mediation: 'Mediation',
      materials: 'Required Materials',
      homework: 'Homework',
      assessment: 'Assessment',
      teacherNotes: 'Teacher Notes',
    },
  };

  const t = translations[language];

  const handleUpdateField = useCallback((path, value) => {
    setEditedPlanner(prevPlanner => {
      const newPlanner = JSON.parse(JSON.stringify(prevPlanner)); // Deep clone
      const keys = path.split('.');
      let current = newPlanner;
      
      for (let i = 0; i < keys.length - 1; i++) {
        const key = keys[i];
        const nextKey = keys[i + 1];
        
        // Check if next key is a number (array index)
        if (!isNaN(nextKey)) {
          if (!Array.isArray(current[key])) {
            current[key] = [];
          }
        } else {
          if (current[key] === undefined) {
            current[key] = {};
          }
        }
        current = current[key];
      }
      
      const lastKey = keys[keys.length - 1];
      current[lastKey] = value;
      
      return newPlanner;
    });
  }, []);

  if (!generatedPlanner) {
    navigate('/');
    return null;
  }

  const plannerData = editMode && editedPlanner ? editedPlanner : generatedPlanner;
  const theme_planner = plannerData?.theme_planner || {};
  const lesson_planners = plannerData?.lesson_planners || [];

  const handleEditMode = () => {
    setEditMode(true);
    setEditedPlanner(JSON.parse(JSON.stringify(generatedPlanner))); // Deep clone
  };

  const handleSaveChanges = () => {
    setGeneratedPlanner(editedPlanner);
    setEditMode(false);
    toast.success(language === 'es' ? 'Cambios guardados' : 'Changes saved');
  };

  const handleCancelEdit = () => {
    setEditMode(false);
    setEditedPlanner(null);
  };

  const handleExportDocx = async () => {
    setExporting(true);
    try {
      const dataToExport = editMode && editedPlanner ? editedPlanner : generatedPlanner;
      const response = await axios.post(
        `${API}/planner/export/docx`,
        dataToExport,
        { responseType: 'blob' }
      );

      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `lesson_planner_${dataToExport.grade}_${dataToExport.scenario}.docx`);
      document.body.appendChild(link);
      link.click();
      link.remove();

      toast.success('Documento exportado exitosamente');
    } catch (error) {
      console.error('Error exporting DOCX:', error);
      toast.error('Error al exportar documento');
    } finally {
      setExporting(false);
    }
  };

  // Editable field component using EditableTextarea
  const EditableField = ({ value, onChange, multiline = false, placeholder = '' }) => {
    if (!editMode) {
      return <span className="text-slate-700 dark:text-slate-300">{value || placeholder}</span>;
    }
    
    if (multiline) {
      return (
        <EditableTextarea
          value={value}
          onChange={onChange}
          className="min-h-[80px] dark:bg-slate-700 dark:border-slate-600 dark:text-white"
          placeholder={placeholder}
          rows={4}
        />
      );
    }
    
    return (
      <Input
        value={value || ''}
        onChange={(e) => onChange(e.target.value)}
        className="dark:bg-slate-700 dark:border-slate-600 dark:text-white"
        placeholder={placeholder}
      />
    );
  };

  const gradeLabels = {
    pre_k: 'Pre-K',
    K: 'Kindergarten',
    1: 'Grade 1',
    2: 'Grade 2',
    3: 'Grade 3',
    4: 'Grade 4',
    5: 'Grade 5',
    6: 'Grade 6',
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-teal-50 via-slate-50 to-blue-50 dark:from-slate-900 dark:via-slate-800 dark:to-slate-900">
      {/* Header */}
      <header className="bg-gradient-to-r from-teal-700 to-teal-600 dark:from-teal-800 dark:to-teal-900 border-b border-teal-800 dark:border-teal-950 sticky top-0 z-50 shadow-lg">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <Button
              variant="ghost"
              onClick={() => navigate('/')}
              className="gap-2 text-white hover:bg-teal-600 dark:hover:bg-teal-800 hover:text-white"
              data-testid="back-button"
            >
              <ArrowLeft className="h-4 w-4" />
              {t.back}
            </Button>
            <div className="flex gap-2">
              <Button
                variant="ghost"
                size="sm"
                onClick={toggleDarkMode}
                data-testid="dark-mode-toggle"
                className="gap-2 text-white hover:bg-teal-600 dark:hover:bg-teal-800 hover:text-white"
                title={darkMode ? 'Modo Claro' : 'Modo Oscuro'}
              >
                {darkMode ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
              </Button>
              
              {editMode ? (
                <>
                  <Button
                    onClick={handleSaveChanges}
                    className="gap-2 bg-green-600 text-white hover:bg-green-700"
                    data-testid="save-changes-button"
                  >
                    {t.save}
                  </Button>
                  <Button
                    onClick={handleCancelEdit}
                    variant="outline"
                    className="gap-2 border-white text-white hover:bg-teal-600"
                    data-testid="cancel-edit-button"
                  >
                    {t.cancel}
                  </Button>
                </>
              ) : (
                <>
                  <Button
                    onClick={handleEditMode}
                    className="gap-2 bg-amber-500 text-white hover:bg-amber-600"
                    data-testid="edit-button"
                  >
                    {t.edit}
                  </Button>
                  <Button
                    onClick={handleExportDocx}
                    disabled={exporting}
                    className="gap-2 bg-white text-teal-700 hover:bg-teal-50 dark:bg-slate-700 dark:text-teal-300 dark:hover:bg-slate-600"
                    data-testid="export-docx-button"
                  >
                    <FileText className="h-4 w-4" />
                    {t.exportDocx}
                  </Button>
                </>
              )}
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-6 py-8">
        {/* Document Header */}
        <div className="bg-white dark:bg-slate-800 rounded-lg border border-teal-200 dark:border-teal-800 shadow-lg p-6 mb-6">
          <div className="flex items-start justify-between">
            <div>
              <h1 className="text-3xl font-bold font-heading text-teal-900 dark:text-teal-100 mb-2">
                Lesson Planner
              </h1>
              <div className="flex gap-2 flex-wrap">
                <Badge className="bg-teal-600 text-white hover:bg-teal-700 dark:bg-teal-700 dark:hover:bg-teal-600" data-testid="grade-badge">
                  {gradeLabels[generatedPlanner.grade]}
                </Badge>
                <Badge className="bg-blue-600 text-white hover:bg-blue-700 dark:bg-blue-700 dark:hover:bg-blue-600" data-testid="scenario-badge">
                  {generatedPlanner.scenario}
                </Badge>
                <Badge className="bg-teal-100 text-teal-800 border border-teal-300 dark:bg-teal-900 dark:text-teal-200 dark:border-teal-700" data-testid="theme-badge">
                  {generatedPlanner.theme}
                </Badge>
              </div>
            </div>
          </div>
        </div>

        <Tabs defaultValue="theme" className="space-y-6">
          <TabsList className="grid w-full grid-cols-2 h-12 bg-teal-50 dark:bg-slate-700 border border-teal-200 dark:border-slate-600">
            <TabsTrigger 
              value="theme" 
              className="text-base data-[state=active]:bg-teal-600 data-[state=active]:text-white dark:data-[state=active]:bg-teal-700" 
              data-testid="theme-tab"
            >
              {t.themePlanner}
            </TabsTrigger>
            <TabsTrigger 
              value="lessons" 
              className="text-base data-[state=active]:bg-teal-600 data-[state=active]:text-white dark:data-[state=active]:bg-teal-700" 
              data-testid="lessons-tab"
            >
              {t.lessonPlanners}
            </TabsTrigger>
          </TabsList>

          {/* Theme Planner Tab */}
          <TabsContent value="theme" className="space-y-6">
            {/* SECTION 1: General Information */}
            <Card className="border-teal-200 dark:border-teal-800 shadow-md dark:bg-slate-800">
              <CardHeader className="bg-gradient-to-r from-teal-50 to-blue-50 dark:from-slate-700 dark:to-slate-800 border-b border-teal-100 dark:border-slate-700">
                <CardTitle className="text-teal-900 dark:text-teal-100">1. {language === 'es' ? 'Información General' : 'General Information'}</CardTitle>
              </CardHeader>
              <CardContent className="pt-4">
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div className="space-y-1">
                    <p className="text-xs font-medium text-slate-500 dark:text-slate-400">{language === 'es' ? 'Docente(s)' : 'Teacher(s)'}</p>
                    <p className="text-sm text-slate-900 dark:text-slate-100">{theme_planner?.general_information?.teachers || '_______________'}</p>
                  </div>
                  <div className="space-y-1">
                    <p className="text-xs font-medium text-slate-500 dark:text-slate-400">{language === 'es' ? 'Grado' : 'Grade Level'}</p>
                    <p className="text-sm text-slate-900 dark:text-slate-100">{gradeLabels[theme_planner?.general_information?.grade] || generatedPlanner?.grade}</p>
                  </div>
                  <div className="space-y-1">
                    <p className="text-xs font-medium text-slate-500 dark:text-slate-400">{language === 'es' ? 'Nivel CEFR' : 'CEFR Level'}</p>
                    <p className="text-sm text-slate-900 dark:text-slate-100">{theme_planner?.general_information?.cefr_level || '______'}</p>
                  </div>
                  <div className="space-y-1">
                    <p className="text-xs font-medium text-slate-500 dark:text-slate-400">{language === 'es' ? 'Trimestre' : 'Term/Trimester'}</p>
                    <p className="text-sm text-slate-900 dark:text-slate-100">{theme_planner?.general_information?.trimester || '______'}</p>
                  </div>
                  <div className="space-y-1">
                    <p className="text-xs font-medium text-slate-500 dark:text-slate-400">{language === 'es' ? 'Horas Semanales' : 'Weekly Hours'}</p>
                    <p className="text-sm text-slate-900 dark:text-slate-100">{theme_planner?.general_information?.weekly_hours || '______'}</p>
                  </div>
                  <div className="space-y-1">
                    <p className="text-xs font-medium text-slate-500 dark:text-slate-400">{language === 'es' ? 'Semanas (desde/hasta)' : 'Weeks (from/to)'}</p>
                    <p className="text-sm text-slate-900 dark:text-slate-100">{theme_planner?.general_information?.week_range || '______'}</p>
                  </div>
                  <div className="space-y-1">
                    <p className="text-xs font-medium text-slate-500 dark:text-slate-400">Scenario</p>
                    <p className="text-sm text-slate-900 dark:text-slate-100">{theme_planner?.general_information?.scenario || generatedPlanner?.scenario}</p>
                  </div>
                  <div className="space-y-1">
                    <p className="text-xs font-medium text-slate-500 dark:text-slate-400">Theme</p>
                    <p className="text-sm text-slate-900 dark:text-slate-100">{theme_planner?.general_information?.theme || generatedPlanner?.theme}</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* SECTION 2: Specific Standards and Learning Outcomes */}
            <Card className="border-teal-200 dark:border-teal-800 shadow-md dark:bg-slate-800">
              <CardHeader className="bg-gradient-to-r from-teal-50 to-blue-50 dark:from-slate-700 dark:to-slate-800 border-b border-teal-100 dark:border-slate-700">
                <CardTitle className="text-teal-900 dark:text-teal-100">2. {language === 'es' ? 'Estándares Específicos y Resultados de Aprendizaje' : 'Specific Standards and Learning Outcomes'}</CardTitle>
              </CardHeader>
              <CardContent className="pt-4">
                <div className="space-y-6">
                  {[
                    { key: 'listening', label: language === 'es' ? 'Listening (Comprensión Auditiva)' : 'Listening (Auditory Comprehension)' },
                    { key: 'reading', label: language === 'es' ? 'Reading (Comprensión Lectora)' : 'Reading (Reading Comprehension)' },
                    { key: 'speaking', label: language === 'es' ? 'Speaking (Expresión Oral)' : 'Speaking (Oral Expression)' },
                    { key: 'writing', label: language === 'es' ? 'Writing (Expresión Escrita)' : 'Writing (Written Expression)' },
                    { key: 'mediation', label: 'Mediation' }
                  ].map(({ key, label }) => {
                    const skillData = theme_planner?.standards_and_learning_outcomes?.[key];
                    
                    // Extract standards from 'specific' array or individual fields
                    const standards = [];
                    const outcomes = skillData?.learning_outcomes || [];
                    
                    if (skillData && typeof skillData === 'object') {
                      // Check if 'specific' is an array (Grade 1 format)
                      if (Array.isArray(skillData.specific)) {
                        skillData.specific.forEach((s, i) => {
                          standards.push({ standard: s, outcome: outcomes[i] || '' });
                        });
                      } else {
                        // Check individual fields (Grade 4 format)
                        const fields = ['receptive', 'interactive', 'productive', 'reading1', 'reading2', 
                                       'phonemic_awareness', 'listening1', 'listening2', 'speaking1', 
                                       'speaking2', 'writing1', 'writing2', 'mediation1', 'mediation2', 
                                       'text', 'concept'];
                        fields.forEach((field) => {
                          if (skillData[field]) {
                            const fieldLabel = field.replace(/[0-9]/g, '').replace(/_/g, ' ');
                            const capitalLabel = fieldLabel.charAt(0).toUpperCase() + fieldLabel.slice(1);
                            standards.push({ 
                              standard: `${capitalLabel}: ${skillData[field]}`, 
                              outcome: outcomes[standards.length] || '' 
                            });
                          }
                        });
                      }
                    }
                    
                    return (
                      <div key={key} className="border-l-4 border-teal-500 pl-4 py-2">
                        <h4 className="font-semibold text-teal-800 dark:text-teal-300 mb-3">{label}</h4>
                        {standards.length > 0 ? (
                          <div className="overflow-x-auto">
                            <table className="w-full text-sm border-collapse">
                              <thead>
                                <tr className="bg-teal-50 dark:bg-slate-700">
                                  <th className="border border-teal-200 dark:border-slate-600 px-3 py-2 text-left font-semibold text-teal-800 dark:text-teal-200 w-1/2">Specific Standard</th>
                                  <th className="border border-teal-200 dark:border-slate-600 px-3 py-2 text-left font-semibold text-teal-800 dark:text-teal-200 w-1/2">Learning Outcome</th>
                                </tr>
                              </thead>
                              <tbody>
                                {standards.map((item, idx) => (
                                  <tr key={idx} className={idx % 2 === 0 ? 'bg-white dark:bg-slate-800' : 'bg-slate-50 dark:bg-slate-750'}>
                                    <td className="border border-teal-200 dark:border-slate-600 px-3 py-2 text-slate-700 dark:text-slate-300">
                                      {item.standard}
                                    </td>
                                    <td className="border border-teal-200 dark:border-slate-600 px-3 py-2 text-slate-700 dark:text-slate-300">
                                      {item.outcome ? (
                                        <span className="text-green-700 dark:text-green-400">{item.outcome}</span>
                                      ) : (
                                        <span className="italic text-slate-400">To be defined</span>
                                      )}
                                    </td>
                                  </tr>
                                ))}
                              </tbody>
                            </table>
                          </div>
                        ) : (
                          <p className="text-sm text-slate-400 italic">{language === 'es' ? 'Por completar' : 'To be completed'}</p>
                        )}
                      </div>
                    );
                  })}
                </div>
              </CardContent>
            </Card>

            {/* SECTION 3: Communicative Competencies */}
            <Card className="border-teal-200 dark:border-teal-800 shadow-md dark:bg-slate-800">
              <CardHeader className="bg-gradient-to-r from-teal-50 to-blue-50 dark:from-slate-700 dark:to-slate-800 border-b border-teal-100 dark:border-slate-700">
                <CardTitle className="text-teal-900 dark:text-teal-100">3. {language === 'es' ? 'Competencias Comunicativas' : 'Communicative Competencies'}</CardTitle>
              </CardHeader>
              <CardContent className="pt-4 space-y-4">
                {/* Linguistic Competence */}
                <div className="border-l-4 border-blue-500 pl-4">
                  <h4 className="font-semibold text-blue-800 dark:text-blue-300 mb-2">
                    {language === 'es' ? 'Competencia Lingüística (Aprender a Conocer)' : 'Linguistic Competence (Learning to Know)'}
                  </h4>
                  <div className="space-y-2 text-sm text-slate-700 dark:text-slate-300">
                    <div>
                      <strong>{language === 'es' ? 'Estructuras Gramaticales:' : 'Grammar Structures:'}</strong>{' '}
                      {theme_planner?.communicative_competences?.linguistic?.grammatical_features
                        ? (Array.isArray(theme_planner.communicative_competences.linguistic.grammatical_features)
                            ? theme_planner.communicative_competences.linguistic.grammatical_features.join(', ')
                            : theme_planner.communicative_competences.linguistic.grammatical_features)
                        : theme_planner?.communicative_competences?.linguistic?.grammar
                          ? (Array.isArray(theme_planner.communicative_competences.linguistic.grammar)
                              ? theme_planner.communicative_competences.linguistic.grammar.join(', ')
                              : theme_planner.communicative_competences.linguistic.grammar)
                          : '______'}
                    </div>
                    <div>
                      <strong>{language === 'es' ? 'Vocabulario:' : 'Vocabulary:'}</strong>{' '}
                      {theme_planner?.communicative_competences?.linguistic?.vocabulary
                        ? (Array.isArray(theme_planner.communicative_competences.linguistic.vocabulary)
                            ? theme_planner.communicative_competences.linguistic.vocabulary.join(', ')
                            : theme_planner.communicative_competences.linguistic.vocabulary)
                        : '______'}
                    </div>
                    <div>
                      <strong>{language === 'es' ? 'Pronunciación y Conciencia Fonémica:' : 'Pronunciation and Phonemic Awareness:'}</strong>{' '}
                      {theme_planner?.communicative_competences?.linguistic?.phonemic_awareness || theme_planner?.communicative_competences?.linguistic?.pronunciation || '______'}
                    </div>
                  </div>
                </div>

                {/* Pragmatic Competence */}
                <div className="border-l-4 border-green-500 pl-4">
                  <h4 className="font-semibold text-green-800 dark:text-green-300 mb-2">
                    {language === 'es' ? 'Competencia Pragmática (Aprender a Hacer)' : 'Pragmatic Competence (Learning to Do)'}
                  </h4>
                  <div className="text-sm text-slate-700 dark:text-slate-300">
                    <strong>{language === 'es' ? 'Funciones Comunicativas y Marcadores del Discurso:' : 'Communicative Functions and Discourse Markers:'}</strong>{' '}
                    {theme_planner?.communicative_competences?.pragmatic
                      ? (Array.isArray(theme_planner.communicative_competences.pragmatic)
                          ? theme_planner.communicative_competences.pragmatic.join(', ')
                          : theme_planner.communicative_competences.pragmatic)
                      : theme_planner?.communicative_competences?.pragmatic?.functions || '______'}
                  </div>
                </div>

                {/* Sociolinguistic Competence */}
                <div className="border-l-4 border-purple-500 pl-4">
                  <h4 className="font-semibold text-purple-800 dark:text-purple-300 mb-2">
                    {language === 'es' ? 'Competencia Sociolingüística (Aprender a Ser)' : 'Sociolinguistic Competence (Learning to Be)'}
                  </h4>
                  <div className="text-sm text-slate-700 dark:text-slate-300">
                    <strong>{language === 'es' ? 'Interacciones Respetuosas y Participación Social:' : 'Respectful Interactions and Social Participation:'}</strong>{' '}
                    {theme_planner?.communicative_competences?.sociolinguistic
                      ? (Array.isArray(theme_planner.communicative_competences.sociolinguistic)
                          ? theme_planner.communicative_competences.sociolinguistic.join(', ')
                          : theme_planner.communicative_competences.sociolinguistic)
                      : '______'}
                  </div>
                </div>

                {/* 21st Century Skills Project */}
                <div className="border-l-4 border-amber-500 pl-4">
                  <h4 className="font-semibold text-amber-800 dark:text-amber-300 mb-2">
                    {language === 'es' ? 'Proyecto del Siglo XXI' : '21st Century Skills Project'}
                  </h4>
                  {generatedPlanner?.project ? (
                    <div className="space-y-2 text-sm text-slate-700 dark:text-slate-300">
                      <p><strong>{language === 'es' ? 'Nombre:' : 'Name:'}</strong> {generatedPlanner.project.name}</p>
                      <p><strong>{language === 'es' ? 'Categoría:' : 'Category:'}</strong> {generatedPlanner.project.category}</p>
                      <p><strong>{language === 'es' ? 'Descripción:' : 'Overview:'}</strong> {generatedPlanner.project.overview}</p>
                      <p><strong>{language === 'es' ? 'Objetivo General:' : 'General Objective:'}</strong> {generatedPlanner.project.general_objective}</p>
                      {generatedPlanner.project.specific_objectives && (
                        <div>
                          <strong>{language === 'es' ? 'Objetivos Específicos:' : 'Specific Objectives:'}</strong>
                          <ul className="list-disc list-inside ml-2">
                            {generatedPlanner.project.specific_objectives.map((obj, i) => (
                              <li key={i}>{obj}</li>
                            ))}
                          </ul>
                        </div>
                      )}
                      {generatedPlanner.project.activities && (
                        <div>
                          <strong>{language === 'es' ? 'Actividades:' : 'Activities:'}</strong>
                          <ul className="list-disc list-inside ml-2">
                            {generatedPlanner.project.activities.map((act, i) => (
                              <li key={i}>{act}</li>
                            ))}
                          </ul>
                        </div>
                      )}
                      {generatedPlanner.project.products_evidences && (
                        <p><strong>{language === 'es' ? 'Productos/Evidencias:' : 'Products/Evidences:'}</strong> {generatedPlanner.project.products_evidences.join(', ')}</p>
                      )}
                      {generatedPlanner.project.rubric_criteria && (
                        <div>
                          <strong>{language === 'es' ? 'Criterios de Rúbrica:' : 'Rubric Criteria:'}</strong>
                          <ul className="list-disc list-inside ml-2">
                            {Object.entries(generatedPlanner.project.rubric_criteria).map(([k, v], i) => (
                              <li key={i}><strong>{k}:</strong> {v}</li>
                            ))}
                          </ul>
                        </div>
                      )}
                      <p><strong>{language === 'es' ? 'Duración:' : 'Duration:'}</strong> {generatedPlanner.project.duration}</p>
                      {generatedPlanner.project.skills_developed && (
                        <p><strong>{language === 'es' ? 'Habilidades Desarrolladas:' : 'Skills Developed:'}</strong> {generatedPlanner.project.skills_developed.join(', ')}</p>
                      )}
                    </div>
                  ) : (
                    <p className="text-sm text-slate-400 italic">{language === 'es' ? 'No se ha seleccionado un proyecto' : 'No project selected'}</p>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* SECTION 4: Specific Objectives */}
            <Card className="border-teal-200 dark:border-teal-800 shadow-md dark:bg-slate-800">
              <CardHeader className="bg-gradient-to-r from-teal-50 to-blue-50 dark:from-slate-700 dark:to-slate-800 border-b border-teal-100 dark:border-slate-700">
                <CardTitle className="text-teal-900 dark:text-teal-100">4. {language === 'es' ? 'Objetivos Específicos' : 'Specific Objectives'}</CardTitle>
              </CardHeader>
              <CardContent className="pt-4">
                <div className="space-y-3">
                  {[
                    { key: 'listening', label: language === 'es' ? 'Para Listening' : 'For Listening' },
                    { key: 'reading', label: language === 'es' ? 'Para Reading' : 'For Reading' },
                    { key: 'speaking', label: language === 'es' ? 'Para Speaking' : 'For Speaking' },
                    { key: 'writing', label: language === 'es' ? 'Para Writing' : 'For Writing' },
                    { key: 'mediation', label: language === 'es' ? 'Para Mediation' : 'For Mediation' }
                  ].map(({ key, label }) => {
                    const objective = theme_planner?.specific_objectives?.[key];
                    return (
                      <div key={key} className="border-l-4 border-teal-500 pl-4">
                        <h4 className="font-semibold text-teal-800 dark:text-teal-300 text-sm">{label}</h4>
                        {editMode ? (
                          <EditableTextarea
                            value={objective || ''}
                            onChange={(value) => handleUpdateField(`theme_planner.specific_objectives.${key}`, value)}
                            className="mt-1"
                          />
                        ) : (
                          <p className="text-sm text-slate-700 dark:text-slate-300">
                            {objective || <span className="italic text-slate-400">{language === 'es' ? 'Por completar' : 'To be completed'}</span>}
                          </p>
                        )}
                      </div>
                    );
                  })}
                </div>
              </CardContent>
            </Card>

            {/* SECTION 5: Teaching Materials and Strategies */}
            <Card className="border-teal-200 dark:border-teal-800 shadow-md dark:bg-slate-800">
              <CardHeader className="bg-gradient-to-r from-teal-50 to-blue-50 dark:from-slate-700 dark:to-slate-800 border-b border-teal-100 dark:border-slate-700">
                <CardTitle className="text-teal-900 dark:text-teal-100">5. {language === 'es' ? 'Materiales y Estrategias de Enseñanza' : 'Teaching Materials and Strategies'}</CardTitle>
              </CardHeader>
              <CardContent className="pt-4 space-y-4">
                <div>
                  <h4 className="font-semibold text-slate-800 dark:text-slate-200 mb-2">
                    {language === 'es' ? 'Lista de Materiales Requeridos' : 'List of Required Materials'}
                  </h4>
                  {theme_planner?.materials_and_strategies?.required_materials && Array.isArray(theme_planner.materials_and_strategies.required_materials) ? (
                    <ul className="list-disc list-inside text-sm text-slate-700 dark:text-slate-300 space-y-1">
                      {theme_planner.materials_and_strategies.required_materials.map((mat, i) => (
                        <li key={i}>{mat}</li>
                      ))}
                    </ul>
                  ) : (
                    <p className="text-sm text-slate-400 italic">{language === 'es' ? 'Por completar' : 'To be completed'}</p>
                  )}
                </div>
                <Separator />
                <div>
                  <h4 className="font-semibold text-slate-800 dark:text-slate-200 mb-2">
                    {language === 'es' ? 'Instrucción Diferenciada y Adaptaciones para Necesidades de Aprendizaje Diversas (DLN)' : 'Differentiated Instruction and Adaptations for Diverse Learning Needs (DLN)'}
                  </h4>
                  <p className="text-sm text-slate-700 dark:text-slate-300">
                    {theme_planner?.materials_and_strategies?.differentiated_instruction || (language === 'es' ? 'Por completar' : 'To be completed')}
                  </p>
                </div>
              </CardContent>
            </Card>

            {/* SECTION 6: Learning Sequence */}
            <Card className="border-teal-200 dark:border-teal-800 shadow-md dark:bg-slate-800">
              <CardHeader className="bg-gradient-to-r from-teal-50 to-blue-50 dark:from-slate-700 dark:to-slate-800 border-b border-teal-100 dark:border-slate-700">
                <CardTitle className="text-teal-900 dark:text-teal-100">6. {language === 'es' ? 'Secuencia de Aprendizaje' : 'Learning Sequence'}</CardTitle>
              </CardHeader>
              <CardContent className="pt-4">
                <div className="space-y-4">
                  {[
                    { 
                      num: 1, 
                      skill: 'Listening', 
                      title: language === 'es' ? 'Listening y Fundamentos del Lenguaje' : 'Listening and Language Foundations',
                      desc: language === 'es' 
                        ? 'Introducción al vocabulario clave y estructuras de lenguaje a través de actividades de comprensión auditiva. Los estudiantes desarrollan habilidades receptivas escuchando diálogos, canciones y presentaciones relacionadas con el tema.'
                        : 'Introduction to key vocabulary and language structures through listening comprehension activities. Students develop receptive skills by listening to dialogues, songs, and presentations related to the theme.'
                    },
                    { 
                      num: 2, 
                      skill: 'Reading', 
                      title: language === 'es' ? 'Reading y Comprensión de Conceptos/Ideas en Textos' : 'Reading and Understanding Concepts/Ideas in Texts',
                      desc: language === 'es'
                        ? 'Los estudiantes interactúan con textos escritos relacionados con el tema para desarrollar habilidades de comprensión lectora. Incluye identificación de palabras clave, comprensión de ideas principales y trabajo con textos ilustrados.'
                        : 'Students interact with written texts related to the theme to develop reading comprehension skills. Includes identification of key words, understanding main ideas, and working with illustrated texts.'
                    },
                    { 
                      num: 3, 
                      skill: 'Speaking', 
                      title: language === 'es' ? 'Tareas Productivas/Interactivas de Speaking' : 'Productive/Interactive Speaking Tasks',
                      desc: language === 'es'
                        ? 'Los estudiantes participan en actividades de producción oral estructuradas y semi-estructuradas. Incluye diálogos en parejas, descripciones orales, presentaciones breves y práctica de pronunciación relacionada con el tema.'
                        : 'Students engage in structured and semi-structured oral production activities. Includes pair dialogues, oral descriptions, brief presentations, and pronunciation practice related to the theme.'
                    },
                    { 
                      num: 4, 
                      skill: 'Writing', 
                      title: language === 'es' ? 'Writing Productivo/Interactivo y Preparación del Proyecto' : 'Productive/Interactive Writing and Project Preparation',
                      desc: language === 'es'
                        ? 'Los estudiantes practican la escritura de palabras, frases y oraciones relacionadas con el tema. Esta lección también sirve como preparación para el proyecto del Siglo XXI, incluyendo borradores y planificación.'
                        : 'Students practice writing words, phrases, and sentences related to the theme. This lesson also serves as preparation for the 21st Century Project, including drafts and planning.'
                    },
                    { 
                      num: 5, 
                      skill: 'Mediation', 
                      title: language === 'es' ? 'Completar el Proyecto del Siglo XXI con Énfasis en Mediation' : 'Completing the 21st Century Project with Emphasis on Mediation',
                      desc: language === 'es'
                        ? 'Los estudiantes completan su proyecto del Siglo XXI integrando todas las habilidades aprendidas (Listening, Reading, Speaking, Writing). Incluye trabajo colaborativo, presentaciones grupales, mediación entre compañeros, autoevaluación y reflexión sobre el aprendizaje.'
                        : 'Students complete their 21st Century Project integrating all learned skills (Listening, Reading, Speaking, Writing). Includes collaborative work, group presentations, peer mediation, self-assessment, and reflection on learning.'
                    }
                  ].map(({ num, skill, title, desc }) => (
                    <div key={num} className="border-l-4 border-teal-500 pl-4 py-3 bg-slate-50 dark:bg-slate-700/50 rounded-r-lg">
                      <div className="flex items-center gap-3 mb-2">
                        <Badge className="bg-teal-600 text-white">{language === 'es' ? 'Lección' : 'Lesson'} {num}</Badge>
                        <span className="font-semibold text-teal-800 dark:text-teal-300">{skill}</span>
                      </div>
                      <p className="font-medium text-slate-900 dark:text-slate-100 mb-1">{title}</p>
                      <p className="text-sm text-slate-600 dark:text-slate-400">{desc}</p>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Lesson Planners Tab */}
          <TabsContent value="lessons" className="space-y-6">
            {/* Lesson Navigation */}
            <div className="flex gap-2 overflow-x-auto pb-2">
              {lesson_planners?.map((lesson, idx) => (
                <Button
                  key={idx}
                  variant={selectedLesson === idx ? 'default' : 'outline'}
                  onClick={() => setSelectedLesson(idx)}
                  className={`whitespace-nowrap ${
                    selectedLesson === idx 
                      ? 'bg-teal-600 hover:bg-teal-700 text-white' 
                      : 'border-teal-300 text-teal-700 hover:bg-teal-50'
                  }`}
                  data-testid={`lesson-${idx + 1}-button`}
                >
                  {t.lesson} {lesson.lesson_number}: {lesson.skill_focus}
                </Button>
              ))}
            </div>

            {/* Selected Lesson */}
            {lesson_planners && lesson_planners[selectedLesson] && (
              <Card className="border-teal-200 shadow-md">
                <CardHeader className="bg-gradient-to-r from-teal-50 to-blue-50 border-b border-teal-100">
                  <CardTitle className="flex items-center gap-3 text-teal-900">
                    <span className="text-2xl">
                      {t.lesson} {lesson_planners[selectedLesson].lesson_number}
                    </span>
                    <Badge className="bg-teal-600 text-white">
                      {lesson_planners[selectedLesson].skill_focus}
                    </Badge>
                  </CardTitle>
                  <CardDescription>
                    {lesson_planners[selectedLesson].scenario} - {lesson_planners[selectedLesson].theme}
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  {/* Specific Objective */}
                  <div>
                    <h4 className="font-semibold text-slate-800 dark:text-slate-200 mb-2">Specific Objective</h4>
                    <div className="text-slate-700 dark:text-slate-300">
                      <EditableField
                        value={lesson_planners[selectedLesson].specific_objective}
                        onChange={(value) => handleUpdateField(`lesson_planners.${selectedLesson}.specific_objective`, value)}
                        multiline
                        placeholder="Enter specific objective..."
                      />
                    </div>
                  </div>

                  {/* Learning Outcome */}
                  <div>
                    <h4 className="font-semibold text-slate-800 dark:text-slate-200 mb-2">{t.learningOutcome}</h4>
                    <div className="text-slate-700 dark:text-slate-300">
                      <EditableField
                        value={lesson_planners[selectedLesson].learning_outcome}
                        onChange={(value) => handleUpdateField(`lesson_planners.${selectedLesson}.learning_outcome`, value)}
                        multiline
                        placeholder="Enter learning outcome..."
                      />
                    </div>
                  </div>

                  <Separator />

                  {/* Lesson Stages */}
                  <div>
                    <h4 className="font-semibold text-slate-800 dark:text-slate-200 mb-4">{t.lessonStages}</h4>
                    <div className="space-y-4">
                      {lesson_planners[selectedLesson].lesson_stages?.map((stage, idx) => (
                        <div key={idx} className="border-l-4 border-secondary dark:border-teal-500 pl-4">
                          <h5 className="font-semibold text-secondary dark:text-teal-400 mb-2">{stage.stage}</h5>
                          {editMode ? (
                            <div className="space-y-2">
                              {stage.activities?.map((activity, actIdx) => (
                                <ActivityEditor
                                  key={actIdx}
                                  value={activity}
                                  onChange={(value) => {
                                    const newActivities = [...stage.activities];
                                    newActivities[actIdx] = value;
                                    handleUpdateField(`lesson_planners.${selectedLesson}.lesson_stages.${idx}.activities`, newActivities);
                                  }}
                                />
                              ))}
                              <Button
                                onClick={() => {
                                  const newActivities = [...(stage.activities || []), 'Nueva actividad'];
                                  handleUpdateField(`lesson_planners.${selectedLesson}.lesson_stages.${idx}.activities`, newActivities);
                                }}
                                variant="outline"
                                size="sm"
                                className="w-full dark:border-slate-600 dark:text-slate-300"
                              >
                                + Add Activity
                              </Button>
                            </div>
                          ) : (
                            stage.activities && stage.activities.length > 0 ? (
                              <ul className="list-disc list-inside text-sm text-slate-700 dark:text-slate-300 space-y-1">
                                {stage.activities.map((activity, actIdx) => (
                                  <li key={actIdx}>{activity}</li>
                                ))}
                              </ul>
                            ) : (
                              <p className="text-sm text-slate-500 dark:text-slate-400 italic">To be completed</p>
                            )
                          )}
                        </div>
                      ))}
                    </div>
                  </div>

                  <Separator />

                  {/* Comments Section */}
                  <div className="space-y-4">
                    <div>
                      <h4 className="font-semibold text-slate-800 dark:text-slate-200 mb-2">{t.homework}</h4>
                      <div className="text-slate-700 dark:text-slate-300">
                        <EditableField
                          value={lesson_planners[selectedLesson].comments?.homework}
                          onChange={(value) => handleUpdateField(`lesson_planners.${selectedLesson}.comments.homework`, value)}
                          multiline
                          placeholder="Enter homework..."
                        />
                      </div>
                    </div>

                    <div>
                      <h4 className="font-semibold text-slate-800 dark:text-slate-200 mb-2">{t.assessment}</h4>
                      <div className="text-slate-700 dark:text-slate-300">
                        <EditableField
                          value={lesson_planners[selectedLesson].comments?.formative_assessment}
                          onChange={(value) => handleUpdateField(`lesson_planners.${selectedLesson}.comments.formative_assessment`, value)}
                          multiline
                          placeholder="Enter assessment strategies..."
                        />
                      </div>
                    </div>

                    <div>
                      <h4 className="font-semibold text-slate-800 dark:text-slate-200 mb-2">{t.teacherNotes}</h4>
                      <div className="text-slate-700 dark:text-slate-300">
                        <EditableField
                          value={lesson_planners[selectedLesson].comments?.teacher_comments}
                          onChange={(value) => handleUpdateField(`lesson_planners.${selectedLesson}.comments.teacher_comments`, value)}
                          multiline
                          placeholder="Enter teacher notes..."
                        />
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
}
