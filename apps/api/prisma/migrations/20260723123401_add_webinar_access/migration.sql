-- AlterTable
ALTER TABLE `Webinar` ADD COLUMN `access` ENUM('open', 'members_only') NOT NULL DEFAULT 'open';

-- CreateIndex
CREATE INDEX `Webinar_access_idx` ON `Webinar`(`access`);
