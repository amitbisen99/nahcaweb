-- AlterTable
ALTER TABLE `MemberProfile` ADD COLUMN `addressStreet` VARCHAR(191) NULL,
    ADD COLUMN `addressState` VARCHAR(191) NULL,
    ADD COLUMN `addressCountry` VARCHAR(191) NULL,
    ADD COLUMN `addressPostalCode` VARCHAR(191) NULL,
    ADD COLUMN `whatsappNumber` VARCHAR(191) NULL,
    ADD COLUMN `primaryRoleSetting` VARCHAR(191) NULL,
    ADD COLUMN `primaryRoleSettingOther` VARCHAR(191) NULL,
    ADD COLUMN `interestedIn` VARCHAR(191) NULL,
    ADD COLUMN `interestedInOther` VARCHAR(191) NULL,
    ADD COLUMN `spiritualCareRole` VARCHAR(191) NULL,
    ADD COLUMN `affiliatedOrganizations` VARCHAR(191) NULL,
    ADD COLUMN `studyProgram` VARCHAR(191) NULL;

-- AlterTable
ALTER TABLE `Membership` ADD COLUMN `contactPersonName` VARCHAR(191) NULL;
