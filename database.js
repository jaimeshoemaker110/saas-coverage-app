const sqlite3 = require('sqlite3').verbose();
const path = require('path');

// Database file path
const DB_PATH = path.join(__dirname, 'data', 'saas.db');

// Initialize database with schema
function initDatabase() {
  return new Promise((resolve, reject) => {
    const db = new sqlite3.Database(DB_PATH, (err) => {
      if (err) {
        reject(err);
        return;
      }
      console.log('Connected to SQLite database');
    });

    // Create tables
    db.serialize(() => {
      // Coverage table
      db.run(`
        CREATE TABLE IF NOT EXISTS coverage (
          coverage_id TEXT PRIMARY KEY,
          coverage_name TEXT
        )
      `, (err) => {
        if (err) console.error('Error creating coverage table:', err);
      });

      // Customer-Product relationship table
      db.run(`
        CREATE TABLE IF NOT EXISTS customer_product (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          coverage_id TEXT NOT NULL,
          customer_name TEXT NOT NULL,
          product_name TEXT NOT NULL,
          FOREIGN KEY (coverage_id) REFERENCES coverage(coverage_id)
        )
      `, (err) => {
        if (err) console.error('Error creating customer_product table:', err);
      });

      // Data targets table
      db.run(`
        CREATE TABLE IF NOT EXISTS data_target (
          coverage_id TEXT PRIMARY KEY,
          target_value INTEGER NOT NULL,
          FOREIGN KEY (coverage_id) REFERENCES coverage(coverage_id)
        )
      `, (err) => {
        if (err) console.error('Error creating data_target table:', err);
      });

      // Auto targets table
      db.run(`
        CREATE TABLE IF NOT EXISTS auto_target (
          coverage_id TEXT PRIMARY KEY,
          target_value INTEGER NOT NULL,
          FOREIGN KEY (coverage_id) REFERENCES coverage(coverage_id)
        )
      `, (err) => {
        if (err) console.error('Error creating auto_target table:', err);
        resolve(db);
      });
    });
  });
}

// Get all unique coverage IDs
function getAllCoverageIds(db) {
  return new Promise((resolve, reject) => {
    const query = `
      SELECT DISTINCT coverage_id 
      FROM coverage 
      ORDER BY coverage_id
    `;
    
    db.all(query, [], (err, rows) => {
      if (err) {
        reject(err);
        return;
      }
      resolve(rows);
    });
  });
}

// Get coverage details by ID
function getCoverageDetails(db, coverageId) {
  return new Promise((resolve, reject) => {
    const queries = {
      customers: `
        SELECT DISTINCT customer_name, product_name
        FROM customer_product
        WHERE coverage_id = ?
        ORDER BY customer_name, product_name
      `,
      dataTarget: `
        SELECT target_value
        FROM data_target
        WHERE coverage_id = ?
      `,
      autoTarget: `
        SELECT target_value
        FROM auto_target
        WHERE coverage_id = ?
      `
    };

    const result = {
      coverageId: coverageId,
      customers: [],
      products: [],
      dataTarget: null,
      autoTarget: null
    };

    // Get customers and products
    db.all(queries.customers, [coverageId], (err, rows) => {
      if (err) {
        reject(err);
        return;
      }

      // Group by customer
      const customerMap = new Map();
      rows.forEach(row => {
        if (!customerMap.has(row.customer_name)) {
          customerMap.set(row.customer_name, []);
        }
        customerMap.get(row.customer_name).push(row.product_name);
      });

      result.customers = Array.from(customerMap.entries()).map(([name, products]) => ({
        name,
        products
      }));

      // Get unique products
      result.products = [...new Set(rows.map(r => r.product_name))];

      // Get data target
      db.get(queries.dataTarget, [coverageId], (err, row) => {
        if (!err && row) {
          result.dataTarget = row.target_value;
        }

        // Get auto target
        db.get(queries.autoTarget, [coverageId], (err, row) => {
          if (!err && row) {
            result.autoTarget = row.target_value;
          }

          resolve(result);
        });
      });
    });
  });
}

// Get coverage details for multiple IDs
function getMultipleCoverageDetails(db, coverageIds) {
  return new Promise(async (resolve, reject) => {
    try {
      const results = [];
      
      for (const coverageId of coverageIds) {
        const details = await getCoverageDetails(db, coverageId);
        results.push(details);
      }
      
      resolve(results);
    } catch (error) {
      reject(error);
    }
  });
}

// Get database connection
function getDatabase() {
  return new Promise((resolve, reject) => {
    const db = new sqlite3.Database(DB_PATH, (err) => {
      if (err) {
        reject(err);
        return;
      }
      resolve(db);
    });
  });
}

module.exports = {
  initDatabase,
  getAllCoverageIds,
  getCoverageDetails,
  getMultipleCoverageDetails,
  getDatabase
};

// Made with Bob
