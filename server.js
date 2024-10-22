require('dotenv').config();  // Load environment variables

console.log('DB_USER:', process.env.DB_USER);
console.log('DB_SERVER:', process.env.DB_SERVER);

const express = require('express');
const sql = require('mssql');
const bodyParser = require('body-parser');
const cors = require('cors');
const path = require('path');  // Import path for serving React build

const app = express();
const port = 5000;

app.use(bodyParser.json());
app.use(cors());

// Function to configure the database connection
const getDatabaseConfig = (orderType) => {
    let database = '';
    switch (orderType) {
        case 'jaycar-au':
            database = 'ARHOAU_HOData'; // Jaycar AU database
            break;
        case 'jaycar-nz':
            database = 'ARHONZ_HOData'; // Jaycar NZ database
            break;
        case 'rtm':
            database = 'ARHORTM_HOData'; // RTM database
            break;
        default:
            throw new Error('Invalid company type');
    }

    return {
        user: process.env.DB_USER,
        password: process.env.DB_PASSWORD,
        server: process.env.DB_SERVER,
        database: database,
        options: {
            encrypt: false,
            trustServerCertificate: false,
        },
    };
};

// Function to get specific branches based on orderType and storeMode
const getBranches = (orderType, storeMode) => {
    if (storeMode === 'online') {
        switch (orderType) {
            case 'jaycar-au':
                return [400, 409]; // Online-specific branches for Jaycar AU
            case 'jaycar-nz':
                return [200, 209]; // Online-specific branches for Jaycar NZ
            case 'rtm':
                return [300, 399]; // Online-specific branches for RTM
            default:
                throw new Error('Invalid company type');
        }
    } else { // In-store mode
        switch (orderType) {
            case 'jaycar-au':
                return Array.from({ length: 512 - 400 + 1 }, (_, i) => 400 + i); // All in-store branches for Jaycar AU
            case 'jaycar-nz':
                return Array.from({ length: 224 - 203 + 1 }, (_, i) => 203 + i); // All in-store branches for Jaycar NZ
            case 'rtm':
                return Array.from({ length: 343 - 304 + 1 }, (_, i) => 304 + i); // All in-store branches for RTM
            default:
                throw new Error('Invalid company type');
        }
    }
};

// API endpoint to test server
app.get('/', (req, res) => {
    res.send("Hi");
});

// Endpoint to get original price based on item_code and orderType
app.get('/api/get-original-price/:orderType/:item_code', async (req, res) => {
    const { item_code, orderType } = req.params;
    console.log('Fetching price for item_code:', item_code, 'and orderType:', orderType);

    try {
        const dbConfig = getDatabaseConfig(orderType); // Dynamically get dbConfig for orderType
        const pool = await sql.connect(dbConfig);

        const query = `
            SELECT price 
            FROM [${dbConfig.database}].[dbo].[ITEM_PRICE]  
            WHERE item_code = @item_code
            AND price_type='P1'
            AND break_count=0
        `;
        const result = await pool.request()
            .input('item_code', sql.VarChar, item_code)
            .query(query);

        if (result.recordset.length > 0) {
            const originalPrice = parseFloat(result.recordset[0].price).toFixed(2);
            console.log(`Found price: ${originalPrice} for item_code: ${item_code}`);
            res.json({ originalPrice });
        } else {
            res.status(404).json({ message: 'Item not found' });
        }
    } catch (err) {
        console.error('Error fetching original price:', err);
        res.status(500).json({ message: 'Failed to fetch original price', error: err });
    }
});

// Route to insert item and price into the PRICE_PENDING table for both P1 and P2 price types for each branch
app.post('/api/v1/promo-uploader/insert-item', async (req, res) => {
    const { item_code, price, effective_date, end_date, orderType, storeMode } = req.body;  // Accept the orderType (company type) and storeMode (online or in-store)

    try {
        // Get the correct database configuration based on the company selected
        const dbConfig = getDatabaseConfig(orderType);

        // Get the correct branches based on the selected company and store mode
        const branches = getBranches(orderType, storeMode);

        // Adjust the effective_date and end_date by 4 minutes (240,000 milliseconds)
        const adjustedEffectiveDate = new Date(new Date(effective_date).getTime() + 4 * 60000);  // 4 minutes ahead
        const adjustedEndDate = new Date(new Date(end_date).getTime() + 4 * 60000);  // 4 minutes ahead

        // Connect to the database for this specific request
        const pool = await sql.connect(dbConfig);

        // Insert prices for each branch
        for (const branch_no of branches) {
            // Insert for price_type P1 first
            const queryP1 = `
                INSERT INTO [dbo].[PRICE_PENDING]
                (item_code, branch_no, break_count, price_code, price_type, effective_date, price, count, end_date, discountable, show_markdown, updated_yn, ignore_dm, no_charge_spec_yn, status, last_modified, break_type, break_disc, mandatory_yn, source, drpstatus, linked_yn, net_price, catalogue_id)
                VALUES
                (@item_code, @branch_no, 0, 'SS', 'P1', @adjustedEffectiveDate, @price, 0, @adjustedEndDate, 1, 0, 0, 0, 0, 0, GETDATE(), '', '', 0, 'HO', 0, 0, 0, '');
            `;
            await pool.request()
                .input('item_code', sql.VarChar, item_code)
                .input('branch_no', sql.Int, branch_no)
                .input('price', sql.Decimal(18, 2), price)
                .input('adjustedEffectiveDate', sql.DateTime, adjustedEffectiveDate)
                .input('adjustedEndDate', sql.DateTime, adjustedEndDate)
                .query(queryP1);

            // Insert for price_type P2 after P1
            const queryP2 = `
                INSERT INTO [dbo].[PRICE_PENDING]
                (item_code, branch_no, break_count, price_code, price_type, effective_date, price, count, end_date, discountable, show_markdown, updated_yn, ignore_dm, no_charge_spec_yn, status, last_modified, break_type, break_disc, mandatory_yn, source, drpstatus, linked_yn, net_price, catalogue_id)
                VALUES
                (@item_code, @branch_no, 0, 'SS', 'P2', @adjustedEffectiveDate, @price, 0, @adjustedEndDate, 1, 0, 0, 0, 0, 0, GETDATE(), '', '', 0, 'HO', 0, 0, 0, '');
            `;
            await pool.request()
                .input('item_code', sql.VarChar, item_code)
                .input('branch_no', sql.Int, branch_no)
                .input('price', sql.Decimal(18, 2), price)
                .input('adjustedEffectiveDate', sql.DateTime, adjustedEffectiveDate)
                .input('adjustedEndDate', sql.DateTime, adjustedEndDate)
                .query(queryP2);

            console.log(`Inserted P1 and P2 prices for branch ${branch_no} (${storeMode} mode)`);
        }

        // Close the connection pool after completing the request
        await pool.close();

        res.json({ success: true, message: 'Item and price inserted successfully for all branches and price types' });
    } catch (err) {
        console.error('Error inserting item:', err);e
        res.status(500).json({ success: false, message: 'Failed to insert item and price', error: err.message });
    }
});

//  serve the React build
app.use(express.static(path.join(__dirname, 'build')));


app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname + '/build/index.html'));
});
// Start the server
app.listen(port, '0.0.0.0', () => {
    console.log(`Server running on port ${port}`);
});
