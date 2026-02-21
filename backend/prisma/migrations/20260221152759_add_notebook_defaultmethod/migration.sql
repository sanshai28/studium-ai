-- CreateEnum
CREATE TYPE "NotebookMethod" AS ENUM ('cornell', 'sentence', 'outlining', 'charting', 'blank');

-- AlterTable
ALTER TABLE "notebooks" ADD COLUMN     "defaultMethod" "NotebookMethod" NOT NULL DEFAULT 'blank';
