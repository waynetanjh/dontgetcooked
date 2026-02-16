/*
  Warnings:

  - You are about to drop the column `person_id` on the `events` table. All the data in the column will be lost.
  - You are about to drop the `persons` table. If the table is not empty, all the data it contains will be lost.
  - Added the required column `name` to the `events` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "events" DROP CONSTRAINT "events_person_id_fkey";

-- AlterTable
ALTER TABLE "events" DROP COLUMN "person_id",
ADD COLUMN     "name" TEXT NOT NULL;

-- DropTable
DROP TABLE "persons";
