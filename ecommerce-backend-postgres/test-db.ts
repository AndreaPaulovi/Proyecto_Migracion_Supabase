
import pool from "./src/database/db";

async function testConnection() {
  try {
    const result = await pool.query(
      "SELECT current_database() AS database, NOW() AS server_time"
    );

    console.log("¡Conexión exitosa con Supabase!");
    console.log("Base de datos:", result.rows[0].database);
    console.log("Hora del servidor:", result.rows[0].server_time);
  } catch (error) {
    console.error("Error al conectar con Supabase:", error);
  } finally {
    await pool.end();
  }
}

testConnection();
