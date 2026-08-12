-- AlterTable: expand Coupon with admin-manageable fields
ALTER TABLE `Coupon`
  ADD COLUMN `name` VARCHAR(191) NOT NULL DEFAULT '',
  ADD COLUMN `appliesTo` JSON NULL,
  ADD COLUMN `validFrom` DATETIME(3) NULL,
  ADD COLUMN `validTill` DATETIME(3) NULL,
  ADD COLUMN `published` BOOLEAN NOT NULL DEFAULT false,
  ADD COLUMN `updatedAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3);

ALTER TABLE `Coupon` DROP COLUMN `expiresAt`;

ALTER TABLE `Coupon` MODIFY COLUMN `discountType` ENUM('percent', 'fixed_amount', 'complimentary') NOT NULL;

-- AlterTable: link Payment to the Coupon it redeemed, if any
ALTER TABLE `Payment` ADD COLUMN `couponId` INTEGER NULL;

-- CreateIndex
CREATE INDEX `Payment_couponId_idx` ON `Payment`(`couponId`);

-- AddForeignKey
ALTER TABLE `Payment` ADD CONSTRAINT `Payment_couponId_fkey` FOREIGN KEY (`couponId`) REFERENCES `Coupon`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;
