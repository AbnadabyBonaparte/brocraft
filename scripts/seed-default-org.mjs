/**
 * Seed script to create default organization for BROCRAFT
 * Run this after migration 0004_multi_tenant_foundation.sql
 */

import { drizzle } from "drizzle-orm/mysql2";
import mysql from "mysql2/promise";
import { organizations } from "../drizzle/schema.js";
import { eq } from "drizzle-orm";

const connectionString = process.env.DATABASE_URL;
if (!connectionString) {
  console.error("ERROR: DATABASE_URL environment variable is required");
  process.exit(1);
}

async function seedDefaultOrg() {
  const connection = await mysql.createConnection(connectionString);
  const db = drizzle(connection);

  try {
    // Use fixed UUID for default org (matches migration)
    const defaultOrgId = "00000000-0000-0000-0000-000000000001";
    
    // Check if default org already exists
    const existing = await db.select().from(organizations).where(
      eq(organizations.slug, "brocraft-community")
    ).limit(1);

    if (existing.length > 0) {
      console.log("✅ Default organization already exists:", existing[0].id);
      return existing[0].id;
    }

    // Create default organization with fixed UUID
    const defaultOrg = {
      id: defaultOrgId,
      name: "Brocraft Community",
      slug: "brocraft-community",
    };

    // Use INSERT IGNORE to avoid errors if org already exists
    try {
      await db.insert(organizations).values(defaultOrg);
    } catch (error) {
      // If org already exists, that's fine
      if (error.message?.includes('Duplicate entry')) {
        console.log("   (Organization already exists, skipping)");
      } else {
        throw error;
      }
    }

    console.log("✅ Default organization created:", defaultOrgId);
    console.log("   Name:", defaultOrg.name);
    console.log("   Slug:", defaultOrg.slug);

    return defaultOrgId;
  } catch (error) {
    console.error("❌ Error seeding default organization:", error);
    throw error;
  } finally {
    await connection.end();
  }
}

seedDefaultOrg()
  .then((orgId) => {
    console.log("\n🎉 Seed completed successfully!");
    console.log("Default org ID:", orgId);
    process.exit(0);
  })
  .catch((error) => {
    console.error("\n💥 Seed failed:", error);
    process.exit(1);
  });

