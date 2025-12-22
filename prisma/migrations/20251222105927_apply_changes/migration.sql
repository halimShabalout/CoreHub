/*
  Warnings:

  - You are about to drop the column `name` on the `Permission` table. All the data in the column will be lost.
  - You are about to drop the column `description` on the `Role` table. All the data in the column will be lost.
  - You are about to drop the column `isDeveloper` on the `Role` table. All the data in the column will be lost.
  - You are about to drop the column `name` on the `Role` table. All the data in the column will be lost.

*/
-- DropIndex
DROP INDEX "Permission_name_key";

-- DropIndex
DROP INDEX "Role_name_key";

-- AlterTable
ALTER TABLE "Permission" DROP COLUMN "name";

-- AlterTable
ALTER TABLE "Role" DROP COLUMN "description",
DROP COLUMN "isDeveloper",
DROP COLUMN "name";

-- CreateTable
CREATE TABLE "RolePermissionTranslation" (
    "id" SERIAL NOT NULL,
    "tableName" TEXT NOT NULL,
    "rowId" INTEGER NOT NULL,
    "field" TEXT NOT NULL,
    "languageId" INTEGER NOT NULL,
    "content" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "RolePermissionTranslation_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "RolePermissionTranslation_tableName_rowId_languageId_field_idx" ON "RolePermissionTranslation"("tableName", "rowId", "languageId", "field");

-- CreateIndex
CREATE UNIQUE INDEX "RolePermissionTranslation_tableName_rowId_field_languageId_key" ON "RolePermissionTranslation"("tableName", "rowId", "field", "languageId");

-- AddForeignKey
ALTER TABLE "RolePermissionTranslation" ADD CONSTRAINT "RolePermissionTranslation_languageId_fkey" FOREIGN KEY ("languageId") REFERENCES "Language"("id") ON DELETE CASCADE ON UPDATE CASCADE;
