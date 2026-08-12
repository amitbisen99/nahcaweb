-- CreateTable
CREATE TABLE `MemberProfile` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `userId` INTEGER NOT NULL,
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
    `careContexts` JSON NULL,
    `boardCertified` BOOLEAN NULL,
    `boardCertifiedOrg` VARCHAR(191) NULL,
    `endorsed` BOOLEAN NULL,
    `endorsedBy` VARCHAR(191) NULL,
    `orgMemberships` JSON NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    UNIQUE INDEX `MemberProfile_userId_key`(`userId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `MemberProfile` ADD CONSTRAINT `MemberProfile_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `User`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;
