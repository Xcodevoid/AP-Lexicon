-- CreateEnum
CREATE TYPE "Role" AS ENUM ('STUDENT', 'ADMIN');

-- CreateEnum
CREATE TYPE "LanguageMode" AS ENUM ('FULL', 'BALANCED', 'EXAM');

-- CreateEnum
CREATE TYPE "ContentStatus" AS ENUM ('DRAFT', 'PUBLISHED');

-- CreateEnum
CREATE TYPE "ReviewStatus" AS ENUM ('DRAFT', 'TEACHER_REVIEW', 'APPROVED', 'NEEDS_FIX');

-- CreateEnum
CREATE TYPE "Skill" AS ENUM ('TRANSLATION', 'CONCEPT', 'APPLICATION');

-- CreateEnum
CREATE TYPE "Stage" AS ENUM ('DISCOVER', 'RECOGNIZE', 'UNDERSTAND', 'APPLY', 'MASTER');

-- CreateEnum
CREATE TYPE "QuestionType" AS ENUM ('MCQ', 'SCENARIO', 'PASSAGE', 'GRAPH', 'CLOZE', 'WRITTEN');

-- CreateEnum
CREATE TYPE "ErrorType" AS ENUM ('TRANSLATION', 'CONCEPT', 'APPLICATION', 'CONFUSION');

-- CreateEnum
CREATE TYPE "CardState" AS ENUM ('NEW', 'LEARNING', 'REVIEW', 'RELEARNING');

-- CreateTable
CREATE TABLE "User" (
    "id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "passwordHash" TEXT,
    "name" TEXT NOT NULL,
    "role" "Role" NOT NULL DEFAULT 'STUDENT',
    "isDemo" BOOLEAN NOT NULL DEFAULT false,
    "languageMode" "LanguageMode" NOT NULL DEFAULT 'BALANCED',
    "grade" INTEGER,
    "dailyGoalXp" INTEGER NOT NULL DEFAULT 60,
    "focusSubjects" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "onboardedAt" TIMESTAMP(3),
    "leaderboardOptIn" BOOLEAN NOT NULL DEFAULT false,
    "leaderboardAlias" TEXT,
    "reducedMotion" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Session" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "expiresAt" TIMESTAMP(3) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Session_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Subject" (
    "id" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "nameZh" TEXT NOT NULL,
    "shortName" TEXT NOT NULL,
    "description" TEXT NOT NULL DEFAULT '',
    "theme" TEXT NOT NULL DEFAULT 'blue',
    "order" INTEGER NOT NULL DEFAULT 0,
    "status" "ContentStatus" NOT NULL DEFAULT 'DRAFT',
    "frameworkNote" TEXT NOT NULL DEFAULT '',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Subject_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Unit" (
    "id" TEXT NOT NULL,
    "subjectId" TEXT NOT NULL,
    "number" INTEGER NOT NULL,
    "title" TEXT NOT NULL,
    "titleZh" TEXT NOT NULL DEFAULT '',
    "description" TEXT NOT NULL DEFAULT '',
    "status" "ContentStatus" NOT NULL DEFAULT 'PUBLISHED',

    CONSTRAINT "Unit_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Topic" (
    "id" TEXT NOT NULL,
    "unitId" TEXT NOT NULL,
    "code" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "titleZh" TEXT NOT NULL DEFAULT '',
    "objectives" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "order" INTEGER NOT NULL DEFAULT 0,

    CONSTRAINT "Topic_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Term" (
    "id" TEXT NOT NULL,
    "externalId" TEXT NOT NULL,
    "subjectId" TEXT NOT NULL,
    "unitId" TEXT,
    "topicId" TEXT,
    "term" TEXT NOT NULL,
    "zh" TEXT NOT NULL,
    "definition" TEXT NOT NULL,
    "zhExplanation" TEXT NOT NULL DEFAULT '',
    "pronunciation" TEXT,
    "audioUrl" TEXT,
    "difficulty" INTEGER NOT NULL DEFAULT 2,
    "category" TEXT NOT NULL DEFAULT 'Subject concept',
    "tags" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "misconceptions" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "apExample" TEXT NOT NULL DEFAULT '',
    "realWorld" TEXT NOT NULL DEFAULT '',
    "visual" JSONB,
    "imageUrl" TEXT,
    "writtenPrompt" TEXT NOT NULL DEFAULT '',
    "priority" TEXT NOT NULL DEFAULT 'Medium',
    "source" TEXT NOT NULL DEFAULT '',
    "reviewStatus" "ReviewStatus" NOT NULL DEFAULT 'TEACHER_REVIEW',
    "status" "ContentStatus" NOT NULL DEFAULT 'DRAFT',
    "order" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Term_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "TermRelation" (
    "fromId" TEXT NOT NULL,
    "toId" TEXT NOT NULL,
    "kind" TEXT NOT NULL,

    CONSTRAINT "TermRelation_pkey" PRIMARY KEY ("fromId","toId","kind")
);

-- CreateTable
CREATE TABLE "Question" (
    "id" TEXT NOT NULL,
    "externalId" TEXT NOT NULL,
    "subjectId" TEXT NOT NULL,
    "unitId" TEXT,
    "type" "QuestionType" NOT NULL,
    "stage" "Stage" NOT NULL,
    "skill" "Skill" NOT NULL,
    "difficulty" INTEGER NOT NULL DEFAULT 2,
    "prompt" TEXT NOT NULL,
    "promptZh" TEXT NOT NULL DEFAULT '',
    "passage" TEXT NOT NULL DEFAULT '',
    "visual" JSONB,
    "options" JSONB NOT NULL,
    "answer" TEXT NOT NULL DEFAULT '',
    "rubric" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "explanation" TEXT NOT NULL,
    "explanationZh" TEXT NOT NULL DEFAULT '',
    "source" TEXT NOT NULL DEFAULT 'Original AP Lexicon practice item — not an official College Board question',
    "status" "ContentStatus" NOT NULL DEFAULT 'DRAFT',
    "confusionPairId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Question_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "QuestionTerm" (
    "questionId" TEXT NOT NULL,
    "termId" TEXT NOT NULL,
    "primary" BOOLEAN NOT NULL DEFAULT false,

    CONSTRAINT "QuestionTerm_pkey" PRIMARY KEY ("questionId","termId")
);

-- CreateTable
CREATE TABLE "ConfusionPair" (
    "id" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "subjectId" TEXT NOT NULL,
    "termAId" TEXT NOT NULL,
    "termBId" TEXT NOT NULL,
    "keyDifference" TEXT NOT NULL,
    "keyDifferenceZh" TEXT NOT NULL DEFAULT '',
    "dimensions" JSONB NOT NULL,
    "scenarios" JSONB NOT NULL,
    "visual" JSONB,
    "status" "ContentStatus" NOT NULL DEFAULT 'PUBLISHED',

    CONSTRAINT "ConfusionPair_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "UserTermState" (
    "userId" TEXT NOT NULL,
    "termId" TEXT NOT NULL,
    "state" "CardState" NOT NULL DEFAULT 'NEW',
    "stability" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "difficulty" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "due" TIMESTAMP(3),
    "lastReview" TIMESTAMP(3),
    "reps" INTEGER NOT NULL DEFAULT 0,
    "lapses" INTEGER NOT NULL DEFAULT 0,
    "recognition" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "recognitionN" INTEGER NOT NULL DEFAULT 0,
    "concept" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "conceptN" INTEGER NOT NULL DEFAULT 0,
    "application" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "applicationN" INTEGER NOT NULL DEFAULT 0,
    "independentOk" INTEGER NOT NULL DEFAULT 0,
    "discoveredAt" TIMESTAMP(3),
    "bookmarked" BOOLEAN NOT NULL DEFAULT false,
    "note" TEXT NOT NULL DEFAULT '',
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "UserTermState_pkey" PRIMARY KEY ("userId","termId")
);

-- CreateTable
CREATE TABLE "ReviewLog" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "termId" TEXT NOT NULL,
    "questionId" TEXT,
    "generatedKey" TEXT,
    "skill" "Skill" NOT NULL,
    "stage" "Stage" NOT NULL,
    "correct" BOOLEAN NOT NULL,
    "rating" INTEGER NOT NULL,
    "errorType" "ErrorType",
    "confusedWithId" TEXT,
    "usedHint" BOOLEAN NOT NULL DEFAULT false,
    "responseMs" INTEGER NOT NULL DEFAULT 0,
    "answer" TEXT NOT NULL DEFAULT '',
    "mode" TEXT NOT NULL DEFAULT 'learn',
    "elapsedDays" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "scheduledDays" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "stabilityAfter" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ReviewLog_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "XpEvent" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "amount" INTEGER NOT NULL,
    "reason" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "XpEvent_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "UserAchievement" (
    "userId" TEXT NOT NULL,
    "key" TEXT NOT NULL,
    "unlockedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "UserAchievement_pkey" PRIMARY KEY ("userId","key")
);

-- CreateTable
CREATE TABLE "PersonalBest" (
    "userId" TEXT NOT NULL,
    "key" TEXT NOT NULL,
    "value" INTEGER NOT NULL,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "PersonalBest_pkey" PRIMARY KEY ("userId","key")
);

-- CreateTable
CREATE TABLE "Collection" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "color" TEXT NOT NULL DEFAULT 'blue',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Collection_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "CollectionTerm" (
    "collectionId" TEXT NOT NULL,
    "termId" TEXT NOT NULL,
    "addedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "CollectionTerm_pkey" PRIMARY KEY ("collectionId","termId")
);

-- CreateTable
CREATE TABLE "StudyGoal" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "subjectSlug" TEXT,
    "targetDate" TIMESTAMP(3) NOT NULL,
    "targetTerms" INTEGER NOT NULL DEFAULT 20,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "doneAt" TIMESTAMP(3),

    CONSTRAINT "StudyGoal_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ImportJob" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "filename" TEXT NOT NULL,
    "format" TEXT NOT NULL,
    "created" INTEGER NOT NULL DEFAULT 0,
    "updated" INTEGER NOT NULL DEFAULT 0,
    "skipped" INTEGER NOT NULL DEFAULT 0,
    "errors" JSONB NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ImportJob_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");

-- CreateIndex
CREATE INDEX "Session_userId_idx" ON "Session"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "Subject_slug_key" ON "Subject"("slug");

-- CreateIndex
CREATE UNIQUE INDEX "Unit_subjectId_number_key" ON "Unit"("subjectId", "number");

-- CreateIndex
CREATE UNIQUE INDEX "Topic_unitId_code_key" ON "Topic"("unitId", "code");

-- CreateIndex
CREATE UNIQUE INDEX "Term_externalId_key" ON "Term"("externalId");

-- CreateIndex
CREATE INDEX "Term_subjectId_status_idx" ON "Term"("subjectId", "status");

-- CreateIndex
CREATE INDEX "Term_term_idx" ON "Term"("term");

-- CreateIndex
CREATE UNIQUE INDEX "Question_externalId_key" ON "Question"("externalId");

-- CreateIndex
CREATE UNIQUE INDEX "ConfusionPair_slug_key" ON "ConfusionPair"("slug");

-- CreateIndex
CREATE INDEX "UserTermState_userId_due_idx" ON "UserTermState"("userId", "due");

-- CreateIndex
CREATE INDEX "ReviewLog_userId_createdAt_idx" ON "ReviewLog"("userId", "createdAt");

-- CreateIndex
CREATE INDEX "ReviewLog_userId_termId_idx" ON "ReviewLog"("userId", "termId");

-- CreateIndex
CREATE INDEX "XpEvent_userId_createdAt_idx" ON "XpEvent"("userId", "createdAt");

-- CreateIndex
CREATE UNIQUE INDEX "Collection_userId_name_key" ON "Collection"("userId", "name");

-- AddForeignKey
ALTER TABLE "Session" ADD CONSTRAINT "Session_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Unit" ADD CONSTRAINT "Unit_subjectId_fkey" FOREIGN KEY ("subjectId") REFERENCES "Subject"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Topic" ADD CONSTRAINT "Topic_unitId_fkey" FOREIGN KEY ("unitId") REFERENCES "Unit"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Term" ADD CONSTRAINT "Term_subjectId_fkey" FOREIGN KEY ("subjectId") REFERENCES "Subject"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Term" ADD CONSTRAINT "Term_unitId_fkey" FOREIGN KEY ("unitId") REFERENCES "Unit"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Term" ADD CONSTRAINT "Term_topicId_fkey" FOREIGN KEY ("topicId") REFERENCES "Topic"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TermRelation" ADD CONSTRAINT "TermRelation_fromId_fkey" FOREIGN KEY ("fromId") REFERENCES "Term"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TermRelation" ADD CONSTRAINT "TermRelation_toId_fkey" FOREIGN KEY ("toId") REFERENCES "Term"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Question" ADD CONSTRAINT "Question_subjectId_fkey" FOREIGN KEY ("subjectId") REFERENCES "Subject"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Question" ADD CONSTRAINT "Question_unitId_fkey" FOREIGN KEY ("unitId") REFERENCES "Unit"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Question" ADD CONSTRAINT "Question_confusionPairId_fkey" FOREIGN KEY ("confusionPairId") REFERENCES "ConfusionPair"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "QuestionTerm" ADD CONSTRAINT "QuestionTerm_questionId_fkey" FOREIGN KEY ("questionId") REFERENCES "Question"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "QuestionTerm" ADD CONSTRAINT "QuestionTerm_termId_fkey" FOREIGN KEY ("termId") REFERENCES "Term"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ConfusionPair" ADD CONSTRAINT "ConfusionPair_subjectId_fkey" FOREIGN KEY ("subjectId") REFERENCES "Subject"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "UserTermState" ADD CONSTRAINT "UserTermState_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "UserTermState" ADD CONSTRAINT "UserTermState_termId_fkey" FOREIGN KEY ("termId") REFERENCES "Term"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ReviewLog" ADD CONSTRAINT "ReviewLog_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ReviewLog" ADD CONSTRAINT "ReviewLog_termId_fkey" FOREIGN KEY ("termId") REFERENCES "Term"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ReviewLog" ADD CONSTRAINT "ReviewLog_questionId_fkey" FOREIGN KEY ("questionId") REFERENCES "Question"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "XpEvent" ADD CONSTRAINT "XpEvent_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "UserAchievement" ADD CONSTRAINT "UserAchievement_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PersonalBest" ADD CONSTRAINT "PersonalBest_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Collection" ADD CONSTRAINT "Collection_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CollectionTerm" ADD CONSTRAINT "CollectionTerm_collectionId_fkey" FOREIGN KEY ("collectionId") REFERENCES "Collection"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CollectionTerm" ADD CONSTRAINT "CollectionTerm_termId_fkey" FOREIGN KEY ("termId") REFERENCES "Term"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "StudyGoal" ADD CONSTRAINT "StudyGoal_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ImportJob" ADD CONSTRAINT "ImportJob_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
