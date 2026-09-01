-- CreateTable
CREATE TABLE `ReceiptEmailLog` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `eventCode` VARCHAR(191) NOT NULL,
    `subject` VARCHAR(191) NOT NULL,
    `sentByEmail` VARCHAR(191) NOT NULL,
    `sentCount` INTEGER NOT NULL,
    `failedCount` INTEGER NOT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    INDEX `ReceiptEmailLog_eventCode_idx`(`eventCode`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
