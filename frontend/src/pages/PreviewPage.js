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

  const { theme_planner, lesson_planners } = editMode && editedPlanner ? editedPlanner : generatedPlanner;

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
            <Card className="border-teal-200 dark:border-teal-800 shadow-md dark:bg-slate-800">
              <CardHeader className="bg-gradient-to-r from-teal-50 to-blue-50 dark:from-slate-700 dark:to-slate-800 border-b border-teal-100 dark:border-slate-700">
                <CardTitle className="text-teal-900 dark:text-teal-100">{t.generalInfo}</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm font-medium text-slate-500 dark:text-slate-400">{t.grade}</p>
                    <p className="text-base text-slate-900 dark:text-slate-100">{gradeLabels[theme_planner?.general_information?.grade]}</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-slate-500 dark:text-slate-400">{t.cefrLevel}</p>
                    <p className="text-base text-slate-900 dark:text-slate-100">{theme_planner?.general_information?.cefr_level}</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-slate-500 dark:text-slate-400">{t.scenario}</p>
                    <p className="text-base text-slate-900 dark:text-slate-100">{theme_planner?.general_information?.scenario}</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-slate-500 dark:text-slate-400">{t.theme}</p>
                    <p className="text-base text-slate-900 dark:text-slate-100">{theme_planner?.general_information?.theme}</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Specific Objectives (SMART) */}
            <Card className="border-teal-200 dark:border-teal-800 shadow-md dark:bg-slate-800">
              <CardHeader className="bg-gradient-to-r from-teal-50 to-blue-50 dark:from-slate-700 dark:to-slate-800 border-b border-teal-100 dark:border-slate-700">
                <CardTitle className="text-teal-900 dark:text-teal-100">{t.objectives} (SMART)</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {['listening', 'reading', 'speaking', 'writing', 'mediation'].map((skill) => {
                    const objective = theme_planner?.specific_objectives?.[skill];
                    return (
                      <div key={skill} className="border-l-4 border-teal-500 pl-4">
                        <h4 className="font-semibold text-teal-800 dark:text-teal-300 capitalize mb-2">{t[skill]}</h4>
                        {editMode ? (
                          <EditableField
                            value={objective || ''}
                            onChange={(value) => handleUpdateField(`theme_planner.specific_objectives.${skill}`, value)}
                            multiline
                            placeholder={`Objetivo SMART para ${skill}...`}
                          />
                        ) : (
                          <p className="text-sm text-slate-700 dark:text-slate-300">
                            {objective || <span className="italic text-slate-400">Por completar</span>}
                          </p>
                        )}
                      </div>
                    );
                  })}
                </div>
              </CardContent>
            </Card>

            {/* 21st Century Project Section */}
            {generatedPlanner?.project && (
              <Card className="border-amber-300 dark:border-amber-700 shadow-md dark:bg-slate-800 bg-amber-50">
                <CardHeader className="bg-gradient-to-r from-amber-100 to-orange-100 dark:from-amber-900/50 dark:to-orange-900/50 border-b border-amber-200 dark:border-amber-700">
                  <CardTitle className="text-amber-900 dark:text-amber-100 flex items-center gap-2">
                    <span className="text-2xl">🎯</span>
                    {language === 'es' ? 'Proyecto del Siglo XXI (Lección 5)' : '21st Century Project (Lesson 5)'}
                  </CardTitle>
                  <CardDescription className="text-amber-700 dark:text-amber-300">
                    {generatedPlanner.project.category}
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4 pt-4">
                  <div>
                    <h4 className="font-semibold text-amber-800 dark:text-amber-200 mb-1">{language === 'es' ? 'Nombre del Proyecto' : 'Project Name'}</h4>
                    <p className="text-slate-700 dark:text-slate-300 text-lg font-medium">{generatedPlanner.project.name}</p>
                  </div>
                  
                  <div>
                    <h4 className="font-semibold text-amber-800 dark:text-amber-200 mb-1">{language === 'es' ? 'Descripción' : 'Overview'}</h4>
                    <p className="text-slate-700 dark:text-slate-300">{generatedPlanner.project.overview}</p>
                  </div>
                  
                  <div>
                    <h4 className="font-semibold text-amber-800 dark:text-amber-200 mb-1">{language === 'es' ? 'Objetivo General' : 'General Objective'}</h4>
                    <p className="text-slate-700 dark:text-slate-300">{generatedPlanner.project.general_objective}</p>
                  </div>
                  
                  {generatedPlanner.project.specific_objectives && (
                    <div>
                      <h4 className="font-semibold text-amber-800 dark:text-amber-200 mb-2">{language === 'es' ? 'Objetivos Específicos' : 'Specific Objectives'}</h4>
                      <ul className="list-disc list-inside text-sm text-slate-700 dark:text-slate-300 space-y-1">
                        {generatedPlanner.project.specific_objectives.map((obj, idx) => (
                          <li key={idx}>{obj}</li>
                        ))}
                      </ul>
                    </div>
                  )}
                  
                  {generatedPlanner.project.activities && (
                    <div>
                      <h4 className="font-semibold text-amber-800 dark:text-amber-200 mb-2">{language === 'es' ? 'Actividades del Proyecto' : 'Project Activities'}</h4>
                      <ul className="list-disc list-inside text-sm text-slate-700 dark:text-slate-300 space-y-1">
                        {generatedPlanner.project.activities.map((act, idx) => (
                          <li key={idx}>{act}</li>
                        ))}
                      </ul>
                    </div>
                  )}
                  
                  {generatedPlanner.project.products_evidences && (
                    <div>
                      <h4 className="font-semibold text-amber-800 dark:text-amber-200 mb-2">{language === 'es' ? 'Productos / Evidencias' : 'Products / Evidences'}</h4>
                      <div className="flex flex-wrap gap-2">
                        {generatedPlanner.project.products_evidences.map((prod, idx) => (
                          <Badge key={idx} className="bg-amber-200 text-amber-800 dark:bg-amber-800 dark:text-amber-100">
                            {prod}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  )}
                  
                  {generatedPlanner.project.rubric_criteria && (
                    <div>
                      <h4 className="font-semibold text-amber-800 dark:text-amber-200 mb-2">{language === 'es' ? 'Criterios de Rúbrica' : 'Rubric Criteria'}</h4>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                        {Object.entries(generatedPlanner.project.rubric_criteria).map(([criterion, description], idx) => (
                          <div key={idx} className="bg-white dark:bg-slate-700 p-2 rounded border border-amber-200 dark:border-amber-600">
                            <span className="font-medium text-amber-700 dark:text-amber-300">{criterion}:</span>
                            <span className="text-slate-600 dark:text-slate-300 ml-1">{description}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                  
                  <div className="flex flex-wrap gap-4 pt-2">
                    <div>
                      <span className="font-semibold text-amber-800 dark:text-amber-200">{language === 'es' ? 'Duración: ' : 'Duration: '}</span>
                      <span className="text-slate-700 dark:text-slate-300">{generatedPlanner.project.duration}</span>
                    </div>
                    {generatedPlanner.project.skills_developed && (
                      <div>
                        <span className="font-semibold text-amber-800 dark:text-amber-200">{language === 'es' ? 'Habilidades: ' : 'Skills: '}</span>
                        <span className="text-slate-700 dark:text-slate-300">{generatedPlanner.project.skills_developed.join(', ')}</span>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Standards */}
            <Card className="border-teal-200 dark:border-teal-800 shadow-md dark:bg-slate-800">
              <CardHeader className="bg-gradient-to-r from-teal-50 to-blue-50 dark:from-slate-700 dark:to-slate-800 border-b border-teal-100 dark:border-slate-700">
                <CardTitle className="text-teal-900 dark:text-teal-100">{t.standards}</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {['listening', 'reading', 'speaking', 'writing', 'mediation'].map((skill) => {
                    const skillData = theme_planner?.standards_and_learning_outcomes?.[skill];
                    if (!skillData) return null;
                    
                    return (
                      <div key={skill} className="border-l-4 border-teal-500 pl-4">
                        <h4 className="font-semibold text-teal-800 dark:text-teal-300 capitalize mb-2">{t[skill]}</h4>
                        {typeof skillData === 'object' && (
                          <div className="space-y-2 text-sm text-slate-700 dark:text-slate-300">
                            {skillData.general && <p><strong>General:</strong> {skillData.general}</p>}
                            {skillData.specific && Array.isArray(skillData.specific) && skillData.specific.map((s, i) => (
                              <p key={i}><strong>Specific:</strong> {s}</p>
                            ))}
                            {skillData.learning_outcomes && Array.isArray(skillData.learning_outcomes) && (
                              <div>
                                <strong>Learning Outcomes:</strong>
                                <ul className="list-disc list-inside ml-2 mt-1">
                                  {skillData.learning_outcomes.slice(0, 2).map((lo, i) => (
                                    <li key={i} className="text-xs">{lo}</li>
                                  ))}
                                </ul>
                              </div>
                            )}
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </CardContent>
            </Card>

            {/* Communicative Competences */}
            <Card className="border-teal-200 dark:border-teal-800 shadow-md dark:bg-slate-800">
              <CardHeader className="bg-gradient-to-r from-teal-50 to-blue-50 dark:from-slate-700 dark:to-slate-800 border-b border-teal-100 dark:border-slate-700">
                <CardTitle className="text-teal-900 dark:text-teal-100">{t.competences}</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {theme_planner?.communicative_competences?.linguistic && (
                    <div>
                      <h4 className="font-semibold text-slate-800 dark:text-slate-200 mb-2">Linguistic Competence</h4>
                      <div className="space-y-2 text-sm text-slate-700 dark:text-slate-300">
                        {theme_planner.communicative_competences.linguistic.grammatical_features && (
                          <div>
                            <strong>Grammar:</strong>{' '}
                            {Array.isArray(theme_planner.communicative_competences.linguistic.grammatical_features)
                              ? theme_planner.communicative_competences.linguistic.grammatical_features.join(', ')
                              : theme_planner.communicative_competences.linguistic.grammatical_features}
                          </div>
                        )}
                        {theme_planner.communicative_competences.linguistic.grammar && (
                          <div>
                            <strong>Grammar:</strong>{' '}
                            {Array.isArray(theme_planner.communicative_competences.linguistic.grammar)
                              ? theme_planner.communicative_competences.linguistic.grammar.join(', ')
                              : theme_planner.communicative_competences.linguistic.grammar}
                          </div>
                        )}
                        {theme_planner.communicative_competences.linguistic.vocabulary && (
                          <div>
                            <strong>Vocabulary:</strong>{' '}
                            {Array.isArray(theme_planner.communicative_competences.linguistic.vocabulary)
                              ? theme_planner.communicative_competences.linguistic.vocabulary.join(', ')
                              : theme_planner.communicative_competences.linguistic.vocabulary}
                          </div>
                        )}
                      </div>
                    </div>
                  )}
                  {theme_planner?.communicative_competences?.pragmatic && (
                    <div>
                      <h4 className="font-semibold text-slate-800 mb-2">Pragmatic Competence</h4>
                      <p className="text-sm text-slate-700">
                        {Array.isArray(theme_planner.communicative_competences.pragmatic)
                          ? theme_planner.communicative_competences.pragmatic.join(', ')
                          : theme_planner.communicative_competences.pragmatic}
                      </p>
                    </div>
                  )}
                  {theme_planner?.communicative_competences?.sociolinguistic && (
                    <div>
                      <h4 className="font-semibold text-slate-800 mb-2">Sociolinguistic Competence</h4>
                      <p className="text-sm text-slate-700">
                        {Array.isArray(theme_planner.communicative_competences.sociolinguistic)
                          ? theme_planner.communicative_competences.sociolinguistic.join(', ')
                          : theme_planner.communicative_competences.sociolinguistic}
                      </p>
                    </div>
                  )}
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
