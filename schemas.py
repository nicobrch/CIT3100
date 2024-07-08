from pydantic import BaseModel
from typing import Any, List
from datetime import datetime

class CompanyCreate(BaseModel):
    company_name: str

class LocationCreate(BaseModel):
    company_id: int
    location_name: str
    location_country: str
    location_city: str
    location_meta: str

class SensorCreate(BaseModel):
    location_id: int
    sensor_name: str
    sensor_category: str
    sensor_meta: str

class SensorDataCreate(BaseModel):
    sensor_api_key: str
    json_data: List[Any]

class SensorDataGet(BaseModel):
    company_api_key: str
    from_epoch: int
    to_epoch: int
    sensor_id: List[int]
    
class SensorDataResponse(BaseModel):
    id: int
    sensor_id: int
    data: Any
    timestamp: datetime