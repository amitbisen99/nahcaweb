-- AlterTable
ALTER TABLE `Event` ADD COLUMN `access` ENUM('open', 'members_only') NOT NULL DEFAULT 'open';
ALTER TABLE `Event` ADD COLUMN `speakers` JSON NULL;

-- CreateIndex
CREATE INDEX `Event_access_idx` ON `Event`(`access`);

-- AlterTable
ALTER TABLE `Webinar` ADD COLUMN `speakers` JSON NULL;
