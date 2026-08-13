-- AlterTable
ALTER TABLE `Membership` ADD COLUMN `studentCount` INTEGER NULL;

-- CreateTable
CREATE TABLE `InstitutionSponsorship` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `userId` INTEGER NOT NULL,
    `seatCount` INTEGER NOT NULL,
    `stripeSubscriptionId` VARCHAR(191) NULL,
    `startDate` DATETIME(3) NOT NULL,
    `endDate` DATETIME(3) NOT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    UNIQUE INDEX `InstitutionSponsorship_userId_key`(`userId`),
    INDEX `InstitutionSponsorship_stripeSubscriptionId_idx`(`stripeSubscriptionId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `InstitutionClaimCode` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `sponsorshipId` INTEGER NOT NULL,
    `code` VARCHAR(191) NOT NULL,
    `claimedByUserId` INTEGER NULL,
    `claimedAt` DATETIME(3) NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    UNIQUE INDEX `InstitutionClaimCode_code_key`(`code`),
    INDEX `InstitutionClaimCode_sponsorshipId_idx`(`sponsorshipId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `InstitutionSponsorship` ADD CONSTRAINT `InstitutionSponsorship_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `User`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `InstitutionClaimCode` ADD CONSTRAINT `InstitutionClaimCode_sponsorshipId_fkey` FOREIGN KEY (`sponsorshipId`) REFERENCES `InstitutionSponsorship`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `InstitutionClaimCode` ADD CONSTRAINT `InstitutionClaimCode_claimedByUserId_fkey` FOREIGN KEY (`claimedByUserId`) REFERENCES `User`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;
