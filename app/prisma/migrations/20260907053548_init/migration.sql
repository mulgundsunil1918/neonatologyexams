-- CreateTable
CREATE TABLE "Resource" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "title" TEXT NOT NULL,
    "shortName" TEXT NOT NULL,
    "edition" TEXT,
    "year" INTEGER,
    "category" TEXT NOT NULL,
    "fileName" TEXT NOT NULL,
    "pageCount" INTEGER,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- CreateTable
CREATE TABLE "Sitting" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "label" TEXT NOT NULL,
    "year" INTEGER NOT NULL,
    "month" INTEGER
);

-- CreateTable
CREATE TABLE "Paper" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "sittingId" TEXT NOT NULL,
    "paperNo" INTEGER NOT NULL,
    "paperType" TEXT NOT NULL,
    "pageStart" INTEGER NOT NULL,
    "pageEnd" INTEGER NOT NULL,
    "totalMarks" INTEGER,
    "durationMins" INTEGER,
    "formatNote" TEXT,
    CONSTRAINT "Paper_sittingId_fkey" FOREIGN KEY ("sittingId") REFERENCES "Sitting" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "MasterQuestion" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "paperType" TEXT NOT NULL,
    "stem" TEXT NOT NULL,
    "repetitionTier" TEXT NOT NULL,
    "conceptGroupId" TEXT,
    "hasImage" BOOLEAN NOT NULL DEFAULT false,
    "hasTable" BOOLEAN NOT NULL DEFAULT false,
    "flawNote" TEXT,
    "confidenceStatus" TEXT NOT NULL DEFAULT 'SOURCE_CONFIRMED',
    "primarySystemId" TEXT,
    "secondarySystemId" TEXT,
    "topicId" TEXT,
    "subtopicId" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "MasterQuestion_primarySystemId_fkey" FOREIGN KEY ("primarySystemId") REFERENCES "System" ("id") ON DELETE SET NULL ON UPDATE CASCADE,
    CONSTRAINT "MasterQuestion_secondarySystemId_fkey" FOREIGN KEY ("secondarySystemId") REFERENCES "System" ("id") ON DELETE SET NULL ON UPDATE CASCADE,
    CONSTRAINT "MasterQuestion_topicId_fkey" FOREIGN KEY ("topicId") REFERENCES "Topic" ("id") ON DELETE SET NULL ON UPDATE CASCADE,
    CONSTRAINT "MasterQuestion_subtopicId_fkey" FOREIGN KEY ("subtopicId") REFERENCES "Subtopic" ("id") ON DELETE SET NULL ON UPDATE CASCADE,
    CONSTRAINT "MasterQuestion_conceptGroupId_fkey" FOREIGN KEY ("conceptGroupId") REFERENCES "ConceptGroup" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "ConceptGroup" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "label" TEXT NOT NULL,
    "reviewedAt" DATETIME
);

-- CreateTable
CREATE TABLE "QuestionOccurrence" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "masterQuestionId" TEXT NOT NULL,
    "paperId" TEXT NOT NULL,
    "originalQnum" INTEGER NOT NULL,
    "pdfPageStart" INTEGER NOT NULL,
    "pdfPageEnd" INTEGER NOT NULL,
    "extractionMethod" TEXT NOT NULL,
    CONSTRAINT "QuestionOccurrence_masterQuestionId_fkey" FOREIGN KEY ("masterQuestionId") REFERENCES "MasterQuestion" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "QuestionOccurrence_paperId_fkey" FOREIGN KEY ("paperId") REFERENCES "Paper" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "Option" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "masterQuestionId" TEXT NOT NULL,
    "letter" TEXT NOT NULL,
    "text" TEXT NOT NULL,
    "sortOrder" INTEGER NOT NULL,
    CONSTRAINT "Option_masterQuestionId_fkey" FOREIGN KEY ("masterQuestionId") REFERENCES "MasterQuestion" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "SubPart" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "masterQuestionId" TEXT NOT NULL,
    "label" TEXT NOT NULL,
    "text" TEXT NOT NULL,
    "marks" TEXT,
    "sortOrder" INTEGER NOT NULL,
    CONSTRAINT "SubPart_masterQuestionId_fkey" FOREIGN KEY ("masterQuestionId") REFERENCES "MasterQuestion" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "Answer" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "masterQuestionId" TEXT NOT NULL,
    "correctLetter" TEXT,
    "confidenceStatus" TEXT NOT NULL DEFAULT 'NOT_FOUND',
    "sourcedFrom" TEXT,
    CONSTRAINT "Answer_masterQuestionId_fkey" FOREIGN KEY ("masterQuestionId") REFERENCES "MasterQuestion" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "Explanation" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "masterQuestionId" TEXT NOT NULL,
    "body" TEXT,
    "highYieldPoint" TEXT,
    CONSTRAINT "Explanation_masterQuestionId_fkey" FOREIGN KEY ("masterQuestionId") REFERENCES "MasterQuestion" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "System" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "sortOrder" INTEGER NOT NULL
);

-- CreateTable
CREATE TABLE "Topic" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "systemId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    CONSTRAINT "Topic_systemId_fkey" FOREIGN KEY ("systemId") REFERENCES "System" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "Subtopic" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "topicId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    CONSTRAINT "Subtopic_topicId_fkey" FOREIGN KEY ("topicId") REFERENCES "Topic" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "QuestionSource" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "masterQuestionId" TEXT NOT NULL,
    "resourceId" TEXT NOT NULL,
    "role" TEXT NOT NULL,
    "chapter" TEXT,
    "pageRef" TEXT,
    "tableOrFigure" TEXT,
    CONSTRAINT "QuestionSource_masterQuestionId_fkey" FOREIGN KEY ("masterQuestionId") REFERENCES "MasterQuestion" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "QuestionSource_resourceId_fkey" FOREIGN KEY ("resourceId") REFERENCES "Resource" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "User" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "email" TEXT NOT NULL,
    "name" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- CreateTable
CREATE TABLE "Attempt" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "userId" TEXT NOT NULL,
    "masterQuestionId" TEXT NOT NULL,
    "selectedLetter" TEXT,
    "isCorrect" BOOLEAN,
    "timeSpentSecs" INTEGER,
    "attemptedAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "studySessionId" TEXT,
    "confidence" INTEGER,
    "nextReviewDate" DATETIME,
    CONSTRAINT "Attempt_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "Attempt_masterQuestionId_fkey" FOREIGN KEY ("masterQuestionId") REFERENCES "MasterQuestion" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "Attempt_studySessionId_fkey" FOREIGN KEY ("studySessionId") REFERENCES "StudySession" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "Bookmark" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "userId" TEXT NOT NULL,
    "masterQuestionId" TEXT NOT NULL,
    "flag" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "Bookmark_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "Bookmark_masterQuestionId_fkey" FOREIGN KEY ("masterQuestionId") REFERENCES "MasterQuestion" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "Note" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "userId" TEXT NOT NULL,
    "masterQuestionId" TEXT NOT NULL,
    "body" TEXT NOT NULL,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "Note_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "Note_masterQuestionId_fkey" FOREIGN KEY ("masterQuestionId") REFERENCES "MasterQuestion" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "StudySession" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "userId" TEXT NOT NULL,
    "mode" TEXT NOT NULL,
    "startedAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "endedAt" DATETIME,
    CONSTRAINT "StudySession_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateIndex
CREATE UNIQUE INDEX "Resource_shortName_key" ON "Resource"("shortName");

-- CreateIndex
CREATE INDEX "Resource_category_idx" ON "Resource"("category");

-- CreateIndex
CREATE UNIQUE INDEX "Paper_sittingId_paperNo_key" ON "Paper"("sittingId", "paperNo");

-- CreateIndex
CREATE INDEX "MasterQuestion_repetitionTier_idx" ON "MasterQuestion"("repetitionTier");

-- CreateIndex
CREATE INDEX "MasterQuestion_paperType_idx" ON "MasterQuestion"("paperType");

-- CreateIndex
CREATE INDEX "MasterQuestion_primarySystemId_idx" ON "MasterQuestion"("primarySystemId");

-- CreateIndex
CREATE INDEX "QuestionOccurrence_masterQuestionId_idx" ON "QuestionOccurrence"("masterQuestionId");

-- CreateIndex
CREATE UNIQUE INDEX "QuestionOccurrence_paperId_originalQnum_key" ON "QuestionOccurrence"("paperId", "originalQnum");

-- CreateIndex
CREATE INDEX "Option_masterQuestionId_idx" ON "Option"("masterQuestionId");

-- CreateIndex
CREATE INDEX "SubPart_masterQuestionId_idx" ON "SubPart"("masterQuestionId");

-- CreateIndex
CREATE UNIQUE INDEX "Answer_masterQuestionId_key" ON "Answer"("masterQuestionId");

-- CreateIndex
CREATE UNIQUE INDEX "Explanation_masterQuestionId_key" ON "Explanation"("masterQuestionId");

-- CreateIndex
CREATE UNIQUE INDEX "System_name_key" ON "System"("name");

-- CreateIndex
CREATE UNIQUE INDEX "Topic_systemId_name_key" ON "Topic"("systemId", "name");

-- CreateIndex
CREATE UNIQUE INDEX "Subtopic_topicId_name_key" ON "Subtopic"("topicId", "name");

-- CreateIndex
CREATE INDEX "QuestionSource_masterQuestionId_idx" ON "QuestionSource"("masterQuestionId");

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");

-- CreateIndex
CREATE INDEX "Attempt_userId_masterQuestionId_idx" ON "Attempt"("userId", "masterQuestionId");

-- CreateIndex
CREATE UNIQUE INDEX "Bookmark_userId_masterQuestionId_key" ON "Bookmark"("userId", "masterQuestionId");
