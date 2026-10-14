import pool from "../../src/database/db";
import buildInsertQueries from "../../src/utils/query-builder/buildInsertQueries";
import mockShippingMethod from "./data";
import { PoolClient } from "pg";

const seedShipping = async (client: PoolClient) => {
  console.log("Starting shipping seed...");

  const { columnsStr, placeholdersStr, values } =
    buildInsertQueries(mockShippingMethod);

  await client.query(
    `
    INSERT INTO shipping (${columnsStr})
    VALUES (${placeholdersStr})
    `,
    values,
  );

  console.log("Inserted shipping method:", mockShippingMethod.name);

  console.log("\nInserted shipping method successfully\n");
};

export default seedShipping;
