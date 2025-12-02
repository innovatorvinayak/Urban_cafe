import "dotenv/config";
import { query } from "./connection";

async function cleanOrdersExpenses() {
  try {
    console.log("Cleaning orders and expenses...");

    // Cancel all orders (can't delete due to permissions)
    console.log("Cancelling all orders...");
    const orderResult = await query(
      "UPDATE orders SET status = 'cancelled' WHERE status != 'cancelled'"
    );
    console.log(`✓ Cancelled ${(orderResult as any).affectedRows || 0} orders`);

    // Mark all expenses as deleted (can't delete due to permissions)
    console.log("Marking all expenses as deleted...");
    const expenseResult = await query(
      "UPDATE expenses SET amount = 0, notes = CONCAT(COALESCE(notes, ''), ' [DELETED]')"
    );
    console.log(`✓ Marked ${(expenseResult as any).affectedRows || 0} expenses as deleted`);

    console.log("\n✓ Cleanup completed successfully!");
    console.log("→ All orders cancelled");
    console.log("→ All expenses marked as deleted (amount = 0)");
    console.log("\nYou can now start fresh with new orders and expenses.");
  } catch (error: any) {
    console.error("Cleanup error:", error.message);
    console.error(error);
    process.exit(1);
  }
}

// Run if called directly
if (process.argv[1] && process.argv[1].endsWith("clean-orders-expenses.ts")) {
  cleanOrdersExpenses()
    .then(() => process.exit(0))
    .catch((error) => {
      console.error(error);
      process.exit(1);
    });
}

export { cleanOrdersExpenses };

