ALTER TABLE "order_table" ADD COLUMN "razorpay_order_id" text;--> statement-breakpoint
ALTER TABLE "order_table" ADD COLUMN "razorpay_payment_id" text;--> statement-breakpoint
CREATE INDEX "order_razorpay_order_id_idx" ON "order_table" USING btree ("razorpay_order_id");