from fastapi import FastAPI, Depends, HTTPException
from sqlalchemy.orm import Session
from . import models, schemas, crud, db
from typing import List

models.Base.metadata.create_all(bind=db.engine)

app = FastAPI()

def get_db():
    database = db.SessionLocal()
    try:
        yield database
    finally:
        database.close()

@app.post("/api/v1/sensor_data/", response_model=schemas.SensorDataResponse)
def create_sensor_data(sensor_data: schemas.SensorDataCreate, db: Session = Depends(get_db)):
    return crud.create_sensor_data(db=db, sensor_data=sensor_data)

@app.get("/api/v1/sensor_data/{sensor_id}", response_model=List[schemas.SensorDataResponse])
def get_sensor_data(sensor_id: int, db: Session = Depends(get_db)):
    return crud.get_sensor_data(db=db, sensor_id=sensor_id)
