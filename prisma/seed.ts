import { PrismaClient } from "@prisma/client";
import * as bcrypt from "bcryptjs";

const prisma = new PrismaClient();

// =========================
// MAIN
// =========================
async function main() {
  console.log("Seeding database...");

  // ===================================================
  // LANGUAGES
  // ===================================================
  await prisma.language.createMany({
    data: [
      { code: "en", name: "English", isDefault: true },
      { code: "ar", name: "العربية", isDefault: false },
    ],
    skipDuplicates: true,
  });

  const languages = await prisma.language.findMany();

  // ===================================================
  // ROLES 
  // ===================================================
  await prisma.role.createMany({
    data: [{}, {}],
    skipDuplicates: true,
  });

  const roles = await prisma.role.findMany();

  // ===================================================
  // PERMISSIONS 
  // ===================================================
  const permissionsData = [
    { endpoint: "/dashboard" },
    { endpoint: "/users/create" },
    { endpoint: "/users/update" },
    { endpoint: "/users/delete" },
    { endpoint: "/users" },
    { endpoint: "/profile" },
    { endpoint: "/profile/update" },
    { endpoint: "/permissions" },
    { endpoint: "/roles/create" },
    { endpoint: "/roles/update" },
    { endpoint: "/roles/delete" },
    { endpoint: "/roles" },
    { endpoint: "/role/permissions" },
    { endpoint: "/products" },
    { endpoint: "/product/create" },
    { endpoint: "/product/update" },
    { endpoint: "/product/delete" },
    { endpoint: "/categories" },
    { endpoint: "/category/create" },
    { endpoint: "/category/update" },
    { endpoint: "/category/delete" },
    { endpoint: "/category/products" },
    { endpoint: "/contact-requests" },
    { endpoint: "/contact-requests/update" },
    { endpoint: "/about-us" },
    { endpoint: "/about-us/update" },
    { endpoint: "/contact-information" },
    { endpoint: "/contact-information/update" },
    { endpoint: "/home-slider" },
    { endpoint: "/home-slider/create" },
    { endpoint: "/home-slider/update" },
    { endpoint: "/home-slider/delete" },
    { endpoint: "/social-links" },
    { endpoint: "/social-links/create" },
    { endpoint: "/social-links/update" },
    { endpoint: "/social-links/delete" },
  ];

  await prisma.permission.createMany({
    data: permissionsData,
    skipDuplicates: true,
  });

  const permissions = await prisma.permission.findMany();

  // ===================================================
  // USERS
  // ===================================================
  const passwordHash = await bcrypt.hash("123", 10);

  await prisma.user.createMany({
    data: [
      {
        username: "admin",
        email: "admin@gmail.com",
        password: passwordHash,
        status: "active",
        languageId: languages.find((l) => l.code === "en")!.id,
      },
      {
        username: "manager",
        email: "manager@gmail.com",
        password: passwordHash,
        status: "active",
        languageId: languages.find((l) => l.code === "ar")!.id,
      },
    ],
    skipDuplicates: true,
  });

  const users = await prisma.user.findMany();

  const adminUser = users.find((u) => u.username === "admin");
  const managerUser = users.find((u) => u.username === "manager");

  // ===================================================
  // ROLE TRANSLATIONS
  // ===================================================
  const roleTranslations = [
    { en: "Administrator", ar: "مدير النظام" },
    { en: "Manager", ar: "مشرف" },
  ];

  for (const role of roles) {
    const tr = roleTranslations[role.id - 1];
    if (!tr) continue;

    for (const lang of languages) {
      await prisma.rolePermissionTranslation.create({
        data: {
          tableName: "Role",
          rowId: role.id,
          field: "name",
          languageId: lang.id,
          content: lang.code === "ar" ? tr.ar : tr.en,
        },
      });
    }
  }

  // ===================================================
  // PERMISSION TRANSLATIONS
  // ===================================================
  for (const permission of permissions) {
    for (const lang of languages) {
      await prisma.rolePermissionTranslation.create({
        data: {
          tableName: "Permission",
          rowId: permission.id,
          field: "name",
          languageId: lang.id,
          content:
            lang.code === "ar"
              ? `صلاحية ${permission.endpoint}`
              : `Permission ${permission.endpoint}`,
        },
      });
    }
  }

  // ===================================================
  // ROLE PERMISSIONS
  // ===================================================
  for (const role of roles) {
    await prisma.rolePermission.createMany({
      data: permissions.map((p) => ({
        roleId: role.id,
        permissionId: p.id,
      })),
      skipDuplicates: true,
    });
  }

  // ===================================================
  // USER ROLES
  // ===================================================
  if (adminUser && roles.length > 0) {
    await prisma.userRole.create({
      data: {
        userId: adminUser.id,
        roleId: roles[0].id, // Administrator
      },
    });
  }

  if (managerUser && roles.length > 1) {
    await prisma.userRole.create({
      data: {
        userId: managerUser.id,
        roleId: roles[1].id, // Manager
      },
    });
  }

  console.log("Seeding completed successfully ✅");
}

// =========================
// RUN
// =========================
main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
