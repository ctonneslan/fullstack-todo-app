/**
 * Database Setup Helper for Tests
 * Initializes the database schema before running tests
 */

import { readFileSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import pool from '../../config/database.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

export async function setupDatabase() {
  try {
    // Read the init.sql file
    const initSqlPath = join(__dirname, '../../../init.sql');
    const initSql = readFileSync(initSqlPath, 'utf8');

    // Execute the SQL to create tables
    await pool.query(initSql);
    console.log('✓ Database schema initialized');
  } catch (error) {
    console.error('Failed to initialize database schema:', error);
    throw error;
  }
}

export async function teardownDatabase() {
  try {
    await pool.end();
  } catch (error) {
    console.error('Failed to close database connection:', error);
  }
}
