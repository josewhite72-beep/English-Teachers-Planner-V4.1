import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { toast } from 'sonner';
import { usePlanner } from '@/context/PlannerContext';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { BookOpen, FileText, Globe, Sparkles, Moon, Sun, User, Calendar, Clock } from 'lucide-react';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

export default function HomePage() {
  const navigate = useNavigate();
  const {
    language,
    setLanguage,
    darkMode,
    toggleDarkMode,
    selectedGrade,
    setSelectedGrade,
    selectedScenario,
    setSelectedScenario,
    selectedTheme,
    setSelectedTheme,
    planType,
    setPlanType,
    officialFormat,
    setOfficialFormat,
    selectedProject,
    setSelectedProject,
    setGeneratedPlanner,
    scenarios,
    setScenarios,
    themes,
    setThemes,
    // New MEDUCA fields
    teacherName,
    setTeacherName,
    trimester,
    setTrimester,
    weeklyHours,
    setWeeklyHours,
    weekFrom,
    setWeekFrom,
    weekTo,
    setWeekTo,
  } = usePlanner();

  const [grades] = useState(['pre_k', 'K', '1', '2', '3', '4', '5', '6']);
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(false);

  const translations = {
    es: {
      title: 'English Teachers Planner',
      subtitle: 'Genera planeamientos de clases alineados al currículo MEDUCA',
      grade: 'Grado',
      selectGrade: 'Selecciona un grado',
      scenario: 'Scenario',
      selectScenario: 'Selecciona un scenario',
      theme: 'Theme',
      selectTheme: 'Selecciona un theme',
      planType: 'Tipo de Plan',
      basic: 'Basic',
      standard: 'Standard',
      enriched: 'Enriched',
      project: 'Proyecto del Siglo XXI',
      selectProject: 'Selecciona un proyecto (opcional)',
      officialFormat: 'Formato Oficial MEDUCA',
      generate: 'Generar Planeamiento',
      generating: 'Generando...',
      // New MEDUCA fields
      teacherInfo: 'Información del Docente (Opcional)',
      teacherName: 'Nombre del Docente',
      teacherPlaceholder: 'Ej: Prof. María García',
      trimester: 'Trimestre',
      selectTrimester: 'Selecciona trimestre',
      weeklyHours: 'Horas Semanales',
      weeklyHoursPlaceholder: 'Ej: 3',
      weekRange: 'Semanas',
      weekFrom: 'Desde',
      weekTo: 'Hasta',
    },
    en: {
      title: 'English Teachers Planner',
      subtitle: 'Generate lesson planners aligned to MEDUCA curriculum',
      grade: 'Grade',
      selectGrade: 'Select a grade',
      scenario: 'Scenario',
      selectScenario: 'Select a scenario',
      theme: 'Theme',
      selectTheme: 'Select a theme',
      planType: 'Plan Type',
      basic: 'Basic',
      standard: 'Standard',
      enriched: 'Enriched',
      project: '21st Century Project',
      selectProject: 'Select a project (optional)',
      officialFormat: 'Official MEDUCA Format',
      generate: 'Generate Planner',
      generating: 'Generating...',
      // New MEDUCA fields
      teacherInfo: 'Teacher Information (Optional)',
      teacherName: 'Teacher Name',
      teacherPlaceholder: 'E.g.: Prof. María García',
      trimester: 'Trimester',
      selectTrimester: 'Select trimester',
      weeklyHours: 'Weekly Hours',
      weeklyHoursPlaceholder: 'E.g.: 3',
      weekRange: 'Weeks',
      weekFrom: 'From',
      weekTo: 'To',
    },
  };

  const t = translations[language];

  // Load scenarios when grade changes
  useEffect(() => {
    if (selectedGrade) {
      loadScenarios(selectedGrade);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedGrade]);

  // Load themes when scenario changes
  useEffect(() => {
    if (selectedGrade && selectedScenario) {
      loadThemes(selectedGrade, selectedScenario);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedScenario]);

  // Load projects when scenario changes
  useEffect(() => {
    if (selectedGrade && selectedScenario) {
      loadProjects(selectedGrade, selectedScenario);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedScenario]);

  const loadScenarios = async (grade) => {
    try {
      const response = await axios.get(`${API}/grades/${grade}/scenarios`);
      setScenarios(response.data.scenarios || []);
      setSelectedScenario('');
      setSelectedTheme('');
      setProjects([]);  // Reset projects when grade changes
      setSelectedProject(null);
    } catch (error) {
      console.error('Error loading scenarios:', error);
      toast.error('Error loading scenarios');
    }
  };

  const loadThemes = async (grade, scenario) => {
    try {
      const response = await axios.get(`${API}/grades/${grade}/scenarios/${encodeURIComponent(scenario)}/themes`);
      setThemes(response.data.themes || []);
      setSelectedTheme('');
    } catch (error) {
      console.error('Error loading themes:', error);
      toast.error('Error loading themes');
    }
  };

  const loadProjects = async (grade, scenario) => {
    try {
      console.log('Loading projects for:', grade, scenario);
      const response = await axios.get(`${API}/projects/official/${grade}/${encodeURIComponent(scenario)}`);
      console.log('Projects loaded:', response.data.projects);
      setProjects(response.data.projects || []);
    } catch (error) {
      console.error('Error loading projects:', error);
      setProjects([]);
    }
  };

  const handleGenerate = async () => {
    if (!selectedGrade || !selectedScenario || !selectedTheme) {
      toast.error('Por favor completa todos los campos requeridos');
      return;
    }

    setLoading(true);
    try {
      const response = await axios.post(`${API}/planner/generate`, {
        grade: selectedGrade,
        scenario: selectedScenario,
        theme: selectedTheme,
        plan_type: planType,
        official_format: officialFormat,
        project_id: selectedProject,
        language: language,
        // New MEDUCA fields
        teacher_name: teacherName,
        trimester: trimester,
        weekly_hours: weeklyHours,
        week_from: weekFrom,
        week_to: weekTo,
      });

      setGeneratedPlanner(response.data);
      toast.success('Planeamiento generado exitosamente');
      navigate('/preview');
    } catch (error) {
      console.error('Error generating planner:', error);
      toast.error('Error al generar el planeamiento');
    } finally {
      setLoading(false);
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
    <div className="min-h-screen bg-gradient-to-br from-teal-50 via-slate-50 to-blue-50 dark:from-slate-900 dark:via-slate-800 dark:to-slate-900">
      {/* Header */}
      <header className="bg-gradient-to-r from-teal-700 to-teal-600 dark:from-teal-800 dark:to-teal-900 border-b border-teal-800 dark:border-teal-950 sticky top-0 z-50 shadow-lg">
        <div className="max-w-7xl mx-auto px-6 py-5">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <BookOpen className="h-9 w-9 text-white" />
              <div>
                <h1 className="text-2xl font-bold font-heading text-white">{t.title}</h1>
                <p className="text-sm text-teal-100 dark:text-teal-200">{t.subtitle}</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
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
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setLanguage(language === 'es' ? 'en' : 'es')}
                data-testid="language-toggle"
                className="gap-2 text-white hover:bg-teal-600 dark:hover:bg-teal-800 hover:text-white"
              >
                <Globe className="h-4 w-4" />
                {language === 'es' ? 'EN' : 'ES'}
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-4xl mx-auto px-6 py-12">
        <Card className="border-teal-200 dark:border-teal-800 shadow-xl bg-white dark:bg-slate-800">
          <CardHeader className="bg-gradient-to-r from-teal-50 to-blue-50 dark:from-slate-700 dark:to-slate-800 border-b border-teal-100 dark:border-slate-700">
            <CardTitle className="flex items-center gap-2 text-2xl text-teal-900 dark:text-teal-100">
              <FileText className="h-6 w-6 text-teal-700 dark:text-teal-400" />
              {t.title}
            </CardTitle>
            <CardDescription className="text-teal-700 dark:text-teal-300">{t.subtitle}</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Grade Selector */}
            <div className="space-y-2">
              <Label htmlFor="grade" className="text-base font-semibold dark:text-slate-200">
                {t.grade} *
              </Label>
              <Select value={selectedGrade} onValueChange={setSelectedGrade}>
                <SelectTrigger id="grade" data-testid="grade-selector" className="w-full dark:bg-slate-700 dark:border-slate-600 dark:text-white">
                  <SelectValue placeholder={t.selectGrade} />
                </SelectTrigger>
                <SelectContent>
                  {grades.map((grade) => (
                    <SelectItem key={grade} value={grade}>
                      {gradeLabels[grade]}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Scenario Selector */}
            <div className="space-y-2">
              <Label htmlFor="scenario" className="text-base font-semibold dark:text-slate-200">
                {t.scenario} *
              </Label>
              <Select
                value={selectedScenario}
                onValueChange={setSelectedScenario}
                disabled={!selectedGrade}
              >
                <SelectTrigger id="scenario" data-testid="scenario-selector" className="w-full dark:bg-slate-700 dark:border-slate-600 dark:text-white">
                  <SelectValue placeholder={t.selectScenario} />
                </SelectTrigger>
                <SelectContent>
                  {scenarios.map((scenario, idx) => (
                    <SelectItem key={idx} value={scenario}>
                      {scenario}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Theme Selector */}
            <div className="space-y-2">
              <Label htmlFor="theme" className="text-base font-semibold dark:text-slate-200">
                {t.theme} *
              </Label>
              <Select
                value={selectedTheme}
                onValueChange={setSelectedTheme}
                disabled={!selectedScenario}
              >
                <SelectTrigger id="theme" data-testid="theme-selector" className="w-full dark:bg-slate-700 dark:border-slate-600 dark:text-white">
                  <SelectValue placeholder={t.selectTheme} />
                </SelectTrigger>
                <SelectContent>
                  {themes.map((theme, idx) => (
                    <SelectItem key={idx} value={theme}>
                      {theme}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Teacher Information Section - MEDUCA Official Format */}
            <div className="space-y-4 p-4 bg-blue-50 dark:bg-slate-700 rounded-lg border border-blue-200 dark:border-slate-600">
              <div className="flex items-center gap-2">
                <User className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                <Label className="text-base font-semibold text-blue-800 dark:text-blue-300">
                  {t.teacherInfo}
                </Label>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Teacher Name */}
                <div className="space-y-2">
                  <Label htmlFor="teacher-name" className="text-sm dark:text-slate-300">
                    {t.teacherName}
                  </Label>
                  <Input
                    id="teacher-name"
                    data-testid="teacher-name-input"
                    value={teacherName}
                    onChange={(e) => setTeacherName(e.target.value)}
                    placeholder={t.teacherPlaceholder}
                    className="dark:bg-slate-600 dark:border-slate-500 dark:text-white"
                  />
                </div>

                {/* Trimester */}
                <div className="space-y-2">
                  <Label htmlFor="trimester" className="text-sm dark:text-slate-300">
                    {t.trimester}
                  </Label>
                  <Select value={trimester} onValueChange={setTrimester}>
                    <SelectTrigger id="trimester" data-testid="trimester-selector" className="w-full dark:bg-slate-600 dark:border-slate-500 dark:text-white">
                      <SelectValue placeholder={t.selectTrimester} />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="1">1</SelectItem>
                      <SelectItem value="2">2</SelectItem>
                      <SelectItem value="3">3</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {/* Weekly Hours */}
                <div className="space-y-2">
                  <Label htmlFor="weekly-hours" className="text-sm dark:text-slate-300 flex items-center gap-1">
                    <Clock className="h-4 w-4" />
                    {t.weeklyHours}
                  </Label>
                  <Input
                    id="weekly-hours"
                    data-testid="weekly-hours-input"
                    type="number"
                    min="1"
                    max="10"
                    value={weeklyHours}
                    onChange={(e) => setWeeklyHours(e.target.value)}
                    placeholder={t.weeklyHoursPlaceholder}
                    className="dark:bg-slate-600 dark:border-slate-500 dark:text-white"
                  />
                </div>

                {/* Week Range */}
                <div className="space-y-2">
                  <Label className="text-sm dark:text-slate-300 flex items-center gap-1">
                    <Calendar className="h-4 w-4" />
                    {t.weekRange}
                  </Label>
                  <div className="flex items-center gap-2">
                    <Input
                      id="week-from"
                      data-testid="week-from-input"
                      type="number"
                      min="1"
                      max="52"
                      value={weekFrom}
                      onChange={(e) => setWeekFrom(e.target.value)}
                      placeholder={t.weekFrom}
                      className="w-20 dark:bg-slate-600 dark:border-slate-500 dark:text-white"
                    />
                    <span className="text-slate-500 dark:text-slate-400">→</span>
                    <Input
                      id="week-to"
                      data-testid="week-to-input"
                      type="number"
                      min="1"
                      max="52"
                      value={weekTo}
                      onChange={(e) => setWeekTo(e.target.value)}
                      placeholder={t.weekTo}
                      className="w-20 dark:bg-slate-600 dark:border-slate-500 dark:text-white"
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Plan Type */}
            <div className="space-y-2">
              <Label htmlFor="plan-type" className="text-base font-semibold dark:text-slate-200">
                {t.planType}
              </Label>
              <Select value={planType} onValueChange={setPlanType}>
                <SelectTrigger id="plan-type" data-testid="plan-type-selector" className="w-full dark:bg-slate-700 dark:border-slate-600 dark:text-white">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="basic">{t.basic}</SelectItem>
                  <SelectItem value="standard">{t.standard}</SelectItem>
                  <SelectItem value="enriched">{t.enriched}</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Project Selector - Always show when theme is selected */}
            {selectedTheme && (
              <div className="space-y-2">
                <Label htmlFor="project" className="text-base font-semibold flex items-center gap-2 dark:text-slate-200">
                  <Sparkles className="h-4 w-4 text-amber-500" />
                  {t.project}
                </Label>
                <Select value={selectedProject || ''} onValueChange={setSelectedProject}>
                  <SelectTrigger id="project" data-testid="project-selector" className="w-full dark:bg-slate-700 dark:border-slate-600 dark:text-white">
                    <SelectValue placeholder={t.selectProject} />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="none">{language === 'es' ? 'Ninguno' : 'None'}</SelectItem>
                    {projects.map((project) => (
                      <SelectItem key={project.id} value={project.id}>
                        {project.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {projects.length === 0 && (
                  <p className="text-xs text-amber-600 dark:text-amber-400">
                    {language === 'es' ? 'No hay proyectos disponibles para este scenario' : 'No projects available for this scenario'}
                  </p>
                )}
              </div>
            )}

            {/* Official Format Toggle */}
            <div className="flex items-center justify-between py-4 px-4 bg-slate-50 dark:bg-slate-700 rounded-lg">
              <Label htmlFor="official-format" className="text-base font-semibold cursor-pointer dark:text-slate-200">
                {t.officialFormat}
              </Label>
              <Switch
                id="official-format"
                data-testid="official-format-toggle"
                checked={officialFormat}
                onCheckedChange={setOfficialFormat}
              />
            </div>

            {/* Generate Button */}
            <Button
              onClick={handleGenerate}
              disabled={loading || !selectedGrade || !selectedScenario || !selectedTheme}
              className="w-full h-14 text-lg bg-gradient-to-r from-teal-600 to-teal-700 hover:from-teal-700 hover:to-teal-800 text-white shadow-lg"
              data-testid="generate-button"
            >
              {loading ? t.generating : t.generate}
            </Button>
          </CardContent>
        </Card>
      </main>
    </div>
  );
}
