/*
  Warnings:

  - Added the required column `payment_method` to the `user_transactions` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE `user_transactions` ADD COLUMN `payment_method` ENUM('CASH') NOT NULL;
