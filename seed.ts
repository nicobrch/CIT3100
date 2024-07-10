import { db } from './db';
import { eq } from 'drizzle-orm';
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
    }
  ]);

  const companyIdResult = await db.select({id: schema.company.id}).from(schema.company).where(eq(schema.company.company_name, 'compania1'));
  const companyId = companyIdResult[0].id;
  
  await db.insert(schema.location).values([
    {
      location_name: 'ubicacion1',
      location_country: 'chile',
      location_city: 'santiago',
      company_id: companyId,
    }
  ]);

  const locationIdResult = await db.select({id: schema.location.id}).from(schema.location).where(eq(schema.location.location_name, 'ubicacion1'));
  const locationId = locationIdResult[0].id;
  
  await db.insert(schema.sensor).values([
    {
      sensor_name: 'sensor1',
      sensor_category: 'temperatura',
      sensor_api_key: generateApiKey(),
      location_id: locationId,
    },
    {
      sensor_name: 'sensor2',
      sensor_category: 'humedad',
      sensor_api_key: generateApiKey(),
      location_id: locationId,
    }
  ]);
}

seedTables().catch(console.error);