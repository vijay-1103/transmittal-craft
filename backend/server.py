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

# Transmittal API Endpoints

@api_router.post("/transmittals", response_model=TransmittalResponse)
async def create_transmittal(transmittal_data: TransmittalCreate):
    """Create a new transmittal as draft"""
    transmittal_dict = transmittal_data.dict()
    transmittal_dict['document_count'] = len(transmittal_data.documents)
    transmittal_obj = Transmittal(**transmittal_dict)
    
    # Convert to dict with proper serialization for MongoDB
    insert_dict = transmittal_obj.dict()
    # Convert date objects to ISO format strings for MongoDB
    if isinstance(insert_dict.get('transmittal_date'), date):
        insert_dict['transmittal_date'] = insert_dict['transmittal_date'].isoformat()
    
    await db.transmittals.insert_one(insert_dict)
    return TransmittalResponse(**transmittal_obj.dict())

@api_router.get("/transmittals", response_model=List[TransmittalResponse])
async def get_transmittals(
    status: Optional[str] = None,
    skip: int = 0,
    limit: int = 9
):
    """Get transmittals with optional filtering and pagination"""
    query = {}
    if status and status != "all":
        query["status"] = status
    
    transmittals = await db.transmittals.find(query).sort("created_date", -1).skip(skip).limit(limit).to_list(limit)
    return [TransmittalResponse(**transmittal) for transmittal in transmittals]

@api_router.get("/transmittals/count")
async def get_transmittals_count(status: Optional[str] = None):
    """Get total count of transmittals"""
    query = {}
    if status and status != "all":
        query["status"] = status
    
    count = await db.transmittals.count_documents(query)
    return {"count": count}

@api_router.get("/transmittals/{transmittal_id}", response_model=TransmittalResponse)
async def get_transmittal(transmittal_id: str):
    """Get a specific transmittal by ID"""
    transmittal = await db.transmittals.find_one({"id": transmittal_id})
    if not transmittal:
        raise HTTPException(status_code=404, detail="Transmittal not found")
    return TransmittalResponse(**transmittal)

@api_router.put("/transmittals/{transmittal_id}", response_model=TransmittalResponse)
async def update_transmittal(transmittal_id: str, update_data: TransmittalUpdate):
    """Update a transmittal (only if status is draft)"""
    transmittal = await db.transmittals.find_one({"id": transmittal_id})
    if not transmittal:
        raise HTTPException(status_code=404, detail="Transmittal not found")
    
    if transmittal.get("status") != "draft":
        raise HTTPException(status_code=400, detail="Cannot edit generated transmittal")
    
    update_dict = {k: v for k, v in update_data.dict().items() if v is not None}
    if 'documents' in update_dict:
        update_dict['document_count'] = len(update_dict['documents'])
    
    # Convert date objects to ISO format strings for MongoDB
    if 'transmittal_date' in update_dict and isinstance(update_dict['transmittal_date'], date):
        update_dict['transmittal_date'] = update_dict['transmittal_date'].isoformat()
    
    await db.transmittals.update_one(
        {"id": transmittal_id},
        {"$set": update_dict}
    )
    
    updated_transmittal = await db.transmittals.find_one({"id": transmittal_id})
    return TransmittalResponse(**updated_transmittal)

@api_router.delete("/transmittals/{transmittal_id}")
async def delete_transmittal(transmittal_id: str):
    """Delete a transmittal (only if status is draft)"""
    transmittal = await db.transmittals.find_one({"id": transmittal_id})
    if not transmittal:
        raise HTTPException(status_code=404, detail="Transmittal not found")
    
    if transmittal.get("status") != "draft":
        raise HTTPException(status_code=400, detail="Cannot delete generated transmittal")
    
    await db.transmittals.delete_one({"id": transmittal_id})
    return {"message": "Transmittal deleted successfully"}

@api_router.post("/transmittals/{transmittal_id}/generate", response_model=TransmittalResponse)
async def generate_transmittal(transmittal_id: str):
    """Generate a transmittal (change status from draft to generated)"""
    transmittal = await db.transmittals.find_one({"id": transmittal_id})
    if not transmittal:
        raise HTTPException(status_code=404, detail="Transmittal not found")
    
    if transmittal.get("status") != "draft":
        raise HTTPException(status_code=400, detail="Transmittal already generated")
    
    # Generate transmittal number
    count = await db.transmittals.count_documents({"status": {"$ne": "draft"}})
    transmittal_number = f"TRN-{datetime.now().year}-{str(count + 1).zfill(3)}"
    
    await db.transmittals.update_one(
        {"id": transmittal_id},
        {"$set": {
            "status": "generated",
            "transmittal_number": transmittal_number,
            "generated_date": datetime.utcnow()
        }}
    )
    
    updated_transmittal = await db.transmittals.find_one({"id": transmittal_id})
    return TransmittalResponse(**updated_transmittal)

@api_router.post("/transmittals/{transmittal_id}/duplicate", response_model=TransmittalResponse)
async def duplicate_transmittal(transmittal_id: str, mode: str = "opposite"):
    """Duplicate transmittal with opposite send mode or same mode"""
    transmittal = await db.transmittals.find_one({"id": transmittal_id})
    if not transmittal:
        raise HTTPException(status_code=404, detail="Transmittal not found")
    
    # Create duplicate
    duplicate_dict = dict(transmittal)
    duplicate_dict.pop("_id", None)  # Remove MongoDB _id
    duplicate_dict["id"] = str(uuid.uuid4())
    duplicate_dict["status"] = "draft"
    duplicate_dict["transmittal_number"] = None
    duplicate_dict["generated_date"] = None
    duplicate_dict["created_date"] = datetime.utcnow()
    duplicate_dict["send_details"] = None
    duplicate_dict["receive_details"] = None
    duplicate_dict["sent_status"] = None
    duplicate_dict["received_status"] = None
    
    # Change send mode if mode is opposite
    if mode == "opposite":
        duplicate_dict["send_mode"] = "Hardcopy" if transmittal["send_mode"] == "Softcopy" else "Softcopy"
        duplicate_dict["title"] = f"{duplicate_dict['title']} - {duplicate_dict['send_mode']} Copy"
    else:
        duplicate_dict["title"] = f"{duplicate_dict['title']} - Copy"
    
    await db.transmittals.insert_one(duplicate_dict)
    return TransmittalResponse(**duplicate_dict)

@api_router.post("/transmittals/{transmittal_id}/send")
async def update_send_status(transmittal_id: str, send_details: SendDetails, sent_status: str):
    """Update send details and status"""
    transmittal = await db.transmittals.find_one({"id": transmittal_id})
    if not transmittal:
        raise HTTPException(status_code=404, detail="Transmittal not found")
    
    send_dict = send_details.dict()
    # Convert datetime objects to ISO format strings for MongoDB if needed
    if 'send_date' in send_dict and send_dict['send_date'] and isinstance(send_dict['send_date'], (date, datetime)):
        send_dict['send_date'] = send_dict['send_date'].isoformat()
    
    update_data = {
        "status": "sent",
        "send_details": send_dict,
        "sent_status": sent_status
    }
    
    await db.transmittals.update_one(
        {"id": transmittal_id},
        {"$set": update_data}
    )
    
    return {"message": "Send status updated successfully"}

@api_router.post("/transmittals/{transmittal_id}/receive")
async def update_receive_status(transmittal_id: str, receive_details: ReceiveDetails, received_status: str):
    """Update receive details and status"""
    transmittal = await db.transmittals.find_one({"id": transmittal_id})
    if not transmittal:
        raise HTTPException(status_code=404, detail="Transmittal not found")
    
    receive_dict = receive_details.dict()
    # Convert date objects to ISO format strings for MongoDB
    if 'received_date' in receive_dict and isinstance(receive_dict['received_date'], date):
        receive_dict['received_date'] = receive_dict['received_date'].isoformat()
    
    update_data = {
        "status": "received",
        "receive_details": receive_dict,
        "received_status": received_status
    }
    
    await db.transmittals.update_one(
        {"id": transmittal_id},
        {"$set": update_data}
    )
    
    return {"message": "Receive status updated successfully"}

@api_router.post("/transmittals/upload-receipt")
async def upload_receipt(file: UploadFile = File(...)):
    """Upload receipt file and return base64 encoded string"""
    if not file.content_type.startswith(('image/', 'application/pdf')):
        raise HTTPException(status_code=400, detail="Only images and PDF files are allowed")
    
    content = await file.read()
    base64_content = base64.b64encode(content).decode('utf-8')
    
    return {
        "filename": file.filename,
        "content_type": file.content_type,
        "base64_content": base64_content
    }

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
