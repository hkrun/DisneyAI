/*
 Navicat Premium Data Transfer

 Source Server         : localhost_5432
 Source Server Type    : PostgreSQL
 Source Server Version : 170004 (170004)
 Source Host           : localhost:5432
 Source Catalog        : dsn
 Source Schema         : public

 Target Server Type    : PostgreSQL
 Target Server Version : 170004 (170004)
 File Encoding         : 65001

 Date: 30/09/2025 13:27:36
*/


-- ----------------------------
-- Sequence structure for nf_api_keys_id_seq
-- ----------------------------
DROP SEQUENCE IF EXISTS "public"."nf_api_keys_id_seq";
CREATE SEQUENCE "public"."nf_api_keys_id_seq" 
INCREMENT 1
MINVALUE  1
MAXVALUE 9223372036854775807
START 1
CACHE 1;

-- ----------------------------
-- Sequence structure for nf_api_usage_id_seq
-- ----------------------------
DROP SEQUENCE IF EXISTS "public"."nf_api_usage_id_seq";
CREATE SEQUENCE "public"."nf_api_usage_id_seq" 
INCREMENT 1
MINVALUE  1
MAXVALUE 9223372036854775807
START 1
CACHE 1;

-- ----------------------------
-- Sequence structure for nf_cache_id_seq
-- ----------------------------
DROP SEQUENCE IF EXISTS "public"."nf_cache_id_seq";
CREATE SEQUENCE "public"."nf_cache_id_seq" 
INCREMENT 1
MINVALUE  1
MAXVALUE 9223372036854775807
START 1
CACHE 1;

-- ----------------------------
-- Sequence structure for nf_contact_id_seq
-- ----------------------------
DROP SEQUENCE IF EXISTS "public"."nf_contact_id_seq";
CREATE SEQUENCE "public"."nf_contact_id_seq" 
INCREMENT 1
MINVALUE  1
MAXVALUE 9223372036854775807
START 1
CACHE 1;

-- ----------------------------
-- Sequence structure for nf_credits_id_seq
-- ----------------------------
DROP SEQUENCE IF EXISTS "public"."nf_credits_id_seq";
CREATE SEQUENCE "public"."nf_credits_id_seq" 
INCREMENT 1
MINVALUE  1
MAXVALUE 9223372036854775807
START 1
CACHE 1;

-- ----------------------------
-- Sequence structure for nf_error_logs_id_seq
-- ----------------------------
DROP SEQUENCE IF EXISTS "public"."nf_error_logs_id_seq";
CREATE SEQUENCE "public"."nf_error_logs_id_seq" 
INCREMENT 1
MINVALUE  1
MAXVALUE 9223372036854775807
START 1
CACHE 1;

-- ----------------------------
-- Sequence structure for nf_health_assessments_id_seq
-- ----------------------------
DROP SEQUENCE IF EXISTS "public"."nf_health_assessments_id_seq";
CREATE SEQUENCE "public"."nf_health_assessments_id_seq" 
INCREMENT 1
MINVALUE  1
MAXVALUE 9223372036854775807
START 1
CACHE 1;

-- ----------------------------
-- Sequence structure for nf_names_id_seq
-- ----------------------------
DROP SEQUENCE IF EXISTS "public"."nf_names_id_seq";
CREATE SEQUENCE "public"."nf_names_id_seq" 
INCREMENT 1
MINVALUE  1
MAXVALUE 9223372036854775807
START 1
CACHE 1;

-- ----------------------------
-- Sequence structure for nf_products_id_seq
-- ----------------------------
DROP SEQUENCE IF EXISTS "public"."nf_products_id_seq";
CREATE SEQUENCE "public"."nf_products_id_seq" 
INCREMENT 1
MINVALUE  1
MAXVALUE 9223372036854775807
START 1
CACHE 1;

-- ----------------------------
-- Sequence structure for nf_subscription_id_seq
-- ----------------------------
DROP SEQUENCE IF EXISTS "public"."nf_subscription_id_seq";
CREATE SEQUENCE "public"."nf_subscription_id_seq" 
INCREMENT 1
MINVALUE  1
MAXVALUE 9223372036854775807
START 1
CACHE 1;

-- ----------------------------
-- Sequence structure for nf_template_face_swap_jobs_id_seq
-- ----------------------------
DROP SEQUENCE IF EXISTS "public"."nf_template_face_swap_jobs_id_seq";
CREATE SEQUENCE "public"."nf_template_face_swap_jobs_id_seq" 
INCREMENT 1
MINVALUE  1
MAXVALUE 9223372036854775807
START 1
CACHE 1;

-- ----------------------------
-- Sequence structure for nf_transform_history_id_seq
-- ----------------------------
DROP SEQUENCE IF EXISTS "public"."nf_transform_history_id_seq";
CREATE SEQUENCE "public"."nf_transform_history_id_seq" 
INCREMENT 1
MINVALUE  1
MAXVALUE 9223372036854775807
START 1
CACHE 1;

-- ----------------------------
-- Sequence structure for nf_user_health_assessment_id_seq
-- ----------------------------
DROP SEQUENCE IF EXISTS "public"."nf_user_health_assessment_id_seq";
CREATE SEQUENCE "public"."nf_user_health_assessment_id_seq" 
INCREMENT 1
MINVALUE  1
MAXVALUE 9223372036854775807
START 1
CACHE 1;

-- ----------------------------
-- Sequence structure for nf_users_id_seq
-- ----------------------------
DROP SEQUENCE IF EXISTS "public"."nf_users_id_seq";
CREATE SEQUENCE "public"."nf_users_id_seq" 
INCREMENT 1
MINVALUE  1
MAXVALUE 9223372036854775807
START 1
CACHE 1;

-- ----------------------------
-- Sequence structure for nf_video_templates_id_seq
-- ----------------------------
DROP SEQUENCE IF EXISTS "public"."nf_video_templates_id_seq";
CREATE SEQUENCE "public"."nf_video_templates_id_seq" 
INCREMENT 1
MINVALUE  1
MAXVALUE 9223372036854775807
START 1
CACHE 1;

-- ----------------------------
-- Table structure for nf_cache
-- ----------------------------
DROP TABLE IF EXISTS "public"."nf_cache";
CREATE TABLE "public"."nf_cache" (
  "id" int4 NOT NULL DEFAULT nextval('nf_cache_id_seq'::regclass),
  "cache_key" varchar(255) COLLATE "pg_catalog"."default" NOT NULL,
  "cache_value" text COLLATE "pg_catalog"."default" NOT NULL,
  "expires_at" timestamp(6) NOT NULL,
  "created_at" timestamp(6) DEFAULT CURRENT_TIMESTAMP,
  "updated_at" timestamp(6) DEFAULT CURRENT_TIMESTAMP
)
;
COMMENT ON COLUMN "public"."nf_cache"."cache_key" IS '缓存键';
COMMENT ON COLUMN "public"."nf_cache"."cache_value" IS '缓存值（JSON格式）';
COMMENT ON COLUMN "public"."nf_cache"."expires_at" IS '过期时间';
COMMENT ON COLUMN "public"."nf_cache"."created_at" IS '创建时间';
COMMENT ON COLUMN "public"."nf_cache"."updated_at" IS '更新时间';
COMMENT ON TABLE "public"."nf_cache" IS '系统缓存表';

-- ----------------------------
-- Table structure for nf_contact
-- ----------------------------
DROP TABLE IF EXISTS "public"."nf_contact";
CREATE TABLE "public"."nf_contact" (
  "id" int4 NOT NULL DEFAULT nextval('nf_contact_id_seq'::regclass),
  "name" varchar(255) COLLATE "pg_catalog"."default",
  "email" varchar(255) COLLATE "pg_catalog"."default",
  "message" text COLLATE "pg_catalog"."default",
  "created_at" timestamp(6) DEFAULT CURRENT_TIMESTAMP
)
;

-- ----------------------------
-- Table structure for nf_credits
-- ----------------------------
DROP TABLE IF EXISTS "public"."nf_credits";
CREATE TABLE "public"."nf_credits" (
  "id" int4 NOT NULL DEFAULT nextval('nf_credits_id_seq'::regclass),
  "user_id" varchar(32) COLLATE "pg_catalog"."default" NOT NULL,
  "product_name" varchar(64) COLLATE "pg_catalog"."default",
  "order_number" varchar(64) COLLATE "pg_catalog"."default" DEFAULT '0'::character varying,
  "order_price" numeric(10,2) DEFAULT 0,
  "order_date" timestamp(6),
  "credit_amount" int4 DEFAULT 0,
  "credit_type" char(1) COLLATE "pg_catalog"."default",
  "credit_transaction_type" char(1) COLLATE "pg_catalog"."default",
  "credit_desc" varchar(256) COLLATE "pg_catalog"."default",
  "created_at" timestamp(6) DEFAULT CURRENT_TIMESTAMP
)
;
COMMENT ON COLUMN "public"."nf_credits"."credit_type" IS '0=赠送积分 1=订阅积分 2=充值积分 3=退款积分';
COMMENT ON COLUMN "public"."nf_credits"."credit_transaction_type" IS '0=消费积分 1=获得积分 2=退款积分';
COMMENT ON TABLE "public"."nf_credits" IS '用户积分记录表';

-- ----------------------------
-- Table structure for nf_error_logs
-- ----------------------------
DROP TABLE IF EXISTS "public"."nf_error_logs";
CREATE TABLE "public"."nf_error_logs" (
  "id" int4 NOT NULL DEFAULT nextval('nf_error_logs_id_seq'::regclass),
  "user_id" varchar(32) COLLATE "pg_catalog"."default" NOT NULL,
  "error_type" char(1) COLLATE "pg_catalog"."default",
  "error_msg" text COLLATE "pg_catalog"."default",
  "created_at" timestamp(6) DEFAULT CURRENT_TIMESTAMP
)
;

-- ----------------------------
-- Table structure for nf_naming_tasks
-- ----------------------------
DROP TABLE IF EXISTS "public"."nf_naming_tasks";
CREATE TABLE "public"."nf_naming_tasks" (
  "id" int4 NOT NULL DEFAULT nextval('nf_names_id_seq'::regclass),
  "user_id" varchar(255) COLLATE "pg_catalog"."default",
  "action" varchar(50) COLLATE "pg_catalog"."default" NOT NULL,
  "params" jsonb NOT NULL,
  "result" jsonb NOT NULL,
  "ip" varchar(50) COLLATE "pg_catalog"."default" NOT NULL,
  "created_at" timestamptz(6) DEFAULT CURRENT_TIMESTAMP
)
;

-- ----------------------------
-- Table structure for nf_subscription
-- ----------------------------
DROP TABLE IF EXISTS "public"."nf_subscription";
CREATE TABLE "public"."nf_subscription" (
  "id" int4 NOT NULL DEFAULT nextval('nf_subscription_id_seq'::regclass),
  "user_id" varchar(32) COLLATE "pg_catalog"."default" NOT NULL,
  "order_number" varchar(64) COLLATE "pg_catalog"."default" DEFAULT '0'::character varying,
  "subscription_id" varchar(64) COLLATE "pg_catalog"."default" DEFAULT '0'::character varying,
  "order_price" numeric(10,2) DEFAULT 0,
  "credit_amount" int4 DEFAULT 0,
  "order_type" char(1) COLLATE "pg_catalog"."default",
  "order_desc" varchar(256) COLLATE "pg_catalog"."default",
  "order_date" timestamp(6),
  "subscription_type" varchar(16) COLLATE "pg_catalog"."default" DEFAULT 'monthly'::character varying,
  "subscription_status" varchar(16) COLLATE "pg_catalog"."default" DEFAULT 'active'::character varying,
  "trial_start" timestamp(6),
  "trial_end" timestamp(6),
  "created_at" timestamp(6) DEFAULT CURRENT_TIMESTAMP,
  "plan_type" varchar(20) COLLATE "pg_catalog"."default" DEFAULT 'basic'::character varying
)
;
COMMENT ON COLUMN "public"."nf_subscription"."plan_type" IS '订阅计划类型: basic=基础版, professional=专业版, business=商业版';

-- ----------------------------
-- Table structure for nf_transform_history
-- ----------------------------
DROP TABLE IF EXISTS "public"."nf_transform_history";
CREATE TABLE "public"."nf_transform_history" (
  "id" int4 NOT NULL DEFAULT nextval('nf_transform_history_id_seq'::regclass),
  "user_id" varchar(32) COLLATE "pg_catalog"."default" NOT NULL,
  "style_id" varchar(64) COLLATE "pg_catalog"."default" NOT NULL,
  "prediction_id" varchar(128) COLLATE "pg_catalog"."default",
  "original_image_url" text COLLATE "pg_catalog"."default",
  "result_url" text COLLATE "pg_catalog"."default",
  "credits_used" int4 DEFAULT 1,
  "status" varchar(20) COLLATE "pg_catalog"."default" DEFAULT 'processing'::character varying,
  "error" text COLLATE "pg_catalog"."default",
  "custom_prompt" text COLLATE "pg_catalog"."default",
  "processing_time" int4,
  "created_at" timestamp(6) DEFAULT CURRENT_TIMESTAMP,
  "updated_at" timestamp(6) DEFAULT CURRENT_TIMESTAMP,
  "type" varchar(20) COLLATE "pg_catalog"."default" DEFAULT 'image'::character varying,
  "task_id" varchar(128) COLLATE "pg_catalog"."default",
  "generated_image_url" text COLLATE "pg_catalog"."default"
)
;
COMMENT ON COLUMN "public"."nf_transform_history"."user_id" IS '用户ID';
COMMENT ON COLUMN "public"."nf_transform_history"."style_id" IS '使用的风格模板ID';
COMMENT ON COLUMN "public"."nf_transform_history"."prediction_id" IS 'Flux API预测ID';
COMMENT ON COLUMN "public"."nf_transform_history"."original_image_url" IS '原始图片URL';
COMMENT ON COLUMN "public"."nf_transform_history"."result_url" IS '转换结果图片URL';
COMMENT ON COLUMN "public"."nf_transform_history"."credits_used" IS '消耗的积分数量';
COMMENT ON COLUMN "public"."nf_transform_history"."status" IS '转换状态: processing, completed, failed';
COMMENT ON COLUMN "public"."nf_transform_history"."error" IS '错误信息';
COMMENT ON COLUMN "public"."nf_transform_history"."custom_prompt" IS '用户自定义提示词';
COMMENT ON COLUMN "public"."nf_transform_history"."processing_time" IS '处理时间（秒）';
COMMENT ON COLUMN "public"."nf_transform_history"."type" IS '转换类型: image(图片转换), video(视频转换)';
COMMENT ON COLUMN "public"."nf_transform_history"."task_id" IS '任务ID（视频转换使用）';
COMMENT ON COLUMN "public"."nf_transform_history"."generated_image_url" IS '生成的中间图片URL（视频转换使用）';
COMMENT ON TABLE "public"."nf_transform_history" IS '图像和视频转换历史记录表';

-- ----------------------------
-- Table structure for nf_users
-- ----------------------------
DROP TABLE IF EXISTS "public"."nf_users";
CREATE TABLE "public"."nf_users" (
  "id" int4 NOT NULL DEFAULT nextval('nf_users_id_seq'::regclass),
  "credits" int4 DEFAULT 0,
  "username" varchar(64) COLLATE "pg_catalog"."default",
  "email_address" varchar(64) COLLATE "pg_catalog"."default" NOT NULL,
  "password_hash" varchar(255) COLLATE "pg_catalog"."default" NOT NULL,
  "first_name" varchar(32) COLLATE "pg_catalog"."default",
  "last_name" varchar(32) COLLATE "pg_catalog"."default",
  "gender" varchar(8) COLLATE "pg_catalog"."default",
  "user_id" varchar(32) COLLATE "pg_catalog"."default" NOT NULL,
  "status" char(1) COLLATE "pg_catalog"."default" DEFAULT '1'::bpchar,
  "email_verified" bool DEFAULT false,
  "created_at" timestamp(6) DEFAULT CURRENT_TIMESTAMP,
  "updated_at" timestamp(6) DEFAULT CURRENT_TIMESTAMP
)
;

-- ----------------------------
-- Function structure for clean_expired_cache
-- ----------------------------
DROP FUNCTION IF EXISTS "public"."clean_expired_cache"();
CREATE OR REPLACE FUNCTION "public"."clean_expired_cache"()
  RETURNS "pg_catalog"."void" AS $BODY$
BEGIN
  DELETE FROM "public"."nf_cache" WHERE expires_at <= NOW();
END;
$BODY$
  LANGUAGE plpgsql VOLATILE
  COST 100;

-- ----------------------------
-- Alter sequences owned by
-- ----------------------------
SELECT setval('"public"."nf_api_keys_id_seq"', 1, false);

-- ----------------------------
-- Alter sequences owned by
-- ----------------------------
SELECT setval('"public"."nf_api_usage_id_seq"', 1, false);

-- ----------------------------
-- Alter sequences owned by
-- ----------------------------
SELECT setval('"public"."nf_cache_id_seq"', 1, false);

-- ----------------------------
-- Alter sequences owned by
-- ----------------------------
SELECT setval('"public"."nf_contact_id_seq"', 5, true);

-- ----------------------------
-- Alter sequences owned by
-- ----------------------------
SELECT setval('"public"."nf_credits_id_seq"', 151, true);

-- ----------------------------
-- Alter sequences owned by
-- ----------------------------
SELECT setval('"public"."nf_error_logs_id_seq"', 1, false);

-- ----------------------------
-- Alter sequences owned by
-- ----------------------------
SELECT setval('"public"."nf_health_assessments_id_seq"', 1, true);

-- ----------------------------
-- Alter sequences owned by
-- ----------------------------
SELECT setval('"public"."nf_names_id_seq"', 1, false);

-- ----------------------------
-- Alter sequences owned by
-- ----------------------------
SELECT setval('"public"."nf_products_id_seq"', 1, true);

-- ----------------------------
-- Alter sequences owned by
-- ----------------------------
SELECT setval('"public"."nf_subscription_id_seq"', 1, false);

-- ----------------------------
-- Alter sequences owned by
-- ----------------------------
SELECT setval('"public"."nf_template_face_swap_jobs_id_seq"', 13, true);

-- ----------------------------
-- Alter sequences owned by
-- ----------------------------
SELECT setval('"public"."nf_transform_history_id_seq"', 73, true);

-- ----------------------------
-- Alter sequences owned by
-- ----------------------------
SELECT setval('"public"."nf_user_health_assessment_id_seq"', 56, true);

-- ----------------------------
-- Alter sequences owned by
-- ----------------------------
SELECT setval('"public"."nf_users_id_seq"', 5, true);

-- ----------------------------
-- Alter sequences owned by
-- ----------------------------
SELECT setval('"public"."nf_video_templates_id_seq"', 11, true);

-- ----------------------------
-- Indexes structure for table nf_cache
-- ----------------------------
CREATE INDEX "idx_cache_created_at" ON "public"."nf_cache" USING btree (
  "created_at" "pg_catalog"."timestamp_ops" ASC NULLS LAST
);
CREATE INDEX "idx_cache_expires_at" ON "public"."nf_cache" USING btree (
  "expires_at" "pg_catalog"."timestamp_ops" ASC NULLS LAST
);
CREATE INDEX "idx_cache_key" ON "public"."nf_cache" USING btree (
  "cache_key" COLLATE "pg_catalog"."default" "pg_catalog"."text_ops" ASC NULLS LAST
);

-- ----------------------------
-- Uniques structure for table nf_cache
-- ----------------------------
ALTER TABLE "public"."nf_cache" ADD CONSTRAINT "nf_cache_key_unique" UNIQUE ("cache_key");

-- ----------------------------
-- Primary Key structure for table nf_cache
-- ----------------------------
ALTER TABLE "public"."nf_cache" ADD CONSTRAINT "nf_cache_pkey" PRIMARY KEY ("id");

-- ----------------------------
-- Indexes structure for table nf_transform_history
-- ----------------------------
CREATE INDEX "idx_transform_history_created_at" ON "public"."nf_transform_history" USING btree (
  "created_at" "pg_catalog"."timestamp_ops" ASC NULLS LAST
);
CREATE INDEX "idx_transform_history_prediction_id" ON "public"."nf_transform_history" USING btree (
  "prediction_id" COLLATE "pg_catalog"."default" "pg_catalog"."text_ops" ASC NULLS LAST
);
CREATE INDEX "idx_transform_history_status" ON "public"."nf_transform_history" USING btree (
  "status" COLLATE "pg_catalog"."default" "pg_catalog"."text_ops" ASC NULLS LAST
);
CREATE INDEX "idx_transform_history_task_id" ON "public"."nf_transform_history" USING btree (
  "task_id" COLLATE "pg_catalog"."default" "pg_catalog"."text_ops" ASC NULLS LAST
);
CREATE INDEX "idx_transform_history_type" ON "public"."nf_transform_history" USING btree (
  "type" COLLATE "pg_catalog"."default" "pg_catalog"."text_ops" ASC NULLS LAST
);
CREATE INDEX "idx_transform_history_user_id" ON "public"."nf_transform_history" USING btree (
  "user_id" COLLATE "pg_catalog"."default" "pg_catalog"."text_ops" ASC NULLS LAST
);

-- ----------------------------
-- Checks structure for table nf_transform_history
-- ----------------------------
ALTER TABLE "public"."nf_transform_history" ADD CONSTRAINT "chk_transform_type" CHECK (type::text = ANY (ARRAY['image'::character varying, 'video'::character varying]::text[]));

-- ----------------------------
-- Primary Key structure for table nf_transform_history
-- ----------------------------
ALTER TABLE "public"."nf_transform_history" ADD CONSTRAINT "nf_transform_history_pkey" PRIMARY KEY ("id");
