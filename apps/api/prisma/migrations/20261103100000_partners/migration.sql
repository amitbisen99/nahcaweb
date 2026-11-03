-- CreateTable
CREATE TABLE `Partner` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `name` VARCHAR(191) NOT NULL,
    `url` VARCHAR(191) NOT NULL,
    `logoUrl` VARCHAR(191) NULL,
    `order` INTEGER NOT NULL DEFAULT 0,
    `published` BOOLEAN NOT NULL DEFAULT false,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    INDEX `Partner_published_idx`(`published`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- Seed the partners that were hard-coded on the page
INSERT INTO `Partner` (`name`, `url`, `logoUrl`, `order`, `published`, `updatedAt`) VALUES
  ('Association of Professional Chaplains (APC)', 'https://www.apchaplains.org/', '/partners/apc.png', 1, true, CURRENT_TIMESTAMP(3)),
  ('ACPE', 'https://acpe.edu/', '/partners/acpe.png', 2, true, CURRENT_TIMESTAMP(3)),
  ('Chaplaincy Innovation Lab', 'https://chaplaincyinnovation.org/', '/partners/chaplaincy-innovation-lab.png', 3, true, CURRENT_TIMESTAMP(3)),
  ('Chinmaya International Foundation', 'https://chinfo.org/all-courses/hindu-spiritual-care/', '/partners/chinmaya-international-foundation.png', 4, true, CURRENT_TIMESTAMP(3));
