import "dotenv/config";
import { query } from "./connection";

async function resetInventoryStock() {
  try {
    console.log("Resetting all inventory stock to 0...");

    const result = await query(
      "UPDATE inventory_items SET current_stock = 0 WHERE is_active = TRUE"
    );

    console.log(`✓ Reset ${(result as any).affectedRows || 0} active inventory items to 0 stock`);
    console.log("\nAll active inventory items now have 0 stock.");
    console.log("You can now restock items as needed.");
  } catch (error: any) {
    console.error("Error resetting inventory:", error.message);
    console.error(error);
    process.exit(1);
  }
}

// Run if called directly
if (process.argv[1] && process.argv[1].endsWith("reset-inventory-stock.ts")) {
  resetInventoryStock()
    .then(() => process.exit(0))
    .catch((error) => {
      console.error(error);
      process.exit(1);
    });
}

export { resetInventoryStock };

