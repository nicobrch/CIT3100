from sqlalchemy import Column, Integer, String, ForeignKey, Text, DateTime
from sqlalchemy.sql import func
from .db import Base

class Admin(Base):
    __tablename__ = "Admin"
    username = Column(String, primary_key=True, index=True)
    password = Column(String, nullable=False)

class Company(Base):
    __tablename__ = "Company"
    id = Column(Integer, primary_key=True, index=True)
    company_name = Column(String, nullable=False)
    company_api_key = Column(String, unique=True, index=True)

class Location(Base):
    __tablename__ = "Location"
    id = Column(Integer, primary_key=True, index=True)
    company_id = Column(Integer, ForeignKey("companies.id"))
    location_name = Column(String, nullable=False)
    location_country = Column(String, nullable=False)
    location_city = Column(String, nullable=False)
    location_meta = Column(String, nullable=False)

class Sensor(Base):
    __tablename__ = "Sensor"
    id = Column(Integer, primary_key=True, index=True)
    location_id = Column(Integer, ForeignKey("locations.id"))
    sensor_name = Column(String, nullable=False)
    sensor_category = Column(String, nullable=False)
    sensor_meta = Column(String)
    sensor_api_key = Column(String, unique=True, index=True)

class SensorData(Base):
    __tablename__ = "SensorData"
    id = Column(Integer, primary_key=True, index=True)
    sensor_id = Column(Integer, ForeignKey("sensors.id"))
    data = Column(Text, nullable=False)
    timestamp = Column(DateTime(timezone=True), server_default=func.now())