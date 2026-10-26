-- AlterTable
ALTER TABLE `MemberProfile` ADD COLUMN `placesOfEmploymentStudy` JSON NULL;

-- AlterTable
ALTER TABLE `Webinar` ADD COLUMN `date` DATETIME(3) NULL,
    ADD COLUMN `time` VARCHAR(191) NULL;

-- AlterTable
ALTER TABLE `EventRegistration` ADD COLUMN `reminderSentAt` DATETIME(3) NULL;
