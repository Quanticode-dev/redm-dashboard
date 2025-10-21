from fastapi import FastAPI, APIRouter, HTTPException, Depends, status
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from dotenv import load_dotenv
from starlette.middleware.cors import CORSMiddleware
from motor.motor_asyncio import AsyncIOMotorClient
import os
import logging
from pathlib import Path
from pydantic import BaseModel, Field, ConfigDict
from typing import List, Optional
import uuid
from datetime import datetime, timezone, timedelta
import jwt
from passlib.context import CryptContext

ROOT_DIR = Path(__file__).parent
load_dotenv(ROOT_DIR / '.env')

# MongoDB connection
mongo_url = os.environ['MONGO_URL']
client = AsyncIOMotorClient(mongo_url)
db = client[os.environ['DB_NAME']]

# JWT Settings
SECRET_KEY = os.environ.get('JWT_SECRET', 'your-secret-key-change-in-production')
ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_MINUTES = 60 * 24  # 24 hours

# Password hashing
pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")
security = HTTPBearer()

# Create the main app
app = FastAPI()
api_router = APIRouter(prefix="/api")

# --- Models ---
class User(BaseModel):
    model_config = ConfigDict(extra="ignore")
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    username: str
    is_admin: bool = False
    permissions: List[str] = []  # "hunter", "map", "zug"
    created_at: str = Field(default_factory=lambda: datetime.now(timezone.utc).isoformat())

class UserCreate(BaseModel):
    username: str
    password: str
    is_admin: bool = False
    permissions: List[str] = []

class UserUpdate(BaseModel):
    permissions: Optional[List[str]] = None
    is_admin: Optional[bool] = None

class UserLogin(BaseModel):
    username: str
    password: str

class PasswordChange(BaseModel):
    old_password: str
    new_password: str

class Token(BaseModel):
    access_token: str
    token_type: str
    user: User

class InventoryItem(BaseModel):
    model_config = ConfigDict(extra="ignore")
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    name: str
    price: float
    stock: int
    created_at: str = Field(default_factory=lambda: datetime.now(timezone.utc).isoformat())

class InventoryItemCreate(BaseModel):
    name: str
    price: float
    stock: int

class InventoryItemUpdate(BaseModel):
    name: Optional[str] = None
    price: Optional[float] = None
    stock: Optional[int] = None

class StockUpdate(BaseModel):
    item_id: str
    quantity: int  # positive for add, negative for remove
    is_personal_use: bool = False  # For "Eigenbedarf"

class ProtocolLog(BaseModel):
    model_config = ConfigDict(extra="ignore")
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    user_id: str
    username: str
    item_name: str
    action: str  # "added" or "removed"
    quantity: int
    is_personal_use: bool = False  # For "Eigenbedarf"
    timestamp: str = Field(default_factory=lambda: datetime.now(timezone.utc).isoformat())

class MapMarker(BaseModel):
    model_config = ConfigDict(extra="ignore")
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    name: str
    type: str  # "person", "gebaeude", "material"
    is_friendly: bool = True
    map_x: float
    map_y: float
    created_by: str
    created_at: str = Field(default_factory=lambda: datetime.now(timezone.utc).isoformat())

class MapMarkerCreate(BaseModel):
    name: str
    type: str
    is_friendly: bool = True
    map_x: float
    map_y: float

class MapMarkerUpdate(BaseModel):
    name: Optional[str] = None
    type: Optional[str] = None
    is_friendly: Optional[bool] = None
    map_x: Optional[float] = None
    map_y: Optional[float] = None

# --- Helper Functions ---
def hash_password(password: str) -> str:
    return pwd_context.hash(password)

def verify_password(plain_password: str, hashed_password: str) -> bool:
    return pwd_context.verify(plain_password, hashed_password)

def create_access_token(data: dict) -> str:
    to_encode = data.copy()
    expire = datetime.now(timezone.utc) + timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    to_encode.update({"exp": expire})
    encoded_jwt = jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)
    return encoded_jwt

async def get_current_user(credentials: HTTPAuthorizationCredentials = Depends(security)) -> dict:
    try:
        token = credentials.credentials
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        user_id: str = payload.get("sub")
        if user_id is None:
            raise HTTPException(status_code=401, detail="Invalid authentication")
        
        user = await db.users.find_one({"id": user_id}, {"_id": 0})
        if user is None:
            raise HTTPException(status_code=401, detail="User not found")
        return user
    except jwt.ExpiredSignatureError:
        raise HTTPException(status_code=401, detail="Token expired")
    except Exception:
        raise HTTPException(status_code=401, detail="Invalid authentication")

async def get_admin_user(current_user: dict = Depends(get_current_user)) -> dict:
    if not current_user.get("is_admin"):
        raise HTTPException(status_code=403, detail="Admin access required")
    return current_user

# --- Auth Routes ---
@api_router.post("/auth/register", response_model=User)
async def register(user_data: UserCreate):
    # Check if username exists
    existing = await db.users.find_one({"username": user_data.username}, {"_id": 0})
    if existing:
        raise HTTPException(status_code=400, detail="Username already exists")
    
    user_obj = User(
        username=user_data.username,
        is_admin=user_data.is_admin,
        permissions=user_data.permissions
    )
    
    doc = user_obj.model_dump()
    doc["password_hash"] = hash_password(user_data.password)
    
    await db.users.insert_one(doc)
    return user_obj

@api_router.post("/auth/login", response_model=Token)
async def login(credentials: UserLogin):
    user = await db.users.find_one({"username": credentials.username}, {"_id": 0})
    if not user or not verify_password(credentials.password, user["password_hash"]):
        raise HTTPException(status_code=401, detail="Invalid username or password")
    
    access_token = create_access_token(data={"sub": user["id"]})
    user_obj = User(**{k: v for k, v in user.items() if k != "password_hash"})
    
    return Token(access_token=access_token, token_type="bearer", user=user_obj)

@api_router.get("/auth/me", response_model=User)
async def get_me(current_user: dict = Depends(get_current_user)):
    return User(**{k: v for k, v in current_user.items() if k != "password_hash"})

@api_router.post("/auth/change-password")
async def change_password(password_data: PasswordChange, current_user: dict = Depends(get_current_user)):
    user = await db.users.find_one({"id": current_user["id"]}, {"_id": 0})
    if not verify_password(password_data.old_password, user["password_hash"]):
        raise HTTPException(status_code=400, detail="Incorrect old password")
    
    new_hash = hash_password(password_data.new_password)
    await db.users.update_one({"id": current_user["id"]}, {"$set": {"password_hash": new_hash}})
    return {"message": "Password changed successfully"}

# --- Admin User Management Routes ---
@api_router.get("/admin/users", response_model=List[User])
async def get_all_users(admin_user: dict = Depends(get_admin_user)):
    users = await db.users.find({}, {"_id": 0, "password_hash": 0}).to_list(1000)
    return users

@api_router.post("/admin/users", response_model=User)
async def create_user(user_data: UserCreate, admin_user: dict = Depends(get_admin_user)):
    existing = await db.users.find_one({"username": user_data.username}, {"_id": 0})
    if existing:
        raise HTTPException(status_code=400, detail="Username already exists")
    
    user_obj = User(
        username=user_data.username,
        is_admin=user_data.is_admin,
        permissions=user_data.permissions
    )
    
    doc = user_obj.model_dump()
    doc["password_hash"] = hash_password(user_data.password)
    
    await db.users.insert_one(doc)
    return user_obj

@api_router.put("/admin/users/{user_id}", response_model=User)
async def update_user(user_id: str, user_data: UserUpdate, admin_user: dict = Depends(get_admin_user)):
    user = await db.users.find_one({"id": user_id}, {"_id": 0})
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    
    update_data = {}
    if user_data.permissions is not None:
        update_data["permissions"] = user_data.permissions
    if user_data.is_admin is not None:
        update_data["is_admin"] = user_data.is_admin
    
    await db.users.update_one({"id": user_id}, {"$set": update_data})
    updated_user = await db.users.find_one({"id": user_id}, {"_id": 0, "password_hash": 0})
    return User(**updated_user)

@api_router.delete("/admin/users/{user_id}")
async def delete_user(user_id: str, admin_user: dict = Depends(get_admin_user)):
    result = await db.users.delete_one({"id": user_id})
    if result.deleted_count == 0:
        raise HTTPException(status_code=404, detail="User not found")
    return {"message": "User deleted successfully"}

# --- Inventory Routes ---
@api_router.get("/inventory", response_model=List[InventoryItem])
async def get_inventory(current_user: dict = Depends(get_current_user)):
    if "hunter" not in current_user.get("permissions", []):
        raise HTTPException(status_code=403, detail="No permission for Hunter section")
    items = await db.inventory.find({}, {"_id": 0}).to_list(1000)
    return items

@api_router.post("/inventory", response_model=InventoryItem)
async def create_inventory_item(item_data: InventoryItemCreate, current_user: dict = Depends(get_current_user)):
    if "hunter" not in current_user.get("permissions", []):
        raise HTTPException(status_code=403, detail="No permission for Hunter section")
    
    item_obj = InventoryItem(**item_data.model_dump())
    doc = item_obj.model_dump()
    await db.inventory.insert_one(doc)
    return item_obj

@api_router.put("/inventory/{item_id}", response_model=InventoryItem)
async def update_inventory_item(item_id: str, item_data: InventoryItemUpdate, current_user: dict = Depends(get_current_user)):
    if "hunter" not in current_user.get("permissions", []):
        raise HTTPException(status_code=403, detail="No permission for Hunter section")
    
    item = await db.inventory.find_one({"id": item_id}, {"_id": 0})
    if not item:
        raise HTTPException(status_code=404, detail="Item not found")
    
    update_data = {k: v for k, v in item_data.model_dump().items() if v is not None}
    if update_data:
        await db.inventory.update_one({"id": item_id}, {"$set": update_data})
    
    updated_item = await db.inventory.find_one({"id": item_id}, {"_id": 0})
    return InventoryItem(**updated_item)

@api_router.delete("/inventory/{item_id}")
async def delete_inventory_item(item_id: str, current_user: dict = Depends(get_current_user)):
    if "hunter" not in current_user.get("permissions", []):
        raise HTTPException(status_code=403, detail="No permission for Hunter section")
    
    result = await db.inventory.delete_one({"id": item_id})
    if result.deleted_count == 0:
        raise HTTPException(status_code=404, detail="Item not found")
    return {"message": "Item deleted successfully"}

@api_router.post("/inventory/stock")
async def update_stock(stock_data: StockUpdate, current_user: dict = Depends(get_current_user)):
    if "hunter" not in current_user.get("permissions", []):
        raise HTTPException(status_code=403, detail="No permission for Hunter section")
    
    item = await db.inventory.find_one({"id": stock_data.item_id}, {"_id": 0})
    if not item:
        raise HTTPException(status_code=404, detail="Item not found")
    
    new_stock = item["stock"] + stock_data.quantity
    if new_stock < 0:
        raise HTTPException(status_code=400, detail="Insufficient stock")
    
    await db.inventory.update_one({"id": stock_data.item_id}, {"$set": {"stock": new_stock}})
    
    # Log to protocol
    action = "added" if stock_data.quantity > 0 else "removed"
    log = ProtocolLog(
        user_id=current_user["id"],
        username=current_user["username"],
        item_name=item["name"],
        action=action,
        quantity=abs(stock_data.quantity),
        is_personal_use=stock_data.is_personal_use
    )
    await db.protocol.insert_one(log.model_dump())
    
    return {"message": "Stock updated successfully", "new_stock": new_stock}

# --- Protocol Routes ---
@api_router.get("/protocol", response_model=List[ProtocolLog])
async def get_protocol(current_user: dict = Depends(get_current_user)):
    if "hunter" not in current_user.get("permissions", []):
        raise HTTPException(status_code=403, detail="No permission for Hunter section")
    logs = await db.protocol.find({}, {"_id": 0}).sort("timestamp", -1).to_list(1000)
    return logs

@api_router.delete("/protocol/{log_id}")
async def delete_protocol_log(log_id: str, admin_user: dict = Depends(get_admin_user)):
    result = await db.protocol.delete_one({"id": log_id})
    if result.deleted_count == 0:
        raise HTTPException(status_code=404, detail="Log entry not found")
    return {"message": "Log entry deleted successfully"}

# --- Map Marker Routes ---
@api_router.get("/map/markers", response_model=List[MapMarker])
async def get_markers(current_user: dict = Depends(get_current_user)):
    if "map" not in current_user.get("permissions", []):
        raise HTTPException(status_code=403, detail="No permission for Map section")
    markers = await db.map_markers.find({}, {"_id": 0}).to_list(1000)
    return markers

@api_router.post("/map/markers", response_model=MapMarker)
async def create_marker(marker_data: MapMarkerCreate, current_user: dict = Depends(get_current_user)):
    if "map" not in current_user.get("permissions", []):
        raise HTTPException(status_code=403, detail="No permission for Map section")
    
    marker_obj = MapMarker(
        **marker_data.model_dump(),
        created_by=current_user["username"]
    )
    
    doc = marker_obj.model_dump()
    await db.map_markers.insert_one(doc)
    return marker_obj

@api_router.put("/map/markers/{marker_id}", response_model=MapMarker)
async def update_marker(marker_id: str, marker_data: MapMarkerUpdate, current_user: dict = Depends(get_current_user)):
    if "map" not in current_user.get("permissions", []):
        raise HTTPException(status_code=403, detail="No permission for Map section")
    
    marker = await db.map_markers.find_one({"id": marker_id}, {"_id": 0})
    if not marker:
        raise HTTPException(status_code=404, detail="Marker not found")
    
    update_data = {k: v for k, v in marker_data.model_dump().items() if v is not None}
    if update_data:
        await db.map_markers.update_one({"id": marker_id}, {"$set": update_data})
    
    updated_marker = await db.map_markers.find_one({"id": marker_id}, {"_id": 0})
    return MapMarker(**updated_marker)

@api_router.delete("/map/markers/{marker_id}")
async def delete_marker(marker_id: str, current_user: dict = Depends(get_current_user)):
    if "map" not in current_user.get("permissions", []):
        raise HTTPException(status_code=403, detail="No permission for Map section")
    
    result = await db.map_markers.delete_one({"id": marker_id})
    if result.deleted_count == 0:
        raise HTTPException(status_code=404, detail="Marker not found")
    return {"message": "Marker deleted successfully"}

# Include router
app.include_router(api_router)

app.add_middleware(
    CORSMiddleware,
    allow_credentials=True,
    allow_origins=os.environ.get('CORS_ORIGINS', '*').split(','),
    allow_methods=["*"],
    allow_headers=["*"],
)

logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)

@app.on_event("shutdown")
async def shutdown_db_client():
    client.close()