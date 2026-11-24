-- Resources become one kind of record: a single form, filed under any number of
-- tags (Academic Papers, Websites, Podcasts, Videos, Articles, Newsletters) and
-- shown on any number of pages (Resources for Chaplains / Students / Community).

ALTER TABLE `Resource`
    ADD COLUMN `websiteUrl` VARCHAR(191) NULL,
    ADD COLUMN `podcastUrl` VARCHAR(191) NULL,
    ADD COLUMN `videoUrl` VARCHAR(191) NULL,
    ADD COLUMN `publishedDate` DATETIME(3) NULL,
    ADD COLUMN `tags` JSON NULL,
    ADD COLUMN `pages` JSON NULL;

-- Existing rows: the old `kind` becomes their tag, and the one old link goes to
-- the matching link field.
UPDATE `Resource` SET
    `tags` = JSON_ARRAY(CASE `kind`
        WHEN 'academic_paper' THEN 'academic-papers'
        WHEN 'website' THEN 'websites'
        WHEN 'podcast' THEN 'podcasts'
        WHEN 'video' THEN 'videos'
    END),
    `pages` = JSON_ARRAY(),
    `websiteUrl` = CASE WHEN `kind` = 'website' THEN `linkUrl` END,
    `podcastUrl` = CASE WHEN `kind` = 'podcast' THEN `linkUrl` END,
    `videoUrl` = CASE WHEN `kind` = 'video' THEN `linkUrl` END;

-- The description is now rich text (HTML). Older descriptions were plain text,
-- so escape them and keep their line breaks.
UPDATE `Resource` SET `description` = CONCAT(
    '<p>',
    REPLACE(REPLACE(REPLACE(REPLACE(REPLACE(`description`, '&', '&amp;'), '<', '&lt;'), '>', '&gt;'), CHAR(13), ''), CHAR(10), '<br>'),
    '</p>'
) WHERE `description` IS NOT NULL AND `description` <> '';

-- Articles and newsletters used to have tables of their own. Their rows move in
-- here (the old tables are left untouched as a backup).
INSERT INTO `Resource` (`kind`, `title`, `description`, `published`, `tags`, `pages`, `createdAt`, `updatedAt`)
SELECT 'article', `title`, `richTextBody`, `published`, JSON_ARRAY('articles'), JSON_ARRAY(), `createdAt`, `updatedAt`
FROM `Article`;

INSERT INTO `Resource` (`kind`, `title`, `fileUrl`, `websiteUrl`, `publishedDate`, `published`, `tags`, `pages`, `createdAt`, `updatedAt`)
SELECT 'newsletter', `title`, `fileUrl`, `mailchimpCampaignUrl`, `publishedDate`, `published`, JSON_ARRAY('newsletters'), JSON_ARRAY(), `createdAt`, `updatedAt`
FROM `Newsletter`;

DROP INDEX `Resource_kind_published_idx` ON `Resource`;
ALTER TABLE `Resource` DROP COLUMN `kind`, DROP COLUMN `linkUrl`;
CREATE INDEX `Resource_published_idx` ON `Resource`(`published`);
