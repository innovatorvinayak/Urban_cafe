import "dotenv/config";
import { query } from "./connection";

interface InventoryItemData {
  name: string;
  hindi_name: string;
  category: string;
  unit: string;
  current_stock: number;
  min_stock: number;
  max_stock?: number;
  unit_price: number;
  supplier?: string;
}

const inventoryItems: InventoryItemData[] = [
  // Basic Ingredients
  { name: "Maggi Noodles", hindi_name: "मैगी नूडल्स", category: "Basic Ingredients", unit: "pack", current_stock: 100, min_stock: 20, max_stock: 200, unit_price: 14, supplier: "Nestle" },
  { name: "Butter", hindi_name: "मक्खन", category: "Basic Ingredients", unit: "kg", current_stock: 10, min_stock: 2, max_stock: 20, unit_price: 500, supplier: "Local Dairy" },
  { name: "Oil", hindi_name: "तेल", category: "Basic Ingredients", unit: "liter", current_stock: 10, min_stock: 2, max_stock: 20, unit_price: 150, supplier: "Local" },
  { name: "Salt", hindi_name: "नमक", category: "Basic Ingredients", unit: "kg", current_stock: 10, min_stock: 2, max_stock: 20, unit_price: 25, supplier: "Local" },
  
  // Spices & Masalas
  { name: "Red Chilli Powder", hindi_name: "लाल मिर्च पाउडर", category: "Spices & Masalas", unit: "pack", current_stock: 15, min_stock: 3, max_stock: 30, unit_price: 60, supplier: "MDH" },
  { name: "Turmeric Powder", hindi_name: "हल्दी पाउडर", category: "Spices & Masalas", unit: "pack", current_stock: 15, min_stock: 3, max_stock: 30, unit_price: 50, supplier: "MDH" },
  { name: "Coriander Powder", hindi_name: "धनिया पाउडर", category: "Spices & Masalas", unit: "pack", current_stock: 15, min_stock: 3, max_stock: 30, unit_price: 45, supplier: "MDH" },
  { name: "Garam Masala", hindi_name: "गरम मसाला", category: "Spices & Masalas", unit: "pack", current_stock: 15, min_stock: 3, max_stock: 30, unit_price: 60, supplier: "MDH" },
  { name: "Kitchen King Masala", hindi_name: "किचन किंग मसाला", category: "Spices & Masalas", unit: "pack", current_stock: 15, min_stock: 3, max_stock: 30, unit_price: 70, supplier: "MDH" },
  { name: "Tandoori Masala", hindi_name: "तंदूरी मसाला", category: "Spices & Masalas", unit: "pack", current_stock: 20, min_stock: 5, max_stock: 50, unit_price: 50, supplier: "MDH" },
  { name: "Peri-Peri Masala", hindi_name: "पेरी पेरी मसाला", category: "Spices & Masalas", unit: "pack", current_stock: 15, min_stock: 3, max_stock: 30, unit_price: 60, supplier: "Local" },
  { name: "Chaat Masala", hindi_name: "चाट मसाला", category: "Spices & Masalas", unit: "pack", current_stock: 15, min_stock: 3, max_stock: 30, unit_price: 40, supplier: "MDH" },
  { name: "Black Pepper", hindi_name: "काली मिर्च", category: "Spices & Masalas", unit: "pack", current_stock: 10, min_stock: 2, max_stock: 20, unit_price: 80, supplier: "Local" },
  { name: "Oregano", hindi_name: "ओरेगानो", category: "Spices & Masalas", unit: "pack", current_stock: 25, min_stock: 5, max_stock: 50, unit_price: 80, supplier: "Local" },
  { name: "Chilli Flakes", hindi_name: "चिली फ्लेक्स", category: "Spices & Masalas", unit: "pack", current_stock: 20, min_stock: 5, max_stock: 40, unit_price: 30, supplier: "Local" },
  { name: "Black Salt", hindi_name: "काला नमक", category: "Spices & Masalas", unit: "kg", current_stock: 2, min_stock: 0.5, max_stock: 5, unit_price: 100, supplier: "Local" },
  
  // Sauces & Condiments
  { name: "Schezwan Sauce", hindi_name: "स्कीज़वान सॉस", category: "Sauces", unit: "bottle", current_stock: 15, min_stock: 3, max_stock: 30, unit_price: 100, supplier: "Local" },
  { name: "Tomato Ketchup", hindi_name: "टोमैटो केचप", category: "Sauces", unit: "bottle", current_stock: 20, min_stock: 5, max_stock: 40, unit_price: 80, supplier: "Kissan" },
  { name: "Mayonnaise", hindi_name: "मेयोनीज़", category: "Sauces", unit: "bottle", current_stock: 10, min_stock: 2, max_stock: 20, unit_price: 120, supplier: "Veeba" },
  { name: "Tomato Pizza Sauce", hindi_name: "टोमैटो पिज़्ज़ा सॉस", category: "Sauces", unit: "bottle", current_stock: 20, min_stock: 5, max_stock: 40, unit_price: 90, supplier: "Kissan" },
  { name: "Chocolate Syrup", hindi_name: "चॉकलेट सिरप", category: "Sauces", unit: "bottle", current_stock: 12, min_stock: 3, max_stock: 25, unit_price: 150, supplier: "Hershey's" },
  
  // Dairy Products
  { name: "Cheese Slices", hindi_name: "चीज़ स्लाइस", category: "Dairy", unit: "pack", current_stock: 50, min_stock: 10, max_stock: 100, unit_price: 120, supplier: "Amul" },
  { name: "Mozzarella Cheese", hindi_name: "मौज़रेला चीज़", category: "Dairy", unit: "kg", current_stock: 5, min_stock: 1, max_stock: 10, unit_price: 400, supplier: "Local Dairy" },
  { name: "Processed Cheese", hindi_name: "प्रोसेस्ड चीज़", category: "Dairy", unit: "kg", current_stock: 5, min_stock: 1, max_stock: 10, unit_price: 350, supplier: "Amul" },
  { name: "Milk", hindi_name: "दूध", category: "Dairy", unit: "liter", current_stock: 20, min_stock: 5, max_stock: 50, unit_price: 60, supplier: "Local Dairy" },
  { name: "Fresh Cream", hindi_name: "मलाई / फ्रेश क्रीम", category: "Dairy", unit: "liter", current_stock: 5, min_stock: 1, max_stock: 10, unit_price: 300, supplier: "Local Dairy" },
  { name: "Curd (Yogurt)", hindi_name: "दही", category: "Dairy", unit: "kg", current_stock: 5, min_stock: 1, max_stock: 10, unit_price: 80, supplier: "Local Dairy" },
  { name: "Paneer", hindi_name: "पनीर", category: "Dairy", unit: "kg", current_stock: 5, min_stock: 1, max_stock: 10, unit_price: 300, supplier: "Local Dairy" },
  { name: "Milk Powder", hindi_name: "मिल्क पाउडर", category: "Dairy", unit: "pack", current_stock: 10, min_stock: 2, max_stock: 20, unit_price: 400, supplier: "Nestle" },
  
  // Vegetables
  { name: "Boiled Sweet Corn", hindi_name: "उबला मीठा कॉर्न", category: "Vegetables", unit: "kg", current_stock: 3, min_stock: 1, max_stock: 8, unit_price: 60, supplier: "Local Market" },
  { name: "Capsicum", hindi_name: "शिमला मिर्च", category: "Vegetables", unit: "kg", current_stock: 5, min_stock: 1, max_stock: 10, unit_price: 80, supplier: "Local Market" },
  { name: "Onion", hindi_name: "प्याज", category: "Vegetables", unit: "kg", current_stock: 10, min_stock: 2, max_stock: 20, unit_price: 40, supplier: "Local Market" },
  { name: "Tomato", hindi_name: "टमाटर", category: "Vegetables", unit: "kg", current_stock: 8, min_stock: 2, max_stock: 15, unit_price: 50, supplier: "Local Market" },
  { name: "Cabbage", hindi_name: "पत्ता गोभी", category: "Vegetables", unit: "kg", current_stock: 5, min_stock: 1, max_stock: 10, unit_price: 30, supplier: "Local Market" },
  { name: "Potato", hindi_name: "आलू", category: "Vegetables", unit: "kg", current_stock: 10, min_stock: 2, max_stock: 20, unit_price: 30, supplier: "Local Market" },
  { name: "Carrot", hindi_name: "गाजर", category: "Vegetables", unit: "kg", current_stock: 3, min_stock: 1, max_stock: 8, unit_price: 40, supplier: "Local Market" },
  { name: "Green Peas", hindi_name: "हरी मटर", category: "Vegetables", unit: "kg", current_stock: 2, min_stock: 0.5, max_stock: 5, unit_price: 100, supplier: "Local Market" },
  { name: "Green Chilli", hindi_name: "हरी मिर्च", category: "Vegetables", unit: "kg", current_stock: 1, min_stock: 0.25, max_stock: 3, unit_price: 100, supplier: "Local Market" },
  { name: "Ginger", hindi_name: "अदरक", category: "Vegetables", unit: "kg", current_stock: 1, min_stock: 0.25, max_stock: 3, unit_price: 250, supplier: "Local Market" },
  { name: "Garlic", hindi_name: "लहसुन", category: "Vegetables", unit: "kg", current_stock: 2, min_stock: 0.5, max_stock: 5, unit_price: 200, supplier: "Local Market" },
  { name: "Garlic Paste", hindi_name: "लहसुन पेस्ट", category: "Vegetables", unit: "jar", current_stock: 10, min_stock: 2, max_stock: 20, unit_price: 80, supplier: "Local" },
  { name: "Coriander Leaves", hindi_name: "धनिया पत्ती", category: "Vegetables", unit: "bunch", current_stock: 15, min_stock: 5, max_stock: 30, unit_price: 15, supplier: "Local Market" },
  { name: "Mint Leaves", hindi_name: "पुदीना पत्ती", category: "Vegetables", unit: "bunch", current_stock: 20, min_stock: 5, max_stock: 40, unit_price: 20, supplier: "Local Market" },
  { name: "Lemon", hindi_name: "नींबू", category: "Vegetables", unit: "kg", current_stock: 5, min_stock: 1, max_stock: 10, unit_price: 60, supplier: "Local Market" },
  
  // Bakery Items
  { name: "Bread", hindi_name: "ब्रेड", category: "Bakery", unit: "pack", current_stock: 30, min_stock: 10, max_stock: 60, unit_price: 40, supplier: "Local Bakery" },
  { name: "Pizza Base", hindi_name: "पिज़्ज़ा बेस", category: "Bakery", unit: "piece", current_stock: 50, min_stock: 10, max_stock: 100, unit_price: 15, supplier: "Local Bakery" },
  
  // Beverages Ingredients
  { name: "Tea Leaves", hindi_name: "चाय पत्ती", category: "Beverages", unit: "kg", current_stock: 5, min_stock: 1, max_stock: 10, unit_price: 400, supplier: "Tata Tea" },
  { name: "Sugar", hindi_name: "चीनी", category: "Beverages", unit: "kg", current_stock: 20, min_stock: 5, max_stock: 50, unit_price: 50, supplier: "Local" },
  { name: "Jaggery", hindi_name: "गुड़ (वैकल्पिक)", category: "Beverages", unit: "kg", current_stock: 3, min_stock: 1, max_stock: 8, unit_price: 80, supplier: "Local" },
  { name: "Cardamom", hindi_name: "इलायची", category: "Beverages", unit: "pack", current_stock: 15, min_stock: 3, max_stock: 30, unit_price: 80, supplier: "Local" },
  { name: "Caramel Syrup", hindi_name: "करामेल सिरप", category: "Beverages", unit: "bottle", current_stock: 8, min_stock: 2, max_stock: 15, unit_price: 150, supplier: "Local" },
  { name: "Coffee Powder", hindi_name: "कॉफी पाउडर", category: "Beverages", unit: "kg", current_stock: 3, min_stock: 0.5, max_stock: 8, unit_price: 600, supplier: "Nescafe" },
  { name: "Ice Cubes", hindi_name: "बर्फ", category: "Beverages", unit: "kg", current_stock: 20, min_stock: 5, max_stock: 50, unit_price: 10, supplier: "Local" },
  { name: "Soda Water", hindi_name: "सोडा वाटर", category: "Beverages", unit: "bottle", current_stock: 50, min_stock: 10, max_stock: 100, unit_price: 20, supplier: "Coca Cola" },
  { name: "Lemon Juice", hindi_name: "नींबू रस", category: "Beverages", unit: "bottle", current_stock: 10, min_stock: 2, max_stock: 20, unit_price: 60, supplier: "Local" },
  { name: "Orange Syrup", hindi_name: "ऑरेंज सिरप", category: "Beverages", unit: "bottle", current_stock: 8, min_stock: 2, max_stock: 15, unit_price: 150, supplier: "Local" },
  { name: "Mint Syrup", hindi_name: "मिंट सिरप", category: "Beverages", unit: "bottle", current_stock: 10, min_stock: 2, max_stock: 20, unit_price: 120, supplier: "Local" },
  { name: "Masala Lemonade Powder", hindi_name: "मसाला लेमोनेड पाउडर", category: "Beverages", unit: "pack", current_stock: 15, min_stock: 3, max_stock: 30, unit_price: 50, supplier: "Local" },
  { name: "Rooh Afza / Lemon Sharbat Syrup", hindi_name: "रू अफज़ा / नींबू शरबत सिरप", category: "Beverages", unit: "bottle", current_stock: 8, min_stock: 2, max_stock: 15, unit_price: 180, supplier: "Hamdard" },
  
  // Dessert Ingredients
  { name: "Cocoa Powder", hindi_name: "कोको पाउडर", category: "Desserts", unit: "pack", current_stock: 8, min_stock: 2, max_stock: 15, unit_price: 200, supplier: "Cadbury" },
  { name: "Bread (for dessert)", hindi_name: "ब्रेड (डेज़र्ट के लिए)", category: "Desserts", unit: "pack", current_stock: 30, min_stock: 10, max_stock: 60, unit_price: 40, supplier: "Local Bakery" },
  { name: "Powdered Sugar", hindi_name: "पाउडर चीनी", category: "Desserts", unit: "kg", current_stock: 5, min_stock: 1, max_stock: 10, unit_price: 60, supplier: "Local" },
  { name: "Dry Fruits Chopped", hindi_name: "कटे हुए सूखे मेवे", category: "Desserts", unit: "kg", current_stock: 2, min_stock: 0.5, max_stock: 5, unit_price: 800, supplier: "Local" },
  
  // Packaging & Disposables
  { name: "Paper Cups", hindi_name: "पेपर कप", category: "Packaging", unit: "pack", current_stock: 200, min_stock: 50, max_stock: 500, unit_price: 150, supplier: "Local" },
  { name: "Plastic Cups", hindi_name: "प्लास्टिक कप", category: "Packaging", unit: "pack", current_stock: 200, min_stock: 50, max_stock: 500, unit_price: 100, supplier: "Local" },
  { name: "Straws", hindi_name: "स्ट्रॉ", category: "Packaging", unit: "pack", current_stock: 100, min_stock: 20, max_stock: 300, unit_price: 50, supplier: "Local" },
  { name: "Tissue Paper", hindi_name: "टिश्यू पेपर", category: "Packaging", unit: "pack", current_stock: 50, min_stock: 10, max_stock: 100, unit_price: 80, supplier: "Local" },
  { name: "Aluminium Foil", hindi_name: "एल्युमिनियम फॉयल", category: "Packaging", unit: "roll", current_stock: 15, min_stock: 3, max_stock: 30, unit_price: 120, supplier: "Local" },
  { name: "Disposable Plates", hindi_name: "डिस्पोजेबल प्लेट्स", category: "Packaging", unit: "pack", current_stock: 100, min_stock: 20, max_stock: 300, unit_price: 150, supplier: "Local" },
];

async function seedInventory() {
  try {
    console.log("Starting complete inventory seeding with Hindi names...");

    // Check if is_active column exists
    let hasIsActiveColumn = false;
    try {
      await query("SELECT is_active FROM inventory_items LIMIT 1");
      hasIsActiveColumn = true;
    } catch (error: any) {
      if (error.code === 'ER_BAD_FIELD_ERROR') {
        console.log("⚠️  is_active column not found. Run: ALTER TABLE inventory_items ADD COLUMN is_active BOOLEAN DEFAULT TRUE;");
        console.log("Continuing without is_active column...");
      } else {
        throw error;
      }
    }

    // Mark all existing items as inactive (if column exists)
    if (hasIsActiveColumn) {
      console.log("Marking all existing inventory items as inactive...");
      const markInactiveResult = await query("UPDATE inventory_items SET is_active = FALSE");
      console.log(`✓ Marked ${(markInactiveResult as any).affectedRows || 0} items as inactive`);
    }

    let inserted = 0;
    let updated = 0;
    let skipped = 0;

    for (const item of inventoryItems) {
      try {
        // Combine English and Hindi names
        const itemName = item.hindi_name ? `${item.name} / ${item.hindi_name}` : item.name;

        // Check if item already exists (by original name or combined name)
        const existingItems = await query(
          "SELECT id, name FROM inventory_items WHERE name = ? OR name = ?",
          [item.name, itemName]
        );

        if (Array.isArray(existingItems) && existingItems.length > 0) {
          // Check for exact duplicate to avoid multiple entries
          const exactMatch = (existingItems as any[]).find((ei: any) => ei.name === itemName);
          
          if (exactMatch) {
            // Update existing item and set to active
            const updateSql = hasIsActiveColumn
              ? `UPDATE inventory_items 
                 SET category = ?, unit = ?, current_stock = ?, min_stock = ?, max_stock = ?, 
                     unit_price = ?, supplier = ?, is_active = TRUE
                 WHERE id = ?`
              : `UPDATE inventory_items 
                 SET category = ?, unit = ?, current_stock = ?, min_stock = ?, max_stock = ?, 
                     unit_price = ?, supplier = ?
                 WHERE id = ?`;
            
            await query(updateSql, [
              item.category,
              item.unit,
              item.current_stock,
              item.min_stock,
              item.max_stock || null,
              item.unit_price,
              item.supplier || null,
              exactMatch.id,
            ]);
            console.log(`✓ Updated: ${itemName}`);
            updated++;
          } else {
            // Update the old name to new combined name
            const oldItem = (existingItems as any[])[0];
            const updateSql = hasIsActiveColumn
              ? `UPDATE inventory_items 
                 SET name = ?, category = ?, unit = ?, current_stock = ?, min_stock = ?, max_stock = ?, 
                     unit_price = ?, supplier = ?, is_active = TRUE
                 WHERE id = ?`
              : `UPDATE inventory_items 
                 SET name = ?, category = ?, unit = ?, current_stock = ?, min_stock = ?, max_stock = ?, 
                     unit_price = ?, supplier = ?
                 WHERE id = ?`;
            
            await query(updateSql, [
              itemName,
              item.category,
              item.unit,
              item.current_stock,
              item.min_stock,
              item.max_stock || null,
              item.unit_price,
              item.supplier || null,
              oldItem.id,
            ]);
            console.log(`✓ Updated (renamed): ${itemName}`);
            updated++;
          }
        } else {
          // Insert new item as active
          const insertSql = hasIsActiveColumn
            ? `INSERT INTO inventory_items (name, category, unit, current_stock, min_stock, max_stock, unit_price, supplier, is_active)
               VALUES (?, ?, ?, ?, ?, ?, ?, ?, TRUE)`
            : `INSERT INTO inventory_items (name, category, unit, current_stock, min_stock, max_stock, unit_price, supplier)
               VALUES (?, ?, ?, ?, ?, ?, ?, ?)`;
          
          await query(insertSql, [
            itemName,
            item.category,
            item.unit,
            item.current_stock,
            item.min_stock,
            item.max_stock || null,
            item.unit_price,
            item.supplier || null,
          ]);
          console.log(`✓ Inserted: ${itemName}`);
          inserted++;
        }
      } catch (error: any) {
        console.error(`✗ Error processing ${item.name}:`, error.message);
        skipped++;
      }
    }

    console.log(`\nComplete inventory seeding finished!`);
    console.log(`✓ Inserted: ${inserted} items`);
    console.log(`✓ Updated: ${updated} items`);
    console.log(`✗ Skipped: ${skipped} items (errors)`);
    console.log(`Total: ${inserted + updated} items processed`);
    console.log("\nNote: Old items not in the seed list remain inactive.");
  } catch (error: any) {
    console.error("Inventory seeding error:", error.message);
    console.error(error);
    process.exit(1);
  }
}

// Run if called directly
if (process.argv[1] && process.argv[1].endsWith("seed-inventory-complete.ts")) {
  seedInventory()
    .then(() => process.exit(0))
    .catch((error) => {
      console.error(error);
      process.exit(1);
    });
}

export { seedInventory };

