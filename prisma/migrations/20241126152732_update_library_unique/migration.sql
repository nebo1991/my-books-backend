/*
  Warnings:

  - You are about to drop the column `libraryId` on the `Book` table. All the data in the column will be lost.

*/
-- DropForeignKey
ALTER TABLE "Book" DROP CONSTRAINT "Book_libraryId_fkey";

-- AlterTable
ALTER TABLE "Book" DROP COLUMN "libraryId";

-- CreateTable
CREATE TABLE "_LibraryBooks" (
    "A" INTEGER NOT NULL,
    "B" INTEGER NOT NULL
);

-- CreateIndex
CREATE UNIQUE INDEX "_LibraryBooks_AB_unique" ON "_LibraryBooks"("A", "B");

-- CreateIndex
CREATE INDEX "_LibraryBooks_B_index" ON "_LibraryBooks"("B");

-- AddForeignKey
ALTER TABLE "_LibraryBooks" ADD CONSTRAINT "_LibraryBooks_A_fkey" FOREIGN KEY ("A") REFERENCES "Book"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_LibraryBooks" ADD CONSTRAINT "_LibraryBooks_B_fkey" FOREIGN KEY ("B") REFERENCES "Library"("id") ON DELETE CASCADE ON UPDATE CASCADE;
