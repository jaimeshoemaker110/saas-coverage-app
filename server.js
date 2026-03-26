const express = require('express');
const cors = require('cors');
const path = require('path');
const XLSX = require('xlsx');
const { getDatabase, getAllCoverageIds, getCoverageDetails, getMultipleCoverageDetails } = require('./database');

const app = express();
const PORT = process.env.PORT || 3000;
const NODE_ENV = process.env.NODE_ENV || 'development';

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.static('public'));

// Request logging middleware
app.use((req, res, next) => {
  const timestamp = new Date().toISOString();
  console.log(`[${timestamp}] ${req.method} ${req.path}`);
  next();
});

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({
    status: 'ok',
    environment: NODE_ENV,
    timestamp: new Date().toISOString()
  });
});

// API Routes

// Get all coverage IDs
app.get('/api/coverage-ids', async (req, res) => {
  try {
    const db = await getDatabase();
    const coverageIds = await getAllCoverageIds(db);
    db.close();
    res.json(coverageIds);
  } catch (error) {
    console.error('Error fetching coverage IDs:', error);
    res.status(500).json({ error: 'Failed to fetch coverage IDs' });
  }
});

// Get coverage details by ID
app.get('/api/coverage/:id', async (req, res) => {
  try {
    const coverageId = req.params.id;
    const db = await getDatabase();
    const details = await getCoverageDetails(db, coverageId);
    db.close();
    
    if (details.customers.length === 0 && details.products.length === 0) {
      res.status(404).json({ error: 'Coverage ID not found' });
      return;
    }
    
    res.json(details);
  } catch (error) {
    console.error('Error fetching coverage details:', error);
    res.status(500).json({ error: 'Failed to fetch coverage details' });
  }
});

// Get multiple coverage details by IDs (POST endpoint)
app.post('/api/coverage/multiple', async (req, res) => {
  try {
    const { coverageIds } = req.body;
    
    if (!coverageIds || !Array.isArray(coverageIds) || coverageIds.length === 0) {
      res.status(400).json({ error: 'Invalid coverage IDs array' });
      return;
    }
    
    const db = await getDatabase();
    const results = await getMultipleCoverageDetails(db, coverageIds);
    db.close();
    
    res.json(results);
  } catch (error) {
    console.error('Error fetching multiple coverage details:', error);
    res.status(500).json({ error: 'Failed to fetch coverage details' });
  }
});

// Export to CSV
app.get('/api/export/csv/:id', async (req, res) => {
  try {
    const coverageId = req.params.id;
    const db = await getDatabase();
    const details = await getCoverageDetails(db, coverageId);
    db.close();

    if (details.customers.length === 0) {
      res.status(404).json({ error: 'Coverage ID not found' });
      return;
    }

    // Build CSV content with new structure
    let csv = '';
    
    // Section 1: Coverage summary
    csv += 'Coverage ID,Data Target,Auto Target\n';
    csv += `"${coverageId}","${details.dataTarget || 'N/A'}","${details.autoTarget || 'N/A'}"\n`;
    csv += '\n'; // Blank row
    
    // Section 2: Customer and product details with metrics
    csv += 'Coverage ID,Customer Name,Product Name,Possible Metric(s),Where to see\n';
    details.customers.forEach(customer => {
      customer.products.forEach(product => {
        const productName = typeof product === 'string' ? product : product.name;
        const metrics = typeof product === 'object' ? (product.possibleMetrics || 'N/A') : 'N/A';
        const whereToSee = typeof product === 'object' ? (product.whereToSee || 'N/A') : 'N/A';
        csv += `"${coverageId}","${customer.name}","${productName}","${metrics}","${whereToSee}"\n`;
      });
    });

    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', `attachment; filename="coverage_${coverageId}.csv"`);
    res.send(csv);
  } catch (error) {
    console.error('Error exporting to CSV:', error);
    res.status(500).json({ error: 'Failed to export to CSV' });
  }
});

// Export to Excel
app.get('/api/export/excel/:id', async (req, res) => {
  try {
    const coverageId = req.params.id;
    const db = await getDatabase();
    const details = await getCoverageDetails(db, coverageId);
    db.close();

    if (details.customers.length === 0) {
      res.status(404).json({ error: 'Coverage ID not found' });
      return;
    }

    // Build data array for Excel with new structure
    const data = [];
    
    // Section 1: Coverage summary
    data.push(['Coverage ID', 'Data Target', 'Auto Target']);
    data.push([coverageId, details.dataTarget || 'N/A', details.autoTarget || 'N/A']);
    data.push([]); // Blank row
    
    // Section 2: Customer and product details with metrics
    data.push(['Coverage ID', 'Customer Name', 'Product Name', 'Possible Metric(s)', 'Where to see']);
    details.customers.forEach(customer => {
      customer.products.forEach(product => {
        const productName = typeof product === 'string' ? product : product.name;
        const metrics = typeof product === 'object' ? (product.possibleMetrics || 'N/A') : 'N/A';
        const whereToSee = typeof product === 'object' ? (product.whereToSee || 'N/A') : 'N/A';
        data.push([coverageId, customer.name, productName, metrics, whereToSee]);
      });
    });

    // Create workbook and worksheet
    const wb = XLSX.utils.book_new();
    const ws = XLSX.utils.aoa_to_sheet(data);
    
    // Set column widths
    ws['!cols'] = [
      { wch: 15 },  // Coverage ID
      { wch: 40 },  // Customer Name / Data Target
      { wch: 40 },  // Product Name / Auto Target
      { wch: 30 },  // Possible Metric(s)
      { wch: 30 }   // Where to see
    ];

    XLSX.utils.book_append_sheet(wb, ws, 'Coverage Data');

    // Generate buffer
    const buffer = XLSX.write(wb, { type: 'buffer', bookType: 'xlsx' });

    res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
    res.setHeader('Content-Disposition', `attachment; filename="coverage_${coverageId}.xlsx"`);
    res.send(buffer);
  } catch (error) {
    console.error('Error exporting to Excel:', error);
    res.status(500).json({ error: 'Failed to export to Excel' });
  }
});

// Export multiple coverage IDs to CSV
app.post('/api/export/csv/multiple', async (req, res) => {
  try {
    const { coverageIds } = req.body;
    
    if (!coverageIds || !Array.isArray(coverageIds) || coverageIds.length === 0) {
      res.status(400).json({ error: 'Invalid coverage IDs array' });
      return;
    }
    
    const db = await getDatabase();
    const results = await getMultipleCoverageDetails(db, coverageIds);
    db.close();

    // Build CSV content with new structure
    let csv = '';
    
    results.forEach((details, index) => {
      if (index > 0) {
        csv += '\n\n'; // Double blank row between coverage IDs
      }
      
      // Section 1: Coverage summary
      csv += 'Coverage ID,Data Target,Auto Target\n';
      csv += `"${details.coverageId}","${details.dataTarget || 'N/A'}","${details.autoTarget || 'N/A'}"\n`;
      csv += '\n'; // Blank row
      
      // Section 2: Customer and product details with metrics
      csv += 'Coverage ID,Customer Name,Product Name,Possible Metric(s),Where to see\n';
      details.customers.forEach(customer => {
        customer.products.forEach(product => {
          const productName = typeof product === 'string' ? product : product.name;
          const metrics = typeof product === 'object' ? (product.possibleMetrics || 'N/A') : 'N/A';
          const whereToSee = typeof product === 'object' ? (product.whereToSee || 'N/A') : 'N/A';
          csv += `"${details.coverageId}","${customer.name}","${productName}","${metrics}","${whereToSee}"\n`;
        });
      });
    });

    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', `attachment; filename="coverage_multiple.csv"`);
    res.send(csv);
  } catch (error) {
    console.error('Error exporting multiple to CSV:', error);
    res.status(500).json({ error: 'Failed to export to CSV' });
  }
});

// Export multiple coverage IDs to Excel
app.post('/api/export/excel/multiple', async (req, res) => {
  try {
    const { coverageIds } = req.body;
    
    if (!coverageIds || !Array.isArray(coverageIds) || coverageIds.length === 0) {
      res.status(400).json({ error: 'Invalid coverage IDs array' });
      return;
    }
    
    const db = await getDatabase();
    const results = await getMultipleCoverageDetails(db, coverageIds);
    db.close();

    // Build data array for Excel with new structure
    const data = [];
    
    results.forEach((details, index) => {
      if (index > 0) {
        data.push([]); // Blank row
        data.push([]); // Double blank row between coverage IDs
      }
      
      // Section 1: Coverage summary
      data.push(['Coverage ID', 'Data Target', 'Auto Target']);
      data.push([details.coverageId, details.dataTarget || 'N/A', details.autoTarget || 'N/A']);
      data.push([]); // Blank row
      
      // Section 2: Customer and product details with metrics
      data.push(['Coverage ID', 'Customer Name', 'Product Name', 'Possible Metric(s)', 'Where to see']);
      details.customers.forEach(customer => {
        customer.products.forEach(product => {
          const productName = typeof product === 'string' ? product : product.name;
          const metrics = typeof product === 'object' ? (product.possibleMetrics || 'N/A') : 'N/A';
          const whereToSee = typeof product === 'object' ? (product.whereToSee || 'N/A') : 'N/A';
          data.push([details.coverageId, customer.name, productName, metrics, whereToSee]);
        });
      });
    });

    // Create workbook and worksheet
    const wb = XLSX.utils.book_new();
    const ws = XLSX.utils.aoa_to_sheet(data);
    
    // Set column widths
    ws['!cols'] = [
      { wch: 15 },  // Coverage ID
      { wch: 40 },  // Customer Name / Data Target
      { wch: 40 },  // Product Name / Auto Target
      { wch: 30 },  // Possible Metric(s)
      { wch: 30 }   // Where to see
    ];

    XLSX.utils.book_append_sheet(wb, ws, 'Coverage Data');

    // Generate buffer
    const buffer = XLSX.write(wb, { type: 'buffer', bookType: 'xlsx' });

    res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
    res.setHeader('Content-Disposition', `attachment; filename="coverage_multiple.xlsx"`);
    res.send(buffer);
  } catch (error) {
    console.error('Error exporting multiple to Excel:', error);
    res.status(500).json({ error: 'Failed to export to Excel' });
  }
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(`[ERROR] ${err.stack}`);
  res.status(500).json({
    error: 'Internal server error',
    message: NODE_ENV === 'development' ? err.message : 'Something went wrong'
  });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({ error: 'Not found' });
});

// Start server
app.listen(PORT, () => {
  console.log(`\n========================================`);
  console.log(`SaaS Coverage Lookup Application`);
  console.log(`========================================`);
  console.log(`Environment: ${NODE_ENV}`);
  console.log(`Server running at: http://localhost:${PORT}`);
  console.log(`API endpoints:`);
  console.log(`  - GET /health`);
  console.log(`  - GET /api/coverage-ids`);
  console.log(`  - GET /api/coverage/:id`);
  console.log(`  - POST /api/coverage/multiple`);
  console.log(`  - GET /api/export/csv/:id`);
  console.log(`  - GET /api/export/excel/:id`);
  console.log(`  - POST /api/export/csv/multiple`);
  console.log(`  - POST /api/export/excel/multiple`);
  console.log(`========================================\n`);
});

// Graceful shutdown
process.on('SIGTERM', () => {
  console.log('SIGTERM signal received: closing HTTP server');
  process.exit(0);
});

process.on('SIGINT', () => {
  console.log('SIGINT signal received: closing HTTP server');
  process.exit(0);
});

// Made with Bob
