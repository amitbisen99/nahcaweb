-- AlterTable
ALTER TABLE `ConferenceVideo` MODIFY `videoUrl` VARCHAR(191) NULL,
    ADD COLUMN `videoFileUrl` VARCHAR(191) NULL,
    ADD COLUMN `embedCode` TEXT NULL,
    ADD COLUMN `thumbnailUrl` VARCHAR(191) NULL;
