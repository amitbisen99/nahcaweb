-- CreateTable
CREATE TABLE `ForumCategory` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `name` VARCHAR(191) NOT NULL,
    `slug` VARCHAR(191) NOT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    UNIQUE INDEX `ForumCategory_slug_key`(`slug`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `ForumTopic` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `categoryId` INTEGER NOT NULL,
    `authorId` INTEGER NOT NULL,
    `title` VARCHAR(191) NOT NULL,
    `body` TEXT NOT NULL,
    `visibility` ENUM('public', 'members_only') NOT NULL DEFAULT 'public',
    `status` ENUM('pending', 'published', 'rejected') NOT NULL DEFAULT 'pending',
    `rejectionReason` TEXT NULL,
    `pinned` BOOLEAN NOT NULL DEFAULT false,
    `locked` BOOLEAN NOT NULL DEFAULT false,
    `deletedAt` DATETIME(3) NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    INDEX `ForumTopic_categoryId_idx`(`categoryId`),
    INDEX `ForumTopic_authorId_idx`(`authorId`),
    INDEX `ForumTopic_status_idx`(`status`),
    INDEX `ForumTopic_visibility_idx`(`visibility`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `ForumReply` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `topicId` INTEGER NOT NULL,
    `authorId` INTEGER NOT NULL,
    `body` TEXT NOT NULL,
    `deletedAt` DATETIME(3) NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    INDEX `ForumReply_topicId_idx`(`topicId`),
    INDEX `ForumReply_authorId_idx`(`authorId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `ForumTopic` ADD CONSTRAINT `ForumTopic_categoryId_fkey` FOREIGN KEY (`categoryId`) REFERENCES `ForumCategory`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `ForumTopic` ADD CONSTRAINT `ForumTopic_authorId_fkey` FOREIGN KEY (`authorId`) REFERENCES `User`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `ForumReply` ADD CONSTRAINT `ForumReply_topicId_fkey` FOREIGN KEY (`topicId`) REFERENCES `ForumTopic`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `ForumReply` ADD CONSTRAINT `ForumReply_authorId_fkey` FOREIGN KEY (`authorId`) REFERENCES `User`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- Starter categories (admin-editable directly in the DB; no admin CRUD UI
-- for categories yet — out of scope for this first pass of the forum).
INSERT INTO `ForumCategory` (`name`, `slug`) VALUES
    ('General Discussion', 'general-discussion'),
    ('Chaplaincy Practice', 'chaplaincy-practice'),
    ('Events & Programs', 'events-programs'),
    ('Announcements', 'announcements');
