CREATE TYPE "public"."order_status" AS ENUM('pending', 'processing', 'shipped', 'delivered', 'cancelled');--> statement-breakpoint
CREATE TYPE "public"."pay_method" AS ENUM('card', 'upi', 'wallet', 'cod');--> statement-breakpoint
CREATE TYPE "public"."pay_status" AS ENUM('pending', 'paid', 'failed', 'refunded');--> statement-breakpoint
CREATE TYPE "public"."product_status" AS ENUM('active', 'draft', 'archived');--> statement-breakpoint
CREATE TABLE "account" (
	"id" text PRIMARY KEY NOT NULL,
	"user_id" text NOT NULL,
	"account_id" text NOT NULL,
	"provider_id" text NOT NULL,
	"access_token" text,
	"refresh_token" text,
	"id_token" text,
	"access_token_expires_at" timestamp,
	"refresh_token_expires_at" timestamp,
	"scope" text,
	"password" text,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "address" (
	"id" text PRIMARY KEY NOT NULL,
	"customer_id" text NOT NULL,
	"label" text NOT NULL,
	"name" text NOT NULL,
	"phone" text NOT NULL,
	"line1" text NOT NULL,
	"line2" text,
	"city" text NOT NULL,
	"pin" text NOT NULL,
	"state" text NOT NULL,
	"default" boolean DEFAULT false
);
--> statement-breakpoint
CREATE TABLE "collection" (
	"slug" text PRIMARY KEY NOT NULL,
	"title" text NOT NULL,
	"blurb" text,
	"image" text
);
--> statement-breakpoint
CREATE TABLE "collection_product" (
	"collection_slug" text NOT NULL,
	"product_id" text NOT NULL,
	CONSTRAINT "collection_product_collection_slug_product_id_pk" PRIMARY KEY("collection_slug","product_id")
);
--> statement-breakpoint
CREATE TABLE "coupon" (
	"code" text PRIMARY KEY NOT NULL,
	"kind" text,
	"value" integer,
	"note" text,
	"used" integer DEFAULT 0,
	"active" boolean DEFAULT true
);
--> statement-breakpoint
CREATE TABLE "order_table" (
	"id" text PRIMARY KEY NOT NULL,
	"placed_at" timestamp DEFAULT now() NOT NULL,
	"customer_id" text,
	"name" text NOT NULL,
	"phone" text NOT NULL,
	"email" text NOT NULL,
	"address" text NOT NULL,
	"pin" text NOT NULL,
	"city" text NOT NULL,
	"delivery_method" text NOT NULL,
	"cod" boolean DEFAULT true NOT NULL,
	"payment_method" "pay_method",
	"payment_status" "pay_status" DEFAULT 'pending' NOT NULL,
	"status" "order_status" DEFAULT 'pending' NOT NULL,
	"coupon" text,
	"carrier" text,
	"tracking" text,
	"totals" jsonb NOT NULL
);
--> statement-breakpoint
CREATE TABLE "order_event" (
	"id" text PRIMARY KEY NOT NULL,
	"order_id" text NOT NULL,
	"stage" "order_status" NOT NULL,
	"at" text NOT NULL,
	"note" text
);
--> statement-breakpoint
CREATE TABLE "order_line" (
	"id" text PRIMARY KEY NOT NULL,
	"key" text NOT NULL,
	"order_id" text NOT NULL,
	"product_id" text NOT NULL,
	"name" text NOT NULL,
	"size" text NOT NULL,
	"color" text NOT NULL,
	"qty" integer NOT NULL,
	"price" integer NOT NULL
);
--> statement-breakpoint
CREATE TABLE "product" (
	"id" text PRIMARY KEY NOT NULL,
	"name" text NOT NULL,
	"category" text NOT NULL,
	"price" integer NOT NULL,
	"compare_at" integer,
	"badge" text,
	"fabric" text NOT NULL,
	"fit" text NOT NULL,
	"fit_name" text NOT NULL,
	"image" text NOT NULL,
	"alt_image" text,
	"model" jsonb NOT NULL,
	"care" text NOT NULL,
	"status" "product_status" DEFAULT 'active' NOT NULL,
	"cost" integer,
	"units_sold_30d" integer DEFAULT 0
);
--> statement-breakpoint
CREATE TABLE "product_color" (
	"id" text PRIMARY KEY NOT NULL,
	"name" text NOT NULL,
	"hex" text NOT NULL,
	"images" text[] DEFAULT '{}' NOT NULL,
	"product_id" text NOT NULL
);
--> statement-breakpoint
CREATE TABLE "product_variant" (
	"id" text PRIMARY KEY NOT NULL,
	"size" text NOT NULL,
	"sku" text NOT NULL,
	"stock" integer DEFAULT 0,
	"threshold" integer DEFAULT 0,
	"product_id" text NOT NULL,
	CONSTRAINT "product_variant_sku_unique" UNIQUE("sku")
);
--> statement-breakpoint
CREATE TABLE "review" (
	"id" text PRIMARY KEY NOT NULL,
	"product_id" text NOT NULL,
	"product_name" text NOT NULL,
	"author" text NOT NULL,
	"rating" integer NOT NULL,
	"text" text NOT NULL,
	"at" text NOT NULL,
	"status" text DEFAULT 'pending' NOT NULL
);
--> statement-breakpoint
CREATE TABLE "session" (
	"id" text PRIMARY KEY NOT NULL,
	"user_id" text NOT NULL,
	"expires_at" timestamp NOT NULL,
	"token" text NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	"ip_address" text,
	"user_agent" text,
	CONSTRAINT "session_token_unique" UNIQUE("token")
);
--> statement-breakpoint
CREATE TABLE "subscription" (
	"id" text PRIMARY KEY NOT NULL,
	"plan" text NOT NULL,
	"reference_id" text NOT NULL,
	"razorpay_customer_id" text,
	"razorpay_subscription_id" text,
	"razorpay_plan_id" text,
	"status" text DEFAULT 'created' NOT NULL,
	"current_start" timestamp,
	"current_end" timestamp,
	"ended_at" timestamp,
	"quantity" integer DEFAULT 1,
	"total_count" integer,
	"paid_count" integer DEFAULT 0,
	"remaining_count" integer,
	"cancelled_at" timestamp,
	"paused_at" timestamp,
	"short_url" text,
	"cancel_at_cycle_end" boolean DEFAULT false,
	"billing_period" text,
	"trial_start" timestamp,
	"trial_end" timestamp,
	"metadata" text,
	"renewed_at" timestamp,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "user" (
	"id" text PRIMARY KEY NOT NULL,
	"name" text NOT NULL,
	"email" text NOT NULL,
	"email_verified" boolean DEFAULT false NOT NULL,
	"image" text,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	"razorpay_customer_id" text,
	CONSTRAINT "user_email_unique" UNIQUE("email"),
	CONSTRAINT "user_razorpay_customer_id_unique" UNIQUE("razorpay_customer_id")
);
--> statement-breakpoint
CREATE TABLE "verification" (
	"id" text PRIMARY KEY NOT NULL,
	"identifier" text NOT NULL,
	"value" text NOT NULL,
	"expires_at" timestamp NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "account" ADD CONSTRAINT "account_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "address" ADD CONSTRAINT "address_customer_id_user_id_fk" FOREIGN KEY ("customer_id") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "collection_product" ADD CONSTRAINT "collection_product_collection_slug_collection_slug_fk" FOREIGN KEY ("collection_slug") REFERENCES "public"."collection"("slug") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "collection_product" ADD CONSTRAINT "collection_product_product_id_product_id_fk" FOREIGN KEY ("product_id") REFERENCES "public"."product"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "order_table" ADD CONSTRAINT "order_table_customer_id_user_id_fk" FOREIGN KEY ("customer_id") REFERENCES "public"."user"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "order_event" ADD CONSTRAINT "order_event_order_id_order_table_id_fk" FOREIGN KEY ("order_id") REFERENCES "public"."order_table"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "order_line" ADD CONSTRAINT "order_line_order_id_order_table_id_fk" FOREIGN KEY ("order_id") REFERENCES "public"."order_table"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "product_color" ADD CONSTRAINT "product_color_product_id_product_id_fk" FOREIGN KEY ("product_id") REFERENCES "public"."product"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "product_variant" ADD CONSTRAINT "product_variant_product_id_product_id_fk" FOREIGN KEY ("product_id") REFERENCES "public"."product"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "review" ADD CONSTRAINT "review_product_id_product_id_fk" FOREIGN KEY ("product_id") REFERENCES "public"."product"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "session" ADD CONSTRAINT "session_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "account_user_id_idx" ON "account" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "account_account_id_idx" ON "account" USING btree ("account_id");--> statement-breakpoint
CREATE INDEX "address_customer_id_idx" ON "address" USING btree ("customer_id");--> statement-breakpoint
CREATE INDEX "collection_product_slug_idx" ON "collection_product" USING btree ("collection_slug");--> statement-breakpoint
CREATE INDEX "collection_product_product_idx" ON "collection_product" USING btree ("product_id");--> statement-breakpoint
CREATE INDEX "order_customer_id_idx" ON "order_table" USING btree ("customer_id");--> statement-breakpoint
CREATE INDEX "order_placed_at_idx" ON "order_table" USING btree ("placed_at");--> statement-breakpoint
CREATE INDEX "order_event_order_id_idx" ON "order_event" USING btree ("order_id");--> statement-breakpoint
CREATE INDEX "order_line_order_id_idx" ON "order_line" USING btree ("order_id");--> statement-breakpoint
CREATE INDEX "product_color_product_id_idx" ON "product_color" USING btree ("product_id");--> statement-breakpoint
CREATE INDEX "product_variant_product_id_idx" ON "product_variant" USING btree ("product_id");--> statement-breakpoint
CREATE INDEX "product_variant_sku_idx" ON "product_variant" USING btree ("sku");--> statement-breakpoint
CREATE INDEX "review_product_id_idx" ON "review" USING btree ("product_id");--> statement-breakpoint
CREATE INDEX "session_user_id_idx" ON "session" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "subscription_user_id_idx" ON "subscription" USING btree ("reference_id");--> statement-breakpoint
CREATE INDEX "subscription_razorpay_customer_id_idx" ON "subscription" USING btree ("razorpay_customer_id");--> statement-breakpoint
CREATE INDEX "verification_identifier_idx" ON "verification" USING btree ("identifier");--> statement-breakpoint
CREATE INDEX "verification_value_idx" ON "verification" USING btree ("value");