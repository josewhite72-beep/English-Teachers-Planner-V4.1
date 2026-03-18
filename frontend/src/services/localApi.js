/**
 * Local API Service - Versión FINAL MEJORADA
 * Genera estructura compatible con PreviewPage.js
 * Incluye Specific Objectives SMART y Lesson Planners detallados
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
      
      const projectsByScenario = projectsData.projects_by_scenario || {};
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
      const gradeData = await fetchJSON(`grades/${grade}.json`);
      
      if (!gradeData) {
        console.error(`Grade data not found: ${grade}`);
        return null;
      }
      
      const scenario = findScenario(gradeData.scenarios, scenarioTitle);
      
      if (!scenario) {
        console.error(`Scenario not found: "${scenarioTitle}" in grade ${grade}`);
        console.log('Available scenarios:', gradeData.scenarios?.map(s => s.title));
        return null;
      }

      if (!scenario.themes.includes(themeTitle)) {
        console.error(`Theme not found: "${themeTitle}" in scenario "${scenarioTitle}"`);
        console.log('Available themes:', scenario.themes);
        return null;
      }

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
        grade,
        scenario: scenarioTitle,
        theme: themeTitle,
        language,
        plan_type,
        official_format,
        generated_at: new Date().toISOString(),
        ...(projectData && { project: projectData }),

        // THEME PLANNER
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

          // SPECIFIC OBJECTIVES SMART - GENERADOS AUTOMÁTICAMENTE
          specific_objectives: generateSMARTObjectives(scenario, scenarioTitle, themeTitle, 'theme'),

          materials_and_strategies: {
            required_materials: generateMaterials(scenario, projectData),
            differentiated_instruction: ''
          },

          learning_sequence: {
            lesson_dates: ['', '', '', '', '']
          }
        },

        // LESSON PLANNERS - Array de 5 lecciones detalladas
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
 * Helper: Generar Specific Objectives SMART
 */
function generateSMARTObjectives(scenario, scenarioTitle, themeTitle, timeframe) {
  const standards = scenario.standards_and_learning_outcomes || {};
  const competences = scenario.communicative_competences || {};
  const vocabulary = competences.linguistic?.vocabulary || [];
  const grammar = competences.linguistic?.grammar || [];

  const timePrefix = timeframe === 'theme' 
    ? 'By the end of this theme' 
    : 'By the end of this lesson';

  const vocabCount = Array.isArray(vocabulary) ? Math.min(vocabulary.length, 10) : 5;
  const grammarSample = Array.isArray(grammar) ? grammar[0] : 'key structures';

  return {
    listening: `${timePrefix}, students will be able to identify at least ${Math.max(5, vocabCount)} key vocabulary words when listening to simple descriptions or dialogues related to ${themeTitle}.`,
    
    reading: `${timePrefix}, students will be able to read and understand 3-5 simple sentences or short texts about ${themeTitle} and answer comprehension questions with 80% accuracy.`,
    
    speaking: `${timePrefix}, students will be able to produce 3-5 complete sentences using ${grammarSample} to describe or discuss ${themeTitle} in conversations with peers.`,
    
    writing: `${timePrefix}, students will be able to write 3-5 simple sentences about ${themeTitle} using correct spelling of at least ${Math.max(3, Math.floor(vocabCount/2))} vocabulary words from this theme.`,
    
    mediation: `${timePrefix}, students will be able to collaborate with peers to complete a project or activity related to ${themeTitle}, demonstrating understanding of the theme's key concepts and vocabulary.`
  };
}

/**
 * Helper: Generar 5 lesson planners detallados
 */
function generateLessonPlanners(grade, scenario, theme, scenarioData, projectData, language) {
  const skills = [
    { skill: 'Listening', number: 1 },
    { skill: 'Reading', number: 2 },
    { skill: 'Speaking', number: 3 },
    { skill: 'Writing', number: 4 },
    { skill: 'Mediation', number: 5 }
  ];

  const competences = scenarioData.communicative_competences || {};
  const vocabulary = competences.linguistic?.vocabulary || [];
  const grammar = competences.linguistic?.grammar || [];

  return skills.map(({ skill, number }) => {
    const skillKey = skill.toLowerCase();

    return {
      lesson_number: number,
      skill_focus: skill,
      scenario: scenario,
      theme: theme,
      date: '',
      time: '45-60 minutes',
      
      // Specific Objective SMART para la lección
      specific_objective: generateSMARTObjectives(scenarioData, scenario, theme, 'lesson')[skillKey],
      
      learning_outcome: '',
      
      lesson_stages: generateDetailedStages(skill, scenarioData, vocabulary, grammar, projectData, language),

      comments: {
        homework: '',
        formative_assessment: '',
        teacher_comments: ''
      }
    };
  });
}

/**
 * Helper: Generar stages detallados con actividades específicas
 */
function generateDetailedStages(skill, scenarioData, vocabulary, grammar, projectData, language) {
  const vocabSample = Array.isArray(vocabulary) ? vocabulary.slice(0, 5).join(', ') : 'key vocabulary';
  const grammarSample = Array.isArray(grammar) ? grammar.slice(0, 2).join(', ') : 'grammar structures';

  const stages = {
    es: {
      Listening: [
        {
          stage: 'Warm-up / Pre-task',
          activities: [
            `Mostrar imágenes relacionadas con el vocabulario clave: ${vocabSample}`,
            `Hacer preguntas para activar conocimientos previos sobre el tema`,
            `Introducir 3-5 palabras clave del vocabulario con gestos y mímica`
          ],
          estimated_time: '10 min'
        },
        {
          stage: 'Presentation',
          activities: [
            `Presentar el audio/diálogo que contiene el vocabulario: ${vocabSample}`,
            `Reproducir el audio una vez mientras los estudiantes solo escuchan`,
            `Mostrar tarjetas visuales con las palabras clave mientras reproducen el audio de nuevo`
          ],
          estimated_time: '15 min'
        },
        {
          stage: 'Preparation',
          activities: [
            `Reproducir el audio por tercera vez, pausando para explicar palabras difíciles`,
            `Los estudiantes completan una hoja de trabajo de comprensión auditiva con apoyo`,
            `Practicar la pronunciación de las palabras clave en coro`
          ],
          estimated_time: '10 min'
        },
        {
          stage: 'Performance',
          activities: [
            `Los estudiantes escuchan el audio final de forma independiente`,
            `Completan ejercicios de comprensión auditiva sin ayuda`,
            `Identifican las palabras clave en el audio y las señalan en sus hojas`
          ],
          estimated_time: '10 min'
        },
        {
          stage: 'Assessment',
          activities: [
            `Revisar las respuestas de comprensión en parejas`,
            `Evaluación formativa: los estudiantes muestran comprensión señalando imágenes correctas`,
            `El docente verifica la comprensión haciendo preguntas simples sobre el audio`
          ],
          estimated_time: '5 min'
        },
        {
          stage: 'Reflection',
          activities: [
            `Los estudiantes comparten qué palabras nuevas aprendieron`,
            `Reflexionar: ¿Qué fue fácil o difícil de entender en el audio?`,
            `Relacionar el contenido del audio con su vida diaria`
          ],
          estimated_time: '5 min'
        }
      ],
      Reading: [
        {
          stage: 'Warm-up / Pre-task',
          activities: [
            `Mostrar el título del texto y hacer predicciones sobre el contenido`,
            `Revisar vocabulario clave que aparecerá en el texto: ${vocabSample}`,
            `Activar conocimientos previos sobre el tema mediante preguntas guiadas`
          ],
          estimated_time: '10 min'
        },
        {
          stage: 'Presentation',
          activities: [
            `Presentar el texto completo en la pizarra o proyector`,
            `Leer el texto en voz alta mientras los estudiantes siguen con el dedo`,
            `Señalar las palabras clave y estructuras gramaticales: ${grammarSample}`
          ],
          estimated_time: '15 min'
        },
        {
          stage: 'Preparation',
          activities: [
            `Los estudiantes leen el texto en silencio de forma individual`,
            `En parejas, subrayar las palabras que reconocen del vocabulario clave`,
            `Completar ejercicios de comprensión lectora con ayuda del docente`
          ],
          estimated_time: '10 min'
        },
        {
          stage: 'Performance',
          activities: [
            `Los estudiantes leen el texto independientemente`,
            `Responden preguntas de comprensión sin ayuda`,
            `Identifican y copian 3-5 oraciones del texto que contengan vocabulario clave`
          ],
          estimated_time: '10 min'
        },
        {
          stage: 'Assessment',
          activities: [
            `Revisar las respuestas de comprensión en grupos pequeños`,
            `Los estudiantes comparten las oraciones que copiaron`,
            `Evaluación formativa mediante preguntas sobre el texto`
          ],
          estimated_time: '5 min'
        },
        {
          stage: 'Reflection',
          activities: [
            `¿Qué aprendieron del texto?`,
            `¿Qué palabras nuevas encontraron?`,
            `Relacionar el contenido del texto con sus experiencias personales`
          ],
          estimated_time: '5 min'
        }
      ],
      Speaking: [
        {
          stage: 'Warm-up / Pre-task',
          activities: [
            `Juego de vocabulario oral: repetir palabras clave en cadena`,
            `Práctica de pronunciación de estructuras: ${grammarSample}`,
            `Ejercicio de mímica: actuar y adivinar palabras del vocabulario`
          ],
          estimated_time: '10 min'
        },
        {
          stage: 'Presentation',
          activities: [
            `Modelar diálogos usando las estructuras gramaticales clave`,
            `Demostrar cómo formar oraciones completas sobre el tema`,
            `Presentar frases útiles para la comunicación oral`
          ],
          estimated_time: '15 min'
        },
        {
          stage: 'Preparation',
          activities: [
            `Practicar diálogos en parejas con tarjetas de apoyo visual`,
            `El docente circula y ayuda con pronunciación y gramática`,
            `Los estudiantes preparan 2-3 oraciones para compartir con la clase`
          ],
          estimated_time: '10 min'
        },
        {
          stage: 'Performance',
          activities: [
            `Los estudiantes presentan sus oraciones frente a la clase`,
            `Participar en conversaciones breves sin tarjetas de apoyo`,
            `Demostrar uso de vocabulario y gramática en contexto natural`
          ],
          estimated_time: '10 min'
        },
        {
          stage: 'Assessment',
          activities: [
            `Los compañeros dan retroalimentación positiva sobre las presentaciones`,
            `El docente evalúa pronunciación y uso correcto de estructuras`,
            `Autoevaluación: ¿Usé las palabras correctamente?`
          ],
          estimated_time: '5 min'
        },
        {
          stage: 'Reflection',
          activities: [
            `¿Qué fue más fácil o difícil al hablar?`,
            `¿Qué palabras nuevas usaron al hablar?`,
            `Establecer metas personales para mejorar la expresión oral`
          ],
          estimated_time: '5 min'
        }
      ],
      Writing: [
        {
          stage: 'Warm-up / Pre-task',
          activities: [
            `Lluvia de ideas: escribir en la pizarra palabras relacionadas con el tema`,
            `Revisar ortografía de palabras clave: ${vocabSample}`,
            `Practicar escribir oraciones simples en la pizarra como clase`
          ],
          estimated_time: '10 min'
        },
        {
          stage: 'Presentation',
          activities: [
            `Mostrar ejemplos de escritos modelo sobre el tema`,
            `Analizar la estructura de oraciones usando ${grammarSample}`,
            `Demostrar paso a paso cómo escribir una oración completa`
          ],
          estimated_time: '15 min'
        },
        {
          stage: 'Preparation',
          activities: [
            `Los estudiantes crean borradores de 3-5 oraciones con ayuda`,
            `Trabajar en parejas para revisar ortografía y gramática`,
            `El docente revisa borradores y da retroalimentación`
          ],
          estimated_time: '10 min'
        },
        {
          stage: 'Performance',
          activities: [
            `Los estudiantes escriben la versión final de sus oraciones`,
            `Producir un escrito limpio y legible`,
            `Ilustrar sus oraciones con dibujos simples`
          ],
          estimated_time: '10 min'
        },
        {
          stage: 'Assessment',
          activities: [
            `Intercambiar escritos con un compañero para revisión de pares`,
            `El docente evalúa ortografía, gramática y claridad`,
            `Identificar los puntos fuertes del escrito de cada estudiante`
          ],
          estimated_time: '5 min'
        },
        {
          stage: 'Reflection',
          activities: [
            `¿Qué fue fácil o difícil al escribir?`,
            `¿Qué palabras necesito practicar más?`,
            `Compartir voluntariamente sus escritos con la clase`
          ],
          estimated_time: '5 min'
        }
      ],
      Mediation: [
        {
          stage: 'Warm-up / Pre-task',
          activities: [
            projectData 
              ? `Introducir el proyecto: ${projectData.name}` 
              : 'Introducir el proyecto integrador del tema',
            `Formar equipos de trabajo de 3-4 estudiantes`,
            `Explicar las expectativas y objetivos del proyecto`
          ],
          estimated_time: '10 min'
        },
        {
          stage: 'Presentation',
          activities: [
            projectData 
              ? `Mostrar ejemplos del proyecto terminado: ${projectData.overview}` 
              : 'Mostrar ejemplos de proyectos similares',
            `Explicar la rúbrica de evaluación paso a paso`,
            `Demostrar cómo completar cada parte del proyecto`
          ],
          estimated_time: '15 min'
        },
        {
          stage: 'Preparation',
          activities: [
            `Los equipos planifican su proyecto y asignan roles`,
            `Usar los borradores de escritura de la Lección 4`,
            `Practicar cómo presentarán su proyecto a la clase`,
            projectData?.materials 
              ? `Reunir materiales necesarios: ${projectData.materials.slice(0, 3).join(', ')}` 
              : 'Reunir materiales necesarios'
          ],
          estimated_time: '10 min'
        },
        {
          stage: 'Performance',
          activities: [
            `Los equipos ejecutan y completan su proyecto`,
            `Presentaciones grupales frente a la clase`,
            `Demostrar integración de todas las habilidades: escuchar, leer, hablar, escribir`
          ],
          estimated_time: '15 min'
        },
        {
          stage: 'Assessment',
          activities: [
            `Evaluación con rúbrica del docente`,
            `Retroalimentación entre equipos (peer feedback)`,
            `Autoevaluación: cada estudiante evalúa su contribución al equipo`
          ],
          estimated_time: '5 min'
        },
        {
          stage: 'Reflection',
          activities: [
            `Reflexión grupal: ¿Qué aprendimos trabajando en equipo?`,
            `¿Qué habilidades usamos del tema completo?`,
            `Celebración de logros y reconocimiento del trabajo de todos`
          ],
          estimated_time: '5 min'
        }
      ]
    },
    en: {
      Listening: [
        {
          stage: 'Warm-up / Pre-task',
          activities: [
            `Show images related to key vocabulary: ${vocabSample}`,
            `Ask questions to activate prior knowledge about the topic`,
            `Introduce 3-5 key vocabulary words using gestures and mime`
          ],
          estimated_time: '10 min'
        },
        {
          stage: 'Presentation',
          activities: [
            `Present the audio/dialogue containing the vocabulary: ${vocabSample}`,
            `Play the audio once while students only listen`,
            `Show visual flashcards with key words while playing audio again`
          ],
          estimated_time: '15 min'
        },
        {
          stage: 'Preparation',
          activities: [
            `Play audio a third time, pausing to explain difficult words`,
            `Students complete listening comprehension worksheet with support`,
            `Practice pronunciation of key words in chorus`
          ],
          estimated_time: '10 min'
        },
        {
          stage: 'Performance',
          activities: [
            `Students listen to final audio independently`,
            `Complete comprehension exercises without help`,
            `Identify key words in audio and mark them on worksheets`
          ],
          estimated_time: '10 min'
        },
        {
          stage: 'Assessment',
          activities: [
            `Review comprehension answers in pairs`,
            `Formative assessment: students show understanding by pointing to correct images`,
            `Teacher verifies comprehension by asking simple questions about the audio`
          ],
          estimated_time: '5 min'
        },
        {
          stage: 'Reflection',
          activities: [
            `Students share new words they learned`,
            `Reflect: What was easy or difficult to understand in the audio?`,
            `Connect audio content to their daily lives`
          ],
          estimated_time: '5 min'
        }
      ],
      // Agregar Reading, Speaking, Writing, Mediation en inglés con la misma estructura...
    }
  };

  const langStages = stages[language] || stages.en;
  return langStages[skill] || stages.en.Listening;
}

/**
 * Helper: Generar lista de materiales
 */
function generateMaterials(scenarioData, projectData) {
  const materials = [];
  const vocabulary = scenarioData.communicative_competences?.linguistic?.vocabulary;

  materials.push('Whiteboard and markers');
  materials.push('Vocabulary flashcards');
  materials.push('Worksheets');
  materials.push('Audio/visual resources');

  if (Array.isArray(vocabulary) && vocabulary.length > 0) {
    materials.push(`Vocabulary materials: ${vocabulary.slice(0, 5).join(', ')}`);
  }

  if (projectData?.materials) {
    materials.push(...projectData.materials.slice(0, 3));
  }

  return materials;
}

export default localApi;
