import { db } from "./db";
import { eq, and, gte, lte, inArray } from "drizzle-orm";
import * as schema from "./schema";
import express from "express";
import cors from "cors";

const app = express();
const port = 3000;
const url = "/api/v1/";

app.use(cors());
app.use(express.json());

/* POST sensor data */
app.post(url.concat("sensor_data"), async (req, res) => {
  const { apiKey, data } = req.body;
  if (!apiKey || !data) {
    return res.status(400).send("Missing required fields");
  }

  const sensorResult = await db.select().from(schema.sensor).where(eq(schema.sensor.sensor_api_key, apiKey));
  if (sensorResult.length === 0) {
    return res.status(400).send("Invalid API Key");
  }

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
  const { companyApiKey, fromEpoch, toEpoch, sensorIds } = req.body;
  if (!companyApiKey || !fromEpoch || !toEpoch || !sensorIds) {
    return res.status(400).send("Missing required fields");
  }

  const companyResult = await db.select().from(schema.company).where(eq(schema.company.company_api_key, companyApiKey));
  if (companyResult.length === 0) {
    return res.status(401).send("Invalid API Key");
  }

  const sensorDataResult = await db.select().from(schema.sensor_data).where(
    and(
      inArray(schema.sensor_data.sensor_id, sensorIds),
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
  );

  return res.status(200).json(locationResult);
});

app.listen(port, () => {
  console.log(`Listening on port ${port}...`);
});