import "dotenv/config";
import { query } from "./connection";

interface UserData {
  email: string;
  password: string;
  name: string;
  role: "admin" | "manager" | "cashier" | "kitchen";
}

const users: UserData[] = [
  {
    email: "admin@zenithgarden.com",
    password: "admin123",
    name: "Admin User",
    role: "admin",
  },
  {
    email: "manager@zenithgarden.com",
    password: "manager123",
    name: "Manager User",
    role: "manager",
  },
  {
    email: "cashier@zenithgarden.com",
    password: "cashier123",
    name: "Cashier User",
    role: "cashier",
  },
  {
    email: "kitchen@zenithgarden.com",
    password: "kitchen123",
    name: "Kitchen Staff",
    role: "kitchen",
  },
];

async function seedUsers() {
  try {
    console.log("Starting user seeding...");

    let inserted = 0;
    let updated = 0;

    for (const user of users) {
      try {
        // Check if user already exists
        const existing = await query(
          "SELECT id FROM users WHERE email = ?",
          [user.email]
        );

        if (Array.isArray(existing) && existing.length > 0) {
          // Update existing user
          await query(
            `UPDATE users 
             SET password = ?, name = ?, role = ?, is_active = TRUE
             WHERE email = ?`,
            [user.password, user.name, user.role, user.email]
          );
          console.log(`✓ Updated: ${user.email}`);
          updated++;
        } else {
          // Insert new user
          await query(
            `INSERT INTO users (email, password, name, role, is_active)
             VALUES (?, ?, ?, ?, TRUE)`,
            [user.email, user.password, user.name, user.role]
          );
          console.log(`✓ Inserted: ${user.email}`);
          inserted++;
        }
      } catch (error: any) {
        console.error(`✗ Error processing ${user.email}:`, error.message);
      }
    }

    console.log(`\nUser seeding completed!`);
    console.log(`✓ Inserted: ${inserted} users`);
    console.log(`✓ Updated: ${updated} users`);
    console.log(`Total: ${inserted + updated} users processed`);
    console.log(`\nDefault login credentials:`);
    users.forEach((u) => {
      console.log(`  ${u.role}: ${u.email} / ${u.password}`);
    });
  } catch (error: any) {
    console.error("User seeding error:", error.message);
    console.error(error);
    process.exit(1);
  }
}

// Run if called directly
if (process.argv[1] && process.argv[1].endsWith("seed-users.ts")) {
  seedUsers()
    .then(() => process.exit(0))
    .catch((error) => {
      console.error(error);
      process.exit(1);
    });
}

export { seedUsers };

