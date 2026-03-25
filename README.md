# SaaS Coverage Lookup Application

A web-based application to search and view SaaS customers, products, and targets by coverage ID.

## Features

- 🔍 **Search by Coverage ID**: Select from a dropdown of all available coverage IDs
- 👥 **View Customers**: See all customers associated with a coverage ID
- 📦 **View Products**: Display all products for each customer
- 🎯 **View Targets**: Show data targets and auto targets
- 📊 **Export Data**: Download results as CSV or Excel files
- 📱 **Responsive Design**: Works on desktop, tablet, and mobile devices

## Prerequisites

Before you begin, ensure you have the following installed:
- **Node.js** (v14 or higher) and npm
- **macOS** (this guide is for macOS users)

### Installing Node.js

If you don't have Node.js installed, follow the instructions in `INSTALL_NODEJS.md`.

## Installation

1. **Navigate to the project directory**:
   ```bash
   cd /Users/jaimeshoemaker/Desktop/saas-coverage-app
   ```

2. **Install dependencies**:
   ```bash
   npm install
   ```

   This will install:
   - express (web server)
   - sqlite3 (database)
   - xlsx (Excel file handling)
   - cors (cross-origin resource sharing)

3. **Import data from Excel**:
   ```bash
   npm run import
   ```

   This command will:
   - Read the Excel file from `/Users/jaimeshoemaker/Documents/2026/SaaS Consumption/SaaS Consumption.xlsx`
   - Create a SQLite database at `data/saas.db`
   - Import all coverage IDs, customers, products, and targets

## Running the Application

1. **Start the server**:
   ```bash
   npm start
   ```

2. **Open your browser** and navigate to:
   ```
   http://localhost:3000
   ```

3. **Use the application**:
   - Select a coverage ID from the dropdown
   - Click "Search" to view results
   - Use "Export CSV" or "Export Excel" buttons to download data

## Project Structure

```
saas-coverage-app/
├── server.js              # Express API server
├── database.js            # Database queries and operations
├── import-data.js         # Excel to SQLite import script
├── package.json           # Node.js dependencies
├── data/
│   └── saas.db           # SQLite database (created after import)
├── public/
│   ├── index.html        # Main application page
│   ├── styles.css        # Application styling
│   └── app.js            # Frontend JavaScript
├── README.md             # This file
└── INSTALL_NODEJS.md     # Node.js installation guide
```

## API Endpoints

The application provides the following REST API endpoints:

- `GET /api/coverage-ids` - Returns all unique coverage IDs
- `GET /api/coverage/:id` - Returns customers, products, and targets for a coverage ID
- `GET /api/export/csv/:id` - Downloads coverage data as CSV
- `GET /api/export/excel/:id` - Downloads coverage data as Excel

## Database Schema

The SQLite database contains four tables:

1. **coverage**: Stores unique coverage IDs
   - `coverage_id` (PRIMARY KEY)
   - `coverage_name`

2. **customer_product**: Links customers to products
   - `id` (PRIMARY KEY)
   - `coverage_id` (FOREIGN KEY)
   - `customer_name`
   - `product_name`

3. **data_target**: Stores data target values
   - `coverage_id` (PRIMARY KEY)
   - `target_value`

4. **auto_target**: Stores auto target values
   - `coverage_id` (PRIMARY KEY)
   - `target_value`

## Troubleshooting

### Port Already in Use

If you see an error that port 3000 is already in use:

1. Find the process using port 3000:
   ```bash
   lsof -i :3000
   ```

2. Kill the process:
   ```bash
   kill -9 <PID>
   ```

3. Or change the port in `server.js` (line 6):
   ```javascript
   const PORT = 3001; // Change to any available port
   ```

### Database Not Found

If you get a "database not found" error:

1. Make sure you've run the import script:
   ```bash
   npm run import
   ```

2. Check that the Excel file exists at:
   ```
   /Users/jaimeshoemaker/Documents/2026/SaaS Consumption/SaaS Consumption.xlsx
   ```

### No Data Showing

If the application loads but shows no data:

1. Check the browser console for errors (F12 or Cmd+Option+I)
2. Verify the server is running (check terminal output)
3. Ensure the database was imported successfully
4. Try re-importing the data:
   ```bash
   npm run import
   ```

## Development

To make changes to the application:

1. **Backend changes** (server.js, database.js):
   - Stop the server (Ctrl+C)
   - Make your changes
   - Restart the server: `npm start`

2. **Frontend changes** (HTML, CSS, JS in public/):
   - Make your changes
   - Refresh the browser (no server restart needed)

3. **Database schema changes**:
   - Update `database.js` and `import-data.js`
   - Delete the database: `rm data/saas.db`
   - Re-import: `npm run import`

## Technologies Used

- **Backend**: Node.js, Express.js
- **Database**: SQLite3
- **Frontend**: HTML5, CSS3, Vanilla JavaScript
- **Data Processing**: xlsx library for Excel files

## License

ISC

## Support

For issues or questions, please check the troubleshooting section above or review the code comments in the source files.