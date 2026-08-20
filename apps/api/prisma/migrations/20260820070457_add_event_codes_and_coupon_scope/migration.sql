-- AlterTable: Coupon gets an optional eventCode, set only when appliesTo
-- includes "nahca_programmes".
ALTER TABLE `Coupon` ADD COLUMN `eventCode` VARCHAR(191) NULL;

-- AlterTable: Event gets a unique eventCode. Added nullable first so
-- existing rows can be backfilled with a deterministic value before the
-- NOT NULL + UNIQUE constraints go on.
ALTER TABLE `Event` ADD COLUMN `eventCode` VARCHAR(191) NULL;
UPDATE `Event` SET `eventCode` = CONCAT('EVT-', LPAD(`id`, 6, '0')) WHERE `eventCode` IS NULL;
ALTER TABLE `Event` MODIFY COLUMN `eventCode` VARCHAR(191) NOT NULL;
CREATE UNIQUE INDEX `Event_eventCode_key` ON `Event`(`eventCode`);

-- AlterTable: Webinar gets the same.
ALTER TABLE `Webinar` ADD COLUMN `eventCode` VARCHAR(191) NULL;
UPDATE `Webinar` SET `eventCode` = CONCAT('WEB-', LPAD(`id`, 6, '0')) WHERE `eventCode` IS NULL;
ALTER TABLE `Webinar` MODIFY COLUMN `eventCode` VARCHAR(191) NOT NULL;
CREATE UNIQUE INDEX `Webinar_eventCode_key` ON `Webinar`(`eventCode`);
