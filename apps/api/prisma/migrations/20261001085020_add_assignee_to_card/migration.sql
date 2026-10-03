-- AlterTable
ALTER TABLE `Card` ADD COLUMN `assigneeId` VARCHAR(191) NULL;

-- AddForeignKey
ALTER TABLE `Card` ADD CONSTRAINT `Card_assigneeId_fkey` FOREIGN KEY (`assigneeId`) REFERENCES `User`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;
