-- CreateTable
CREATE TABLE "pending_telegram_links" (
    "id" TEXT NOT NULL,
    "telegram_username" TEXT NOT NULL,
    "chat_id" BIGINT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "pending_telegram_links_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "pending_telegram_links_telegram_username_key" ON "pending_telegram_links"("telegram_username");
