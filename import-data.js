const XLSX = require('xlsx');
const sqlite3 = require('sqlite3').verbose();
const path = require('path');
const fs = require('fs');

// Paths
const EXCEL_FILE = '/Users/jaimeshoemaker/Documents/2026/SaaS Consumption/SaaS Consumption.xlsx';
const DB_DIR = path.join(__dirname, 'data');
const DB_PATH = path.join(DB_DIR, 'saas.db');

// Create data directory if it doesn't exist
if (!fs.existsSync(DB_DIR)) {
  fs.mkdirSync(DB_DIR, { recursive: true });
}

// Delete existing database to start fresh
if (fs.existsSync(DB_PATH)) {
  fs.unlinkSync(DB_PATH);
  console.log('Deleted existing database');
}

console.log('Starting data import...');

// Read Excel file
const workbook = XLSX.readFile(EXCEL_FILE);

// Get sheet data
const saasBaseSheet = workbook.Sheets['SaaS Base'];
const dataTargetsSheet = workbook.Sheets['SaaS Data Targets'];
const autoTargetsSheet = workbook.Sheets['SaaS Auto Targets'];
const metricsSheet = workbook.Sheets['Metrics'];

// Convert sheets to JSON
const saasBaseData = XLSX.utils.sheet_to_json(saasBaseSheet);
const dataTargetsData = XLSX.utils.sheet_to_json(dataTargetsSheet);
const autoTargetsData = XLSX.utils.sheet_to_json(autoTargetsSheet);
const metricsData = XLSX.utils.sheet_to_json(metricsSheet);

console.log(`Loaded ${saasBaseData.length} rows from SaaS Base`);
console.log(`Loaded ${dataTargetsData.length} rows from Data Targets`);
console.log(`Loaded ${autoTargetsData.length} rows from Auto Targets`);
console.log(`Loaded ${metricsData.length} rows from Metrics`);

// Initialize database
const db = new sqlite3.Database(DB_PATH, (err) => {
  if (err) {
    console.error('Error opening database:', err);
    process.exit(1);
  }
  console.log('Database created successfully');
});

// Create tables
db.serialize(() => {
  // Create tables
  db.run(`
    CREATE TABLE IF NOT EXISTS coverage (
      coverage_id TEXT PRIMARY KEY,
      coverage_name TEXT
    )
  `);

  db.run(`
    CREATE TABLE IF NOT EXISTS customer_product (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      coverage_id TEXT NOT NULL,
      customer_name TEXT NOT NULL,
      product_name TEXT NOT NULL,
      FOREIGN KEY (coverage_id) REFERENCES coverage(coverage_id)
    )
  `);

  db.run(`
    CREATE TABLE IF NOT EXISTS data_target (
      coverage_id TEXT PRIMARY KEY,
      target_value INTEGER NOT NULL,
      FOREIGN KEY (coverage_id) REFERENCES coverage(coverage_id)
    )
  `);

  db.run(`
    CREATE TABLE IF NOT EXISTS auto_target (
      coverage_id TEXT PRIMARY KEY,
      target_value INTEGER NOT NULL,
      FOREIGN KEY (coverage_id) REFERENCES coverage(coverage_id)
    )
  `);

  db.run(`
    CREATE TABLE IF NOT EXISTS product_metrics (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      product_name TEXT NOT NULL,
      possible_metrics TEXT,
      where_to_see TEXT
    )
  `);

  console.log('Tables created successfully');

  // Import SaaS Base data
  const insertCustomerProduct = db.prepare(`
    INSERT INTO customer_product (coverage_id, customer_name, product_name)
    VALUES (?, ?, ?)
  `);

  const insertCoverage = db.prepare(`
    INSERT OR IGNORE INTO coverage (coverage_id, coverage_name)
    VALUES (?, ?)
  `);

  saasBaseData.forEach(row => {
    const coverageId = row['Coverage ID'];
    const customerName = row['DBG Name'];
    const productName = row['Product driving SaaS Target'];

    if (coverageId && customerName && productName) {
      insertCoverage.run(coverageId, customerName);
      insertCustomerProduct.run(coverageId, customerName, productName);
    }
  });

  insertCustomerProduct.finalize();
  insertCoverage.finalize();
  console.log('Imported SaaS Base data');

  // Import Data Targets
  const insertDataTarget = db.prepare(`
    INSERT OR REPLACE INTO data_target (coverage_id, target_value)
    VALUES (?, ?)
  `);

  dataTargetsData.forEach(row => {
    const coverageId = row['Coverage ID'];
    const targetValue = row['Data Target'];

    if (coverageId && targetValue !== undefined) {
      insertDataTarget.run(coverageId, targetValue);
    }
  });

  insertDataTarget.finalize();
  console.log('Imported Data Targets');

  // Import Auto Targets
  const insertAutoTarget = db.prepare(`
    INSERT OR REPLACE INTO auto_target (coverage_id, target_value)
    VALUES (?, ?)
  `);

  autoTargetsData.forEach(row => {
    const coverageId = row['Coverage ID'];
    const targetValue = row['Data Target'];

    if (coverageId && targetValue !== undefined) {
      insertAutoTarget.run(coverageId, targetValue);
    }
  });

  insertAutoTarget.finalize();
  console.log('Imported Auto Targets');

  // Import Metrics
  const insertMetrics = db.prepare(`
    INSERT INTO product_metrics (product_name, possible_metrics, where_to_see)
    VALUES (?, ?, ?)
  `);

  metricsData.forEach(row => {
    const productName = row['Product'];
    const possibleMetrics = row['Possible Metric(s)'];
    const whereToSee = row['Where to see'];

    if (productName) {
      insertMetrics.run(productName, possibleMetrics || null, whereToSee || null);
    }
  });

  insertMetrics.finalize();
  console.log('Imported Product Metrics');

  // Verify import
  db.get('SELECT COUNT(*) as count FROM coverage', (err, row) => {
    if (!err) {
      console.log(`Total coverage IDs: ${row.count}`);
    }
  });

  db.get('SELECT COUNT(*) as count FROM customer_product', (err, row) => {
    if (!err) {
      console.log(`Total customer-product records: ${row.count}`);
    }
  });

  db.get('SELECT COUNT(*) as count FROM data_target', (err, row) => {
    if (!err) {
      console.log(`Total data targets: ${row.count}`);
    }
  });

  db.get('SELECT COUNT(*) as count FROM auto_target', (err, row) => {
    if (!err) {
      console.log(`Total auto targets: ${row.count}`);
    }
  });

  db.get('SELECT COUNT(*) as count FROM product_metrics', (err, row) => {
    if (!err) {
      console.log(`Total product metrics: ${row.count}`);
    }
    
    // Close database
    db.close((err) => {
      if (err) {
        console.error('Error closing database:', err);
      } else {
        console.log('\nData import completed successfully!');
        console.log('Database location:', DB_PATH);
      }
    });
  });
});

// Made with Bob
