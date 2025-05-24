from contextlib import asynccontextmanager
from fastapi import FastAPI, BackgroundTasks
from fastapi.middleware.cors import CORSMiddleware
import asyncio
import logging

from app.api.v1.api import api_router
from app.core.config import get_settings
from app.tasks.risk_assessment import run_periodic_reassessment
from app.db.init_db import init_db

settings = get_settings()
logger = logging.getLogger(__name__)

# Background task state
background_task = None

@asynccontextmanager
async def lifespan(app: FastAPI):
    """Handle startup and shutdown events."""
    # Startup
    global background_task
    background_tasks = BackgroundTasks()
    
    # Initialize database
    logger.info("Creating database tables...")
    await init_db()
    logger.info("Database tables created")
    
    async def periodic_reassessment():
        while True:
            try:
                await run_periodic_reassessment(background_tasks)
                await asyncio.sleep(3600)  # Run every hour
            except Exception as e:
                logger.error(f"Error in periodic reassessment loop: {str(e)}")
                await asyncio.sleep(60)  # Wait before retrying
    
    background_task = asyncio.create_task(periodic_reassessment())
    logger.info("Started periodic risk reassessment task")
    
    yield  # Run the app
    
    # Shutdown
    if background_task:
        background_task.cancel()
        try:
            await background_task
        except asyncio.CancelledError:
            pass
        logger.info("Stopped periodic risk reassessment task")

app = FastAPI(
    title="Heart Sync - Doctor Portal",
    description="""
    Heart Sync is a comprehensive healthcare platform designed specifically for cardiologists and medical professionals
    to monitor and assess their patients' heart health.
    
    ## Key Features
    
    * 👥 **Patient Management**: Efficiently manage your patient roster
    * 📊 **Vital Signs Monitoring**: Track and analyze patient vital signs
    * 🏥 **Medical Records**: Secure storage and retrieval of patient documents
    * ⚕️ **AI-Powered Risk Assessment**: Advanced heart health risk predictions
    * 📈 **Trend Analysis**: Monitor patient health trends over time
    
    ## Doctor-Focused Tools
    
    * **Patient Dashboard**: Quick overview of all your patients
    * **Risk Stratification**: Identify high-risk patients requiring immediate attention
    * **Treatment Tracking**: Monitor medication effectiveness and patient compliance
    * **Automated Assessments**: Regular risk reassessments for proactive care
    
    ## Authentication & Security
    
    * Secure login for verified medical professionals
    * Role-based access control (Doctor/Admin)
    * All medical data is encrypted and HIPAA-compliant
    * Comprehensive audit logging of all actions
    
    ## Professional Features
    
    * Generate detailed patient reports
    * Set up automated alerts for critical conditions
    * Collaborate with other doctors on patient care
    * Access to latest cardiology research and guidelines
    """,
    version="1.0.0",
    lifespan=lifespan,
    contact={
        "name": "Heart Sync Medical Support",
        "email": "medical.support@heartsync.example.com",
    },
    license_info={
        "name": "Medical Software License",
        "url": "https://heartsync.example.com/medical-license",
    },
    docs_url="/docs",  # Swagger UI endpoint
    redoc_url="/redoc",  # ReDoc endpoint
    openapi_tags=[
        {
            "name": "authentication",
            "description": "Doctor authentication and authorization operations",
        },
        {
            "name": "patients",
            "description": "Patient management operations for doctors",
        },
        {
            "name": "vital signs",
            "description": "Patient vital signs monitoring and analysis",
        },
        {
            "name": "risk assessments",
            "description": "AI-powered cardiac risk assessment operations",
        },
        {
            "name": "medical records",
            "description": "Patient medical document management",
        },
    ]
)

# Configure CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.CORS_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include API router
app.include_router(api_router, prefix="/api/v1")

@app.get("/health")
async def health_check():
    """Check API health status."""
    return {"status": "healthy"}


