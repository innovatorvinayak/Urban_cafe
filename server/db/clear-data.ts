import "dotenv/config";
import { query } from "./connection";

async function clearData() {
  try {
    console.log("Starting database cleanup (marking items as inactive)...");

    // Since we don't have DELETE permission, mark items as inactive instead
    console.log("Marking all menu items as inactive...");
    const menuResult = await query("UPDATE menu_items SET is_available = FALSE");
    console.log(`✓ Marked ${(menuResult as any).affectedRows || 0} menu items as inactive`);
    
    console.log("Marking all menu item addons as inactive...");
    const addonResult = await query("UPDATE menu_item_addons SET is_available = FALSE");
    console.log(`✓ Marked ${(addonResult as any).affectedRows || 0} addons as inactive`);
    
    console.log("Cancelling all active orders...");
    const orderResult = await query(
      "UPDATE orders SET status = 'cancelled' WHERE status NOT IN ('completed', 'cancelled')"
    );
    console.log(`✓ Cancelled ${(orderResult as any).affectedRows || 0} active orders`);
    
    console.log("Resetting inventory stock to 0...");
    const inventoryResult = await query("UPDATE inventory_items SET current_stock = 0");
    console.log(`✓ Reset ${(inventoryResult as any).affectedRows || 0} inventory items`);

    console.log("\n✓ Database cleanup completed!");
    console.log("→ All menu items marked as inactive");
    console.log("→ All active orders cancelled");
    console.log("→ All inventory stock reset to 0");
    console.log("\nNote: Running seed scripts will reactivate items with fresh data.");
  } catch (error: any) {
    console.error("Database cleanup error:", error.message);
    console.error(error);
    process.exit(1);
  }
}

// Run if called directly
if (process.argv[1] && process.argv[1].endsWith("clear-data.ts")) {
  clearData()
    .then(() => process.exit(0))
    .catch((error) => {
      console.error(error);
      process.exit(1);
    });
}

export { clearData };

