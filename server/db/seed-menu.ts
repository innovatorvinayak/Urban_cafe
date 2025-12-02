import "dotenv/config";
import { query } from "./connection";

interface MenuItemData {
  name: string;
  category: string;
  cost: number;
  price: number;
  description: string;
  hindiDescription?: string;
}

const menuItems: MenuItemData[] = [
  // Maggi Items
  {
    name: "Amritsari Butter Tadka Maggi",
    category: "Food",
    cost: 38,
    price: 65,
    description: "Heat oil + butter → add garlic & onions → add tomatoes, masala, kasuri methi → add water + Maggi + tastemaker → cook 3 mins → add butter on top.",
    hindiDescription: "तेल + मक्खन गरम करें → लहसुन और प्याज़ भूनें → टमाटर, मसाले, कसूरी मेथी डालें → पानी + मैगी + टेस्टमेकर डालें → 3 मिनट पकाएँ → ऊपर मक्खन डालें।"
  },
  {
    name: "Dhaba Masala Maggi",
    category: "Food",
    cost: 38,
    price: 65,
    description: "Sauté onions, tomatoes, capsicum, peas → add spices → add water + Maggi + tastemaker → cook thick.",
    hindiDescription: "प्याज़, टमाटर, शिमला मिर्च, मटर भूनें → मसाले डालें → पानी + मैगी + टेस्टमेकर डालें → गाढ़ा होने तक पकाएँ।"
  },
  {
    name: "Lahori Garlic Maggi",
    category: "Food",
    cost: 34,
    price: 60,
    description: "Melt butter → add lots of garlic + chilli → add water + Maggi → sprinkle chilli flakes before serving.",
    hindiDescription: "मक्खन पिघलाएँ → ज़्यादा लहसुन + हरी मिर्च भूनें → पानी + मैगी डालें → सर्व करते समय चिली फ्लेक्स डालें।"
  },
  {
    name: "Tandoori Maggi",
    category: "Food",
    cost: 40,
    price: 70,
    description: "Mix curd + tandoori masala + onion + capsicum → fry in butter → add water + Maggi → cook creamy.",
    hindiDescription: "दही + तंदूरी मसाला + प्याज़ + शिमला मिर्च मिलाएँ → मक्खन में भूनें → पानी + मैगी डालें → क्रीमी होने तक पकाएँ।"
  },
  {
    name: "Cheese Burst Maggi",
    category: "Food",
    cost: 48,
    price: 82,
    description: "Cook Maggi in milk → add grated cheese → stir until fully melted and creamy.",
    hindiDescription: "मैगी को दूध में पकाएँ → कद्दूकस चीज़ डालें → पूरी तरह पिघलने तक चलाएँ।"
  },
  {
    name: "Garlic Cheese Maggi",
    category: "Food",
    cost: 46,
    price: 78,
    description: "Fry garlic in butter → add Maggi + water → add cheese cube at the end.",
    hindiDescription: "मक्खन में लहसुन भूनें → मैगी + पानी डालें → अंत में चीज़ क्यूब डालें और पिघलाएँ।"
  },
  {
    name: "Corn & Cheese Maggi",
    category: "Food",
    cost: 45,
    price: 78,
    description: "Add boiled corn to Maggi → add cheese → mix well.",
    hindiDescription: "उबला हुआ कॉर्न मैगी में डालें → चीज़ मिलाएँ → अच्छे से चलाएँ।"
  },
  {
    name: "Paneer Cheese Masala Maggi",
    category: "Food",
    cost: 52,
    price: 88,
    description: "Fry paneer + onion + tomato → add Maggi + water + tastemaker → add cheese on top.",
    hindiDescription: "पनीर + प्याज़ + टमाटर भूनें → मैगी + पानी + टेस्टमेकर डालें → ऊपर चीज़ डालें और पिघलाएँ।"
  },
  {
    name: "Peri-Peri Cheese Maggi",
    category: "Food",
    cost: 50,
    price: 80,
    description: "Cook Maggi with milk + water → add cheese → sprinkle peri-peri seasoning before serving.",
    hindiDescription: "मैगी को दूध + पानी में पकाएँ → चीज़ डालें → सर्व करते समय पेरी-पेरी मसाला छिड़कें।"
  },
  
  // Sandwich Items
  {
    name: "Veg Sandwich",
    category: "Food",
    cost: 32,
    price: 60,
    description: "Butter bread → add sliced onion, tomato, cucumber → apply green chutney + black salt + chilli flakes → close and toast 2 mins (optional).",
    hindiDescription: "ब्रेड पर बटर लगाएँ → प्याज़, टमाटर, खीरा रखें → हरी चटनी + काला नमक + चिली फ्लेक्स डालें → ब्रेड बंद करें → चाहें तो 2 मिनट टोस्ट करें।"
  },
  {
    name: "Paneer Cheese Sandwich",
    category: "Food",
    cost: 48,
    price: 90,
    description: "Butter bread → add mashed paneer + cheese + capsicum + oregano → spread mayo or chutney → toast until cheese melts.",
    hindiDescription: "ब्रेड पर बटर लगाएँ → पनीर + चीज़ + शिमला मिर्च + ओरिगैनो रखें → मेयो/चटनी लगाएँ → चीज़ पिघलने तक टोस्ट करें।"
  },
  {
    name: "Tandoori Sandwich",
    category: "Food",
    cost: 42,
    price: 80,
    description: "Mix hung curd + tandoori masala + onion + capsicum → fill in sandwich → butter grill 3 mins.",
    hindiDescription: "दही + तंदूरी मसाला + प्याज़ + शिमला मिर्च मिलाएँ → सैंडविच में भरें → 3 मिनट मक्खन लगाकर ग्रिल करें।"
  },
  {
    name: "Plain Sandwich",
    category: "Food",
    cost: 20,
    price: 40,
    description: "Butter both bread slices → add chutney + black salt → serve without toasting.",
    hindiDescription: "दोनों ब्रेड पर बटर लगाएँ → हरी चटनी + काला नमक लगाएँ → टोस्ट किए बिना परोसें।"
  },
  {
    name: "Cheese Sandwich",
    category: "Food",
    cost: 40,
    price: 75,
    description: "Butter bread → add grated cheese + oregano + chilli flakes → toast until melted.",
    hindiDescription: "ब्रेड पर बटर लगाएँ → कद्दूकस चीज़ + ओरिगैनो + चिली फ्लेक्स डालें → चीज़ पिघलने तक टोस्ट करें।"
  },
  {
    name: "Corn Cheese Sandwich",
    category: "Food",
    cost: 44,
    price: 85,
    description: "Add boiled sweet corn + grated cheese + mayonnaise → close bread → grill till golden.",
    hindiDescription: "उबला स्वीट कॉर्न + कद्दूकस चीज़ + मेयो मिलाएँ → ब्रेड में भरें → सुनहरा होने तक ग्रिल करें।"
  },
  {
    name: "Veg Grilled Sandwich",
    category: "Food",
    cost: 38,
    price: 70,
    description: "Butter bread → add tomato + onion + capsicum + boiled potato → chutney → sprinkle sandwich masala → grill 3 mins.",
    hindiDescription: "ब्रेड पर बटर लगाएँ → टमाटर + प्याज़ + शिमला मिर्च + उबला आलू रखें → चटनी लगाएँ → सैंडविच मसाला छिड़कें → 3 मिनट ग्रिल करें।"
  },
  
  // Magizza Items
  {
    name: "Classic Masala Magizza",
    category: "Food",
    cost: 42,
    price: 85,
    description: "Cook Maggi dry with little water, spread on tawa like pizza base, add veggies + cheese on top, cover & cook until cheesy.",
    hindiDescription: "मैगी को थोड़े पानी में सूखा पकाएँ, तवे पर बेस की तरह फैलाएँ, ऊपर सब्जियाँ + चीज़ डालकर ढककर पकाएँ।"
  },
  {
    name: "Spicy Schezwan Magizza",
    category: "Food",
    cost: 48,
    price: 95,
    description: "Mix Schezwan chutney while cooking Maggi (dry), place on tawa, add veggies + mozzarella, melt cheese and serve.",
    hindiDescription: "मैगी में पकाते समय शेज़वान चटनी मिलाएँ, तवे पर फैलाएँ, ऊपर सब्जियाँ + मोज़रेला डालकर चीज़ पिघलने तक पकाएँ।"
  },
  {
    name: "Extra Cheese Magizza",
    category: "Food",
    cost: 58,
    price: 115,
    description: "Cook Maggi dry, shape like pizza, add heavy cheese topping, cover until fully melted and golden.",
    hindiDescription: "मैगी को सूखा पकाकर बेस बनाएँ, ऊपर खूब सारा चीज़ डालें, ढककर गोल्डन होने तक पकाएँ।"
  },
  {
    name: "Veggie Delight Magizza",
    category: "Food",
    cost: 54,
    price: 102,
    description: "Cook Maggi dry, place on tawa, add mixed veggies + mozzarella and seasonings, cook covered.",
    hindiDescription: "मैगी को सूखा पकाकर तवे पर रखें, सब्जियाँ + मोज़रेला और मसाले डालकर ढककर पकाएँ।"
  },
  {
    name: "Cheese Burst Magizza",
    category: "Food",
    cost: 70,
    price: 140,
    description: "Spread cooked dry Maggi, layer cheese sauce + mozzarella heavily, cover to get a cheese burst texture.",
    hindiDescription: "सूखी मैगी फैलाएँ, ऊपर चीज़ सॉस + मोज़रेला भारी मात्रा में डालें, ढककर चीज़ बर्स्ट बनने तक पकाएँ।"
  },
  {
    name: "Corn & Cheese Magizza",
    category: "Food",
    cost: 60,
    price: 120,
    description: "Add boiled corn to Maggi, cook dry, shape on tawa, add cheese topping & seasonings, cover until melted.",
    hindiDescription: "मैगी में उबला हुआ कॉर्न मिलाएँ, सूखा पकाएँ, तवे पर बेस बनाएँ, ऊपर चीज़ + मसाले डालकर पिघलने तक पकाएँ।"
  },
  
  // Tea Items
  {
    name: "Lemon Chai",
    category: "Tea",
    cost: 10,
    price: 22,
    description: "Boil water with tea + sugar, strain, squeeze lemon before serving (do not boil after lemon).",
    hindiDescription: "पानी में चायपत्ती + चीनी उबालें, छान लें, नींबू निचोड़कर परोसें (नींबू उबालें नहीं)."
  },
  {
    name: "Masala Chai",
    category: "Tea",
    cost: 13,
    price: 27,
    description: "Boil milk + water + tea leaves + sugar + masala, simmer for flavour, strain and serve.",
    hindiDescription: "दूध + पानी + चायपत्ती + चीनी + मसाला उबालें, स्वाद आने तक पकाएँ, छानकर परोसें।"
  },
  {
    name: "Caramel Masala Chai",
    category: "Tea",
    cost: 17,
    price: 35,
    description: "Boil milk + water + tea leaves + sugar + masala, simmer for flavour, strain and serve. Add caramel over top.",
    hindiDescription: "दूध + पानी + चायपत्ती + चीनी + मसाला उबालें, स्वाद आने तक पकाएँ, छानकर परोसें। कैरेमल ऊपर से डालें।"
  },
  {
    name: "Elaichi Chai",
    category: "Tea",
    cost: 14,
    price: 30,
    description: "Boil milk + water + tea + sugar + elaichi, simmer, strain.",
    hindiDescription: "दूध + पानी + चायपत्ती + चीनी + इलायची उबालें, पकने दें, छानें।"
  },
  {
    name: "Caramel Elaichi Chai",
    category: "Tea",
    cost: 18,
    price: 40,
    description: "Boil milk + water + tea + sugar + elaichi, simmer, strain. Drizzle caramel if needed.",
    hindiDescription: "दूध + पानी + चायपत्ती + चीनी + इलायची उबालें, पकने दें, छानें। कैरेमल ऊपर से डालें।"
  },
  {
    name: "Normal Chai",
    category: "Tea",
    cost: 12,
    price: 22,
    description: "Boil water + milk + tea + sugar, simmer, strain.",
    hindiDescription: "पानी + दूध + चायपत्ती + चीनी उबालें, पकाएँ, छानकर परोसें।"
  },
  {
    name: "Caramel Normal Chai",
    category: "Tea",
    cost: 16,
    price: 32,
    description: "Boil water + milk + tea + sugar, simmer, strain. Drizzle caramel if required.",
    hindiDescription: "पानी + दूध + चायपत्ती + चीनी उबालें, पकाएँ, छानकर परोसें। कैरेमल ऊपर से डालें।"
  },
  {
    name: "Adrak (Ginger) Chai",
    category: "Tea",
    cost: 14,
    price: 30,
    description: "Add crushed ginger while boiling milk + water + tea + sugar, simmer.",
    hindiDescription: "दूध + पानी + चायपत्ती + चीनी उबालते समय अदरक डालें, स्वाद आने तक पकाएँ।"
  },
  {
    name: "Caramel Adrak Chai",
    category: "Tea",
    cost: 18,
    price: 40,
    description: "Add crushed ginger while boiling milk + water + tea + sugar, simmer. Drizzle caramel if needed.",
    hindiDescription: "दूध + पानी + चायपत्ती + चीनी उबालते समय अदरक डालें, स्वाद आने तक पकाएँ। कैरेमल ऊपर से डालें।"
  },
  
  // Coffee
  {
    name: "Filter Coffee",
    category: "Coffee",
    cost: 18,
    price: 35,
    description: "Add coffee powder inside the filter and pour hot water. Add milk and sugar as per preference.",
    hindiDescription: "फिल्टर में कॉफी पाउडर डालें और गर्म पानी डालें। दूध और चीनी पसंद के अनुसार मिलाएँ।"
  },
  
  // Drinks
  {
    name: "Classic Mojito",
    category: "Beverages",
    cost: 18,
    price: 55,
    description: "Crush mint + lemon + sugar slightly, add ice, pour soda, mix gently.",
    hindiDescription: "पुदीना + नींबू + चीनी हल्का कूटें, बर्फ डालें, सोडा डालकर मिलाएँ।"
  },
  {
    name: "Mint Mojito (Extra Mint)",
    category: "Beverages",
    cost: 22,
    price: 65,
    description: "Crush mint + lemon + sugar, add mint syrup, ice and soda, mix.",
    hindiDescription: "पुदीना + नींबू + चीनी कूटें, मिंट सिरप + बर्फ + सोडा डालकर मिलाएँ।"
  },
  {
    name: "Orange Mojito",
    category: "Beverages",
    cost: 28,
    price: 77,
    description: "Mix mint + lemon + syrup, add ice and soda, garnish with mint.",
    hindiDescription: "पुदीना + नींबू + ऑरेंज सिरप मिलाएँ, बर्फ डालें, सोडा डालें।"
  },
  {
    name: "Lemon Mojito",
    category: "Beverages",
    cost: 17,
    price: 55,
    description: "Muddle lemon + mint + sugar + salt, add ice, pour soda, stir.",
    hindiDescription: "नींबू + पुदीना + चीनी + नमक कूटें, बर्फ डालें, सोडा डालकर चलाएँ।"
  },
  {
    name: "Masala Lemonade",
    category: "Beverages",
    cost: 13,
    price: 40,
    description: "Mix lemon + sugar + masalas in chilled water, add ice and mint.",
    hindiDescription: "नींबू + चीनी + मसाले ठंडे पानी में मिलाएँ, बर्फ व पुदीना डालें।"
  },
  {
    name: "Shikanji (North Indian)",
    category: "Beverages",
    cost: 14,
    price: 40,
    description: "Combine lemon + sugar + salts + cumin powder in water, add ice.",
    hindiDescription: "नींबू + चीनी + काला नमक + जीरा पानी में मिलाएँ, बर्फ डालें।"
  },
  
  // Dessert
  {
    name: "Chocolate with Bread",
    category: "Desserts",
    cost: 18,
    price: 40,
    description: "Heat a pan and add butter. Toast bread slices, apply chocolate syrup. Optional: Add choco chips (₹3 extra).",
    hindiDescription: "पैन गरम करें और मक्खन डालें। ब्रेड स्लाइस टोस्ट करें, चॉकलेट सिरप लगाएँ। वैकल्पिक: चॉको चिप्स डालें (₹3 अतिरिक्त)।"
  },
  
  // Pizza Items
  {
    name: "Classic Masala Pizza",
    category: "Food",
    cost: 50,
    price: 95,
    description: "Spread butter on base, add tomato sauce, top with onion, capsicum, sprinkle oregano, add mozzarella, bake/grill until cheese melts.",
    hindiDescription: "बेस पर मक्खन लगाएँ, टमाटर सॉस फैलाएँ, ऊपर प्याज़, शिमला मिर्च डालें, ओरिगैनो छिड़कें, मोज़रेला डालें और चीज़ पिघलने तक बेक/ग्रिल करें।"
  },
  {
    name: "Spicy Schezwan Pizza",
    category: "Food",
    cost: 55,
    price: 105,
    description: "Spread butter + Schezwan sauce on base, top with onion, capsicum, sprinkle chilli flakes, add mozzarella, grill until cheesy.",
    hindiDescription: "बेस पर मक्खन + शेज़वान सॉस लगाएँ, ऊपर प्याज़, शिमला मिर्च डालें, चिली फ्लेक्स छिड़कें, मोज़रेला डालें और चीज़ पिघलने तक ग्रिल करें।"
  },
  {
    name: "Extra Cheese Pizza",
    category: "Food",
    cost: 65,
    price: 125,
    description: "Spread sauce on base, add onion + capsicum lightly, top generously with mozzarella, grill/bake until golden cheesy.",
    hindiDescription: "बेस पर सॉस फैलाएँ, प्याज़ + शिमला मिर्च हल्का डालें, ऊपर खूब मोज़रेला डालें, गोल्डन चीज़ बनने तक ग्रिल/बेक करें।"
  },
  {
    name: "Veggie Delight Pizza",
    category: "Food",
    cost: 60,
    price: 115,
    description: "Spread butter + sauce on base, add onion, capsicum, tomato, corn, top with mozzarella, bake/grill until cheese melts.",
    hindiDescription: "बेस पर मक्खन + सॉस फैलाएँ, प्याज़, शिमला मिर्च, टमाटर, कॉर्न डालें, मोज़रेला डालकर चीज़ पिघलने तक बेक/ग्रिल करें।"
  },
  {
    name: "Cheese Burst Pizza",
    category: "Food",
    cost: 70,
    price: 140,
    description: "Spread sauce on base, top heavily with mozzarella + cheddar + slice, bake/grill to get gooey cheese burst.",
    hindiDescription: "बेस पर सॉस फैलाएँ, मोज़रेला + चेडर + चीज़ स्लाइस ऊपर डालें, चीज़ बर्स्ट बनने तक बेक/ग्रिल करें।"
  },
  {
    name: "Corn & Cheese Pizza",
    category: "Food",
    cost: 65,
    price: 125,
    description: "Spread sauce on base, add corn, sprinkle oregano, top with mozzarella, bake/grill until cheese melts.",
    hindiDescription: "बेस पर सॉस फैलाएँ, कॉर्न डालें, ओरिगैनो छिड़कें, मोज़रेला डालकर चीज़ पिघलने तक बेक/ग्रिल करें।"
  }
];

async function seedMenu() {
  try {
    console.log("Starting menu seeding...");

    // Get category IDs
    const categories = await query("SELECT id, name FROM categories");
    const categoryMap = new Map();
    (categories as any[]).forEach((cat) => {
      categoryMap.set(cat.name, cat.id);
    });

    let inserted = 0;
    let skipped = 0;

    for (const item of menuItems) {
      const categoryId = categoryMap.get(item.category);
      
      if (!categoryId) {
        console.error(`Category "${item.category}" not found for item "${item.name}"`);
        continue;
      }

      // Combine English and Hindi descriptions
      const fullDescription = item.hindiDescription 
        ? `${item.description}\n\n${item.hindiDescription}`
        : item.description;

      try {
        // Check if item already exists
        const [existing] = await query(
          "SELECT id FROM menu_items WHERE name = ? AND category_id = ?",
          [item.name, categoryId]
        );

        if ((existing as any[]).length > 0) {
          // Update existing item
          await query(
            `UPDATE menu_items 
             SET price = ?, description = ?, is_available = TRUE
             WHERE name = ? AND category_id = ?`,
            [item.price, fullDescription, item.name, categoryId]
          );
          console.log(`✓ Updated: ${item.name}`);
          skipped++;
        } else {
          // Insert new item
          await query(
            `INSERT INTO menu_items (name, category_id, description, price, is_available, display_order)
             VALUES (?, ?, ?, ?, TRUE, ?)`,
            [item.name, categoryId, fullDescription, item.price, inserted + 1]
          );
          console.log(`✓ Inserted: ${item.name}`);
          inserted++;
        }
      } catch (error: any) {
        console.error(`✗ Error inserting ${item.name}:`, error.message);
      }
    }

    console.log(`\nMenu seeding completed!`);
    console.log(`✓ Inserted: ${inserted} items`);
    console.log(`✓ Updated: ${skipped} items`);
    console.log(`Total: ${inserted + skipped} items processed`);
  } catch (error: any) {
    console.error("Menu seeding error:", error.message);
    console.error(error);
    process.exit(1);
  }
}

// Run if called directly
if (process.argv[1] && process.argv[1].endsWith("seed-menu.ts")) {
  seedMenu()
    .then(() => process.exit(0))
    .catch((error) => {
      console.error(error);
      process.exit(1);
    });
}

export { seedMenu };

