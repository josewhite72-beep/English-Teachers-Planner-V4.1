/**
 * Local API Service - Versión FINAL
 * Genera estructura compatible con PreviewPage.js
 * Los datos se cargan desde /public/data/
 */

const BASE_PATH = process.env.PUBLIC_URL || '';

/**
 * Carga un archivo JSON desde /public/data/
 */
const fetchJSON = async (path) => {
  try {
    const response = await fetch(`${BASE_PATH}/data/${path}`);
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    return await response.json();
  } catch (error) {
    console.error(`Error loading ${path}:`, error);
    return null;
  }
};

/**
 * Helper: Buscar scenario con comparación case-insensitive y trim
 */
const findScenario = (scenarios, scenarioTitle) => {
  if (!scenarios || !scenarioTitle) return null;
  
  return scenarios.find(
    (s) => s.title?.trim().toLowerCase() === scenarioTitle.trim().toLowerCase()
  );
};

/**
 * API Methods
 */
export const localApi = {
  /**
   * Get all available grades
   */
  getGrades: async () => {
    return {
      grades: ['pre_k', 'K', '1', '2', '3', '4', '5', '6', '7', '8', '9', '10', '11', '12']
    };
  },

  /**
   * Get scenarios for a specific grade
   */
  getScenarios: async (grade) => {
    try {
      const gradeData = await fetchJSON(`grades/${grade}.json`);
      
      if (!gradeData) {
        console.warn(`Grade data not found for: ${grade}`);
        return { scenarios: [] };
      }
      
      const scenarios = (gradeData.scenarios || []).map(s => s.title);
      return { scenarios };
    } catch (error) {
      console.error(`Error loading scenarios for grade ${grade}:`, error);
      return { scenarios: [] };
    }
  },

  /**
   * Get themes for a specific grade and scenario
   */
  getThemes: async (grade, scenarioTitle) => {
    try {
      const gradeData = await fetchJSON(`grades/${grade}.json`);
      
      if (!gradeData) {
        console.warn(`Grade data not found for: ${grade}`);
        return { themes: [] };
      }
      
      const scenario = findScenario(gradeData.scenarios, scenarioTitle);
      
      if (!scenario) {
        console.warn(`Scenario not found: ${scenarioTitle} in grade ${grade}`);
        return { themes: [] };
      }

      const themes = scenario.themes || [];
      return { themes };
    } catch (error) {
      console.error(`Error loading themes for ${grade}/${scenarioTitle}:`, error);
      return { themes: [] };
    }
  },

  /**
   * Get official projects for a grade and scenario
   */
  getProjects: async (grade, scenarioTitle) => {
    try {
      const projectsData = await fetchJSON(`projects/official/${grade}.json`);
      
      if (!projectsData) {
        console.warn(`Projects data not found for grade: ${grade}`);
        return { projects: [] };
      }
      
      // La estructura es projects_by_scenario
      const projectsByScenario = projectsData.projects_by_scenario || {};
      
      // Obtener proyectos del scenario específico
      const scenarioProjects = projectsByScenario[scenarioTitle] || [];
      
      console.log(`Projects loaded for "${scenarioTitle}":`, scenarioProjects.length);
      
      return { projects: scenarioProjects };
    } catch (error) {
      console.error(`Error loading projects for ${grade}/${scenarioTitle}:`, error);
      return { projects: [] };
    }
  },

  /**
   * Generate a planner - Estructura compatible con PreviewPage.js
   */
  generatePlanner: async (params) => {
    const {
      grade,
      scenario: scenarioTitle,
      theme: themeTitle,
      plan_type = 'standard',
      official_format = false,
      project_id = null,
      language = 'es',
      teacher_name = '',
      trimester = '',
      weekly_hours = '',
      week_from = '',
      week_to = ''
    } = params;

    try {
      // Cargar los datos del grado
      const gradeData = await fetchJSON(`grades/${grade}.json`);
      
      if (!gradeData) {
        console.error(`Grade data not found: ${grade}`);
        return null;
      }
      
      // Buscar el scenario por título (case-insensitive)
      const scenario = findScenario(gradeData.scenarios, scenarioTitle);
      
      if (!scenario) {
        console.error(`Scenario not found: "${scenarioTitle}" in grade ${grade}`);
        console.log('Available scenarios:', gradeData.scenarios?.map(s => s.title));
        return null;
      }

      // Verificar que el theme existe
      if (!scenario.themes.includes(themeTitle)) {
        console.error(`Theme not found: "${themeTitle}" in scenario "${scenarioTitle}"`);
        console.log('Available themes:', scenario.themes);
        return null;
      }

      // Cargar proyecto si se seleccionó uno
      let projectData = null;
      if (project_id && project_id !== 'none') {
        try {
          const projectsResponse = await fetchJSON(`projects/official/${grade}.json`);
          if (projectsResponse) {
            const projectsByScenario = projectsResponse.projects_by_scenario || {};
            const scenarioProjects = projectsByScenario[scenarioTitle] || [];
            projectData = scenarioProjects.find(p => p.id === project_id);
            
            if (!projectData) {
              console.warn(`Project not found: ${project_id}`);
            }
          }
        } catch (e) {
          console.warn('Error loading project:', project_id, e);
        }
      }

      // GENERAR ESTRUCTURA COMPATIBLE CON PREVIEWPAGE.JS
      const planner = {
        // Metadata básica
        grade,
        scenario: scenarioTitle,
        theme: themeTitle,
        language,
        plan_type,
        official_format,
        generated_at: new Date().toISOString(),
        ...(projectData && { project: projectData }),

        // THEME PLANNER - Estructura exacta que PreviewPage.js espera
        theme_planner: {
          general_information: {
            teachers: teacher_name || '',
            grade: grade,
            cefr_level: gradeData.proficiency_level || '',
            trimester: trimester || '',
            weekly_hours: weekly_hours || '',
            week_range: week_from && week_to ? `From week ${week_from} to week ${week_to}` : '',
            scenario: scenarioTitle,
            theme: themeTitle
          },

          standards_and_learning_outcomes: scenario.standards_and_learning_outcomes || {},

          communicative_competences: scenario.communicative_competences || {},

          specific_objectives: {
            listening: '',
            reading: '',
            speaking: '',
            writing: '',
            mediation: ''
          },

          materials_and_strategies: {
            required_materials: generateMaterials(scenario, projectData),
            differentiated_instruction: ''
          },

          learning_sequence: {
            lesson_dates: ['', '', '', '', '']
          }
        },

        // LESSON PLANNERS - Array de 5 lecciones
        lesson_planners: generateLessonPlanners(
          grade,
          scenarioTitle,
          themeTitle,
          scenario,
          projectData,
          language
        )
      };

      console.log('✅ Planner generated successfully');
      return planner;

    } catch (error) {
      console.error('❌ Error generating planner:', error);
      return null;
    }
  }
};

/**
 * Helper: Generar 5 lesson planners (1 por skill)
 */
function generateLessonPlanners(grade, scenario, theme, scenarioData, projectData, language) {
  const skills = [
    { skill: 'Listening', number: 1 },
    { skill: 'Reading', number: 2 },
    { skill: 'Speaking', number: 3 },
    { skill: 'Writing', number: 4 },
    { skill: 'Mediation', number: 5 }
  ];

  return skills.map(({ skill, number }) => {
    const skillKey = skill.toLowerCase();
    const standardsData = scenarioData.standards_and_learning_outcomes?.[skillKey];

    return {
      lesson_number: number,
      skill_focus: skill,
      scenario: scenario,
      theme: theme,
      date: '',
      time: '45-60 minutes',
      specific_objective: '',
      learning_outcome: '',
      
      lesson_stages: [
        {
          stage: 'Warm-up / Pre-task',
          activities: [
            generateStageActivity(skill, 'warm-up', scenarioData, language)
          ],
          estimated_time: '10 min'
        },
        {
          stage: 'Presentation',
          activities: [
            generateStageActivity(skill, 'presentation', scenarioData, language)
          ],
          estimated_time: '15 min'
        },
        {
          stage: 'Preparation',
          activities: [
            generateStageActivity(skill, 'preparation', scenarioData, language)
          ],
          estimated_time: '10 min'
        },
        {
          stage: 'Performance',
          activities: [
            generateStageActivity(skill, 'performance', scenarioData, language)
          ],
          estimated_time: '15 min'
        },
        {
          stage: 'Assessment',
          activities: [
            generateStageActivity(skill, 'assessment', scenarioData, language)
          ],
          estimated_time: '5 min'
        },
        {
          stage: 'Reflection',
          activities: [
            generateStageActivity(skill, 'reflection', scenarioData, language)
          ],
          estimated_time: '5 min'
        }
      ],

      comments: {
        homework: '',
        formative_assessment: '',
        teacher_comments: ''
      }
    };
  });
}

/**
 * Helper: Generar actividad para cada stage
 */
function generateStageActivity(skill, stage, scenarioData, language) {
  const competences = scenarioData.communicative_competences || {};
  const vocabulary = competences.linguistic?.vocabulary || [];
  const grammar = competences.linguistic?.grammar || [];

  const vocabSample = Array.isArray(vocabulary) ? vocabulary.slice(0, 3).join(', ') : '';
  const grammarSample = Array.isArray(grammar) ? grammar.slice(0, 1).join(', ') : '';

  const templates = {
    es: {
      'warm-up': {
        Listening: `Actividad de calentamiento para escuchar vocabulario clave${vocabSample ? ': ' + vocabSample : ''}`,
        Reading: `Activar conocimientos previos sobre el tema de lectura`,
        Speaking: `Práctica oral informal para introducir el tema`,
        Writing: `Lluvia de ideas sobre qué escribir`,
        Mediation: `Introducir el proyecto y formar equipos`
      },
      'presentation': {
        Listening: `Presentar audio/diálogo con vocabulario y estructuras clave`,
        Reading: `Presentar el texto y hacer predicciones`,
        Speaking: `Modelar diálogos y expresiones útiles`,
        Writing: `Mostrar ejemplos de escritura del tipo requerido`,
        Mediation: `Explicar las instrucciones y rúbrica del proyecto`
      },
      'preparation': {
        Listening: `Escuchar de nuevo y completar ejercicios de comprensión`,
        Reading: `Leer el texto y responder preguntas de comprensión`,
        Speaking: `Practicar en parejas con apoyo del docente`,
        Writing: `Crear borradores con apoyo`,
        Mediation: `Planificar el proyecto en equipos`
      },
      'performance': {
        Listening: `Demostrar comprensión auditiva de forma independiente`,
        Reading: `Completar tareas de lectura independiente`,
        Speaking: `Presentaciones o conversaciones sin apoyo`,
        Writing: `Producir el escrito final`,
        Mediation: `Ejecutar y presentar el proyecto`
      },
      'assessment': {
        Listening: `Evaluar la comprensión auditiva lograda`,
        Reading: `Evaluar la comprensión lectora`,
        Speaking: `Evaluar la producción oral`,
        Writing: `Evaluar el producto escrito`,
        Mediation: `Evaluar el proyecto con rúbrica`
      },
      'reflection': {
        Listening: `Reflexionar sobre qué escucharon y aprendieron`,
        Reading: `Reflexionar sobre la lectura`,
        Speaking: `Autoevaluación de la expresión oral`,
        Writing: `Revisar y reflexionar sobre el escrito`,
        Mediation: `Reflexión grupal sobre el proyecto`
      }
    },
    en: {
      'warm-up': {
        Listening: `Warm-up activity to introduce listening vocabulary${vocabSample ? ': ' + vocabSample : ''}`,
        Reading: `Activate prior knowledge about the reading topic`,
        Speaking: `Informal speaking practice to introduce the theme`,
        Writing: `Brainstorm writing ideas`,
        Mediation: `Introduce the project and form teams`
      },
      'presentation': {
        Listening: `Present audio/dialogue with key vocabulary and structures`,
        Reading: `Present the text and make predictions`,
        Speaking: `Model dialogues and useful expressions`,
        Writing: `Show examples of the required writing type`,
        Mediation: `Explain project instructions and rubric`
      },
      'preparation': {
        Listening: `Listen again and complete comprehension exercises`,
        Reading: `Read the text and answer comprehension questions`,
        Speaking: `Practice in pairs with teacher support`,
        Writing: `Create drafts with support`,
        Mediation: `Plan the project in teams`
      },
      'performance': {
        Listening: `Demonstrate listening comprehension independently`,
        Reading: `Complete independent reading tasks`,
        Speaking: `Presentations or conversations without support`,
        Writing: `Produce the final written piece`,
        Mediation: `Execute and present the project`
      },
      'assessment': {
        Listening: `Assess listening comprehension achieved`,
        Reading: `Assess reading comprehension`,
        Speaking: `Assess oral production`,
        Writing: `Assess the written product`,
        Mediation: `Assess the project with rubric`
      },
      'reflection': {
        Listening: `Reflect on what they listened to and learned`,
        Reading: `Reflect on the reading`,
        Speaking: `Self-assessment of oral expression`,
        Writing: `Review and reflect on the writing`,
        Mediation: `Group reflection on the project`
      }
    }
  };

  const langTemplates = templates[language] || templates.en;
  return langTemplates[stage]?.[skill] || `Activity for ${skill} - ${stage}`;
}

/**
 * Helper: Generar lista de materiales
 */
function generateMaterials(scenarioData, projectData) {
  const materials = [];

  // Materiales básicos
  materials.push('Whiteboard and markers');
  materials.push('Vocabulary flashcards');
  materials.push('Worksheets');
  materials.push('Audio/visual resources');

  // Agregar vocabulario específico del scenario
  const vocabulary = scenarioData.communicative_competences?.linguistic?.vocabulary;
  if (Array.isArray(vocabulary) && vocabulary.length > 0) {
    materials.push(`Vocabulary materials: ${vocabulary.slice(0, 5).join(', ')}`);
  }

  // Agregar materiales del proyecto si existe
  if (projectData?.materials) {
    materials.push(...projectData.materials.slice(0, 3));
  }

  return materials;
}

export default localApi;
