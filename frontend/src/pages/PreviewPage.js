import React, { useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import { usePlanner } from '@/context/PlannerContext';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Input } from '@/components/ui/input';
import EditableTextarea from '@/components/EditableTextarea';
import { ArrowLeft, Moon, Sun, Printer } from 'lucide-react';

export default function PreviewPage() {
  const navigate = useNavigate();
  const { generatedPlanner, setGeneratedPlanner, language, darkMode, toggleDarkMode } = usePlanner();
  const [selectedLesson, setSelectedLesson] = useState(0);
  const [editMode, setEditMode] = useState(false);
  const [editedPlanner, setEditedPlanner] = useState(null);

  const translations = {
    es: {
      back: 'Volver',
      themePlanner: 'Theme Planner',
      lessonPlanners: 'Lesson Planners',
      exportDocx: 'Exportar PDF Completo',
      edit: 'Editar',
      save: 'Guardar',
      cancel: 'Cancelar',
      lesson: 'Lesson',
    },
    en: {
      back: 'Back',
      themePlanner: 'Theme Planner',
      lessonPlanners: 'Lesson Planners',
      exportDocx: 'Export Complete PDF',
      edit: 'Edit',
      save: 'Save',
      cancel: 'Cancel',
      lesson: 'Lesson',
    },
  };

  const t = translations[language];

  const handleUpdateField = useCallback((path, value) => {
    setEditedPlanner(prevPlanner => {
      const newPlanner = JSON.parse(JSON.stringify(prevPlanner));
      const keys = path.split('.');
      let current = newPlanner;
      for (let i = 0; i < keys.length - 1; i++) {
        const key = keys[i];
        const nextKey = keys[i + 1];
        if (!isNaN(nextKey)) {
          if (!Array.isArray(current[key])) current[key] = [];
        } else {
          if (current[key] === undefined) current[key] = {};
        }
        current = current[key];
      }
      current[keys[keys.length - 1]] = value;
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
  const general_info = theme_planner?.general_information || {};

  const handleEditMode = () => {
    setEditMode(true);
    setEditedPlanner(JSON.parse(JSON.stringify(generatedPlanner)));
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

  const handleExportPDF = () => {
    const printWindow = window.open('', '_blank');
    const styles = Array.from(document.styleSheets)
      .map(sheet => {
        try { return Array.from(sheet.cssRules).map(rule => rule.cssText).join('\n'); }
        catch (e) { return ''; }
      }).join('\n');

    const themeContent = document.getElementById('theme-planner-content')?.innerHTML || '';
    const projectContent = document.getElementById('project-content')?.innerHTML || '';
    const lessonsHTML = lesson_planners?.map((_, idx) => {
      const content = document.getElementById(`lesson-content-${idx}`)?.innerHTML || '';
      return `<div class="page-break"></div>${content}`;
    }).join('') || '';

    printWindow.document.write(`
      <!DOCTYPE html><html><head>
      <meta charset="UTF-8">
      <title>MEDUCA Planner - ${general_info.theme || 'Planner'}</title>
      <style>
        ${styles}
        body { background: white; padding: 20px; font-family: Arial, sans-serif; font-size: 12px; }
        @page { margin: 1.5cm; size: letter portrait; }
        .page-break { page-break-before: always; margin-top: 20px; }
        table { border-collapse: collapse; width: 100%; margin-bottom: 10px; }
        th, td { border: 1px solid #333; padding: 6px 8px; vertical-align: top; font-size: 11px; }
        th { background: #f0f0f0; font-weight: bold; }
        h1, h2, h3 { color: #1a365d; }
        .no-print, button, nav, header { display: none !important; }
      </style>
      </head><body>
      <div id="meduca-header" style="text-align:center; margin-bottom:20px;">
        <div style="display:flex; justify-content:center; align-items:center; gap:20px;">
          <div style="font-size:10px;"><p style="font-weight:bold;">GOBIERNO NACIONAL</p><p>• CON PASO FIRME •</p></div>
          <div style="border-left:1px solid #ccc; height:30px;"></div>
          <div style="font-size:10px; text-align:left;">
            <p style="font-weight:bold; color:#1a365d;">MINISTERIO DE EDUCACIÓN</p>
            <p>Dirección Nacional de Currículo de Lengua Extranjera</p>
          </div>
        </div>
      </div>
      ${themeContent}
      ${projectContent ? `<div class="page-break"></div>${projectContent}` : ''}
      ${lessonsHTML}
      </body></html>
    `);
    printWindow.document.close();
    printWindow.focus();
    setTimeout(() => { printWindow.print(); printWindow.close(); }, 800);
    toast.success(language === 'es' ? 'Generando PDF completo...' : 'Generating complete PDF...');
  };

  const EditableField = ({ value, onChange, multiline = false, placeholder = '', className = '' }) => {
    if (!editMode) {
      return <span className={`text-slate-700 dark:text-slate-300 ${className}`}>{value || placeholder || '______'}</span>;
    }
    if (multiline) {
      return (
        <EditableTextarea value={value} onChange={onChange}
          className={`min-h-[60px] dark:bg-slate-700 dark:border-slate-600 dark:text-white ${className}`}
          placeholder={placeholder} rows={3} />
      );
    }
    return (
      <Input value={value || ''} onChange={(e) => onChange(e.target.value)}
        className={`dark:bg-slate-700 dark:border-slate-600 dark:text-white ${className}`}
        placeholder={placeholder} />
    );
  };

  const gradeLabels = {
    pre_k: 'Pre-K', K: 'Kindergarten', 1: 'Grade 1', 2: 'Grade 2',
    3: 'Grade 3', 4: 'Grade 4', 5: 'Grade 5', 6: 'Grade 6',
    7: 'Grade 7', 8: 'Grade 8', 9: 'Grade 9', 10: 'Grade 10',
    11: 'Grade 11', 12: 'Grade 12',
  };

  const getScenarioNumber = () => {
    const match = generatedPlanner.scenario?.match(/Scenario (\d+)/);
    return match ? match[1] : '___';
  };

  return (
    <div className={`min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-slate-100 dark:from-slate-900 dark:via-slate-800 dark:to-slate-900 ${darkMode ? 'dark' : ''}`}>
      <header className="bg-gradient-to-r from-blue-800 to-blue-700 border-b border-blue-900 sticky top-0 z-50 shadow-lg print:hidden">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <Button variant="ghost" onClick={() => navigate('/')} className="gap-2 text-white hover:bg-blue-600">
              <ArrowLeft className="h-4 w-4" />{t.back}
            </Button>
            <div className="flex gap-2">
              <Button variant="ghost" size="sm" onClick={toggleDarkMode} className="gap-2 text-white hover:bg-blue-600">
                {darkMode ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
              </Button>
              {editMode ? (
                <>
                  <Button onClick={handleSaveChanges} className="gap-2 bg-green-600 text-white hover:bg-green-700">{t.save}</Button>
                  <Button onClick={handleCancelEdit} variant="outline" className="gap-2 border-white text-white hover:bg-blue-600">{t.cancel}</Button>
                </>
              ) : (
                <>
                  <Button onClick={handleEditMode} className="gap-2 bg-amber-500 text-white hover:bg-amber-600">{t.edit}</Button>
                  <Button onClick={handleExportPDF} className="gap-2 bg-white text-blue-700 hover:bg-blue-50">
                    <Printer className="h-4 w-4" />{t.exportDocx}
                  </Button>
                </>
              )}
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-5xl mx-auto px-4 py-6">
        <div className="text-center mb-6">
          <div className="flex justify-center items-center gap-4 mb-2">
            <div className="text-xs text-slate-600 dark:text-slate-400">
              <p className="font-semibold">GOBIERNO NACIONAL</p>
              <p>• CON PASO FIRME •</p>
            </div>
            <div className="h-8 w-px bg-slate-300 dark:bg-slate-600"></div>
            <div className="text-xs text-slate-600 dark:text-slate-400 text-left">
              <p className="font-bold text-blue-800 dark:text-blue-400">MINISTERIO DE EDUCACIÓN</p>
              <p>Dirección Nacional de Currículo de</p>
              <p>Lengua Extranjera</p>
            </div>
          </div>
        </div>

        <Tabs defaultValue="theme" className="space-y-4">
          <TabsList className="grid w-full grid-cols-2 h-12 bg-blue-50 dark:bg-slate-700 border border-blue-200 print:hidden">
            <TabsTrigger value="theme" className="text-base data-[state=active]:bg-blue-700 data-[state=active]:text-white">{t.themePlanner}</TabsTrigger>
            <TabsTrigger value="lessons" className="text-base data-[state=active]:bg-blue-700 data-[state=active]:text-white">{t.lessonPlanners}</TabsTrigger>
          </TabsList>

          <TabsContent value="theme" className="space-y-4">
            {/* THEME PLANNER CONTENT */}
            <div id="theme-planner-content">
              <div className="bg-white dark:bg-slate-800 rounded-lg border-2 border-blue-800 px-6 py-3 text-center">
                <h1 className="text-xl font-bold text-blue-800 dark:text-blue-300">
                  Theme Planner # {getScenarioNumber()} – Overview
                </h1>
              </div>

              {/* SECTION 1 */}
              <Card className="border border-slate-300 dark:border-slate-600 shadow-sm mt-4">
                <CardHeader className="py-3 bg-white dark:bg-slate-800">
                  <CardTitle className="text-base font-bold text-slate-800 dark:text-slate-200">1. General Information:</CardTitle>
                </CardHeader>
                <CardContent className="p-0">
                  <table className="w-full text-sm border-collapse">
                    <tbody>
                      <tr className="border-b border-dashed border-slate-300">
                        <td className="p-3 border-r border-dashed border-slate-300 font-semibold w-1/4">1. Teacher(s):</td>
                        <td className="p-3" colSpan="3">
                          <EditableField value={general_info.teachers} onChange={(v) => handleUpdateField('theme_planner.general_information.teachers', v)} placeholder="_______________" />
                        </td>
                      </tr>
                      <tr className="border-b border-dashed border-slate-300">
                        <td className="p-3 border-r border-dashed border-slate-300 font-semibold">2. Grade:</td>
                        <td className="p-3 border-r border-dashed border-slate-300">{gradeLabels[general_info.grade] || general_info.grade}</td>
                        <td className="p-3 border-r border-dashed border-slate-300 font-semibold">3. CEFR Level:</td>
                        <td className="p-3">{general_info.cefr_level || '______'}</td>
                      </tr>
                      <tr className="border-b border-dashed border-slate-300">
                        <td className="p-3 border-r border-dashed border-slate-300 font-semibold">4. Trimester:</td>
                        <td className="p-3 border-r border-dashed border-slate-300">
                          <EditableField value={general_info.trimester} onChange={(v) => handleUpdateField('theme_planner.general_information.trimester', v)} placeholder="______" />
                        </td>
                        <td className="p-3 border-r border-dashed border-slate-300 font-semibold">5. Weekly Hour(s):</td>
                        <td className="p-3">
                          <EditableField value={general_info.weekly_hours} onChange={(v) => handleUpdateField('theme_planner.general_information.weekly_hours', v)} placeholder="______" />
                        </td>
                      </tr>
                      <tr className="border-b border-dashed border-slate-300">
                        <td className="p-3 border-r border-dashed border-slate-300 font-semibold">6. Week(s):</td>
                        <td className="p-3" colSpan="3">
                          <span>From week </span>
                          <EditableField value={general_info.week_range?.replace('From week ','').split(' to week ')[0]||''} onChange={(v)=>{const t=general_info.week_range?.split(' to week ')[1]||'';handleUpdateField('theme_planner.general_information.week_range',`From week ${v} to week ${t}`);}} placeholder="____" className="inline w-16"/>
                          <span> to week </span>
                          <EditableField value={general_info.week_range?.split(' to week ')[1]||''} onChange={(v)=>{const f=general_info.week_range?.replace('From week ','').split(' to week ')[0]||'';handleUpdateField('theme_planner.general_information.week_range',`From week ${f} to week ${v}`);}} placeholder="____" className="inline w-16"/>
                        </td>
                      </tr>
                      <tr>
                        <td className="p-3 border-r border-dashed border-slate-300 font-semibold">7. Scenario __:</td>
                        <td className="p-3 border-r border-dashed border-slate-300">{general_info.scenario}</td>
                        <td className="p-3 border-r border-dashed border-slate-300 font-semibold">8. Theme __:</td>
                        <td className="p-3">{general_info.theme}</td>
                      </tr>
                    </tbody>
                  </table>
                </CardContent>
              </Card>

              {/* SECTION 2 */}
              <Card className="border border-slate-300 dark:border-slate-600 shadow-sm mt-4">
                <CardHeader className="py-3 bg-white dark:bg-slate-800">
                  <CardTitle className="text-base font-bold text-slate-800 dark:text-slate-200">2. Specific Standards and Learning Outcomes:</CardTitle>
                </CardHeader>
                <CardContent className="p-0">
                  <table className="w-full text-sm border-collapse">
                    <thead>
                      <tr className="border-b border-dashed border-slate-300 bg-slate-50 dark:bg-slate-700">
                        <th className="p-3 border-r border-dashed border-slate-300 text-left font-semibold w-24">Skills:</th>
                        <th className="p-3 border-r border-dashed border-slate-300 text-left font-semibold">Specific Standards:</th>
                        <th className="p-3 text-left font-semibold">Learning Outcomes:</th>
                      </tr>
                    </thead>
                    <tbody>
                      {[{key:'listening',label:'1. Listening:'},{key:'reading',label:'2. Reading:'},{key:'speaking',label:'3. Speaking:'},{key:'writing',label:'4. Writing:'},{key:'mediation',label:'5. Mediation:'}].map(({key,label})=>{
                        const skillData=theme_planner?.standards_and_learning_outcomes?.[key];
                        let standards=[],outcomes=[];
                        if(skillData&&typeof skillData==='object'){
                          outcomes=skillData.learning_outcomes||[];
                          if(Array.isArray(skillData.specific))standards=skillData.specific;
                          else if(Array.isArray(skillData.specific_standards))standards=skillData.specific_standards;
                          else{['receptive','interactive','productive','reading','reading1','reading2','phonemic_awareness','listening','listening1','listening2','speaking','speaking1','speaking2','writing','writing1','writing2','text','concept','general'].forEach(f=>{if(skillData[f]&&typeof skillData[f]==='string')standards.push(skillData[f]);});}
                          if(outcomes.length===0&&standards.length>0){outcomes=standards.map(s=>{let c=s.trim().replace(/^Students will be able to\s*/i,'').replace(/^The student will\s*/i,'').replace(/^Learners will\s*/i,'');if(!c.toLowerCase().startsWith('can '))c=`Can ${c.charAt(0).toLowerCase()}${c.slice(1)}`;c=c.charAt(0).toUpperCase()+c.slice(1);if(!c.endsWith('.'))c+='.';return c;});}
                        }
                        return(
                          <tr key={key} className="border-b border-dashed border-slate-300">
                            <td className="p-3 border-r border-dashed border-slate-300 font-semibold align-top">{label}</td>
                            <td className="p-3 border-r border-dashed border-slate-300 align-top">
                              {standards.length>0?<ul className="list-disc list-inside space-y-1">{standards.map((s,i)=><li key={i} className="text-slate-700 dark:text-slate-300">{s}</li>)}</ul>:<span className="text-slate-400 italic">To be defined</span>}
                            </td>
                            <td className="p-3 align-top">
                              {outcomes.length>0?<ul className="list-disc list-inside space-y-1">{outcomes.map((o,i)=><li key={i} className="text-slate-700 dark:text-slate-300">{o}</li>)}</ul>:<span className="text-slate-400 italic">To be defined</span>}
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </CardContent>
              </Card>

              {/* SECTION 3 */}
              <Card className="border border-slate-300 dark:border-slate-600 shadow-sm mt-4">
                <CardHeader className="py-3 bg-white dark:bg-slate-800">
                  <CardTitle className="text-base font-bold text-slate-800 dark:text-slate-200">3. Communicative Competences</CardTitle>
                </CardHeader>
                <CardContent className="p-0">
                  <table className="w-full text-sm border-collapse">
                    <thead>
                      <tr className="border-b border-dashed border-slate-300 bg-slate-50 dark:bg-slate-700">
                        <th className="p-3 border-r border-dashed border-slate-300 text-center font-semibold w-1/3">Linguistic Competence<br/><span className="font-normal">(Learn to Know)</span></th>
                        <th className="p-3 border-r border-dashed border-slate-300 text-center font-semibold w-1/3">Pragmatic Competence<br/><span className="font-normal">(Learn to Do)</span></th>
                        <th className="p-3 text-center font-semibold w-1/3">Sociolinguistic Competence<br/><span className="font-normal">(Learn to Be)</span></th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr className="border-b border-dashed border-slate-300">
                        <td className="p-3 border-r border-dashed border-slate-300 align-top">
                          <div className="space-y-4">
                            <div><p className="font-semibold mb-1">• Grammatical Features:</p><p className="text-slate-700 dark:text-slate-300 pl-4">{(()=>{const l=theme_planner?.communicative_competences?.linguistic;const g=l?.grammatical_features||l?.grammar;if(Array.isArray(g))return g.join(', ');return g||'______';})()}</p></div>
                            <div><p className="font-semibold mb-1">• Vocabulary:</p><p className="text-slate-700 dark:text-slate-300 pl-4">{(()=>{const v=theme_planner?.communicative_competences?.linguistic?.vocabulary;if(Array.isArray(v))return v.slice(0,10).join(', ');if(typeof v==='object'&&v!==null)return Object.values(v).flat().slice(0,10).join(', ');return v||'______';})()}</p></div>
                            <div><p className="font-semibold mb-1">• Pronunciation & Phonemic Awareness:</p><p className="text-slate-700 dark:text-slate-300 pl-4">{theme_planner?.communicative_competences?.linguistic?.phonemic_awareness||theme_planner?.communicative_competences?.linguistic?.pronunciation||'______'}</p></div>
                          </div>
                        </td>
                        <td className="p-3 border-r border-dashed border-slate-300 align-top">
                          <p className="text-slate-700 dark:text-slate-300">{(()=>{const p=theme_planner?.communicative_competences?.pragmatic;if(Array.isArray(p))return p.join(', ');if(typeof p==='object')return p.functions||JSON.stringify(p);return p||'______';})()}</p>
                        </td>
                        <td className="p-3 align-top">
                          <p className="text-slate-700 dark:text-slate-300">{(()=>{const s=theme_planner?.communicative_competences?.sociolinguistic;if(Array.isArray(s))return s.join(', ');return s||'______';})()}</p>
                        </td>
                      </tr>
                    </tbody>
                  </table>
                </CardContent>
              </Card>

              {/* SECTION 4 */}
              <Card className="border border-slate-300 dark:border-slate-600 shadow-sm mt-4">
                <CardHeader className="py-3 bg-white dark:bg-slate-800">
                  <CardTitle className="text-base font-bold text-slate-800 dark:text-slate-200">4. Specific Objectives</CardTitle>
                </CardHeader>
                <CardContent className="p-0">
                  <table className="w-full text-sm border-collapse">
                    <tbody>
                      {['Listening','Reading','Speaking','Writing','Mediation'].map((skill)=>{
                        const key=skill.toLowerCase();
                        const objective=theme_planner?.specific_objectives?.[key];
                        return(
                          <tr key={key} className="border-b border-dashed border-slate-300 last:border-b-0">
                            <td className="p-3 border-r border-dashed border-slate-300 font-semibold w-24 align-top">{skill}</td>
                            <td className="p-3 align-top">
                              {editMode?<EditableTextarea value={objective||''} onChange={(v)=>handleUpdateField(`theme_planner.specific_objectives.${key}`,v)} className="w-full" rows={2}/>:<span className="text-slate-700 dark:text-slate-300">{objective||<span className="italic text-slate-400">To be completed</span>}</span>}
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </CardContent>
              </Card>

              {/* SECTION 5 */}
              <Card className="border border-slate-300 dark:border-slate-600 shadow-sm mt-4">
                <CardHeader className="py-3 bg-white dark:bg-slate-800">
                  <CardTitle className="text-base font-bold text-slate-800 dark:text-slate-200">5. Materials and Teaching Strategies</CardTitle>
                </CardHeader>
                <CardContent className="p-0">
                  <table className="w-full text-sm border-collapse">
                    <tbody>
                      <tr className="border-b border-dashed border-slate-300">
                        <td className="p-3 font-semibold align-top">Materials</td>
                        <td className="p-3">
                          {theme_planner?.materials_and_strategies?.required_materials?.length>0?<ul className="list-disc list-inside space-y-1">{theme_planner.materials_and_strategies.required_materials.map((m,i)=><li key={i} className="text-slate-700">{m}</li>)}</ul>:<span className="text-slate-400 italic">To be completed</span>}
                        </td>
                      </tr>
                      <tr>
                        <td className="p-3 font-semibold align-top">Differentiated Instruction and Accommodations for Students with Diverse Learning Needs (DLN)</td>
                        <td className="p-3"><span className="text-slate-700">{theme_planner?.materials_and_strategies?.differentiated_instruction||<span className="italic text-slate-400">To be completed</span>}</span></td>
                      </tr>
                    </tbody>
                  </table>
                </CardContent>
              </Card>

              {/* SECTION 6 */}
              <Card className="border border-slate-300 dark:border-slate-600 shadow-sm mt-4">
                <CardHeader className="py-3 bg-white dark:bg-slate-800">
                  <CardTitle className="text-base font-bold text-slate-800 dark:text-slate-200">6. Learning Sequence</CardTitle>
                </CardHeader>
                <CardContent className="p-0">
                  <table className="w-full text-sm border-collapse">
                    <thead>
                      <tr className="border-b border-dashed border-slate-300 bg-slate-50">
                        <th className="p-3 border-r border-dashed border-slate-300 text-left font-semibold w-24">Lesson</th>
                        <th className="p-3 border-r border-dashed border-slate-300 text-center font-semibold">Learning Sequence</th>
                        <th className="p-3 text-center font-semibold w-32">Date</th>
                      </tr>
                    </thead>
                    <tbody>
                      {lesson_planners?.map((lesson,idx)=>(
                        <tr key={idx} className="border-b border-dashed border-slate-300 last:border-b-0">
                          <td className="p-3 border-r border-dashed border-slate-300 font-semibold align-top">Lesson {lesson.lesson_number}</td>
                          <td className="p-3 border-r border-dashed border-slate-300">
                            <p className="font-medium text-blue-800 mb-1">{lesson.skill_focus}</p>
                            <p className="text-slate-700 text-sm">{lesson.specific_objective}</p>
                          </td>
                          <td className="p-3 text-center">
                            <EditableField value={theme_planner?.learning_sequence?.lesson_dates?.[idx]||''} onChange={(v)=>{const dates=[...(theme_planner?.learning_sequence?.lesson_dates||['','','','',''])];dates[idx]=v;handleUpdateField('theme_planner.learning_sequence.lesson_dates',dates);}} placeholder="______" className="text-center"/>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </CardContent>
              </Card>
            </div>

            {/* PROJECT CONTENT */}
            {generatedPlanner?.project && (
              <div id="project-content">
                <Card className="border border-slate-300 dark:border-slate-600 shadow-sm mt-4">
                  <CardHeader className="py-3 bg-white dark:bg-slate-800">
                    <CardTitle className="text-base font-bold text-slate-800 dark:text-slate-200">21st-Century Skills Project</CardTitle>
                  </CardHeader>
                  <CardContent className="p-4">
                    <div className="space-y-2 text-sm text-slate-700 dark:text-slate-300">
                      <p><strong>Name:</strong> {generatedPlanner.project.name}</p>
                      <p><strong>Category:</strong> {generatedPlanner.project.category}</p>
                      <p><strong>Overview:</strong> {generatedPlanner.project.overview}</p>
                      {generatedPlanner.project.materials && (
                        <div>
                          <strong>Materials:</strong>
                          <ul className="list-disc list-inside pl-4 mt-1">
                            {generatedPlanner.project.materials.map((m,i)=><li key={i}>{m}</li>)}
                          </ul>
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              </div>
            )}
          </TabsContent>

          {/* LESSON PLANNERS TAB */}
          <TabsContent value="lessons" className="space-y-4">
            <div className="flex gap-2 overflow-x-auto pb-2 print:hidden">
              {lesson_planners?.map((lesson,idx)=>(
                <Button key={idx} variant={selectedLesson===idx?'default':'outline'} onClick={()=>setSelectedLesson(idx)}
                  className={`whitespace-nowrap ${selectedLesson===idx?'bg-blue-700 hover:bg-blue-800 text-white':'border-blue-300 text-blue-700 hover:bg-blue-50'}`}>
                  {t.lesson} {lesson.lesson_number}: {lesson.skill_focus}
                </Button>
              ))}
            </div>

            {lesson_planners?.map((lesson, idx) => (
              <div key={idx} id={`lesson-content-${idx}`} className={selectedLesson === idx ? 'block space-y-4' : 'hidden'}>
                <div className="bg-white dark:bg-slate-800 rounded-lg border-2 border-blue-800 px-6 py-3 text-center">
                  <h1 className="text-xl font-bold text-blue-800 dark:text-blue-300">
                    Lesson Planner – Theme # {getScenarioNumber()} – Lesson # {lesson.lesson_number}
                  </h1>
                </div>
                <p className="text-sm text-slate-600 italic">Instructions: Complete this planner five times per theme, once per lesson.</p>

                <Card className="border border-slate-300 shadow-sm">
                  <CardContent className="p-0">
                    <div className="p-3 border-b border-dashed border-slate-300">
                      <span className="font-semibold">Lesson # </span><span>{lesson.lesson_number}</span>
                      <span className="ml-8 font-semibold">Skills focus: </span><span>{lesson.skill_focus}</span>
                    </div>
                    <table className="w-full text-sm border-collapse">
                      <tbody>
                        <tr className="border-b border-dashed border-slate-300">
                          <td className="p-3 border-r border-dashed border-slate-300 font-semibold w-1/4">Grade:</td>
                          <td className="p-3 border-r border-dashed border-slate-300">{gradeLabels[generatedPlanner.grade]}</td>
                          <td className="p-3 border-r border-dashed border-slate-300 font-semibold">Scenario:</td>
                          <td className="p-3 border-r border-dashed border-slate-300">{lesson.scenario}</td>
                          <td className="p-3 font-semibold">Theme:</td>
                          <td className="p-3">{lesson.theme}</td>
                        </tr>
                        <tr className="border-b border-dashed border-slate-300">
                          <td className="p-3 border-r border-dashed border-slate-300 font-semibold">Date(s):</td>
                          <td className="p-3 border-r border-dashed border-slate-300" colSpan="2">
                            <EditableField value={lesson.date} onChange={(v)=>handleUpdateField(`lesson_planners.${idx}.date`,v)} placeholder="______"/>
                          </td>
                          <td className="p-3 border-r border-dashed border-slate-300 font-semibold">Time:</td>
                          <td className="p-3" colSpan="2">
                            <EditableField value={lesson.time} onChange={(v)=>handleUpdateField(`lesson_planners.${idx}.time`,v)} placeholder="45-60 minutes"/>
                          </td>
                        </tr>
                        <tr className="border-b border-dashed border-slate-300">
                          <td className="p-3 border-r border-dashed border-slate-300 font-semibold align-top">Specific Objective:</td>
                          <td className="p-3" colSpan="5">
                            {editMode?<EditableTextarea value={lesson.specific_objective} onChange={(v)=>handleUpdateField(`lesson_planners.${idx}.specific_objective`,v)} rows={2}/>:<span className="text-slate-700">{lesson.specific_objective||'______'}</span>}
                          </td>
                        </tr>
                        <tr>
                          <td className="p-3 border-r border-dashed border-slate-300 font-semibold align-top">Learning Outcome:</td>
                          <td className="p-3" colSpan="5">
                            {editMode?<EditableTextarea value={lesson.learning_outcome} onChange={(v)=>handleUpdateField(`lesson_planners.${idx}.learning_outcome`,v)} rows={2}/>:<span className="text-slate-700">{lesson.learning_outcome||'______'}</span>}
                          </td>
                        </tr>
                      </tbody>
                    </table>
                  </CardContent>
                </Card>

                <Card className="border border-slate-300 shadow-sm">
                  <CardContent className="p-0">
                    <table className="w-full text-sm border-collapse">
                      <thead>
                        <tr className="border-b border-dashed border-slate-300 bg-slate-50">
                          <th className="p-3 text-center font-semibold" colSpan="2">The Six Action-oriented Approach Lesson Stages</th>
                          <th className="p-3 text-center font-semibold w-32">Estimated Date and Time</th>
                        </tr>
                      </thead>
                      <tbody>
                        {['Stage 1 - Warm-up / Pre-task:','Stage 2 - Presentation:','Stage 3 - Preparation:','Stage 4 - Performance:','Stage 5 - Assessment / Post-task:','Stage 6 - Reflection:'].map((stage,stageIdx)=>{
                          const stageData=lesson.lesson_stages?.[stageIdx];
                          return(
                            <tr key={stageIdx} className="border-b border-dashed border-slate-300 last:border-b-0">
                              <td className="p-3 align-top" colSpan="2">
                                <p className="font-semibold text-blue-800 mb-2">{stage}</p>
                                {editMode?(
                                  <div className="space-y-2 pl-4">
                                    {stageData?.activities?.map((activity,actIdx)=>(
                                      <EditableTextarea key={actIdx} value={activity} onChange={(value)=>{const a=[...(stageData?.activities||[])];a[actIdx]=value;handleUpdateField(`lesson_planners.${idx}.lesson_stages.${stageIdx}.activities`,a);}} rows={1} className="text-sm"/>
                                    ))}
                                    <Button onClick={()=>{const a=[...(stageData?.activities||[]),'New activity'];handleUpdateField(`lesson_planners.${idx}.lesson_stages.${stageIdx}.activities`,a);}} variant="outline" size="sm" className="text-xs">+ Add Activity</Button>
                                  </div>
                                ):(
                                  <ul className="list-disc list-inside pl-4 space-y-1">
                                    {stageData?.activities?.map((activity,actIdx)=><li key={actIdx} className="text-slate-700">{activity}</li>)}
                                    {(!stageData?.activities||stageData.activities.length===0)&&<li className="text-slate-400 italic">To be completed</li>}
                                  </ul>
                                )}
                              </td>
                              <td className="p-3 text-center align-top">
                                <EditableField value={stageData?.estimated_time||''} onChange={(v)=>handleUpdateField(`lesson_planners.${idx}.lesson_stages.${stageIdx}.estimated_time`,v)} placeholder="______" className="text-center text-xs"/>
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </CardContent>
                </Card>

                <Card className="border border-slate-300 shadow-sm">
                  <CardContent className="p-0">
                    <div className="p-3 border-b border-dashed border-slate-300 bg-slate-50 text-center font-semibold">Comments and Observations</div>
                    <table className="w-full text-sm border-collapse">
                      <tbody>
                        <tr className="border-b border-dashed border-slate-300">
                          <td className="p-3 border-r border-dashed border-slate-300 font-semibold w-48 align-top">Homework:</td>
                          <td className="p-3">{editMode?<EditableTextarea value={lesson.comments?.homework||''} onChange={(v)=>handleUpdateField(`lesson_planners.${idx}.comments.homework`,v)} rows={2}/>:<span className="text-slate-700">{lesson.comments?.homework||'______'}</span>}</td>
                        </tr>
                        <tr className="border-b border-dashed border-slate-300">
                          <td className="p-3 border-r border-dashed border-slate-300 font-semibold align-top">Formative Assessment:</td>
                          <td className="p-3">{editMode?<EditableTextarea value={lesson.comments?.formative_assessment||''} onChange={(v)=>handleUpdateField(`lesson_planners.${idx}.comments.formative_assessment`,v)} rows={2}/>:<span className="text-slate-700">{lesson.comments?.formative_assessment||'______'}</span>}</td>
                        </tr>
                        <tr>
                          <td className="p-3 border-r border-dashed border-slate-300 font-semibold align-top">Teacher's Comments:</td>
                          <td className="p-3">{editMode?<EditableTextarea value={lesson.comments?.teacher_comments||''} onChange={(v)=>handleUpdateField(`lesson_planners.${idx}.comments.teacher_comments`,v)} rows={2}/>:<span className="text-slate-700">{lesson.comments?.teacher_comments||'______'}</span>}</td>
                        </tr>
                      </tbody>
                    </table>
                  </CardContent>
                </Card>
              </div>
            ))}
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
}
