from fastapi import FastAPI, Depends, HTTPException, status
from sqlalchemy.orm import Session
import models
import schemas
import db

models.Base.metadata.create_all(bind=db.engine)

app = FastAPI()

def get_db():
    database = db.SessionLocal()
    try:
        yield database
    finally:
        database.close()

# -- API Endpoints SensorData -- #
@app.post("/sensor_data/", status_code=status.HTTP_201_CREATED)
def create_sensor_data(data: schemas.SensorDataCreate, db: Session = Depends(get_db)):
    # Buscar sensor por API Key
    db_sensor = db.query(models.Sensor).filter(models.Sensor.sensor_api_key == data.sensor_api_key).first()
    if db_sensor is None:
        raise HTTPException(status_code=404, detail="Invalid sensor API Key")
    for item in data.json_data:
        db_sensor_data = models.SensorData(sensor_id=db_sensor.id, json_data=item)
        db.add(db_sensor_data)
    db.commit()
    return {"message": "Sensor data inserted successfully"}

@app.get("/sensor_data/")
def get_sensor_data(data: schemas.SensorDataGet, db: Session = Depends(get_db)):
    # Buscar compañía por API Key
    db_company = db.query(models.Company).filter(models.Company.company_api_key == data.company_api_key).first()
    if db_company is None:
        raise HTTPException(status_code=400, detail="Invalid company API key")
    
    results = db.query(models.SensorData).join(models.Sensor).filter(
        models.SensorData.timestamp.between(data.from_epoch, data.to_epoch),
        models.Sensor.id.in_(data.sensor_id),
        models.Sensor.location.has(company_id=db_company.id)
    ).all()
    return results

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="localhost", port=8000)