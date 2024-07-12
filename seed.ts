import { db } from './db';
import * as schema from './schema';
import { hashPassword, generateApiKey } from './utils';

const seedTables = async () => {
  const hashedPassword = await hashPassword('admin');

  await db.insert(schema.admin).values([
    {
      username: 'admin',
      password: hashedPassword,
    }
  ]);

  await db.insert(schema.company).values([
    {
      company_name: 'compania1',
      company_api_key: generateApiKey(),
    },
    {
      company_name: 'compania2',
      company_api_key: generateApiKey(),
    }
  ]);

  const companyIdResult = await db.select({id: schema.company.id}).from(schema.company);
  
  await db.insert(schema.location).values([
    {
      location_name: 'ubicacion1',
      location_country: 'chile',
      location_city: 'santiago',
      company_id: companyIdResult[0].id,
    },
    {
      location_name: 'ubicacion2',
      location_country: 'chile',
      location_city: 'concepcion',
      company_id: companyIdResult[0].id,
    },
    {
      location_name: 'location1',
      location_country: 'usa',
      location_city: 'california',
      company_id: companyIdResult[1].id,
    },
    {
      location_name: 'location2',
      location_country: 'usa',
      location_city: 'newyork',
      company_id: companyIdResult[1].id,
    }
  ]);

  const locationIdResult = await db.select({id: schema.location.id}).from(schema.location);
  
  await db.insert(schema.sensor).values([
    {
      sensor_name: 'sensor1',
      sensor_category: 'temperatura',
      sensor_api_key: generateApiKey(),
      location_id: locationIdResult[0].id,
    },
    {
      sensor_name: 'sensor2',
      sensor_category: 'humedad',
      sensor_api_key: generateApiKey(),
      location_id: locationIdResult[0].id,
    },
    {
      sensor_name: 'sensor1',
      sensor_category: 'presion',
      sensor_api_key: generateApiKey(),
      location_id: locationIdResult[1].id,
    },
    {
      sensor_name: 'sensor2',
      sensor_category: 'sonido',
      sensor_api_key: generateApiKey(),
      location_id: locationIdResult[1].id,
    }
  ]);

  const sensorIdResult = await db.select({id: schema.sensor.id}).from(schema.sensor);
  
  await db.insert(schema.sensor_data).values([
    {
      sensor_id: sensorIdResult[0].id,
      data: [
        {
          value: "hola"
        },
        {
          value: "adios"
        }
      ]
    },
    {
      sensor_id: sensorIdResult[1].id,
      data: [
        {
          value: "hola"
        },
        {
          value: "adios"
        }
      ]
    },
    {
      sensor_id: sensorIdResult[2].id,
      data: [
        {
          value: "hello"
        },
        {
          value: "bye"
        }
      ]
    },
    {
      sensor_id: sensorIdResult[3].id,
      data: [
        {
          value: "hello"
        },
        {
          value: "bye"
        }
      ]
    }
  ]);
}

seedTables().catch(console.error);