-- CreateTable
CREATE TABLE "User" (
    "uid" SERIAL NOT NULL,
    "username" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "password" TEXT NOT NULL,

    CONSTRAINT "User_pkey" PRIMARY KEY ("uid")
);

-- CreateTable
CREATE TABLE "Seller" (
    "sid" SERIAL NOT NULL,
    "username" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "password" TEXT NOT NULL,

    CONSTRAINT "Seller_pkey" PRIMARY KEY ("sid")
);

-- CreateTable
CREATE TABLE "Book" (
    "bid" SERIAL NOT NULL,
    "title" TEXT NOT NULL,
    "author" TEXT NOT NULL,
    "publishedDate" TIMESTAMP(3) NOT NULL,
    "price" INTEGER NOT NULL,
    "quantity" INTEGER NOT NULL DEFAULT 5,
    "sid" INTEGER NOT NULL,

    CONSTRAINT "Book_pkey" PRIMARY KEY ("bid")
);

-- CreateTable
CREATE TABLE "Order_details" (
    "oid" SERIAL NOT NULL,
    "uid" INTEGER NOT NULL,
    "createdTime" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "amount" INTEGER NOT NULL,

    CONSTRAINT "Order_details_pkey" PRIMARY KEY ("oid")
);

-- CreateTable
CREATE TABLE "Order_items" (
    "itemId" SERIAL NOT NULL,
    "oid" INTEGER NOT NULL,
    "bid" INTEGER NOT NULL,
    "sid" INTEGER NOT NULL,
    "quantity" INTEGER NOT NULL,

    CONSTRAINT "Order_items_pkey" PRIMARY KEY ("itemId")
);

-- CreateIndex
CREATE UNIQUE INDEX "User_username_key" ON "User"("username");

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");

-- CreateIndex
CREATE UNIQUE INDEX "Seller_username_key" ON "Seller"("username");

-- CreateIndex
CREATE UNIQUE INDEX "Seller_email_key" ON "Seller"("email");

-- AddForeignKey
ALTER TABLE "Book" ADD CONSTRAINT "Book_sid_fkey" FOREIGN KEY ("sid") REFERENCES "Seller"("sid") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Order_details" ADD CONSTRAINT "Order_details_uid_fkey" FOREIGN KEY ("uid") REFERENCES "User"("uid") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Order_items" ADD CONSTRAINT "Order_items_bid_fkey" FOREIGN KEY ("bid") REFERENCES "Book"("bid") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Order_items" ADD CONSTRAINT "Order_items_sid_fkey" FOREIGN KEY ("sid") REFERENCES "Seller"("sid") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Order_items" ADD CONSTRAINT "Order_items_oid_fkey" FOREIGN KEY ("oid") REFERENCES "Order_details"("oid") ON DELETE RESTRICT ON UPDATE CASCADE;
