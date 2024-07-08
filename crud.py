from sqlalchemy.orm import Session
from . import models, schemas
from datetime import datetime
import string
import random

def generate_api_key(length=128) -> str:
    random.seed(datetime.now().timestamp())
    characters = string.ascii_letters + string.digits
    return ''.join(random.choice(characters) for i in range(length))

def create_company(db: Session, company: schemas.CompanyCreate):
    db_company = models.Company(company_name=company.company_name, company_api_key=generate_api_key())
    db.add(db_company)
    db.commit()
    db.refresh(db_company)
    return db_company

def get_company_by_id(db: Session, company_id: int):
    return db.query(models.Company).filter(models.Company.id == company_id).first()

def create_sensor(db: Session, sensor: schemas.SensorCreate):
    db_sensor = models.Sensor(location_id=sensor.location_id, sensor_name=sensor.sensor_name, sensor_category=sensor.sensor_category, sensor_meta=sensor.sensor_meta, sensor_api_key=generate_api_key())
    db.add(db_sensor)
    db.commit()
    db.refresh(db_sensor)
    return db_sensor

def get_sensor_by_id(db: Session, sensor_id: int):
    return db.query(models.Sensor).filter(models.Sensor.id == sensor_id).first()

def get_sensor_by_name(db: Session, sensor_name: str):
    return db.query(models.Sensor).filter(models.Sensor.sensor_name == sensor_name).first()

def get_sensor_by_api_key(db: Session, sensor_api_key: str):
    return db.query(models.Sensor).filter(models.Sensor.sensor_api_key == sensor_api_key).first()

def create_sensor_data(db: Session, sensor_data: schemas.SensorDataCreate):
    db_sensor_data = models.SensorData(sensor_id=sensor_data.sensor_id, data=sensor_data.data)
    db.add(db_sensor_data)
    db.commit()
    db.refresh(db_sensor_data)
    return db_sensor_data

def get_sensor_data_by_sensor_id(db: Session, sensor_id: int):
    return db.query(models.SensorData).filter(models.SensorData.sensor_id == sensor_id).all()