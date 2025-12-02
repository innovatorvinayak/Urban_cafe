import "dotenv/config";
import { readFileSync } from "fs";
import { join, dirname } from "path";
import { fileURLToPath } from "url";
import { query } from "./connection";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

async function initializeDatabase() {
  try {
    console.log("Initializing database...");

    // Read schema file
    const schemaPath = join(__dirname, "schema.sql");
    const schema = readFileSync(schemaPath, "utf-8");

    // Remove comments and split by semicolon
    const lines = schema.split("\n");
    const cleanedLines = lines
      .map((line) => {
        // Remove inline comments
        const commentIndex = line.indexOf("--");
        if (commentIndex >= 0) {
          return line.substring(0, commentIndex);
        }
        return line;
      })
      .filter((line) => line.trim().length > 0);

    const fullSchema = cleanedLines.join("\n");
    const statements = fullSchema
      .split(";")
      .map((s) => s.trim())
      .filter((s) => s.length > 0 && !s.startsWith("--"));

    console.log(`Found ${statements.length} SQL statements to execute`);

    let successCount = 0;
    let errorCount = 0;

    for (let i = 0; i < statements.length; i++) {
      const statement = statements[i];
      if (!statement || statement.length < 10) continue;

      try {
        await query(statement);
        successCount++;
        if (i < 5 || i % 10 === 0) {
          console.log(`✓ Executed statement ${i + 1}/${statements.length}`);
        }
      } catch (error: any) {
        // Ignore "table already exists" and "duplicate key" errors
        if (
          error.message.includes("already exists") ||
          error.message.includes("Duplicate entry") ||
          error.message.includes("Duplicate key")
        ) {
          successCount++;
          if (i < 5) {
            console.log(`⚠ Statement ${i + 1} already exists (skipped)`);
          }
        } else {
          errorCount++;
          console.error(`✗ Error in statement ${i + 1}:`, error.message);
          console.error("Statement preview:", statement.substring(0, 150) + "...");
        }
      }
    }

    console.log(`\nDatabase initialization completed!`);
    console.log(`✓ Successful: ${successCount}`);
    if (errorCount > 0) {
      console.log(`✗ Errors: ${errorCount}`);
    }
  } catch (error: any) {
    console.error("Database initialization error:", error.message);
    console.error(error);
    process.exit(1);
  }
}

// Run if called directly
if (process.argv[1] && process.argv[1].endsWith("init.ts")) {
  initializeDatabase()
    .then(() => process.exit(0))
    .catch((error) => {
      console.error(error);
      process.exit(1);
    });
}

export { initializeDatabase };

