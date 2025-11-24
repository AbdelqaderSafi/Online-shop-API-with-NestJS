-- AlterTable
ALTER TABLE `user_transactions` MODIFY `payment_method` ENUM('CASH') NOT NULL DEFAULT 'CASH';
