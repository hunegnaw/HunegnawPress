-- Remove 2FA tables and columns
DROP TABLE IF EXISTS `BackupCode`;
DROP TABLE IF EXISTS `TwoFactorSecret`;
ALTER TABLE `User` DROP COLUMN `twoFactorEnabled`, DROP COLUMN `twoFactorVerified`;
ALTER TABLE `Organization` DROP COLUMN `twoFactorPolicy`;
