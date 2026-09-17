-- AlterTable
ALTER TABLE `product` ADD COLUMN `membersOnly` BOOLEAN NOT NULL DEFAULT false,
    ADD COLUMN `thumbnailUrl` VARCHAR(191) NULL;
