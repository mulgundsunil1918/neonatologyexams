-- CreateTable
CREATE TABLE "Chapter" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "resourceId" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "level" INTEGER NOT NULL,
    "pageStart" INTEGER NOT NULL,
    "pageEnd" INTEGER NOT NULL,
    CONSTRAINT "Chapter_resourceId_fkey" FOREIGN KEY ("resourceId") REFERENCES "Resource" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "ResourcePage" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "resourceId" TEXT NOT NULL,
    "pageNumber" INTEGER NOT NULL,
    "text" TEXT NOT NULL,
    CONSTRAINT "ResourcePage_resourceId_fkey" FOREIGN KEY ("resourceId") REFERENCES "Resource" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_QuestionSource" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "masterQuestionId" TEXT NOT NULL,
    "resourceId" TEXT NOT NULL,
    "chapterId" TEXT,
    "role" TEXT NOT NULL,
    "chapter" TEXT,
    "pageRef" TEXT,
    "tableOrFigure" TEXT,
    "matchedSnippet" TEXT,
    "confidenceStatus" TEXT NOT NULL DEFAULT 'NOT_FOUND',
    "matchMethod" TEXT,
    CONSTRAINT "QuestionSource_masterQuestionId_fkey" FOREIGN KEY ("masterQuestionId") REFERENCES "MasterQuestion" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "QuestionSource_resourceId_fkey" FOREIGN KEY ("resourceId") REFERENCES "Resource" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "QuestionSource_chapterId_fkey" FOREIGN KEY ("chapterId") REFERENCES "Chapter" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);
INSERT INTO "new_QuestionSource" ("chapter", "id", "masterQuestionId", "pageRef", "resourceId", "role", "tableOrFigure") SELECT "chapter", "id", "masterQuestionId", "pageRef", "resourceId", "role", "tableOrFigure" FROM "QuestionSource";
DROP TABLE "QuestionSource";
ALTER TABLE "new_QuestionSource" RENAME TO "QuestionSource";
CREATE INDEX "QuestionSource_masterQuestionId_idx" ON "QuestionSource"("masterQuestionId");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;

-- CreateIndex
CREATE INDEX "Chapter_resourceId_pageStart_idx" ON "Chapter"("resourceId", "pageStart");

-- CreateIndex
CREATE UNIQUE INDEX "ResourcePage_resourceId_pageNumber_key" ON "ResourcePage"("resourceId", "pageNumber");
