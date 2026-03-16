# Sistema de Planeamientos Pregenerados

## 📋 Cómo funciona

Este sistema permite cargar planeamientos completos generados con IAs gratuitas (ChatGPT, Claude, Gemini, etc.) sin costos adicionales de API.

## 🎯 Proceso

1. **Generas el contenido** con cualquier IA gratuita
2. **Creas un archivo JSON** siguiendo el template
3. **Lo guardas** en esta carpeta
4. **La app lo usa automáticamente** cuando alguien solicita ese planeamiento

## 📁 Nombre de archivos

Usa este formato:
```
{grade}_{scenario_number}_{theme_number}_{plan_type}_{language}.json
```

**Ejemplos:**
- `1_1_1_standard_es.json` = Grade 1, Scenario 1, Theme 1, Standard, Español
- `3_2_2_enriched_en.json` = Grade 3, Scenario 2, Theme 2, Enriched, English
- `pre_k_1_1_basic_es.json` = Pre-K, Scenario 1, Theme 1, Basic, Español

## 📄 Estructura del JSON

Ver `TEMPLATE_EXAMPLE.json` para el formato completo.

### Campos principales:

```json
{
  "grade": "1",
  "scenario": "Scenario 1: All Week Long!",
  "theme": "Today Is Tuesday!",
  "plan_type": "standard",
  "language": "es",
  "theme_planner": {
    "specific_objectives": {
      "listening": "Objetivo SMART completo...",
      "reading": "Objetivo SMART completo...",
      "speaking": "Objetivo SMART completo...",
      "writing": "Objetivo SMART completo...",
      "mediation": "Objetivo SMART completo..."
    },
    "materials_and_strategies": {
      "required_materials": ["Material 1", "Material 2", ...],
      "differentiated_instruction": "Descripción detallada..."
    }
  },
  "lesson_planners": [
    {
      "lesson_number": 1,
      "skill_focus": "Listening",
      "specific_objective": "Objetivo específico de la lección...",
      "time": "45 minutos",
      "lesson_stages": [
        {
          "stage": "Warm-up / Pre-task",
          "activities": [
            "Actividad detallada 1...",
            "Actividad detallada 2..."
          ]
        },
        ... 6 stages en total
      ],
      "comments": {
        "homework": "Tarea específica...",
        "formative_assessment": "Estrategias de evaluación...",
        "teacher_comments": "Notas importantes..."
      }
    },
    ... 5 lecciones en total (una por cada skill)
  ]
}
```

## 🤖 Cómo generar contenido con IA gratuita

### Prompt sugerido para ChatGPT/Claude/Gemini:

```
Genera un planeamiento completo de clase de inglés para:

Grado: [Grade 1]
Nivel CEFR: [A1.1]
Scenario: [Scenario 1: All Week Long!]
Theme: [Today Is Tuesday!]
Tipo de plan: [Standard]
Idioma: [Español]

Incluye:

1. OBJETIVOS SMART (uno por cada skill: Listening, Reading, Speaking, Writing, Mediation)
   - Específicos, Medibles, Alcanzables, Relevantes, con tiempo definido

2. MATERIALES Y ESTRATEGIAS
   - Lista de materiales necesarios (mínimo 8 items)
   - Estrategias de diferenciación para diversos estilos de aprendizaje

3. 5 LECCIONES COMPLETAS (una por skill)
   Cada lección debe incluir:
   - Objetivo específico
   - Tiempo: 45-60 minutos
   - 6 STAGES con actividades detalladas:
     * Warm-up / Pre-task (3-5 actividades específicas)
     * Presentation (3-5 actividades)
     * Preparation (3-5 actividades)
     * Performance (3-5 actividades)
     * Assessment / Post-task (3-5 actividades)
     * Reflection (3-5 actividades)
   - Homework específico
   - Estrategias de evaluación formativa
   - Comentarios y tips para el docente

Cada actividad debe ser:
- Específica y práctica
- Con instrucciones paso a paso
- Lista para implementar en el aula
- Apropiada para el nivel [A1.1]

Formato: Devuelve el contenido en formato JSON siguiendo la estructura que te proporcionaré.
```

## ✅ Validación

Antes de guardar el archivo, verifica:

- ✅ El JSON es válido (usa jsonlint.com)
- ✅ Tiene los 5 objetivos SMART
- ✅ Tiene materiales listados
- ✅ Tiene las 5 lecciones completas
- ✅ Cada lección tiene 6 stages
- ✅ Cada stage tiene actividades detalladas (no vacías)
- ✅ Tiene homework, assessment y teacher comments

## 🔄 Prioridad de carga

1. **Si existe archivo JSON pregenerado** → se usa ese (instantáneo)
2. **Si no existe** → se genera estructura básica del currículo

## 📊 Combinaciones posibles

- **8 grados** (pre_k, K, 1, 2, 3, 4, 5, 6)
- **8 scenarios** por grado
- **2 themes** por scenario
- **3 plan types** (basic, standard, enriched)
- **2 idiomas** (es, en)

**Total**: 768 combinaciones posibles

**Recomendación**: Empieza generando los más usados (grados 1-3, plan type standard, español)

## 💡 Tips

- Genera primero los planeamientos **Standard en Español** (los más usados)
- Usa el TEMPLATE_EXAMPLE.json como referencia
- Revisa que las actividades sean específicas y prácticas
- Asegúrate de que el contenido esté alineado al currículo MEDUCA
- Guarda copias de respaldo de tus archivos JSON

## 🆘 Soporte

Si tienes dudas sobre cómo estructurar el contenido o necesitas ayuda, contacta al desarrollador.
