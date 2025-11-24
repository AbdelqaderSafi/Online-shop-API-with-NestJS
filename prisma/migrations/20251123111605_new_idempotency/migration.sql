/*
  Warnings:

  - Added the required column `updated_at` to the `idempotency` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE `idempotency` ADD COLUMN `updated_at` DATETIME(3) NOT NULL;
