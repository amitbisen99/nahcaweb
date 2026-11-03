-- Answers are stored as the option's text, so rename the saved ones along with
-- the labels in the registration/profile forms.

-- "How did you hear about NAHCA?" — members' profiles and event registrations
UPDATE `MemberProfile` SET `hearAboutUs` = 'Chinmaya International Foundation (CIF)' WHERE `hearAboutUs` = 'CIF Spiritual Care course';
UPDATE `MemberProfile` SET `hearAboutUs` = 'Global Theological Union (GTU)' WHERE `hearAboutUs` = 'GTU';
UPDATE `EventRegistration` SET `hearAboutUs` = 'Chinmaya International Foundation (CIF)' WHERE `hearAboutUs` = 'CIF Spiritual Care course';
UPDATE `EventRegistration` SET `hearAboutUs` = 'Global Theological Union (GTU)' WHERE `hearAboutUs` = 'GTU';

-- Professional organization memberships (a JSON array of the selected names)
UPDATE `MemberProfile`
SET `orgMemberships` = REPLACE(REPLACE(`orgMemberships`, '"APC"', '"Association of Professional Chaplains (APC)"'), '"ACPE"', '"Association for Clinical Pastoral Education (ACPE)"')
WHERE `orgMemberships` LIKE '%"APC"%' OR `orgMemberships` LIKE '%"ACPE"%';
