
import { PoolClient } from "pg";

export const truncateTable = async (
  _client: PoolClient,
  tablename: string
): Promise<never> => {
  throw new Error(
    `Operación de limpieza deshabilitada para evitar borrar datos: ${tablename}`
  );
};
