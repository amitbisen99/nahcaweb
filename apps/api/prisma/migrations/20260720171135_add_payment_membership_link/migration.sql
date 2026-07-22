-- AlterTable
ALTER TABLE `Payment` ADD COLUMN `membershipId` INTEGER NULL;

-- CreateIndex
CREATE UNIQUE INDEX `Payment_membershipId_key` ON `Payment`(`membershipId`);

-- AddForeignKey
ALTER TABLE `Payment` ADD CONSTRAINT `Payment_membershipId_fkey` FOREIGN KEY (`membershipId`) REFERENCES `Membership`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;