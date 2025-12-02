import "dotenv/config";
import { query } from "./connection";
import fs from "fs";
import path from "path";

async function initExpenses() {
  try {
    console.log("Initializing expenses table...");

    const schemaPath = path.join(process.cwd(), "server/db/expenses-schema.sql");
    const schema = fs.readFileSync(schemaPath, "utf8");

    // Split by semicolon and execute each statement
    const statements = schema
      .split(";")
      .map((s) => s.trim())
      .filter((s) => s.length > 0);

    for (const statement of statements) {
      try {
        await query(statement);
      } catch (error: any) {
        // Ignore duplicate entry errors
        if (error.code !== 'ER_DUP_ENTRY') {
          console.error(`Error executing statement:`, error.message);
        }
      }
    }

    console.log("✓ Expenses table initialized successfully!");
  } catch (error: any) {
    console.error("Error initializing expenses table:", error.message);
    console.error(error);
    process.exit(1);
  }
}

// Run if called directly
if (process.argv[1] && process.argv[1].endsWith("init-expenses.ts")) {
  initExpenses()
    .then(() => process.exit(0))
    .catch((error) => {
      console.error(error);
      process.exit(1);
    });
}

export { initExpenses };

