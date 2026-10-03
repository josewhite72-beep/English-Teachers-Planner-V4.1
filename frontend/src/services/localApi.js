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
    (s) => getScenarioTitle(s).trim().toLowerCase() === scenarioTitle.trim().toLowerCase()
  );
};

/**
 * Helper: Nombre del scenario sin importar el formato del JSON
 * (Grades preK-6 usan "title"; Grade 7 y 9 usan "scenario_name"; 8, 10-12 usan "scenario")
 */
const getScenarioTitle = (s) => (s?.title || s?.scenario_name || s?.scenario || '').toString();

/**
 * Helper: Normalizar nombres para comparar (mayúsculas, apóstrofos curvos, punto final)
 */
const normalizeName = (str) =>
  String(str || '')
    .toLowerCase()
    .replace(/[\u2018\u2019\u02BC`´]/g, "'")
    .replace(/[\u201C\u201D]/g, '"')
    .replace(/[.!?…\s]+$/g, '')
    .replace(/\s+/g, ' ')
    .trim();

/**
 * Helper: Proyectos de un scenario aunque el nombre no sea idéntico
 * (ej. "I'm Happy." vs "I'm Happy", "Nature’s" vs "Nature's",
 *  "Taking Care of Our Class" vs "Taking Care of Our Classroom")
 */
const findScenarioProjects = (projectsByScenario, scenarioTitle) => {
  if (!projectsByScenario || !scenarioTitle) return [];
  if (projectsByScenario[scenarioTitle]) return projectsByScenario[scenarioTitle];
  const target = normalizeName(scenarioTitle);
  const keys = Object.keys(projectsByScenario);
  let key = keys.find((k) => normalizeName(k) === target);
  if (!key) {
    const prefixMatches = keys.filter((k) => {
      const n = normalizeName(k);
      return n.startsWith(target) || target.startsWith(n);
    });
    if (prefixMatches.length === 1) key = prefixMatches[0];
  }
  return key ? projectsByScenario[key] || [] : [];
};

/**
 * Helper: Gramática como array ("grammar" o "grammatical_features")
 */
const getGrammarList = (linguistic) => {
  const g = linguistic?.grammar || linguistic?.grammatical_features || [];
  const list = Array.isArray(g) ? g : (typeof g === 'string' ? [g] : []);
  // Quitar ejemplos largos "(e.g., ...)" para que los objetivos queden concisos
  return list.map((x) => String(x).replace(/\s*\(e\.g\.[\s\S]*$/i, '').trim()).filter(Boolean);
};

/**
 * Helper: Vocabulario como array (acepta array u objeto por categorías con strings separados por comas)
 */
const getVocabularyList = (linguistic) => {
  const v = linguistic?.vocabulary;
  if (Array.isArray(v)) return v;
  if (v && typeof v === 'object') {
    return Object.values(v)
      .flatMap((x) => (Array.isArray(x) ? x : String(x).split(',')))
      .map((w) => String(w).trim())
      .filter(Boolean);
  }
  if (typeof v === 'string') return v.split(',').map((w) => w.trim()).filter(Boolean);
  return [];
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
      
      const scenarios = (gradeData.scenarios || []).map(getScenarioTitle).filter(Boolean);
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
      const scenarioProjects = findScenarioProjects(projectsByScenario, scenarioTitle);
      
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
        console.log('Available scenarios:', gradeData.scenarios?.map(getScenarioTitle));
        return null;
      }

      if (!(scenario.themes || []).includes(themeTitle)) {
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
            const scenarioProjects = findScenarioProjects(projectsByScenario, scenarioTitle);
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
  const vocabulary = getVocabularyList(competences.linguistic);
  const grammar = getGrammarList(competences.linguistic);

  const timePrefix = timeframe === 'theme' 
    ? 'By the end of this theme' 
    : 'By the end of this lesson';

  const vocabCount = Array.isArray(vocabulary) ? Math.min(vocabulary.length, 10) : 5;
  const grammarSample = grammar.length ? grammar[0] : 'key structures';

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
  const vocabulary = getVocabularyList(competences.linguistic);
  const grammar = getGrammarList(competences.linguistic);

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
  const vocabSample = vocabulary.length ? vocabulary.slice(0, 5).join(', ') : 'key vocabulary';
  const grammarSample = grammar.length ? grammar.slice(0, 2).join(', ') : 'grammar structures';

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
      Reading: [
        {
          stage: 'Warm-up / Pre-task',
          activities: [
            `Show the title of the text and have students predict its content`,
            `Review key vocabulary that will appear in the text: ${vocabSample}`,
            `Activate prior knowledge about the topic with guiding questions`
          ],
          estimated_time: '10 min'
        },
        {
          stage: 'Presentation',
          activities: [
            `Present the full text on the board or projector`,
            `Read the text aloud while students follow along with their finger`,
            `Point out key words and grammar structures: ${grammarSample}`
          ],
          estimated_time: '15 min'
        },
        {
          stage: 'Preparation',
          activities: [
            `Students read the text silently on their own`,
            `In pairs, underline the words they recognize from the key vocabulary`,
            `Complete reading comprehension exercises with teacher support`
          ],
          estimated_time: '10 min'
        },
        {
          stage: 'Performance',
          activities: [
            `Students read the text independently`,
            `Answer comprehension questions without help`,
            `Identify and copy 3-5 sentences from the text that contain key vocabulary`
          ],
          estimated_time: '10 min'
        },
        {
          stage: 'Assessment',
          activities: [
            `Review comprehension answers in small groups`,
            `Students share the sentences they copied`,
            `Formative assessment through questions about the text`
          ],
          estimated_time: '5 min'
        },
        {
          stage: 'Reflection',
          activities: [
            `What did you learn from the text?`,
            `What new words did you find?`,
            `Connect the content of the text to personal experiences`
          ],
          estimated_time: '5 min'
        }
      ],
      Speaking: [
        {
          stage: 'Warm-up / Pre-task',
          activities: [
            `Oral vocabulary game: repeat key words in a chain`,
            `Pronunciation practice of structures: ${grammarSample}`,
            `Charades: act out and guess vocabulary words`
          ],
          estimated_time: '10 min'
        },
        {
          stage: 'Presentation',
          activities: [
            `Model dialogues using the key grammar structures`,
            `Demonstrate how to form complete sentences about the topic`,
            `Present useful phrases for oral communication`
          ],
          estimated_time: '15 min'
        },
        {
          stage: 'Preparation',
          activities: [
            `Practice dialogues in pairs with visual support cards`,
            `Teacher circulates and helps with pronunciation and grammar`,
            `Students prepare 2-3 sentences to share with the class`
          ],
          estimated_time: '10 min'
        },
        {
          stage: 'Performance',
          activities: [
            `Students present their sentences in front of the class`,
            `Take part in short conversations without support cards`,
            `Demonstrate use of vocabulary and grammar in a natural context`
          ],
          estimated_time: '10 min'
        },
        {
          stage: 'Assessment',
          activities: [
            `Classmates give positive feedback on the presentations`,
            `Teacher assesses pronunciation and correct use of structures`,
            `Self-assessment: Did I use the words correctly?`
          ],
          estimated_time: '5 min'
        },
        {
          stage: 'Reflection',
          activities: [
            `What was easier or more difficult when speaking?`,
            `What new words did you use when speaking?`,
            `Set personal goals to improve oral expression`
          ],
          estimated_time: '5 min'
        }
      ],
      Writing: [
        {
          stage: 'Warm-up / Pre-task',
          activities: [
            `Brainstorm: write words related to the topic on the board`,
            `Review the spelling of key words: ${vocabSample}`,
            `Practice writing simple sentences on the board as a class`
          ],
          estimated_time: '10 min'
        },
        {
          stage: 'Presentation',
          activities: [
            `Show model texts about the topic`,
            `Analyze sentence structure using ${grammarSample}`,
            `Demonstrate step by step how to write a complete sentence`
          ],
          estimated_time: '15 min'
        },
        {
          stage: 'Preparation',
          activities: [
            `Students draft 3-5 sentences with support`,
            `Work in pairs to check spelling and grammar`,
            `Teacher reviews drafts and gives feedback`
          ],
          estimated_time: '10 min'
        },
        {
          stage: 'Performance',
          activities: [
            `Students write the final version of their sentences`,
            `Produce a clean and legible piece of writing`,
            `Illustrate their sentences with simple drawings`
          ],
          estimated_time: '10 min'
        },
        {
          stage: 'Assessment',
          activities: [
            `Exchange writing with a classmate for peer review`,
            `Teacher assesses spelling, grammar, and clarity`,
            `Identify the strengths of each student's writing`
          ],
          estimated_time: '5 min'
        },
        {
          stage: 'Reflection',
          activities: [
            `What was easy or difficult when writing?`,
            `Which words do I need to practice more?`,
            `Volunteers share their writing with the class`
          ],
          estimated_time: '5 min'
        }
      ],
      Mediation: [
        {
          stage: 'Warm-up / Pre-task',
          activities: [
            projectData
              ? `Introduce the project: ${projectData.name}`
              : 'Introduce the theme\'s integrating project',
            `Form work teams of 3-4 students`,
            `Explain the expectations and goals of the project`
          ],
          estimated_time: '10 min'
        },
        {
          stage: 'Presentation',
          activities: [
            projectData
              ? `Show examples of the finished project: ${projectData.overview}`
              : 'Show examples of similar projects',
            `Explain the assessment rubric step by step`,
            `Demonstrate how to complete each part of the project`
          ],
          estimated_time: '15 min'
        },
        {
          stage: 'Preparation',
          activities: [
            `Teams plan their project and assign roles`,
            `Use the writing drafts from Lesson 4`,
            `Practice how they will present their project to the class`,
            projectData?.materials
              ? `Gather the necessary materials: ${projectData.materials.slice(0, 3).join(', ')}`
              : 'Gather the necessary materials'
          ],
          estimated_time: '10 min'
        },
        {
          stage: 'Performance',
          activities: [
            `Teams carry out and complete their project`,
            `Group presentations in front of the class`,
            `Demonstrate integration of all skills: listening, reading, speaking, writing`
          ],
          estimated_time: '15 min'
        },
        {
          stage: 'Assessment',
          activities: [
            `Teacher assessment with the rubric`,
            `Feedback between teams (peer feedback)`,
            `Self-assessment: each student evaluates their contribution to the team`
          ],
          estimated_time: '5 min'
        },
        {
          stage: 'Reflection',
          activities: [
            `Group reflection: What did we learn by working as a team?`,
            `Which skills from the whole theme did we use?`,
            `Celebrate achievements and recognize everyone's work`
          ],
          estimated_time: '5 min'
        }
      ]
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
  const vocabulary = getVocabularyList(scenarioData.communicative_competences?.linguistic);

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
