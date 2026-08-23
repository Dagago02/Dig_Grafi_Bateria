from datetime import datetime
from typing import Optional
from pydantic import BaseModel, EmailStr, Field, ConfigDict

class CompanyBase(BaseModel):
    nombre: str = Field(..., min_length=1, max_length=100)
    NIT: str = Field(..., min_length=5, max_length=50)
    email: Optional[EmailStr] = None
    telefono: Optional[str] = None
    direccion: Optional[str] = None
    estado: Optional[str] = "activo"  # "activo" o "inactivo"

class CompanyCreate(CompanyBase):
    pass

class CompanyUpdate(BaseModel):
    nombre: Optional[str] = Field(None, min_length=1, max_length=100)
    NIT: Optional[str] = Field(None, min_length=5, max_length=50)
    email: Optional[EmailStr] = None
    telefono: Optional[str] = None
    direccion: Optional[str] = None
    estado: Optional[str] = None

class CompanyResponse(CompanyBase):
    id: int
    created_at: datetime
    updated_at: datetime

    model_config = ConfigDict(from_attributes=True)
