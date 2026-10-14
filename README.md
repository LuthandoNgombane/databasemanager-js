# Overview

This software is an Inventory Management demonstration application designed to interact with a relational MySQL database using Node.js and the `mysql2` driver. The program models an inventory tracking system with relational data across product categories and stock items.

I wrote this software to master the integration of relational databases within a JavaScript environment, specifically focusing on building parameterized SQL queries, establishing connection pools, implementing relational constraints (foreign keys), executing table joins, computing aggregate statistics, and handling time-series queries.

[Software Demo Video](INSERT_YOUR_YOUTUBE_VIDEO_LINK_HERE)

# Relational Database

The project connects to a local instance of **MySQL Server (v8.0+)** managed via **MySQL Workbench**. The schema uses two relational tables:

1. **`categories` Table**:
   - `category_id` (INT, AUTO_INCREMENT, Primary Key)
   - `category_name` (VARCHAR(100), UNIQUE, NOT NULL)
   - `created_at` (TIMESTAMP, DEFAULT CURRENT_TIMESTAMP)

2. **`products` Table**:
   - `product_id` (INT, AUTO_INCREMENT, Primary Key)
   - `product_name` (VARCHAR(150), NOT NULL)
   - `price` (DECIMAL(10, 2), NOT NULL)
   - `quantity` (INT, NOT NULL, DEFAULT 0)
   - `category_id` (INT, NOT NULL, Foreign Key referencing `categories.category_id` with `ON DELETE CASCADE`)
   - `created_at` (TIMESTAMP, DEFAULT CURRENT_TIMESTAMP)

# Development Environment

* **Development Tools**: Visual Studio Code, MySQL Workbench 8.0, Git, Terminal
* **Runtime / Stack**: Node.js (v20+), JavaScript (ES2022)
* **Libraries / Drivers**:
  * `mysql2/promise` (Promise-based MySQL client)
  * `dotenv` (Environment variable configuration)

# Useful Websites

* [MySQL 8.0 Reference Manual](https://dev.mysql.com/doc/refman/8.0/en/)
* [npm mysql2 Documentation](https://www.npmjs.com/package/mysql2)
* [Node.js Documentation](https://nodejs.org/en/docs/)
* [W3Schools SQL Tutorial](https://www.w3schools.com/sql/)

# Future Work

* Implement a full interactive CLI menu using `readline` or `inquirer` to accept live user input.
* Implement pagination (`LIMIT` and `OFFSET`) for handling larger datasets.
* Add database transaction wrappers (`BEGIN`, `COMMIT`, `ROLLBACK`) for multi-step order processing.
* Add comprehensive automated unit tests using Jest to test database edge cases.
