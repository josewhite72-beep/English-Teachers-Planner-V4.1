# 📚 Guía para Generar Planeamientos con IAs Gratuitas
## Enfoque de Planificación Hacia Atrás (Backward Planning)

## 🎯 Objetivo
Generar planeamientos completos usando ChatGPT, Claude o Gemini gratis, siguiendo el enfoque de **Planificación Hacia Atrás** según las directrices oficiales de MEDUCA.

---

## 🔄 ¿Qué es la Planificación Hacia Atrás?

La planificación hacia atrás comienza por el **final** (Lección 5 - Proyecto del Siglo XXI) y construye las lecciones anteriores para preparar al estudiante.

### Estructura de las 5 Lecciones:

| Lección | Habilidad | Propósito |
|---------|-----------|-----------|
| **5** | **Mediation (PROYECTO DEL SIGLO XXI)** | Proyecto integrador que requiere TODAS las habilidades |
| 4 | Writing | Refinamiento - borradores y producción escrita |
| 3 | Speaking | Práctica interactiva - descripciones orales |
| 2 | Reading | Desarrollo de conceptos - recopilación de información |
| 1 | Listening | Habilidad fundamental - vocabulario clave |

**IMPORTANTE:** 
- Cada lección DEBE preparar explícitamente al estudiante para los requisitos del proyecto de la Lección 5.
- El proyecto DEBE estar alineado con los **Specific Standards** y **Learning Outcomes** del currículo.

---

## 📋 Checklist de Planeamientos

**Archivo:** `planners_master_list.csv`

Este archivo contiene **128 planeamientos** (8 grados × 8 scenarios × 2 themes):
- Pre-K: 16 planeamientos
- K: 16 planeamientos  
- Grade 1-6: 16 planeamientos cada uno

---

## 🤖 Prompt Template para IA (CON BACKWARD PLANNING)

Copia y pega este prompt en ChatGPT/Claude/Gemini, reemplazando los valores entre [corchetes]:

```
Genera un planeamiento completo de clase de inglés para docentes de primaria en Panamá, alineado al currículo MEDUCA, usando el ENFOQUE DE PLANIFICACIÓN HACIA ATRÁS.

DATOS DEL PLANEAMIENTO:
- Grado: [Grade X]
- Nivel CEFR: [consulta tabla de niveles CEFR abajo]
- Scenario: [Scenario X: Nombre del Scenario]  
- Theme: [Nombre del Theme]
- Proyecto Oficial Seleccionado: [Nombre del proyecto de los 3 disponibles]
- Tipo de plan: Standard
- Idioma: Español

INFORMACIÓN DEL CURRÍCULO:
[Pega aquí el contenido del archivo grades/[grade].json para este scenario y theme específico]

PROYECTO OFICIAL SELECCIONADO:
[Pega aquí la información del proyecto oficial que elegiste para la Lección 5]

---

## INSTRUCCIONES DE PLANIFICACIÓN HACIA ATRÁS:

1. **COMIENZA POR LA LECCIÓN 5 (PROYECTO/MEDIATION):**
   - Define claramente las actividades del proyecto
   - El proyecto DEBE integrar las 5 habilidades (Listening, Reading, Speaking, Writing, Mediation)
   - Incluir trabajo colaborativo y autoevaluación

2. **CONSTRUYE LAS LECCIONES 1-4 DE FORMA REGRESIVA:**
   - Lección 1 (Listening): Vocabulario clave necesario para el proyecto
   - Lección 2 (Reading): Lectura y comprensión de información relevante para el proyecto
   - Lección 3 (Speaking): Práctica oral de descripciones que usarán en el proyecto
   - Lección 4 (Writing): Borradores y escritura preparatoria para el proyecto

3. **CADA ACTIVIDAD DEBE CONECTAR CON EL PROYECTO:**
   - En cada lección, incluir una nota explicando cómo prepara al estudiante para el proyecto final

---

GENERA EL PLANEAMIENTO EN FORMATO JSON CON ESTA ESTRUCTURA EXACTA:

{
  "grade": "[grade]",
  "scenario": "[Scenario completo]",
  "theme": "[Theme completo]",
  "plan_type": "standard",
  "language": "es",
  "backward_planning_note": "Este planeamiento utiliza el enfoque de planificación hacia atrás. El proyecto de la Lección 5 es el punto de partida, y las Lecciones 1-4 construyen progresivamente las habilidades necesarias.",
  "theme_planner": {
    "specific_objectives": {
      "listening": "[Objetivo SMART que prepare para el proyecto - debe ser específico, medible, alcanzable, relevante y con tiempo definido]",
      "reading": "[Objetivo SMART que prepare para el proyecto]",
      "speaking": "[Objetivo SMART que prepare para el proyecto]",
      "writing": "[Objetivo SMART que prepare para el proyecto]",
      "mediation": "[Objetivo SMART que describa el proyecto integrador]"
    },
    "materials_and_strategies": {
      "required_materials": [
        "[Material específico 1 - incluir materiales del proyecto]",
        "[Material específico 2]",
        "[Mínimo 8 materiales concretos]"
      ],
      "differentiated_instruction": "[Estrategias para diferentes estilos de aprendizaje. Mínimo 150 palabras]"
    }
  },
  "lesson_planners": [
    {
      "lesson_number": 1,
      "skill_focus": "Listening",
      "connection_to_project": "[Explica cómo esta lección prepara al estudiante para el proyecto de la Lección 5]",
      "specific_objective": "[Objetivo SMART para listening que contribuya al proyecto]",
      "time": "45-60 minutos",
      "lesson_stages": [
        {
          "stage": "Warm-up / Pre-task",
          "activities": [
            "[Actividad 1 con instrucciones paso a paso]",
            "[Actividad 2 - conecta con vocabulario del proyecto]",
            "[Mínimo 3 actividades]"
          ]
        },
        {
          "stage": "Presentation",
          "activities": ["[3+ actividades detalladas]"]
        },
        {
          "stage": "Preparation",
          "activities": ["[3+ actividades con scaffolding]"]
        },
        {
          "stage": "Performance",
          "activities": ["[3+ actividades independientes]"]
        },
        {
          "stage": "Assessment / Post-task",
          "activities": ["[3+ estrategias de evaluación formativa]"]
        },
        {
          "stage": "Reflection",
          "activities": ["[3+ actividades de reflexión]"]
        }
      ],
      "comments": {
        "homework": "[Tarea que refuerce vocabulario del proyecto]",
        "formative_assessment": "[Cómo evaluar el progreso hacia el proyecto]",
        "teacher_comments": "[Notas importantes]"
      }
    },
    {
      "lesson_number": 2,
      "skill_focus": "Reading",
      "connection_to_project": "[Cómo la lectura prepara para el proyecto]",
      "specific_objective": "[Objetivo SMART para Reading]",
      "time": "45-60 minutos",
      "lesson_stages": ["[Misma estructura que Lesson 1]"],
      "comments": {...}
    },
    {
      "lesson_number": 3,
      "skill_focus": "Speaking",
      "connection_to_project": "[Cómo las prácticas orales preparan para el proyecto]",
      "specific_objective": "[Objetivo SMART para Speaking]",
      "time": "45-60 minutos",
      "lesson_stages": ["[Misma estructura]"],
      "comments": {...}
    },
    {
      "lesson_number": 4,
      "skill_focus": "Writing",
      "connection_to_project": "[Cómo la escritura prepara borradores para el proyecto]",
      "specific_objective": "[Objetivo SMART para Writing]",
      "time": "45-60 minutos",
      "lesson_stages": ["[Misma estructura]"],
      "comments": {...}
    },
    {
      "lesson_number": 5,
      "skill_focus": "Mediation",
      "project_name": "[Nombre del proyecto oficial seleccionado]",
      "specific_objective": "[Objetivo SMART - integración de TODAS las habilidades en el proyecto]",
      "time": "45-60 minutos (puede extenderse según duración del proyecto)",
      "lesson_stages": [
        {
          "stage": "Warm-up / Pre-task",
          "activities": [
            "Revisar lo aprendido en Lecciones 1-4",
            "Introducir el proyecto y expectativas",
            "Formar equipos de trabajo"
          ]
        },
        {
          "stage": "Presentation",
          "activities": [
            "Mostrar ejemplos del proyecto terminado",
            "Explicar rúbrica de evaluación",
            "Demostrar pasos del proyecto"
          ]
        },
        {
          "stage": "Preparation",
          "activities": [
            "Trabajo en equipos - planificación",
            "Uso de borradores de Lección 4",
            "Práctica de presentaciones"
          ]
        },
        {
          "stage": "Performance",
          "activities": [
            "Ejecución del proyecto",
            "Presentaciones grupales",
            "Demostración de productos"
          ]
        },
        {
          "stage": "Assessment / Post-task",
          "activities": [
            "Evaluación con rúbrica",
            "Retroalimentación entre pares",
            "Autoevaluación"
          ]
        },
        {
          "stage": "Reflection",
          "activities": [
            "Reflexión sobre el proceso",
            "Qué aprendimos",
            "Celebración de logros"
          ]
        }
      ],
      "comments": {
        "homework": "[Tarea de extensión o compartir proyecto con familia]",
        "formative_assessment": "[Evaluación del proyecto integrador]",
        "teacher_comments": "[Notas sobre diferenciación y adaptaciones]"
      }
    }
  ]
}

---

REQUISITOS CRÍTICOS:
1. Cada actividad debe ser ESPECÍFICA y PRÁCTICA, no genérica
2. TODAS las lecciones deben CONECTAR con el proyecto de la Lección 5
3. Incluir instrucciones paso a paso que el docente pueda seguir
4. Objetivos SMART deben preparar para el proyecto final
5. La Lección 5 debe integrar TODAS las habilidades aprendidas
6. Todo en español
7. El JSON debe ser válido

DEVUELVE SOLO EL JSON, SIN TEXTO ADICIONAL ANTES O DESPUÉS.
```

---

## 📊 Tabla de Niveles CEFR por Grado

| Grado | Nivel CEFR |
|-------|------------|
| Pre-K | Pre A1.1   |
| K     | Pre A1.2   |
| 1     | A1.1       |
| 2     | A1.2       |
| 3     | A2.1       |
| 4     | A2.2       |
| 5     | B1.1       |
| 6     | B1.2       |

---

## 📁 Nombres de Archivos

Usa este formato exacto:
```
{grade}_{scenario_num}_{theme_num}_{plan_type}_{language}.json
```

**Ejemplos:**
- `1_1_1_standard_es.json` = Grade 1, Scenario 1, Theme 1, Standard, Español
- `3_2_2_standard_es.json` = Grade 3, Scenario 2, Theme 2, Standard, Español
- `pre_k_1_1_standard_es.json` = Pre-K, Scenario 1, Theme 1, Standard, Español

---

## 🔄 Proceso de Backward Planning

### Paso 1: Seleccionar el Proyecto (Lección 5)
1. Abre `/app/backend/data/projects/official/[grade].json`
2. Busca el scenario correspondiente
3. **Elige UNO de los 3 proyectos oficiales disponibles**
4. Este proyecto será el punto de partida

### Paso 2: Diseñar las Lecciones 4 → 1
1. **Lección 4 (Writing):** ¿Qué deben escribir para el proyecto?
2. **Lección 3 (Speaking):** ¿Qué deben practicar oralmente?
3. **Lección 2 (Reading):** ¿Qué información deben leer/comprender?
4. **Lección 1 (Listening):** ¿Qué vocabulario necesitan?

### Paso 3: Generar con IA
1. Copia el prompt template
2. Incluye el proyecto seleccionado
3. Envía a ChatGPT/Claude/Gemini
4. Verifica que cada lección conecte con el proyecto

### Paso 4: Validar
1. Ve a https://jsonlint.com
2. Verifica que el JSON sea válido
3. Revisa que TODAS las lecciones mencionen la conexión con el proyecto

### Paso 5: Guardar y Probar
1. Guarda en `/app/backend/data/generated_planners/`
2. Genera el planeamiento en la app
3. Exporta a Word y verifica el formato

---

## 💡 Tips para Backward Planning

**Pregunta clave para cada lección:**
"¿Cómo prepara esta actividad al estudiante para completar exitosamente el proyecto de la Lección 5?"

**Ejemplo - Proyecto "Weather Wheel":**
- Lección 1: Escuchar y aprender vocabulario del clima (sunny, rainy, windy)
- Lección 2: Leer textos simples sobre el clima
- Lección 3: Describir el clima oralmente ("It is sunny today")
- Lección 4: Escribir etiquetas para la rueda del clima
- Lección 5: Crear la rueda del clima y usarla para reportar

---

## ✅ Checklist de Calidad (Backward Planning)

Antes de guardar cada JSON, verifica:

- [ ] JSON es válido (jsonlint.com)
- [ ] El proyecto de Lección 5 es uno de los 3 oficiales
- [ ] TODAS las lecciones tienen `connection_to_project`
- [ ] Lección 1 prepara vocabulario para el proyecto
- [ ] Lección 2 desarrolla comprensión lectora relevante
- [ ] Lección 3 practica expresiones orales del proyecto
- [ ] Lección 4 crea borradores/escritura para el proyecto
- [ ] Lección 5 integra TODAS las habilidades en el proyecto
- [ ] Los objetivos SMART conectan con el proyecto
- [ ] Todo está en español
- [ ] Nombre de archivo correcto

---

## 🆘 Solución de Problemas

**"Las lecciones no conectan con el proyecto"**
- Revisa que cada `connection_to_project` explique claramente la relación
- Verifica que las actividades usen vocabulario/conceptos del proyecto

**"El proyecto no integra todas las habilidades"**
- Asegúrate de incluir: escuchar instrucciones, leer información, hablar/presentar, escribir etiquetas/descripciones, mediar entre compañeros

---

¡Buena suerte generando los planeamientos con Backward Planning! 🎓
