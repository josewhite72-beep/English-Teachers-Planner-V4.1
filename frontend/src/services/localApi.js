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
      // Los scenarios son un array de objetos con "title"
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
      // Buscar el scenario por título
      const scenario = (gradeData.scenarios || []).find(s => s.title === scenarioTitle);
      
      if (!scenario) {
        return { themes: [] };
      }

      // Los themes son un array de strings
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
      // Cargar proyectos oficiales
      const projectsData = await fetchJSON(`projects/official/${grade}.json`);
      
      // La estructura es projects_by_scenario
      const projectsByScenario = projectsData.projects_by_scenario || {};
      
      // Obtener proyectos del scenario específico
      const scenarioProjects = projectsByScenario[scenarioTitle] || [];
      
      console.log(`Projects for ${scenarioTitle}:`, scenarioProjects);
      
      return { projects: scenarioProjects };
    } catch (error) {
      console.error(`Error loading projects for ${grade}/${scenarioTitle}:`, error);
      return { projects: [] };
    }
  },

  /**
   * Generate a planner (mock generation - returns a template)
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
      
      // Buscar el scenario por título
      const scenario = (gradeData.scenarios || []).find(s => s.title === scenarioTitle);
      
      if (!scenario) {
        throw new Error('Scenario not found');
      }

      // Verificar que el theme existe
      if (!scenario.themes.includes(themeTitle)) {
        throw new Error('Theme not found');
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
      if (project_id && project_id !== 'none') {
        try {
          const projectsResponse = await fetchJSON(`projects/official/${grade}.json`);
          const projectsByScenario = projectsResponse.projects_by_scenario || {};
          const scenarioProjects = projectsByScenario[scenarioTitle] || [];
          projectData = scenarioProjects.find(p => p.id === project_id);
        } catch (e) {
          console.warn('Project not found:', project_id);
        }
      }

      // Generar el planner basado en los datos
      const planner = {
        metadata: {
          grade,
          scenario: scenarioTitle,
          theme: themeTitle,
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
          scenario_title: scenarioTitle,
          theme_title: themeTitle,
          proficiency_level: gradeData.proficiency_level || 'A1',
          
          // Standards and Learning Outcomes
          standards: scenario.standards_and_learning_outcomes || {},
          
          // Communicative Competences
          communicative_competences: scenario.communicative_competences || {},
          
          // Assessment Ideas
          assessment_ideas: scenario.assessment_ideas || [],
          
          ...(institutionalStandards && { institutional_standards: institutionalStandards })
        },

        lesson_plan: {
          title: `${scenarioTitle} - ${themeTitle}`,
          
          objective: scenario.standards_and_learning_outcomes?.speaking?.productive || 
                    'Develop language and communication skills',
          
          activities: generateActivities(plan_type, scenario, language),
          
          assessment: {
            formative: language === 'es' 
              ? 'Observación continua durante las actividades'
              : 'Continuous observation during activities',
            summative: language === 'es'
              ? 'Evaluación final del proyecto o presentación'
              : 'Final project or presentation assessment',
            ideas: scenario.assessment_ideas || []
          },

          resources: generateResources(scenario, language),

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
function generateActivities(planType, scenario, language) {
  const competences = scenario.communicative_competences || {};
  const vocabulary = competences.linguistic?.vocabulary || [];
  const grammar = competences.linguistic?.grammar || [];
  
  const baseActivities = language === 'es' ? [
    {
      name: 'Actividad de Introducción',
      duration: '15 min',
      description: vocabulary.length > 0 
        ? `Introducir vocabulario clave: ${vocabulary.slice(0, 5).join(', ')}`
        : 'Introducir el tema principal y activar conocimientos previos',
      type: 'warm_up'
    },
    {
      name: 'Actividad Principal',
      duration: '25 min',
      description: grammar.length > 0
        ? `Practicar estructuras gramaticales: ${grammar.slice(0, 2).join(', ')}`
        : 'Desarrollar las habilidades principales del tema',
      type: 'main'
    },
    {
      name: 'Práctica Guiada',
      duration: '15 min',
      description: 'Aplicar el vocabulario y gramática en contexto comunicativo',
      type: 'practice'
    }
  ] : [
    {
      name: 'Introduction Activity',
      duration: '15 min',
      description: vocabulary.length > 0
        ? `Introduce key vocabulary: ${vocabulary.slice(0, 5).join(', ')}`
        : 'Introduce the main topic and activate prior knowledge',
      type: 'warm_up'
    },
    {
      name: 'Main Activity',
      duration: '25 min',
      description: grammar.length > 0
        ? `Practice grammar structures: ${grammar.slice(0, 2).join(', ')}`
        : 'Develop the main skills of the topic',
      type: 'main'
    },
    {
      name: 'Guided Practice',
      duration: '15 min',
      description: 'Apply vocabulary and grammar in communicative context',
      type: 'practice'
    }
  ];

  if (planType === 'enriched') {
    baseActivities.push(
      language === 'es' ? {
        name: 'Actividad de Extensión',
        duration: '20 min',
        description: 'Proyecto creativo aplicando lo aprendido',
        type: 'extension'
      } : {
        name: 'Extension Activity',
        duration: '20 min',
        description: 'Creative project applying what was learned',
        type: 'extension'
      }
    );
  }

  return baseActivities;
}

/**
 * Helper: Generate resources list
 */
function generateResources(scenario, language) {
  const vocabulary = scenario.communicative_competences?.linguistic?.vocabulary || [];
  
  const baseResources = language === 'es' ? [
    'Pizarra y marcadores',
    'Tarjetas con vocabulario',
    'Hojas de trabajo',
    'Recursos visuales (imágenes, carteles)'
  ] : [
    'Whiteboard and markers',
    'Vocabulary flashcards',
    'Worksheets',
    'Visual resources (images, posters)'
  ];
  
  if (vocabulary.length > 0) {
    baseResources.push(
      language === 'es' 
        ? `Material didáctico: ${vocabulary.slice(0, 10).join(', ')}`
        : `Teaching materials: ${vocabulary.slice(0, 10).join(', ')}`
    );
  }
  
  return baseResources;
}

export default localApi;
          
