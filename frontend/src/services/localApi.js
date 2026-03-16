/**
 * Local API Service - Reemplaza llamadas al backend con datos estáticos
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
    throw error;
  }
};

/**
 * API Methods
 */
export const localApi = {
  /**
   * Get all available grades
   */
  getGrades: async () => {
    // Los grados están disponibles como archivos JSON en /data/grades/
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
      const scenarios = Object.keys(gradeData.scenarios || {});
      return { scenarios };
    } catch (error) {
      console.error(`Error loading scenarios for grade ${grade}:`, error);
      return { scenarios: [] };
    }
  },

  /**
   * Get themes for a specific grade and scenario
   */
  getThemes: async (grade, scenario) => {
    try {
      const gradeData = await fetchJSON(`grades/${grade}.json`);
      const scenarioData = gradeData.scenarios?.[scenario];
      
      if (!scenarioData) {
        return { themes: [] };
      }

      const themes = Object.keys(scenarioData.themes || {});
      return { themes };
    } catch (error) {
      console.error(`Error loading themes for ${grade}/${scenario}:`, error);
      return { themes: [] };
    }
  },

  /**
   * Get official projects for a grade and scenario
   */
  getProjects: async (grade, scenario) => {
    try {
      // Intentar cargar proyectos oficiales
      const projectsData = await fetchJSON(`projects/official/${grade}.json`);
      const projects = projectsData.projects || [];
      
      // Filtrar por scenario si es necesario
      const filteredProjects = projects.filter(p => 
        !p.scenario || p.scenario === scenario
      );
      
      return { projects: filteredProjects };
    } catch (error) {
      console.error(`Error loading projects for ${grade}/${scenario}:`, error);
      return { projects: [] };
    }
  },

  /**
   * Generate a planner (mock generation - returns a template)
   */
  generatePlanner: async (params) => {
    const {
      grade,
      scenario,
      theme,
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
      const scenarioData = gradeData.scenarios?.[scenario];
      const themeData = scenarioData?.themes?.[theme];

      if (!themeData) {
        throw new Error('Theme data not found');
      }

      // Cargar scope & sequence
      let scopeSequence = {};
      try {
        scopeSequence = await fetchJSON('scope_sequence.json');
      } catch (e) {
        console.warn('Scope sequence not found');
      }

      // Cargar estándares institucionales si existen
      let institutionalStandards = null;
      try {
        institutionalStandards = await fetchJSON(`institutional_standards/${grade}.json`);
      } catch (e) {
        console.warn('Institutional standards not found for grade', grade);
      }

      // Cargar proyecto si se seleccionó uno
      let projectData = null;
      if (project_id) {
        try {
          const projectsResponse = await fetchJSON(`projects/official/${grade}.json`);
          projectData = projectsResponse.projects?.find(p => p.id === project_id);
        } catch (e) {
          console.warn('Project not found:', project_id);
        }
      }

      // Generar el planner basado en los datos
      const planner = {
        metadata: {
          grade,
          scenario,
          theme,
          plan_type,
          official_format,
          language,
          generated_at: new Date().toISOString(),
          ...(teacher_name && { teacher_name }),
          ...(trimester && { trimester }),
          ...(weekly_hours && { weekly_hours }),
          ...(week_from && { week_from }),
          ...(week_to && { week_to }),
          ...(projectData && { project: projectData })
        },
        
        curriculum_data: {
          scenario_title: scenario,
          theme_title: theme,
          standards: themeData.standards || [],
          indicators: themeData.indicators || [],
          conceptual_contents: themeData.conceptual_contents || [],
          procedural_contents: themeData.procedural_contents || [],
          attitudinal_contents: themeData.attitudinal_contents || [],
          ...(institutionalStandards && { institutional_standards: institutionalStandards })
        },

        lesson_plan: {
          title: `${scenario} - ${theme}`,
          objective: themeData.indicators?.[0] || 'Develop language skills',
          
          activities: generateActivities(plan_type, themeData, language),
          
          assessment: {
            formative: language === 'es' 
              ? 'Observación continua durante las actividades'
              : 'Continuous observation during activities',
            summative: language === 'es'
              ? 'Evaluación final del proyecto o presentación'
              : 'Final project or presentation assessment'
          },

          resources: generateResources(language),

          differentiation: {
            support: language === 'es'
              ? 'Apoyo adicional para estudiantes que lo necesiten'
              : 'Additional support for students who need it',
            extension: language === 'es'
              ? 'Actividades de extensión para estudiantes avanzados'
              : 'Extension activities for advanced students'
          }
        }
      };

      return planner;
    } catch (error) {
      console.error('Error generating planner:', error);
      throw error;
    }
  }
};

/**
 * Helper: Generate activities based on plan type
 */
function generateActivities(planType, themeData, language) {
  const baseActivities = language === 'es' ? [
    {
      name: 'Actividad de Introducción',
      duration: '15 min',
      description: 'Introducir el tema principal y activar conocimientos previos',
      type: 'warm_up'
    },
    {
      name: 'Actividad Principal',
      duration: '25 min',
      description: 'Desarrollar las habilidades principales del tema',
      type: 'main'
    },
    {
      name: 'Práctica Guiada',
      duration: '15 min',
      description: 'Práctica con apoyo del docente',
      type: 'practice'
    }
  ] : [
    {
      name: 'Introduction Activity',
      duration: '15 min',
      description: 'Introduce the main topic and activate prior knowledge',
      type: 'warm_up'
    },
    {
      name: 'Main Activity',
      duration: '25 min',
      description: 'Develop the main skills of the topic',
      type: 'main'
    },
    {
      name: 'Guided Practice',
      duration: '15 min',
      description: 'Practice with teacher support',
      type: 'practice'
    }
  ];

  if (planType === 'enriched') {
    baseActivities.push(
      language === 'es' ? {
        name: 'Actividad de Extensión',
        duration: '20 min',
        description: 'Actividad adicional para profundizar el aprendizaje',
        type: 'extension'
      } : {
        name: 'Extension Activity',
        duration: '20 min',
        description: 'Additional activity to deepen learning',
        type: 'extension'
      }
    );
  }

  return baseActivities;
}

/**
 * Helper: Generate resources list
 */
function generateResources(language) {
  return language === 'es' ? [
    'Pizarra y marcadores',
    'Materiales visuales',
    'Hojas de trabajo',
    'Recursos digitales (opcional)'
  ] : [
    'Whiteboard and markers',
    'Visual materials',
    'Worksheets',
    'Digital resources (optional)'
  ];
}

export default localApi;
