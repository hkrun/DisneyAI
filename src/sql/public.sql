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

 Date: 22/09/2025 15:20:46
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
SELECT setval('"public"."nf_contact_id_seq"', 5, true);

-- ----------------------------
-- Alter sequences owned by
-- ----------------------------
SELECT setval('"public"."nf_credits_id_seq"', 135, true);

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
SELECT setval('"public"."nf_user_health_assessment_id_seq"', 56, true);

-- ----------------------------
-- Alter sequences owned by
-- ----------------------------
SELECT setval('"public"."nf_users_id_seq"', 3, true);

-- ----------------------------
-- Alter sequences owned by
-- ----------------------------
SELECT setval('"public"."nf_video_templates_id_seq"', 11, true);
