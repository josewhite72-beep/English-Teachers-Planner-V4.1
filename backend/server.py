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
    """Generate a complete lesson planner (Theme + Lessons)"""
    try:
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
        
        # Generate planner based on plan_type
        planner = {
            "grade": request.grade,
            "scenario": request.scenario,
            "theme": request.theme,
            "plan_type": request.plan_type,
            "official_format": request.official_format,
            "language": request.language,
            "theme_planner": generate_theme_planner(scenario_data, request.theme, request.grade, request.plan_type),
            "lesson_planners": generate_lesson_planners(scenario_data, request.theme, request.plan_type),
            "project": project_data
        }
        
        return planner
        
    except Exception as e:
        logger.error(f"Error generating planner: {e}")
        raise HTTPException(status_code=500, detail=str(e))

def generate_theme_planner(scenario_data: dict, theme: str, grade: str, plan_type: str) -> dict:
    """Generate theme planner section"""
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
        "specific_objectives": generate_specific_objectives(standards),
        "materials_and_strategies": {
            "required_materials": [],
            "differentiated_instruction": ""
        },
        "learning_sequence": {
            "project_title": "",
            "project_description": "",
            "connection_to_theme": ""
        }
    }
    
    return theme_planner

def generate_specific_objectives(standards: dict) -> dict:
    """Generate SMART objectives from standards"""
    objectives = {}
    
    for skill in ['listening', 'reading', 'speaking', 'writing', 'mediation']:
        if skill in standards:
            skill_data = standards[skill]
            if isinstance(skill_data, dict):
                general = skill_data.get('general', skill_data.get('receptive', skill_data.get('productive', '')))
                objectives[skill] = general
            else:
                objectives[skill] = ""
    
    return objectives

def generate_lesson_planners(scenario_data: dict, theme: str, plan_type: str) -> list:
    """Generate 5 lesson planners"""
    lessons = []
    skills = ['listening', 'reading', 'speaking', 'writing', 'mediation']
    standards = scenario_data.get('standards_and_learning_outcomes', {})
    
    for i, skill in enumerate(skills, 1):
        lesson = {
            "lesson_number": i,
            "skill_focus": skill.capitalize(),
            "scenario": scenario_data.get('scenario', scenario_data.get('title', '')),
            "theme": theme,
            "date": "",
            "time": "",
            "specific_objective": "",
            "learning_outcome": get_learning_outcome(standards, skill),
            "lesson_stages": generate_lesson_stages(plan_type),
            "comments": {
                "homework": "",
                "formative_assessment": "",
                "teacher_comments": ""
            }
        }
        lessons.append(lesson)
    
    return lessons

def get_learning_outcome(standards: dict, skill: str) -> str:
    """Get learning outcome for a skill"""
    if skill in standards:
        skill_data = standards[skill]
        if isinstance(skill_data, dict):
            outcomes = skill_data.get('learning_outcomes', [])
            if isinstance(outcomes, list) and outcomes:
                return outcomes[0] if outcomes else ""
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
