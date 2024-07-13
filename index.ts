import { db } from "./db";
import { eq, and, gte, lte, inArray } from "drizzle-orm";
import * as schema from "./schema";
import express from "express";
import cors from "cors";

const app = express();
const port = 8080;
const url = "/api/v1/";

app.use(cors());
app.use(express.json());

app.get('/', (req, res) => {
  res.send('Hello World!');
});

/* POST sensor data */
app.post(url.concat("sensor_data"), async (req, res) => {
  const { apiKey, data } = req.body;
  if (!apiKey || !data) {
    return res.status(400).send("Missing required fields");
  }

  // Revisar si está bien la API key
  const sensorResult = await db.select().from(schema.sensor).where(eq(schema.sensor.sensor_api_key, apiKey));
  if (sensorResult.length === 0) {
    return res.status(400).send("Invalid API Key");
  }

  // Insertar el sensor data
  const sensorResultId = sensorResult[0].id;
  await db.insert(schema.sensor_data).values([
    {
      sensor_id: sensorResultId,
      data: JSON.stringify(data)
    }
  ]);

  return res.status(201).send("Se insertó correctamente el sensor data.");
});

/* GET sensor data */
app.get(url.concat("sensor_data"), async (req, res) => {
  const { companyApiKey, fromEpoch, toEpoch, sensorIds } = req.query;
  if (typeof companyApiKey !== "string" || typeof fromEpoch !== "string" || typeof toEpoch !== "string" || typeof sensorIds !== "string") {
    return res.status(400).send("Missing required fields");
  }

  // Revisar si está bien la company API key
  const companyResult = await db.select().from(schema.company).where(eq(schema.company.company_api_key, companyApiKey));
  if (companyResult.length === 0) {
    return res.status(401).send("Invalid API Key");
  }

  // Revisar si sensorIds tiene el formato "[1, 2, 3]"
  const parsedSensorIds = JSON.parse(sensorIds);
  if (!Array.isArray(parsedSensorIds)) {
    return res.status(400).send("Invalid sensorIds format");
  }

  // Buscar los sensores pertenecientes a la compañía
  const sensorResult = await db.select().from(schema.sensor)
    .innerJoin(schema.location, eq(schema.sensor.location_id, schema.location.id))
    .where(eq(schema.location.company_id, companyResult[0].id)
  );
  if (sensorResult.length === 0) {
    return res.status(404).send("No sensors found.");
  }

  // Filtrar los sensores que pertenecen a la compañía, y que están en el parámetro de sensorIds
  const companySensorIds = sensorResult.map((sensor) => sensor.sensor.id);
  const filteredSensorIds = parsedSensorIds.filter((sensorId) => companySensorIds.includes(sensorId));
  if (filteredSensorIds.length === 0) {
    return res.status(404).send("No sensors found for the company.");
  }

  // Obtener los sensor data que cumplen con los filtros
  const sensorDataResult = await db.select().from(schema.sensor_data).where(
    and(
      inArray(schema.sensor_data.sensor_id, filteredSensorIds),
      gte(schema.sensor_data.timestamp, fromEpoch),
      lte(schema.sensor_data.timestamp, toEpoch)
    )
  );

  if (sensorDataResult.length === 0) {
    return res.status(404).send("No sensor data found");
  }

  return res.status(200).json(sensorDataResult);
});

/* GET ubicacion, mostrar todos */
app.get(url.concat("location"), async (req, res) => {
  const { companyApiKey } = req.query;
  if (typeof companyApiKey !== "string") {
    return res.status(400).send("Missing required fields.");
  }

  const companyResult = await db.select().from(schema.company).where(eq(schema.company.company_api_key, companyApiKey));
  if (companyResult.length === 0) {
    return res.status(401).send("Invalid API Key");
  }

  const locationResult = await db.select().from(schema.location).where(eq(schema.location.company_id, companyResult[0].id));
  if (locationResult.length === 0) {
    return res.status(404).send("No locations found.");
  }

  return res.status(200).json(locationResult);
});

/* GET ubicacion, mostrar uno */
app.get(url.concat("location/:locationName"), async (req, res) => {
  const { companyApiKey } = req.query;
  const { locationName } = req.params;
  if (typeof companyApiKey !== "string" || !locationName) {
    return res.status(400).send("Missing required fields.");
  }

  const companyResult = await db.select().from(schema.company).where(eq(schema.company.company_api_key, companyApiKey));
  if (companyResult.length === 0) {
    return res.status(401).send("Invalid API Key");
  }

  const locationResult = await db.select().from(schema.location).where(
    and(
      eq(schema.location.location_name, locationName),
      eq(schema.location.company_id, companyResult[0].id)
    )
  );

  if (locationResult.length === 0) {
    return res.status(404).send("Location not found");
  }

  return res.status(200).json(locationResult);
});

/* UPDATE ubicacion */
app.put(url.concat("location"), async (req, res) => {
  const { companyApiKey, locationName, locationCountry, locationCity, locationMeta } = req.body;
  if (!companyApiKey || !locationName) {
    return res.status(400).send("Missing required fields.");
  }

  const companyResult = await db.select().from(schema.company).where(eq(schema.company.company_api_key, companyApiKey));
  if (companyResult.length === 0) {
    return res.status(401).send("Invalid API Key");
  }

  const locationResult = await db.update(schema.location)
    .set({location_name: locationName, location_country: locationCountry, location_city: locationCity, location_meta: locationMeta})
    .where(and(eq(schema.location.company_id, companyResult[0].id), eq(schema.location.location_name, locationName)))
    .returning({ updatedId: schema.location.id });

  return res.status(200).json(locationResult);
});

/* DELETE ubicacion */
app.delete(url.concat("location"), async (req, res) => {
  const { companyApiKey, locationName } = req.body;
  if (!companyApiKey || !locationName) {
    return res.status(400).send("Missing required fields.");
  }

  const companyResult = await db.select().from(schema.company).where(eq(schema.company.company_api_key, companyApiKey));
  if (companyResult.length === 0) {
    return res.status(401).send("Invalid API Key");
  }

  const locationResult = await db.delete(schema.location).where(
    and(
      eq(schema.location.company_id, companyResult[0].id),
      eq(schema.location.location_name, locationName)
    )
  ).returning({ deletedId: schema.location.id });

  return res.status(200).json(locationResult);
});

/* GET sensor, mostrar todos */
app.get(url.concat("sensor"), async (req, res) => {
  const { companyApiKey } = req.query;
  if (typeof companyApiKey !== "string") {
    return res.status(400).send("Missing required fields.");
  }

  const companyResult = await db.select().from(schema.company).where(eq(schema.company.company_api_key, companyApiKey));
  if (companyResult.length === 0) {
    return res.status(401).send("Invalid API Key");
  }

  const sensorResult = await db.select().from(schema.sensor)
    .innerJoin(schema.location, eq(schema.sensor.location_id, schema.location.id))
    .where(eq(schema.location.company_id, companyResult[0].id)
  );
  if (sensorResult.length === 0) {
    return res.status(404).send("No sensors found.");
  }

  return res.status(200).json(sensorResult);
});

/* GET sensor, mostrar uno */
app.get(url.concat("sensor/:sensorId"), async (req, res) => {
  const { companyApiKey } = req.query;
  const { sensorId } = req.params;
  if (typeof companyApiKey !== "string" || !sensorId) {
    return res.status(400).send("Missing required fields.");
  }

  const companyResult = await db.select().from(schema.company).where(eq(schema.company.company_api_key, companyApiKey));
  if (companyResult.length === 0) {
    return res.status(401).send("Invalid API Key");
  }

  const sensorResult = await db.select().from(schema.sensor)
    .innerJoin(schema.location, eq(schema.sensor.location_id, schema.location.id))
    .where(and(eq(schema.location.company_id, companyResult[0].id), eq(schema.sensor.id, parseInt(sensorId)))
  );
  if (sensorResult.length === 0) {
    return res.status(404).send("No sensors found.");
  }

  return res.status(200).json(sensorResult);
});

/* UPDATE sensor */
app.put(url.concat("sensor"), async (req, res) => {
  const { companyApiKey, sensorId, sensorName, sensorCategory, sensorMeta, locationId } = req.body;
  if (!companyApiKey || !sensorId) {
    return res.status(400).send("Missing required fields.");
  }

  const companyResult = await db.select().from(schema.company).where(eq(schema.company.company_api_key, companyApiKey));
  if (companyResult.length === 0) {
    return res.status(401).send("Invalid API Key");
  }

  const locationResult = await db.select().from(schema.location).where(eq(schema.location.company_id, companyResult[0].id));
  if (locationResult.length === 0) {
    return res.status(404).send("No locations found for this company.");
  }
  const locationIds = locationResult.map((location) => location.id);

  const sensorResult = await db.update(schema.sensor)
    .set({sensor_name: sensorName, sensor_category: sensorCategory, sensor_meta: sensorMeta, location_id: locationId})
    .where(
      and(
        eq(schema.sensor.id, parseInt(sensorId)),
        inArray(schema.sensor.location_id, locationIds)
      )
    )
    .returning({ updatedId: schema.sensor.id }
  );

  return res.status(200).json(sensorResult);
});

/* DELETE sensor */
app.delete(url.concat("sensor"), async (req, res) => {
  const { companyApiKey, sensorId } = req.body;
  if (!companyApiKey || !sensorId) {
    return res.status(400).send("Missing required fields.");
  }

  const companyResult = await db.select().from(schema.company).where(eq(schema.company.company_api_key, companyApiKey));
  if (companyResult.length === 0) {
    return res.status(401).send("Invalid API Key");
  }

  const locationResult = await db.select().from(schema.location).where(eq(schema.location.company_id, companyResult[0].id));
  if (locationResult.length === 0) {
    return res.status(404).send("No locations found for this company.");
  }
  const locationIds = locationResult.map((location) => location.id);

  const sensorResult = await db.delete(schema.sensor)
    .where(
      and(
        eq(schema.sensor.id, parseInt(sensorId)),
        inArray(schema.sensor.location_id, locationIds)
      )
    )
    .returning({ deletedId: schema.sensor.id }
  );

  return res.status(200).json(sensorResult);
});

app.listen(port, () => {
  console.log(`Listening on port ${port}...`);
});