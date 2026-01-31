from fastapi import FastAPI, APIRouter, HTTPException
from fastapi.responses import FileResponse
from dotenv import load_dotenv
from starlette.middleware.cors import CORSMiddleware
from motor.motor_asyncio import AsyncIOMotorClient
import os
import logging
import json
from pathlib import Path
from pydantic import BaseModel, Field, ConfigDict
from typing import List, Dict, Any, Optional
import uuid
from datetime import datetime, timezone
from docx import Document
from docx.shared import Inches, Pt, RGBColor
from docx.enum.text import WD_ALIGN_PARAGRAPH
from io import BytesIO
import tempfile
from emergentintegrations.llm.chat import LlmChat, UserMessage

ROOT_DIR = Path(__file__).parent
load_dotenv(ROOT_DIR / '.env')

# MongoDB connection
mongo_url = os.environ['MONGO_URL']
client = AsyncIOMotorClient(mongo_url)
db = client[os.environ['DB_NAME']]

# Data paths
DATA_DIR = ROOT_DIR / 'data'
GRADES_DIR = DATA_DIR / 'grades'
PROJECTS_OFFICIAL_DIR = DATA_DIR / 'projects' / 'official'
PROJECTS_C21_DIR = DATA_DIR / 'projects' / 'c21'
INSTITUTIONAL_STANDARDS_DIR = DATA_DIR / 'institutional_standards'
SCOPE_SEQUENCE_FILE = DATA_DIR / 'scope_sequence.json'
GENERATED_PLANNERS_DIR = DATA_DIR / 'generated_planners'

# Create the main app without a prefix
app = FastAPI()

# Create a router with the /api prefix
api_router = APIRouter(prefix="/api")

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)

# Models
class PlannerRequest(BaseModel):
    grade: str
    scenario: str
    theme: str
    plan_type: str  # basic, standard, enriched
    official_format: bool = False
    project_id: Optional[str] = None
    language: str = "es"
    
class InstitutionalData(BaseModel):
    school_name: str = ""
    teacher_name: str = ""
    trimester: str = ""
    week_range: str = ""

# Helper functions to load JSON data
def load_grade_data(grade: str) -> dict:
    """Load grade curriculum data"""
    file_path = GRADES_DIR / f"{grade}.json"
    if not file_path.exists():
        raise HTTPException(status_code=404, detail=f"Grade {grade} not found")
    with open(file_path, 'r', encoding='utf-8') as f:
        return json.load(f)

def load_projects_official(grade: str) -> dict:
    """Load official projects for a grade"""
    file_path = PROJECTS_OFFICIAL_DIR / f"{grade}.json"
    if not file_path.exists():
        return {}
    with open(file_path, 'r', encoding='utf-8') as f:
        return json.load(f)

def load_projects_c21(grade: str) -> dict:
    """Load C21 complementary projects for a grade"""
    file_path = PROJECTS_C21_DIR / f"{grade}.json"
    if not file_path.exists():
        return {}
    with open(file_path, 'r', encoding='utf-8') as f:
        return json.load(f)

def load_institutional_standards(grade: str) -> dict:
    """Load institutional standards for a grade"""
    file_path = INSTITUTIONAL_STANDARDS_DIR / f"{grade}.json"
    if not file_path.exists():
        return {}
    with open(file_path, 'r', encoding='utf-8') as f:
        return json.load(f)

def load_pregenerated_planner(grade: str, scenario: str, theme: str, plan_type: str, language: str) -> dict:
    """Load a pregenerated planner from JSON file if it exists"""
    # Extract scenario number from scenario string (e.g., "Scenario 1: All Week Long!" -> "1")
    import re
    scenario_match = re.search(r'Scenario (\d+)', scenario)
    scenario_num = scenario_match.group(1) if scenario_match else "1"
    
    # Determine theme number based on the theme list for that scenario
    # For now, we'll use a simple approach - if we can load the grade data, we can find the index
    try:
        grade_data = load_grade_data(grade)
        scenario_data = None
        if isinstance(grade_data, list):
            scenario_data = next((s for s in grade_data if s.get('scenario', s.get('title', '')) == scenario), None)
        elif isinstance(grade_data, dict) and 'scenarios' in grade_data:
            scenario_data = next((s for s in grade_data['scenarios'] if s.get('scenario', s.get('title', '')) == scenario), None)
        
        if scenario_data:
            themes = scenario_data.get('themes', [])
            theme_num = str(themes.index(theme) + 1) if theme in themes else "1"
        else:
            theme_num = "1"
    except:
        theme_num = "1"
    
    # Build filename: {grade}_{scenario_num}_{theme_num}_{plan_type}_{language}.json
    filename = f"{grade}_{scenario_num}_{theme_num}_{plan_type}_{language}.json"
    file_path = GENERATED_PLANNERS_DIR / filename
    
    logger.info(f"Looking for pregenerated planner: {filename}")
    
    if file_path.exists():
        logger.info(f"Found pregenerated planner: {filename}")
        with open(file_path, 'r', encoding='utf-8') as f:
            return json.load(f)
    
    return None

# API Routes
@api_router.get("/")
async def root():
    return {"message": "English Teachers Planner API"}

@api_router.get("/grades")
async def get_grades():
    """Get list of available grades"""
    grades = ["pre_k", "K", "1", "2", "3", "4", "5", "6"]
    return {"grades": grades}

@api_router.get("/grades/{grade}/scenarios")
async def get_scenarios(grade: str):
    """Get scenarios for a specific grade"""
    try:
        data = load_grade_data(grade)
        
        # Check if data is array or object with scenarios
        if isinstance(data, list):
            scenarios = [s.get('scenario', s.get('title', '')) for s in data]
        elif isinstance(data, dict) and 'scenarios' in data:
            scenarios = [s.get('scenario', s.get('title', '')) for s in data['scenarios']]
        else:
            scenarios = []
            
        return {"scenarios": scenarios}
    except Exception as e:
        logger.error(f"Error loading scenarios for grade {grade}: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@api_router.get("/grades/{grade}/scenarios/{scenario}/themes")
async def get_themes(grade: str, scenario: str):
    """Get themes for a specific scenario"""
    try:
        data = load_grade_data(grade)
        
        # Find the scenario
        scenario_data = None
        if isinstance(data, list):
            scenario_data = next((s for s in data if s.get('scenario', s.get('title', '')) == scenario), None)
        elif isinstance(data, dict) and 'scenarios' in data:
            scenario_data = next((s for s in data['scenarios'] if s.get('scenario', s.get('title', '')) == scenario), None)
            
        if not scenario_data:
            return {"themes": []}
            
        themes = scenario_data.get('themes', [])
        return {"themes": themes}
    except Exception as e:
        logger.error(f"Error loading themes: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@api_router.get("/grades/{grade}/content")
async def get_grade_content(grade: str):
    """Get complete content for a grade"""
    try:
        data = load_grade_data(grade)
        return data
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@api_router.get("/projects/official/{grade}/{scenario}")
async def get_official_projects(grade: str, scenario: str):
    """Get official projects for a grade and scenario"""
    try:
        projects_data = load_projects_official(grade)
        
        if 'projects_by_scenario' in projects_data:
            scenario_projects = projects_data['projects_by_scenario'].get(scenario, [])
        else:
            scenario_projects = []
            
        return {"projects": scenario_projects}
    except Exception as e:
        logger.error(f"Error loading official projects: {e}")
        return {"projects": []}

@api_router.get("/projects/c21/{grade}/{scenario}")
async def get_c21_projects(grade: str, scenario: str):
    """Get C21 complementary projects for a grade and scenario"""
    try:
        projects_data = load_projects_c21(grade)
        
        if 'projects_by_scenario' in projects_data:
            # Find matching scenario (could have different naming)
            scenario_key = None
            for key in projects_data['projects_by_scenario'].keys():
                if scenario in key or key in scenario:
                    scenario_key = key
                    break
            
            if scenario_key:
                scenario_projects = projects_data['projects_by_scenario'][scenario_key]
            else:
                scenario_projects = {}
        else:
            scenario_projects = {}
            
        return {"projects": scenario_projects}
    except Exception as e:
        logger.error(f"Error loading C21 projects: {e}")
        return {"projects": {}}

@api_router.post("/planner/generate")
async def generate_planner(request: PlannerRequest):
    """Generate a complete lesson planner (Theme + Lessons) - uses pregenerated JSON if available"""
    try:
        # First, try to load pregenerated planner
        pregenerated = load_pregenerated_planner(
            request.grade, request.scenario, request.theme, 
            request.plan_type, request.language
        )
        
        if pregenerated:
            logger.info("Using pregenerated planner from JSON file")
            # Load project if specified
            if request.project_id:
                official_projects = load_projects_official(request.grade)
                if 'projects_by_scenario' in official_projects:
                    projects_list = official_projects['projects_by_scenario'].get(request.scenario, [])
                    project_data = next((p for p in projects_list if p.get('id') == request.project_id), None)
                    pregenerated['project'] = project_data
            
            return pregenerated
        
        # If no pregenerated planner, generate basic structure from curriculum
        logger.info("No pregenerated planner found, generating basic structure from curriculum")
        
        # Load grade data
        grade_data = load_grade_data(request.grade)
        
        # Find scenario
        scenario_data = None
        if isinstance(grade_data, list):
            scenario_data = next((s for s in grade_data if s.get('scenario', s.get('title', '')) == request.scenario), None)
        elif isinstance(grade_data, dict) and 'scenarios' in grade_data:
            scenario_data = next((s for s in grade_data['scenarios'] if s.get('scenario', s.get('title', '')) == request.scenario), None)
            
        if not scenario_data:
            raise HTTPException(status_code=404, detail="Scenario not found")
        
        # Load project if specified
        project_data = None
        if request.project_id:
            official_projects = load_projects_official(request.grade)
            if 'projects_by_scenario' in official_projects:
                projects_list = official_projects['projects_by_scenario'].get(request.scenario, [])
                project_data = next((p for p in projects_list if p.get('id') == request.project_id), None)
        
        # Generate basic planner structure
        planner = {
            "grade": request.grade,
            "scenario": request.scenario,
            "theme": request.theme,
            "plan_type": request.plan_type,
            "official_format": request.official_format,
            "language": request.language,
            "theme_planner": generate_basic_theme_planner(scenario_data, request.theme, request.grade, request.plan_type, project_data),
            "lesson_planners": generate_basic_lesson_planners(scenario_data, request.theme, request.plan_type),
            "project": project_data
        }
        
        return planner
        
    except Exception as e:
        logger.error(f"Error generating planner: {e}")
        raise HTTPException(status_code=500, detail=str(e))

def generate_basic_theme_planner(scenario_data: dict, theme: str, grade: str, 
                                 plan_type: str, project_data: dict = None) -> dict:
    """Generate basic theme planner structure from curriculum data"""
    # Get CEFR level from grade
    cefr_levels = {
        "pre_k": "Pre A1.1",
        "K": "Pre A1.2",
        "1": "A1.1",
        "2": "A1.2",
        "3": "A2.1",
        "4": "A2.2",
        "5": "B1.1",
        "6": "B1.2"
    }
    
    standards = scenario_data.get('standards_and_learning_outcomes', {})
    competences = scenario_data.get('communicative_competences', {})
    
    # Generate basic objectives from standards
    objectives = {}
    for skill in ['listening', 'reading', 'speaking', 'writing', 'mediation']:
        if skill in standards:
            skill_data = standards[skill]
            if isinstance(skill_data, dict):
                general = skill_data.get('general', skill_data.get('receptive', skill_data.get('productive', '')))
                objectives[skill] = general
            else:
                objectives[skill] = ""
    
    # Generate basic materials list from curriculum
    materials = []
    if competences.get('linguistic'):
        ling = competences['linguistic']
        if ling.get('vocabulary'):
            materials.append(f"Flashcards or visuals for vocabulary: {', '.join(ling['vocabulary'][:5]) if isinstance(ling['vocabulary'], list) else 'topic vocabulary'}")
        if ling.get('grammatical_features') or ling.get('grammar'):
            materials.append("Grammar charts or reference materials")
    
    # Add standard materials
    materials.extend([
        "Whiteboard and markers",
        "Student worksheets",
        "Audio/video materials (if available)",
        "Realia or authentic materials related to theme"
    ])
    
    theme_planner = {
        "general_information": {
            "teachers": "",
            "grade": grade,
            "cefr_level": cefr_levels.get(grade, "A1"),
            "trimester": "",
            "weekly_hours": "",
            "week_range": "",
            "scenario": scenario_data.get('scenario', scenario_data.get('title', '')),
            "theme": theme
        },
        "standards_and_learning_outcomes": standards,
        "communicative_competences": competences,
        "specific_objectives": objectives,
        "materials_and_strategies": {
            "required_materials": materials,
            "differentiated_instruction": "Adapt activities for different learning styles (visual, auditory, kinesthetic). Provide scaffolding for struggling learners and extension activities for advanced students. Use pair/group work for peer support."
        },
        "learning_sequence": {
            "project_title": project_data.get('name', '') if project_data else '',
            "project_description": project_data.get('overview', '') if project_data else '',
            "connection_to_theme": theme
        }
    }
    
    return theme_planner

def generate_basic_lesson_planners(scenario_data: dict, theme: str, plan_type: str) -> list:
    """Generate basic lesson planner structures with curriculum info"""
    lessons = []
    skills = ['listening', 'reading', 'speaking', 'writing', 'mediation']
    standards = scenario_data.get('standards_and_learning_outcomes', {})
    competences = scenario_data.get('communicative_competences', {})
    
    # Get vocabulary and grammar from competences
    vocab_list = []
    grammar_list = []
    if competences.get('linguistic'):
        ling = competences['linguistic']
        if isinstance(ling.get('vocabulary'), list):
            vocab_list = ling['vocabulary'][:10]  # First 10 vocab items
        elif ling.get('vocabulary'):
            vocab_list = [str(ling['vocabulary'])]
            
        if isinstance(ling.get('grammatical_features'), list):
            grammar_list = ling['grammatical_features'][:5]
        elif isinstance(ling.get('grammar'), list):
            grammar_list = ling['grammar'][:5]
    
    for i, skill in enumerate(skills, 1):
        # Get learning outcome and standards
        learning_outcome = ""
        specific_standard = ""
        if skill in standards:
            skill_data = standards[skill]
            if isinstance(skill_data, dict):
                outcomes = skill_data.get('learning_outcomes', [])
                if isinstance(outcomes, list) and outcomes:
                    learning_outcome = outcomes[0]
                
                # Get specific standard
                specific_standard = skill_data.get('specific', skill_data.get('general', ''))
        
        # Generate basic activities based on curriculum content
        warm_up_activities = [
            f"Review {theme} vocabulary: {', '.join(vocab_list[:5]) if vocab_list else 'key terms'}",
            f"Activate prior knowledge about {theme}",
            "Engage students with visuals or realia related to the topic"
        ]
        
        presentation_activities = [
            f"Introduce {skill} focus using authentic materials",
            f"Present key vocabulary: {', '.join(vocab_list[:5]) if vocab_list else 'topic-related words'}",
            f"Model {skill} skill with clear examples"
        ]
        
        if grammar_list:
            presentation_activities.append(f"Introduce grammar: {', '.join(grammar_list[:2])}")
        
        preparation_activities = [
            f"Guided {skill} practice with scaffolding",
            "Work in pairs or small groups",
            f"Practice using {theme} vocabulary in context"
        ]
        
        performance_activities = [
            f"Independent {skill} activity",
            f"Students demonstrate {skill} skill with {theme} content",
            "Provide opportunities for student production"
        ]
        
        assessment_activities = [
            f"Formative assessment of {skill} skill",
            "Check understanding and provide feedback",
            "Students self-assess their performance"
        ]
        
        reflection_activities = [
            f"Reflect on {skill} learning",
            f"Discuss what was learned about {theme}",
            "Set goals for improvement"
        ]
        
        lesson = {
            "lesson_number": i,
            "skill_focus": skill.capitalize(),
            "scenario": scenario_data.get('scenario', scenario_data.get('title', '')),
            "theme": theme,
            "date": "",
            "time": "45-60 minutes",
            "specific_objective": specific_standard if specific_standard else f"Students will develop {skill} skills related to {theme}",
            "learning_outcome": learning_outcome if learning_outcome else f"Students will be able to use {skill} to communicate about {theme}",
            "lesson_stages": [
                {
                    "stage": "Warm-up / Pre-task",
                    "activities": warm_up_activities
                },
                {
                    "stage": "Presentation",
                    "activities": presentation_activities
                },
                {
                    "stage": "Preparation",
                    "activities": preparation_activities
                },
                {
                    "stage": "Performance",
                    "activities": performance_activities
                },
                {
                    "stage": "Assessment / Post-task",
                    "activities": assessment_activities
                },
                {
                    "stage": "Reflection",
                    "activities": reflection_activities
                }
            ],
            "comments": {
                "homework": f"Practice {skill} skill with {theme} content at home. Review vocabulary and grammar.",
                "formative_assessment": f"Observe student {skill} performance. Check comprehension and production of {theme} content.",
                "teacher_comments": f"Note: This is a basic structure from curriculum. Complete with specific activities for {skill} and {theme}. Consider student level and needs."
            }
        }
        lessons.append(lesson)
    
    return lessons

async def generate_theme_planner_with_ai(scenario_data: dict, theme: str, grade: str, 
                                         plan_type: str, language: str, project_data: dict = None) -> dict:
    """Generate theme planner with AI-generated content"""
    # Get CEFR level from grade
    cefr_levels = {
        "pre_k": "Pre A1.1",
        "K": "Pre A1.2",
        "1": "A1.1",
        "2": "A1.2",
        "3": "A2.1",
        "4": "A2.2",
        "5": "B1.1",
        "6": "B1.2"
    }
    
    standards = scenario_data.get('standards_and_learning_outcomes', {})
    competences = scenario_data.get('communicative_competences', {})
    
    # Create AI prompt for SMART objectives
    objectives_prompt = create_objectives_prompt(scenario_data, theme, grade, language, standards)
    
    # Generate SMART objectives with AI
    llm_key = os.environ.get('EMERGENT_LLM_KEY')
    chat = LlmChat(
        api_key=llm_key,
        session_id=f"objectives-{grade}-{theme}",
        system_message="You are an expert English teacher and curriculum specialist for Panama's MEDUCA curriculum."
    ).with_model("openai", "gpt-5.2")
    
    objectives_message = UserMessage(text=objectives_prompt)
    objectives_response = await chat.send_message(objectives_message)
    
    # Parse objectives response
    smart_objectives = parse_objectives_response(objectives_response)
    
    # Generate materials and strategies
    materials_prompt = create_materials_prompt(scenario_data, theme, grade, language, plan_type, project_data)
    materials_message = UserMessage(text=materials_prompt)
    materials_response = await chat.send_message(materials_message)
    materials_data = parse_materials_response(materials_response)
    
    theme_planner = {
        "general_information": {
            "teachers": "",
            "grade": grade,
            "cefr_level": cefr_levels.get(grade, "A1"),
            "trimester": "",
            "weekly_hours": "",
            "week_range": "",
            "scenario": scenario_data.get('scenario', scenario_data.get('title', '')),
            "theme": theme
        },
        "standards_and_learning_outcomes": standards,
        "communicative_competences": competences,
        "specific_objectives": smart_objectives,
        "materials_and_strategies": materials_data,
        "learning_sequence": {
            "project_title": project_data.get('name', '') if project_data else '',
            "project_description": project_data.get('overview', '') if project_data else '',
            "connection_to_theme": theme
        }
    }
    
    return theme_planner

async def generate_lesson_planners_with_ai(scenario_data: dict, theme: str, plan_type: str, 
                                           language: str, grade: str) -> list:
    """Generate 5 lesson planners with complete AI-generated content"""
    lessons = []
    skills = ['listening', 'reading', 'speaking', 'writing', 'mediation']
    standards = scenario_data.get('standards_and_learning_outcomes', {})
    competences = scenario_data.get('communicative_competences', {})
    
    llm_key = os.environ.get('EMERGENT_LLM_KEY')
    
    for i, skill in enumerate(skills, 1):
        # Create detailed prompt for this lesson
        lesson_prompt = create_lesson_prompt(
            scenario_data, theme, skill, grade, plan_type, language, 
            standards, competences, i
        )
        
        # Generate lesson content with AI
        chat = LlmChat(
            api_key=llm_key,
            session_id=f"lesson-{grade}-{theme}-{skill}",
            system_message="You are an expert English teacher creating detailed, ready-to-teach lesson plans for Panama's MEDUCA curriculum."
        ).with_model("openai", "gpt-5.2")
        
        lesson_message = UserMessage(text=lesson_prompt)
        lesson_response = await chat.send_message(lesson_message)
        
        # Parse AI response into structured lesson
        lesson_data = parse_lesson_response(lesson_response, i, skill, scenario_data, theme)
        lessons.append(lesson_data)
    
    return lessons

def create_objectives_prompt(scenario_data: dict, theme: str, grade: str, language: str, standards: dict) -> str:
    """Create prompt for generating SMART objectives"""
    scenario_title = scenario_data.get('scenario', scenario_data.get('title', ''))
    
    prompt = f"""Generate 5 SMART objectives (one for each skill: Listening, Reading, Speaking, Writing, Mediation) for this English lesson:

Grade: {grade}
Scenario: {scenario_title}
Theme: {theme}
Language: {'Spanish' if language == 'es' else 'English'}

Standards and Learning Outcomes:
{json.dumps(standards, indent=2)}

Each objective must be:
- Specific: clearly defined
- Measurable: observable outcome
- Achievable: appropriate for grade level
- Relevant: aligned to curriculum standards
- Time-bound: for this lesson/theme

Format your response as JSON:
{{
  "listening": "objective text",
  "reading": "objective text",
  "speaking": "objective text",
  "writing": "objective text",
  "mediation": "objective text"
}}

Write in {'Spanish' if language == 'es' else 'English'}."""
    
    return prompt

def create_materials_prompt(scenario_data: dict, theme: str, grade: str, language: str, 
                            plan_type: str, project_data: dict = None) -> str:
    """Create prompt for generating materials and strategies"""
    scenario_title = scenario_data.get('scenario', scenario_data.get('title', ''))
    competences = scenario_data.get('communicative_competences', {})
    
    prompt = f"""Generate a comprehensive list of materials and differentiated instruction strategies for this English lesson:

Grade: {grade}
Scenario: {scenario_title}
Theme: {theme}
Plan Type: {plan_type}
Language: {'Spanish' if language == 'es' else 'English'}

Communicative Competences:
{json.dumps(competences, indent=2, ensure_ascii=False)}

{"Project: " + project_data.get('name', '') if project_data else ""}

Provide:
1. Required Materials: specific items needed (flashcards, posters, manipulatives, tech, etc.)
2. Differentiated Instruction: strategies for diverse learners (visual, auditory, kinesthetic, struggling, advanced, ELL)

Format as JSON:
{{
  "required_materials": ["material 1", "material 2", ...],
  "differentiated_instruction": "detailed strategies text"
}}

Write in {'Spanish' if language == 'es' else 'English'}."""
    
    return prompt

def create_lesson_prompt(scenario_data: dict, theme: str, skill: str, grade: str, 
                        plan_type: str, language: str, standards: dict, 
                        competences: dict, lesson_number: int) -> str:
    """Create comprehensive prompt for generating a complete lesson"""
    scenario_title = scenario_data.get('scenario', scenario_data.get('title', ''))
    
    skill_data = standards.get(skill, {})
    learning_outcome = ""
    if isinstance(skill_data, dict):
        outcomes = skill_data.get('learning_outcomes', [])
        if isinstance(outcomes, list) and outcomes:
            learning_outcome = outcomes[0]
    
    # Get vocabulary and grammar from competences
    vocab = ""
    grammar = ""
    if competences.get('linguistic'):
        ling = competences['linguistic']
        if isinstance(ling.get('vocabulary'), list):
            vocab = ", ".join(ling['vocabulary'][:15])
        elif ling.get('vocabulary'):
            vocab = str(ling['vocabulary'])
            
        if isinstance(ling.get('grammatical_features'), list):
            grammar = ", ".join(ling['grammatical_features'])
        elif isinstance(ling.get('grammar'), list):
            grammar = ", ".join(ling['grammar'])
    
    detail_level = {
        'basic': 'concise and essential',
        'standard': 'complete and balanced',
        'enriched': 'detailed with extension activities'
    }
    
    prompt = f"""Create a complete, ready-to-teach lesson plan for:

Lesson {lesson_number}: {skill.upper()} Skill
Grade: {grade}
Scenario: {scenario_title}
Theme: {theme}
Plan Type: {plan_type} ({detail_level.get(plan_type, 'standard')})
Language: {'Spanish' if language == 'es' else 'English'}

Learning Outcome: {learning_outcome}
Key Vocabulary: {vocab}
Grammar: {grammar}

Generate {detail_level.get(plan_type, 'standard')} content for the 6 Action-Oriented Approach stages:

1. WARM-UP / PRE-TASK (5-10 min):
   - Specific engagement activity
   - How to activate prior knowledge
   - Materials needed

2. PRESENTATION (10-15 min):
   - How to introduce new content
   - Examples to use
   - Visual aids/demonstrations

3. PREPARATION (10-15 min):
   - Guided practice activities
   - Scaffolding techniques
   - Teacher support strategies

4. PERFORMANCE (15-20 min):
   - Independent practice tasks
   - Student production activities
   - Expected outcomes

5. ASSESSMENT / POST-TASK (10 min):
   - Formative assessment strategies
   - How to check understanding
   - Feedback techniques

6. REFLECTION (5 min):
   - Reflection questions
   - Self-assessment activities
   - Closure strategy

Also include:
- SPECIFIC OBJECTIVE: SMART objective for this lesson
- HOMEWORK: meaningful assignment
- TEACHER NOTES: important tips and common challenges

Format as JSON:
{{
  "specific_objective": "SMART objective",
  "lesson_stages": [
    {{
      "stage": "Warm-up / Pre-task",
      "activities": ["activity 1 with details", "activity 2 with details", ...]
    }},
    ... (6 stages total)
  ],
  "homework": "homework description",
  "formative_assessment": "assessment strategies",
  "teacher_comments": "tips and notes for teacher"
}}

Make activities specific, practical, and ready to implement. Include exact instructions the teacher can follow.
Write in {'Spanish' if language == 'es' else 'English'}."""
    
    return prompt

def parse_objectives_response(response: str) -> dict:
    """Parse AI response for objectives"""
    try:
        # Try to extract JSON from response
        import re
        json_match = re.search(r'\{.*\}', response, re.DOTALL)
        if json_match:
            return json.loads(json_match.group())
    except:
        pass
    
    # Fallback
    return {
        "listening": response[:200] if len(response) > 200 else response,
        "reading": "",
        "speaking": "",
        "writing": "",
        "mediation": ""
    }

def parse_materials_response(response: str) -> dict:
    """Parse AI response for materials"""
    try:
        import re
        json_match = re.search(r'\{.*\}', response, re.DOTALL)
        if json_match:
            data = json.loads(json_match.group())
            return {
                "required_materials": data.get('required_materials', []),
                "differentiated_instruction": data.get('differentiated_instruction', '')
            }
    except:
        pass
    
    return {
        "required_materials": ["Materials to be determined"],
        "differentiated_instruction": response[:500] if len(response) > 500 else response
    }

def parse_lesson_response(response: str, lesson_number: int, skill: str, 
                         scenario_data: dict, theme: str) -> dict:
    """Parse AI response into structured lesson"""
    try:
        import re
        json_match = re.search(r'\{.*\}', response, re.DOTALL)
        if json_match:
            data = json.loads(json_match.group())
            
            return {
                "lesson_number": lesson_number,
                "skill_focus": skill.capitalize(),
                "scenario": scenario_data.get('scenario', scenario_data.get('title', '')),
                "theme": theme,
                "date": "",
                "time": "45-60 minutes",
                "specific_objective": data.get('specific_objective', ''),
                "learning_outcome": data.get('learning_outcome', get_learning_outcome_fallback(scenario_data, skill)),
                "lesson_stages": data.get('lesson_stages', []),
                "comments": {
                    "homework": data.get('homework', ''),
                    "formative_assessment": data.get('formative_assessment', ''),
                    "teacher_comments": data.get('teacher_comments', '')
                }
            }
    except Exception as e:
        logger.error(f"Error parsing lesson response: {e}")
    
    # Fallback structure
    return {
        "lesson_number": lesson_number,
        "skill_focus": skill.capitalize(),
        "scenario": scenario_data.get('scenario', scenario_data.get('title', '')),
        "theme": theme,
        "date": "",
        "time": "45-60 minutes",
        "specific_objective": "To be completed",
        "learning_outcome": get_learning_outcome_fallback(scenario_data, skill),
        "lesson_stages": generate_lesson_stages('standard'),
        "comments": {
            "homework": "",
            "formative_assessment": "",
            "teacher_comments": ""
        }
    }

def get_learning_outcome_fallback(scenario_data: dict, skill: str) -> str:
    """Get learning outcome from standards"""
    standards = scenario_data.get('standards_and_learning_outcomes', {})
    if skill in standards:
        skill_data = standards[skill]
        if isinstance(skill_data, dict):
            outcomes = skill_data.get('learning_outcomes', [])
            if isinstance(outcomes, list) and outcomes:
                return outcomes[0]
    return ""

def generate_lesson_stages(plan_type: str) -> list:
    """Generate the 6 action-oriented approach stages"""
    stages = [
        {
            "stage": "Warm-up / Pre-task",
            "activities": [] if plan_type == "basic" else ["Engagement activity", "Modeling", "Clarification"]
        },
        {
            "stage": "Presentation",
            "activities": [] if plan_type == "basic" else ["Introduce new content", "Examples and demonstration"]
        },
        {
            "stage": "Preparation",
            "activities": [] if plan_type == "basic" else ["Guided practice", "Scaffolding"]
        },
        {
            "stage": "Performance",
            "activities": [] if plan_type == "basic" else ["Independent practice", "Student production"]
        },
        {
            "stage": "Assessment / Post-task",
            "activities": [] if plan_type == "basic" else ["Formative assessment", "Feedback"]
        },
        {
            "stage": "Reflection",
            "activities": [] if plan_type == "basic" else ["Student reflection", "Lesson review"]
        }
    ]
    return stages

@api_router.post("/planner/export/docx")
async def export_to_docx(planner: dict):
    """Export planner to DOCX format"""
    try:
        # Create a new Document
        doc = Document()
        
        # Set document margins
        sections = doc.sections
        for section in sections:
            section.top_margin = Inches(0.5)
            section.bottom_margin = Inches(0.5)
            section.left_margin = Inches(0.75)
            section.right_margin = Inches(0.75)
        
        # Title
        title = doc.add_heading('English Lesson Planner', 0)
        title.alignment = WD_ALIGN_PARAGRAPH.CENTER
        
        # Theme Planner Section
        doc.add_heading('Theme Planner', 1)
        
        theme_info = planner.get('theme_planner', {}).get('general_information', {})
        
        # General Information
        doc.add_heading('General Information', 2)
        info_table = doc.add_table(rows=8, cols=2)
        info_table.style = 'Light Grid Accent 1'
        
        info_data = [
            ('Grade', theme_info.get('grade', '')),
            ('CEFR Level', theme_info.get('cefr_level', '')),
            ('Trimester', theme_info.get('trimester', '')),
            ('Weekly Hours', theme_info.get('weekly_hours', '')),
            ('Week Range', theme_info.get('week_range', '')),
            ('Scenario', theme_info.get('scenario', '')),
            ('Theme', theme_info.get('theme', '')),
            ('Teachers', theme_info.get('teachers', ''))
        ]
        
        for i, (label, value) in enumerate(info_data):
            info_table.rows[i].cells[0].text = label
            info_table.rows[i].cells[1].text = str(value)
        
        # Lesson Planners Section
        doc.add_page_break()
        doc.add_heading('Lesson Planners', 1)
        
        for lesson in planner.get('lesson_planners', []):
            doc.add_heading(f"Lesson {lesson['lesson_number']}: {lesson['skill_focus']}", 2)
            
            lesson_table = doc.add_table(rows=4, cols=2)
            lesson_table.style = 'Light Grid Accent 1'
            
            lesson_data = [
                ('Scenario', lesson.get('scenario', '')),
                ('Theme', lesson.get('theme', '')),
                ('Skill Focus', lesson.get('skill_focus', '')),
                ('Learning Outcome', lesson.get('learning_outcome', ''))
            ]
            
            for i, (label, value) in enumerate(lesson_data):
                lesson_table.rows[i].cells[0].text = label
                lesson_table.rows[i].cells[1].text = str(value)
            
            # Lesson Stages
            doc.add_heading('Lesson Stages', 3)
            for stage in lesson.get('lesson_stages', []):
                p = doc.add_paragraph()
                p.add_run(stage['stage'] + ': ').bold = True
                activities = ', '.join(stage.get('activities', [])) if stage.get('activities') else 'To be completed'
                p.add_run(activities)
            
            doc.add_paragraph()  # Space between lessons
        
        # Save to BytesIO
        file_stream = BytesIO()
        doc.save(file_stream)
        file_stream.seek(0)
        
        # Save to temp file and return
        with tempfile.NamedTemporaryFile(delete=False, suffix='.docx') as tmp:
            tmp.write(file_stream.getvalue())
            tmp_path = tmp.name
        
        return FileResponse(
            tmp_path,
            media_type='application/vnd.openxmlformats-officedocument.wordprocessingml.document',
            filename=f"lesson_planner_{planner['grade']}_{planner['scenario']}.docx"
        )
        
    except Exception as e:
        logger.error(f"Error exporting to DOCX: {e}")
        raise HTTPException(status_code=500, detail=str(e))

# Include the router in the main app
app.include_router(api_router)

app.add_middleware(
    CORSMiddleware,
    allow_credentials=True,
    allow_origins=os.environ.get('CORS_ORIGINS', '*').split(','),
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.on_event("shutdown")
async def shutdown_db_client():
    client.close()
