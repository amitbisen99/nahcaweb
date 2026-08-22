-- AlterTable: PaymentType gets a new "event" value
ALTER TABLE `Payment` MODIFY COLUMN `type` ENUM('membership', 'donation', 'conference', 'endorsement', 'event') NOT NULL;

-- CreateTable
CREATE TABLE `EventRegistration` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `eventCode` VARCHAR(191) NOT NULL,
    `userId` INTEGER NULL,
    `name` VARCHAR(191) NULL,
    `email` VARCHAR(191) NULL,
    `preferredPronouns` VARCHAR(191) NULL,
    `mailingAddress` TEXT NULL,
    `phone` VARCHAR(191) NULL,
    `usesWhatsapp` BOOLEAN NULL,
    `whatsappContactOk` BOOLEAN NULL,
    `religiousTraditions` JSON NULL,
    `religiousTraditionOther` VARCHAR(191) NULL,
    `primaryRole` VARCHAR(191) NULL,
    `employment` JSON NULL,
    `hearAboutUs` VARCHAR(191) NULL,
    `hearAboutUsOther` VARCHAR(191) NULL,
    `status` ENUM('pending', 'active') NOT NULL DEFAULT 'pending',
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    INDEX `EventRegistration_eventCode_idx`(`eventCode`),
    INDEX `EventRegistration_userId_idx`(`userId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AlterTable: Payment gets an optional link to the registration it paid for
ALTER TABLE `Payment` ADD COLUMN `eventRegistrationId` INTEGER NULL;

-- CreateIndex
CREATE UNIQUE INDEX `Payment_eventRegistrationId_key` ON `Payment`(`eventRegistrationId`);

-- AddForeignKey
ALTER TABLE `EventRegistration` ADD CONSTRAINT `EventRegistration_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `User`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Payment` ADD CONSTRAINT `Payment_eventRegistrationId_fkey` FOREIGN KEY (`eventRegistrationId`) REFERENCES `EventRegistration`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;
