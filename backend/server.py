from fastapi import FastAPI, APIRouter, HTTPException, File, UploadFile, Form
from fastapi.responses import JSONResponse
from dotenv import load_dotenv
from starlette.middleware.cors import CORSMiddleware
from motor.motor_asyncio import AsyncIOMotorClient
import os
import logging
from pathlib import Path
from pydantic import BaseModel, Field
from typing import List, Optional, Union
import uuid
from datetime import datetime, date
import base64


ROOT_DIR = Path(__file__).parent
load_dotenv(ROOT_DIR / '.env')

# MongoDB connection
mongo_url = os.environ['MONGO_URL']
client = AsyncIOMotorClient(mongo_url)
db = client[os.environ['DB_NAME']]

# Create the main app without a prefix
app = FastAPI()

# Create a router with the /api prefix
api_router = APIRouter(prefix="/api")


# Define Models
class StatusCheck(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    client_name: str
    timestamp: datetime = Field(default_factory=datetime.utcnow)

class StatusCheckCreate(BaseModel):
    client_name: str

# Transmittal Models
class DocumentItem(BaseModel):
    document_no: str
    title: str
    revision: int
    copies: int
    action: str  # for approval, for planning, etc.

class TransmittalCreate(BaseModel):
    transmittal_type: str  # Drawing, Documents
    department: str  # Architecture, Interior Design, etc.
    design_stage: Optional[str] = None  # Conceptual, Schematic, etc. (only for drawings)
    transmittal_date: date
    send_to: str  # Client, Contractor, etc.
    salutation: str  # Mr, Ms, Dr
    recipient_name: str
    sender_name: str
    sender_designation: str
    send_mode: str  # Hardcopy, Softcopy
    documents: List[DocumentItem]
    title: str
    project_name: Optional[str] = None
    purpose: Optional[str] = None
    remarks: Optional[str] = None

class TransmittalUpdate(BaseModel):
    transmittal_type: Optional[str] = None
    department: Optional[str] = None
    design_stage: Optional[str] = None
    transmittal_date: Optional[date] = None
    send_to: Optional[str] = None
    salutation: Optional[str] = None
    recipient_name: Optional[str] = None
    sender_name: Optional[str] = None
    sender_designation: Optional[str] = None
    send_mode: Optional[str] = None
    documents: Optional[List[DocumentItem]] = None
    title: Optional[str] = None
    project_name: Optional[str] = None
    purpose: Optional[str] = None
    remarks: Optional[str] = None

class SendDetails(BaseModel):
    delivery_person: Optional[str] = None  # Receptionist, Me, Other
    send_date: Optional[datetime] = None

class ReceiveDetails(BaseModel):
    receipt_file: Optional[str] = None  # base64 encoded file
    received_date: Optional[date] = None
    received_time: Optional[str] = None  # HH:MM format

class Transmittal(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    transmittal_number: Optional[str] = None
    transmittal_type: str
    department: str
    design_stage: Optional[str] = None
    transmittal_date: date
    send_to: str
    salutation: str
    recipient_name: str
    sender_name: str
    sender_designation: str
    send_mode: str
    documents: List[DocumentItem]
    title: str
    project_name: Optional[str] = None
    purpose: Optional[str] = None
    remarks: Optional[str] = None
    status: str = "draft"  # draft, generated, sent, received
    document_count: int = 0
    created_date: datetime = Field(default_factory=datetime.utcnow)
    generated_date: Optional[datetime] = None
    send_details: Optional[SendDetails] = None
    receive_details: Optional[ReceiveDetails] = None
    sent_status: Optional[str] = None  # Sent, Not Sent
    received_status: Optional[str] = None  # Received, Not Received

class TransmittalResponse(BaseModel):
    id: str
    transmittal_number: Optional[str] = None
    transmittal_type: str
    department: str
    design_stage: Optional[str] = None
    transmittal_date: date
    send_to: str
    salutation: str
    recipient_name: str
    sender_name: str
    sender_designation: str
    send_mode: str
    documents: List[DocumentItem]
    title: str
    project_name: Optional[str] = None
    purpose: Optional[str] = None
    remarks: Optional[str] = None
    status: str
    document_count: int
    created_date: datetime
    generated_date: Optional[datetime] = None
    send_details: Optional[SendDetails] = None
    receive_details: Optional[ReceiveDetails] = None
    sent_status: Optional[str] = None
    received_status: Optional[str] = None

# Add your routes to the router instead of directly to app
@api_router.get("/")
async def root():
    return {"message": "Hello World"}

@api_router.post("/status", response_model=StatusCheck)
async def create_status_check(input: StatusCheckCreate):
    status_dict = input.dict()
    status_obj = StatusCheck(**status_dict)
    _ = await db.status_checks.insert_one(status_obj.dict())
    return status_obj

@api_router.get("/status", response_model=List[StatusCheck])
async def get_status_checks():
    status_checks = await db.status_checks.find().to_list(1000)
    return [StatusCheck(**status_check) for status_check in status_checks]

# Include the router in the main app
app.include_router(api_router)

app.add_middleware(
    CORSMiddleware,
    allow_credentials=True,
    allow_origins=os.environ.get('CORS_ORIGINS', '*').split(','),
    allow_methods=["*"],
    allow_headers=["*"],
)

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)

@app.on_event("shutdown")
async def shutdown_db_client():
    client.close()
