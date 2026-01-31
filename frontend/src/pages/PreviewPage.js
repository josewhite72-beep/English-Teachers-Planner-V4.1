import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { toast } from 'sonner';
import { usePlanner } from '@/context/PlannerContext';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { ArrowLeft, Download, FileText } from 'lucide-react';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

export default function PreviewPage() {
  const navigate = useNavigate();
  const { generatedPlanner, language } = usePlanner();
  const [exporting, setExporting] = useState(false);
  const [selectedLesson, setSelectedLesson] = useState(0);

  const translations = {
    es: {
      back: 'Volver',
      themePlanner: 'Theme Planner',
      lessonPlanners: 'Lesson Planners',
      exportDocx: 'Exportar Word',
      exportPdf: 'Exportar PDF',
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
    },
    en: {
      back: 'Back',
      themePlanner: 'Theme Planner',
      lessonPlanners: 'Lesson Planners',
      exportDocx: 'Export Word',
      exportPdf: 'Export PDF',
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
    },
  };

  const t = translations[language];

  if (!generatedPlanner) {
    navigate('/');
    return null;
  }

  const { theme_planner, lesson_planners } = generatedPlanner;

  const handleExportDocx = async () => {
    setExporting(true);
    try {
      const response = await axios.post(
        `${API}/planner/export/docx`,
        generatedPlanner,
        { responseType: 'blob' }
      );

      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `lesson_planner_${generatedPlanner.grade}_${generatedPlanner.scenario}.docx`);
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
    <div className="min-h-screen bg-gradient-to-br from-teal-50 via-slate-50 to-blue-50">
      {/* Header */}
      <header className="bg-gradient-to-r from-teal-700 to-teal-600 border-b border-teal-800 sticky top-0 z-50 shadow-lg">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <Button
              variant="ghost"
              onClick={() => navigate('/')}
              className="gap-2 text-white hover:bg-teal-600 hover:text-white"
              data-testid="back-button"
            >
              <ArrowLeft className="h-4 w-4" />
              {t.back}
            </Button>
            <div className="flex gap-2">
              <Button
                onClick={handleExportDocx}
                disabled={exporting}
                className="gap-2 bg-white text-teal-700 hover:bg-teal-50"
                data-testid="export-docx-button"
              >
                <FileText className="h-4 w-4" />
                {t.exportDocx}
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-6 py-8">
        {/* Document Header */}
        <div className="bg-white rounded-lg border border-teal-200 shadow-lg p-6 mb-6">
          <div className="flex items-start justify-between">
            <div>
              <h1 className="text-3xl font-bold font-heading text-teal-900 mb-2">
                Lesson Planner
              </h1>
              <div className="flex gap-2 flex-wrap">
                <Badge className="bg-teal-600 text-white hover:bg-teal-700" data-testid="grade-badge">
                  {gradeLabels[generatedPlanner.grade]}
                </Badge>
                <Badge className="bg-blue-600 text-white hover:bg-blue-700" data-testid="scenario-badge">
                  {generatedPlanner.scenario}
                </Badge>
                <Badge className="bg-teal-100 text-teal-800 border border-teal-300" data-testid="theme-badge">
                  {generatedPlanner.theme}
                </Badge>
              </div>
            </div>
          </div>
        </div>

        <Tabs defaultValue="theme" className="space-y-6">
          <TabsList className="grid w-full grid-cols-2 h-12">
            <TabsTrigger value="theme" className="text-base" data-testid="theme-tab">
              {t.themePlanner}
            </TabsTrigger>
            <TabsTrigger value="lessons" className="text-base" data-testid="lessons-tab">
              {t.lessonPlanners}
            </TabsTrigger>
          </TabsList>

          {/* Theme Planner Tab */}
          <TabsContent value="theme" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>{t.generalInfo}</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm font-medium text-slate-500">{t.grade}</p>
                    <p className="text-base text-slate-900">{gradeLabels[theme_planner?.general_information?.grade]}</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-slate-500">{t.cefrLevel}</p>
                    <p className="text-base text-slate-900">{theme_planner?.general_information?.cefr_level}</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-slate-500">{t.scenario}</p>
                    <p className="text-base text-slate-900">{theme_planner?.general_information?.scenario}</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-slate-500">{t.theme}</p>
                    <p className="text-base text-slate-900">{theme_planner?.general_information?.theme}</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Standards */}
            <Card>
              <CardHeader>
                <CardTitle>{t.standards}</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {['listening', 'reading', 'speaking', 'writing', 'mediation'].map((skill) => {
                    const skillData = theme_planner?.standards_and_learning_outcomes?.[skill];
                    if (!skillData) return null;
                    
                    return (
                      <div key={skill} className="border-l-4 border-teal-500 pl-4">
                        <h4 className="font-semibold text-teal-800 capitalize mb-2">{t[skill]}</h4>
                        {typeof skillData === 'object' && (
                          <div className="space-y-2 text-sm text-slate-700">
                            {skillData.general && <p><strong>General:</strong> {skillData.general}</p>}
                            {skillData.specific && <p><strong>Specific:</strong> {skillData.specific}</p>}
                            {skillData.receptive && <p><strong>Receptive:</strong> {skillData.receptive}</p>}
                            {skillData.productive && <p><strong>Productive:</strong> {skillData.productive}</p>}
                            {skillData.interactive && <p><strong>Interactive:</strong> {skillData.interactive}</p>}
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </CardContent>
            </Card>

            {/* Communicative Competences */}
            <Card>
              <CardHeader>
                <CardTitle>{t.competences}</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {theme_planner?.communicative_competences?.linguistic && (
                    <div>
                      <h4 className="font-semibold text-slate-800 mb-2">Linguistic Competence</h4>
                      <div className="space-y-2 text-sm text-slate-700">
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
                  className="whitespace-nowrap"
                  data-testid={`lesson-${idx + 1}-button`}
                >
                  {t.lesson} {lesson.lesson_number}: {lesson.skill_focus}
                </Button>
              ))}
            </div>

            {/* Selected Lesson */}
            {lesson_planners && lesson_planners[selectedLesson] && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-3">
                    <span className="text-2xl">
                      {t.lesson} {lesson_planners[selectedLesson].lesson_number}
                    </span>
                    <Badge className="bg-teal-100 text-teal-800">
                      {lesson_planners[selectedLesson].skill_focus}
                    </Badge>
                  </CardTitle>
                  <CardDescription>
                    {lesson_planners[selectedLesson].scenario} - {lesson_planners[selectedLesson].theme}
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  {/* Learning Outcome */}
                  <div>
                    <h4 className="font-semibold text-slate-800 mb-2">{t.learningOutcome}</h4>
                    <p className="text-slate-700">{lesson_planners[selectedLesson].learning_outcome || 'To be completed'}</p>
                  </div>

                  <Separator />

                  {/* Lesson Stages */}
                  <div>
                    <h4 className="font-semibold text-slate-800 mb-4">{t.lessonStages}</h4>
                    <div className="space-y-4">
                      {lesson_planners[selectedLesson].lesson_stages?.map((stage, idx) => (
                        <div key={idx} className="border-l-4 border-secondary pl-4">
                          <h5 className="font-semibold text-secondary mb-2">{stage.stage}</h5>
                          {stage.activities && stage.activities.length > 0 ? (
                            <ul className="list-disc list-inside text-sm text-slate-700 space-y-1">
                              {stage.activities.map((activity, actIdx) => (
                                <li key={actIdx}>{activity}</li>
                              ))}
                            </ul>
                          ) : (
                            <p className="text-sm text-slate-500 italic">To be completed</p>
                          )}
                        </div>
                      ))}
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
