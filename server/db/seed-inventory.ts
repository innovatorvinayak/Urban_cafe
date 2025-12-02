import "dotenv/config";
import { query } from "./connection";

interface InventoryItemData {
  name: string;
  hindi_name?: string;
  category: string;
  unit: string;
  current_stock: number;
  min_stock: number;
  max_stock?: number;
  unit_price: number;
  supplier?: string;
}

const inventoryItems: InventoryItemData[] = [
  // ========== Maggi & Magizza Ingredients ==========
  { name: "Maggi Noodles", hindi_name: "मैगी नूडल्स", category: "Maggi & Magizza", unit: "pack", current_stock: 100, min_stock: 20, max_stock: 200, unit_price: 14, supplier: "Nestle" },
  { name: "Butter", hindi_name: "मक्खन", category: "Basic Ingredients", unit: "kg", current_stock: 10, min_stock: 2, max_stock: 20, unit_price: 500, supplier: "Local Dairy" },
  { name: "Oil", hindi_name: "तेल", category: "Basic Ingredients", unit: "liter", current_stock: 10, min_stock: 2, max_stock: 20, unit_price: 150, supplier: "Local" },
  { name: "Salt", hindi_name: "नमक", category: "Basic Ingredients", unit: "kg", current_stock: 10, min_stock: 2, max_stock: 20, unit_price: 25, supplier: "Local" },
  { name: "Red Chilli Powder", hindi_name: "लाल मिर्च पाउडर", category: "Spices & Masalas", unit: "pack", current_stock: 15, min_stock: 3, max_stock: 30, unit_price: 60, supplier: "MDH" },
  { name: "Turmeric Powder", hindi_name: "हल्दी पाउडर", category: "Spices & Masalas", unit: "pack", current_stock: 15, min_stock: 3, max_stock: 30, unit_price: 50, supplier: "MDH" },
  { name: "Coriander Powder", hindi_name: "धनिया पाउडर", category: "Spices & Masalas", unit: "pack", current_stock: 15, min_stock: 3, max_stock: 30, unit_price: 45, supplier: "MDH" },
  { name: "Garam Masala", hindi_name: "गरम मसाला", category: "Spices & Masalas", unit: "pack", current_stock: 15, min_stock: 3, max_stock: 30, unit_price: 60, supplier: "MDH" },
  { name: "Kitchen King Masala", hindi_name: "किचन किंग मसाला", category: "Spices & Masalas", unit: "pack", current_stock: 15, min_stock: 3, max_stock: 30, unit_price: 70, supplier: "MDH" },
  { name: "Tandoori Masala", hindi_name: "तंदूरी मसाला", category: "Spices & Masalas", unit: "pack", current_stock: 20, min_stock: 5, max_stock: 50, unit_price: 50, supplier: "MDH" },
  { name: "Peri-Peri Masala", hindi_name: "पेरी पेरी मसाला", category: "Spices & Masalas", unit: "pack", current_stock: 15, min_stock: 3, max_stock: 30, unit_price: 60, supplier: "Local" },
  { name: "Garlic", category: "Maggi & Magizza", unit: "kg", current_stock: 2, min_stock: 0.5, max_stock: 5, unit_price: 200, supplier: "Local Market" },
  { name: "Ginger", category: "Maggi & Magizza", unit: "kg", current_stock: 1, min_stock: 0.25, max_stock: 3, unit_price: 250, supplier: "Local Market" },
  { name: "Onion", category: "Maggi & Magizza", unit: "kg", current_stock: 10, min_stock: 2, max_stock: 20, unit_price: 40, supplier: "Local Market" },
  { name: "Tomato", category: "Maggi & Magizza", unit: "kg", current_stock: 8, min_stock: 2, max_stock: 15, unit_price: 50, supplier: "Local Market" },
  { name: "Capsicum", category: "Maggi & Magizza", unit: "kg", current_stock: 5, min_stock: 1, max_stock: 10, unit_price: 80, supplier: "Local Market" },
  { name: "Green Chilli", category: "Maggi & Magizza", unit: "kg", current_stock: 1, min_stock: 0.25, max_stock: 3, unit_price: 100, supplier: "Local Market" },
  { name: "Kasuri Methi", category: "Maggi & Magizza", unit: "pack", current_stock: 15, min_stock: 3, max_stock: 30, unit_price: 40, supplier: "MDH" },
  { name: "Tandoori Masala", category: "Maggi & Magizza", unit: "pack", current_stock: 20, min_stock: 5, max_stock: 50, unit_price: 50, supplier: "MDH" },
  { name: "Curd / Yogurt", category: "Maggi & Magizza", unit: "kg", current_stock: 5, min_stock: 1, max_stock: 10, unit_price: 80, supplier: "Local Dairy" },
  { name: "Peri-Peri Seasoning", category: "Maggi & Magizza", unit: "pack", current_stock: 15, min_stock: 3, max_stock: 30, unit_price: 60, supplier: "Local" },
  { name: "Sweet Corn (Boiled)", category: "Maggi & Magizza", unit: "kg", current_stock: 3, min_stock: 1, max_stock: 8, unit_price: 60, supplier: "Local Market" },
  { name: "Paneer", category: "Maggi & Magizza", unit: "kg", current_stock: 5, min_stock: 1, max_stock: 10, unit_price: 300, supplier: "Local Dairy" },
  { name: "Cheese Cube", category: "Maggi & Magizza", unit: "pack", current_stock: 50, min_stock: 10, max_stock: 100, unit_price: 15, supplier: "Amul" },
  { name: "Grated Cheese", category: "Maggi & Magizza", unit: "kg", current_stock: 3, min_stock: 1, max_stock: 8, unit_price: 400, supplier: "Local Dairy" },
  { name: "Mozzarella Cheese", category: "Maggi & Magizza", unit: "kg", current_stock: 5, min_stock: 1, max_stock: 10, unit_price: 400, supplier: "Local Dairy" },
  { name: "Cheese Slice", category: "Maggi & Magizza", unit: "pack", current_stock: 50, min_stock: 10, max_stock: 100, unit_price: 120, supplier: "Amul" },
  { name: "Cheese Sauce", category: "Maggi & Magizza", unit: "bottle", current_stock: 8, min_stock: 2, max_stock: 15, unit_price: 200, supplier: "Local" },
  { name: "Chilli Flakes", category: "Maggi & Magizza", unit: "pack", current_stock: 20, min_stock: 5, max_stock: 40, unit_price: 30, supplier: "Local" },
  { name: "Oregano", category: "Maggi & Magizza", unit: "pack", current_stock: 25, min_stock: 5, max_stock: 50, unit_price: 80, supplier: "Local" },
  { name: "Schezwan Chutney", category: "Maggi & Magizza", unit: "bottle", current_stock: 15, min_stock: 3, max_stock: 30, unit_price: 100, supplier: "Local" },
  { name: "Black Salt", category: "Maggi & Magizza", unit: "kg", current_stock: 2, min_stock: 0.5, max_stock: 5, unit_price: 100, supplier: "Local" },
  { name: "Masala / Sandwich Masala", category: "Maggi & Magizza", unit: "pack", current_stock: 12, min_stock: 3, max_stock: 25, unit_price: 50, supplier: "MDH" },
  
  // ========== Sandwich Ingredients ==========
  { name: "Bread", category: "Sandwich", unit: "pack", current_stock: 30, min_stock: 10, max_stock: 60, unit_price: 40, supplier: "Local Bakery" },
  { name: "Butter", category: "Sandwich", unit: "kg", current_stock: 10, min_stock: 2, max_stock: 20, unit_price: 500, supplier: "Local Dairy" },
  { name: "Green Chutney", category: "Sandwich", unit: "bottle", current_stock: 10, min_stock: 2, max_stock: 20, unit_price: 60, supplier: "Local" },
  { name: "Black Salt", category: "Sandwich", unit: "kg", current_stock: 2, min_stock: 0.5, max_stock: 5, unit_price: 100, supplier: "Local" },
  { name: "Tomato", category: "Sandwich", unit: "kg", current_stock: 8, min_stock: 2, max_stock: 15, unit_price: 50, supplier: "Local Market" },
  { name: "Onion", category: "Sandwich", unit: "kg", current_stock: 10, min_stock: 2, max_stock: 20, unit_price: 40, supplier: "Local Market" },
  { name: "Cucumber", category: "Sandwich", unit: "kg", current_stock: 3, min_stock: 1, max_stock: 6, unit_price: 40, supplier: "Local Market" },
  { name: "Mayonnaise", category: "Sandwich", unit: "bottle", current_stock: 10, min_stock: 2, max_stock: 20, unit_price: 120, supplier: "Veeba" },
  { name: "Oregano", category: "Sandwich", unit: "pack", current_stock: 25, min_stock: 5, max_stock: 50, unit_price: 80, supplier: "Local" },
  { name: "Boiled Potato", category: "Sandwich", unit: "kg", current_stock: 5, min_stock: 1, max_stock: 10, unit_price: 30, supplier: "Local Market" },
  { name: "Sweet Corn", category: "Sandwich", unit: "kg", current_stock: 3, min_stock: 1, max_stock: 8, unit_price: 60, supplier: "Local Market" },
  { name: "Paneer", category: "Sandwich", unit: "kg", current_stock: 5, min_stock: 1, max_stock: 10, unit_price: 300, supplier: "Local Dairy" },
  { name: "Cheese (Mozzarella / Slice / Cube)", category: "Sandwich", unit: "kg", current_stock: 5, min_stock: 1, max_stock: 10, unit_price: 400, supplier: "Local Dairy" },
  
  // ========== Pizza Ingredients ==========
  { name: "Pizza Base (6-7 inch)", category: "Pizza", unit: "piece", current_stock: 50, min_stock: 10, max_stock: 100, unit_price: 15, supplier: "Local Bakery" },
  { name: "Butter", category: "Pizza", unit: "kg", current_stock: 10, min_stock: 2, max_stock: 20, unit_price: 500, supplier: "Local Dairy" },
  { name: "Tomato Sauce / Pizza Sauce", category: "Pizza", unit: "bottle", current_stock: 20, min_stock: 5, max_stock: 40, unit_price: 80, supplier: "Kissan" },
  { name: "Schezwan Sauce", category: "Pizza", unit: "bottle", current_stock: 15, min_stock: 3, max_stock: 30, unit_price: 100, supplier: "Local" },
  { name: "Onion", category: "Pizza", unit: "kg", current_stock: 10, min_stock: 2, max_stock: 20, unit_price: 40, supplier: "Local Market" },
  { name: "Capsicum", category: "Pizza", unit: "kg", current_stock: 5, min_stock: 1, max_stock: 10, unit_price: 80, supplier: "Local Market" },
  { name: "Tomato", category: "Pizza", unit: "kg", current_stock: 8, min_stock: 2, max_stock: 15, unit_price: 50, supplier: "Local Market" },
  { name: "Sweet Corn", category: "Pizza", unit: "kg", current_stock: 3, min_stock: 1, max_stock: 8, unit_price: 60, supplier: "Local Market" },
  { name: "Mozzarella Cheese", category: "Pizza", unit: "kg", current_stock: 5, min_stock: 1, max_stock: 10, unit_price: 400, supplier: "Local Dairy" },
  { name: "Chilli Flakes", category: "Pizza", unit: "pack", current_stock: 20, min_stock: 5, max_stock: 40, unit_price: 30, supplier: "Local" },
  { name: "Oregano", category: "Pizza", unit: "pack", current_stock: 25, min_stock: 5, max_stock: 50, unit_price: 80, supplier: "Local" },
  
  // ========== Chai & Coffee Ingredients ==========
  { name: "Tea Leaves", category: "Chai & Coffee", unit: "kg", current_stock: 5, min_stock: 1, max_stock: 10, unit_price: 400, supplier: "Tata Tea" },
  { name: "Milk", category: "Chai & Coffee", unit: "liter", current_stock: 20, min_stock: 5, max_stock: 50, unit_price: 60, supplier: "Local Dairy" },
  { name: "Water", category: "Chai & Coffee", unit: "liter", current_stock: 50, min_stock: 10, max_stock: 100, unit_price: 5, supplier: "Local" },
  { name: "Sugar", category: "Chai & Coffee", unit: "kg", current_stock: 20, min_stock: 5, max_stock: 50, unit_price: 50, supplier: "Local" },
  { name: "Lemon", category: "Chai & Coffee", unit: "kg", current_stock: 5, min_stock: 1, max_stock: 10, unit_price: 60, supplier: "Local Market" },
  { name: "Black Salt", category: "Chai & Coffee", unit: "kg", current_stock: 2, min_stock: 0.5, max_stock: 5, unit_price: 100, supplier: "Local" },
  { name: "Masala (Chai Masala)", category: "Chai & Coffee", unit: "pack", current_stock: 20, min_stock: 5, max_stock: 40, unit_price: 60, supplier: "Local" },
  { name: "Elaichi Powder", category: "Chai & Coffee", unit: "pack", current_stock: 15, min_stock: 3, max_stock: 30, unit_price: 80, supplier: "Local" },
  { name: "Ginger", category: "Chai & Coffee", unit: "kg", current_stock: 1, min_stock: 0.25, max_stock: 3, unit_price: 250, supplier: "Local Market" },
  { name: "Caramel Syrup", category: "Chai & Coffee", unit: "bottle", current_stock: 8, min_stock: 2, max_stock: 15, unit_price: 150, supplier: "Local" },
  { name: "Filter Coffee Powder", category: "Chai & Coffee", unit: "kg", current_stock: 3, min_stock: 0.5, max_stock: 8, unit_price: 600, supplier: "Nescafe" },
  
  // ========== Mojito & Drinks Ingredients ==========
  { name: "Mint Leaves", category: "Mojito & Drinks", unit: "bunch", current_stock: 20, min_stock: 5, max_stock: 40, unit_price: 20, supplier: "Local Market" },
  { name: "Lemon", category: "Mojito & Drinks", unit: "kg", current_stock: 5, min_stock: 1, max_stock: 10, unit_price: 60, supplier: "Local Market" },
  { name: "Sugar", category: "Mojito & Drinks", unit: "kg", current_stock: 20, min_stock: 5, max_stock: 50, unit_price: 50, supplier: "Local" },
  { name: "Soda", category: "Mojito & Drinks", unit: "bottle", current_stock: 50, min_stock: 10, max_stock: 100, unit_price: 20, supplier: "Coca Cola" },
  { name: "Salt", category: "Mojito & Drinks", unit: "kg", current_stock: 5, min_stock: 1, max_stock: 10, unit_price: 20, supplier: "Local" },
  { name: "Green Mint Syrup", category: "Mojito & Drinks", unit: "bottle", current_stock: 10, min_stock: 2, max_stock: 20, unit_price: 120, supplier: "Local" },
  { name: "Orange Syrup", category: "Mojito & Drinks", unit: "bottle", current_stock: 8, min_stock: 2, max_stock: 15, unit_price: 150, supplier: "Local" },
  { name: "Water", category: "Mojito & Drinks", unit: "liter", current_stock: 50, min_stock: 10, max_stock: 100, unit_price: 5, supplier: "Local" },
  { name: "Ice", category: "Mojito & Drinks", unit: "kg", current_stock: 20, min_stock: 5, max_stock: 50, unit_price: 10, supplier: "Local" },
  { name: "Cumin Powder (Jeera)", category: "Mojito & Drinks", unit: "pack", current_stock: 10, min_stock: 2, max_stock: 20, unit_price: 50, supplier: "MDH" },
  { name: "Chaat Masala", category: "Mojito & Drinks", unit: "pack", current_stock: 15, min_stock: 3, max_stock: 30, unit_price: 40, supplier: "MDH" },
  
  // ========== Chocolate Bread Ingredients ==========
  { name: "Bread", category: "Chocolate Bread", unit: "pack", current_stock: 30, min_stock: 10, max_stock: 60, unit_price: 40, supplier: "Local Bakery" },
  { name: "Butter", category: "Chocolate Bread", unit: "kg", current_stock: 10, min_stock: 2, max_stock: 20, unit_price: 500, supplier: "Local Dairy" },
  { name: "Chocolate Syrup", category: "Chocolate Bread", unit: "bottle", current_stock: 12, min_stock: 3, max_stock: 25, unit_price: 150, supplier: "Hershey's" },
  { name: "Choco Chips (Optional)", category: "Chocolate Bread", unit: "pack", current_stock: 15, min_stock: 3, max_stock: 30, unit_price: 80, supplier: "Local" },
];

async function seedInventory() {
  try {
    console.log("Starting inventory seeding...");

    let inserted = 0;
    let updated = 0;

    for (const item of inventoryItems) {
      try {
        // Check if item already exists
        const [existing] = await query(
          "SELECT id FROM inventory_items WHERE name = ? AND category = ?",
          [item.name, item.category]
        );

        if ((existing as any[]).length > 0) {
          // Update existing item
          await query(
            `UPDATE inventory_items 
             SET unit = ?, current_stock = ?, min_stock = ?, max_stock = ?, unit_price = ?, supplier = ?
             WHERE name = ? AND category = ?`,
            [
              item.unit,
              item.current_stock,
              item.min_stock,
              item.max_stock || null,
              item.unit_price,
              item.supplier || null,
              item.name,
              item.category,
            ]
          );
          console.log(`✓ Updated: ${item.name}`);
          updated++;
        } else {
          // Insert new item
          await query(
            `INSERT INTO inventory_items (name, category, unit, current_stock, min_stock, max_stock, unit_price, supplier)
             VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
            [
              item.name,
              item.category,
              item.unit,
              item.current_stock,
              item.min_stock,
              item.max_stock || null,
              item.unit_price,
              item.supplier || null,
            ]
          );
          console.log(`✓ Inserted: ${item.name}`);
          inserted++;
        }
      } catch (error: any) {
        console.error(`✗ Error processing ${item.name}:`, error.message);
      }
    }

    console.log(`\nInventory seeding completed!`);
    console.log(`✓ Inserted: ${inserted} items`);
    console.log(`✓ Updated: ${updated} items`);
    console.log(`Total: ${inserted + updated} items processed`);
  } catch (error: any) {
    console.error("Inventory seeding error:", error.message);
    console.error(error);
    process.exit(1);
  }
}

// Run if called directly
if (process.argv[1] && process.argv[1].endsWith("seed-inventory.ts")) {
  seedInventory()
    .then(() => process.exit(0))
    .catch((error) => {
      console.error(error);
      process.exit(1);
    });
}

export { seedInventory };

