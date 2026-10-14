/**
 * @file app.js
 * @description CSE 310 - SQL Relational Databases Module Implementation.
 * Demonstrates MySQL connectivity, CRUD operations, joins, aggregations, 
 * and date filtering using parameterized queries.
 */

require('dotenv').config();
const mysql = require('mysql2/promise');

/**
 * Creates and returns a connection pool for the MySQL database.
 * 
 * @returns {mysql.Pool} A mysql2 promise-based connection pool.
 */
function createDatabasePool() {
    return mysql.createPool({
        host: process.env.DB_HOST || 'localhost',
        user: process.env.DB_USER || 'root',
        password: process.env.DB_PASSWORD || '',
        database: process.env.DB_NAME || 'inventory_tracker',
        port: Number(process.env.DB_PORT) || 3306,
        waitForConnections: true,
        connectionLimit: 10,
        queueLimit: 0
    });
}

/**
 * Clears existing sample records to ensure deterministic demonstration runs.
 * 
 * @param {mysql.Pool} pool - The active database connection pool.
 * @returns {Promise<void>}
 */
async function resetTables(pool) {
    await pool.execute('DELETE FROM products');
    await pool.execute('DELETE FROM categories');
    console.log('[Setup] Cleared existing records.');
}

/**
 * Inserts a category record into the database.
 * 
 * @param {mysql.Pool} pool - The active database connection pool.
 * @param {string} categoryName - Name of the category.
 * @returns {Promise<number>} The inserted category_id.
 */
async function insertCategory(pool, categoryName) {
    const query = 'INSERT INTO categories (category_name) VALUES (?)';
    const [result] = await pool.execute(query, [categoryName]);
    console.log(`[Create] Category "${categoryName}" added with ID: ${result.insertId}`);
    return result.insertId;
}

/**
 * Inserts a new product into the database.
 * 
 * @param {mysql.Pool} pool - The active database connection pool.
 * @param {string} name - Name of the product.
 * @param {number} price - Unit price.
 * @param {number} quantity - Stock count.
 * @param {number} categoryId - Foreign key referencing categories table.
 * @returns {Promise<number>} The inserted product_id.
 */
async function insertProduct(pool, name, price, quantity, categoryId) {
    const query = `
        INSERT INTO products (product_name, price, quantity, category_id)
        VALUES (?, ?, ?, ?)
    `;
    const [result] = await pool.execute(query, [name, price, quantity, categoryId]);
    console.log(`[Create] Product "${name}" added with ID: ${result.insertId}`);
    return result.insertId;
}

/**
 * Retrieves all products along with their category name using an INNER JOIN.
 * Demonstrates table joining and querying relational data.
 * 
 * @param {mysql.Pool} pool - The active database connection pool.
 * @returns {Promise<Array<Object>>} List of product records joined with categories.
 */
async function fetchProductsWithCategories(pool) {
    const query = `
        SELECT 
            p.product_id,
            p.product_name,
            p.price,
            p.quantity,
            c.category_name,
            p.created_at
        FROM products p
        INNER JOIN categories c ON p.category_id = c.category_id
        ORDER BY p.product_id ASC
    `;
    const [rows] = await pool.execute(query);
    console.log('\n--- Products with Category Details (INNER JOIN) ---');
    console.table(rows);
    return rows;
}

/**
 * Updates stock quantity and unit price for a specific product.
 * Demonstrates record modification.
 * 
 * @param {mysql.Pool} pool - The active database connection pool.
 * @param {number} productId - The primary key ID of the product.
 * @param {number} newPrice - The revised unit price.
 * @param {number} newQuantity - The updated stock count.
 * @returns {Promise<boolean>} True if a row was updated, false otherwise.
 */
async function updateProductDetails(pool, productId, newPrice, newQuantity) {
    const query = `
        UPDATE products 
        SET price = ?, quantity = ?
        WHERE product_id = ?
    `;
    const [result] = await pool.execute(query, [newPrice, newQuantity, productId]);
    const updated = result.affectedRows > 0;
    console.log(`[Update] Product ID ${productId} modified. Affected rows: ${result.affectedRows}`);
    return updated;
}

/**
 * Removes a product from the database by ID.
 * Demonstrates record deletion.
 * 
 * @param {mysql.Pool} pool - The active database connection pool.
 * @param {number} productId - The product ID to delete.
 * @returns {Promise<boolean>} True if a row was deleted, false otherwise.
 */
async function deleteProduct(pool, productId) {
    const query = 'DELETE FROM products WHERE product_id = ?';
    const [result] = await pool.execute(query, [productId]);
    const deleted = result.affectedRows > 0;
    console.log(`[Delete] Product ID ${productId} deleted. Affected rows: ${result.affectedRows}`);
    return deleted;
}

/**
 * Computes aggregate summary metrics across all products in inventory.
 * Demonstrates COUNT, SUM, and AVG SQL aggregate functions.
 * 
 * @param {mysql.Pool} pool - The active database connection pool.
 * @returns {Promise<Object>} Aggregated metrics object.
 */
async function getInventorySummary(pool) {
    const query = `
        SELECT 
            COUNT(*) AS total_products,
            SUM(quantity) AS total_inventory_units,
            ROUND(AVG(price), 2) AS average_unit_price,
            ROUND(SUM(price * quantity), 2) AS total_inventory_valuation
        FROM products
    `;
    const [rows] = await pool.execute(query);
    console.log('\n--- Inventory Aggregates (COUNT, SUM, AVG) ---');
    console.table(rows);
    return rows[0];
}

/**
 * Filters and queries products added within a specific date/time range.
 * Demonstrates date-based filtering using SQL datetime boundaries.
 * 
 * @param {mysql.Pool} pool - The active database connection pool.
 * @param {string} startDate - Start timestamp in 'YYYY-MM-DD HH:MM:SS' format.
 * @param {string} endDate - End timestamp in 'YYYY-MM-DD HH:MM:SS' format.
 * @returns {Promise<Array<Object>>} Filtered products.
 */
async function fetchProductsByDateRange(pool, startDate, endDate) {
    const query = `
        SELECT product_id, product_name, price, quantity, created_at
        FROM products
        WHERE created_at BETWEEN ? AND ?
        ORDER BY created_at DESC
    `;
    const [rows] = await pool.execute(query, [startDate, endDate]);
    console.log(`\n--- Products Created Between ${startDate} and ${endDate} ---`);
    console.table(rows);
    return rows;
}

/**
 * Main application runner executing the end-to-end database workflow.
 * 
 * @returns {Promise<void>}
 */
async function main() {
    const pool = createDatabasePool();

    try {
        console.log('Connecting to MySQL database...');
        await resetTables(pool);

        // 1. Insert Categories
        const catElectronics = await insertCategory(pool, 'Electronics');
        const catAccessories = await insertCategory(pool, 'Accessories');

        // 2. Insert Products (Create)
        const mouseId = await insertProduct(pool, 'Wireless Mouse', 29.99, 50, catAccessories);
        const keyboardId = await insertProduct(pool, 'Mechanical Keyboard', 89.50, 25, catAccessories);
        const monitorId = await insertProduct(pool, '4K Ultrawide Monitor', 499.00, 10, catElectronics);

        // 3. Query with JOIN
        await fetchProductsWithCategories(pool);

        // 4. Update Product
        await updateProductDetails(pool, mouseId, 24.99, 45);

        // 5. Query Aggregates (COUNT, SUM, AVG)
        await getInventorySummary(pool);

        // 6. Query by Date/Time Range
        const now = new Date();
        const past = new Date(now.getTime() - 24 * 60 * 60 * 1000); // 24 hours ago
        const future = new Date(now.getTime() + 60 * 60 * 1000);    // 1 hour ahead

        const formatSQLDate = (d) => d.toISOString().slice(0, 19).replace('T', ' ');
        await fetchProductsByDateRange(pool, formatSQLDate(past), formatSQLDate(future));

        // 7. Delete Product
        await deleteProduct(pool, keyboardId);

        // 8. Final Verification
        console.log('\n--- Final Database State After Deletion ---');
        await fetchProductsWithCategories(pool);

    } catch (error) {
        console.error('Database Error:', error.message);
    } finally {
        await pool.end();
        console.log('\nDatabase connection closed cleanly.');
    }
}

// Execute the software
main();