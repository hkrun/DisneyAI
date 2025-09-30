-- 创建图像转换历史表
-- 用于记录用户的图像转换请求和结果

-- 创建序列
CREATE SEQUENCE IF NOT EXISTS "public"."nf_transform_history_id_seq" 
INCREMENT 1
MINVALUE  1
MAXVALUE 9223372036854775807
START 1
CACHE 1;

-- 创建转换历史表
CREATE TABLE IF NOT EXISTS "public"."nf_transform_history" (
  "id" int4 NOT NULL DEFAULT nextval('nf_transform_history_id_seq'::regclass),
  "user_id" varchar(32) COLLATE "pg_catalog"."default" NOT NULL,
  "style_id" varchar(64) COLLATE "pg_catalog"."default" NOT NULL,
  "prediction_id" varchar(128) COLLATE "pg_catalog"."default" NOT NULL,
  "original_image_url" text COLLATE "pg_catalog"."default",
  "result_url" text COLLATE "pg_catalog"."default",
  "credits_used" int4 DEFAULT 1,
  "status" varchar(20) COLLATE "pg_catalog"."default" DEFAULT 'processing',
  "error_message" text COLLATE "pg_catalog"."default",
  "custom_prompt" text COLLATE "pg_catalog"."default",
  "processing_time" int4, -- 处理时间（秒）
  "created_at" timestamp(6) DEFAULT CURRENT_TIMESTAMP,
  "updated_at" timestamp(6) DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "nf_transform_history_pkey" PRIMARY KEY ("id")
);

-- 添加注释
COMMENT ON TABLE "public"."nf_transform_history" IS '图像转换历史记录表';
COMMENT ON COLUMN "public"."nf_transform_history"."user_id" IS '用户ID';
COMMENT ON COLUMN "public"."nf_transform_history"."style_id" IS '使用的风格模板ID';
COMMENT ON COLUMN "public"."nf_transform_history"."prediction_id" IS 'Flux API预测ID';
COMMENT ON COLUMN "public"."nf_transform_history"."original_image_url" IS '原始图片URL';
COMMENT ON COLUMN "public"."nf_transform_history"."result_url" IS '转换结果图片URL';
COMMENT ON COLUMN "public"."nf_transform_history"."credits_used" IS '消耗的积分数量';
COMMENT ON COLUMN "public"."nf_transform_history"."status" IS '转换状态: processing, completed, failed';
COMMENT ON COLUMN "public"."nf_transform_history"."error_message" IS '错误信息';
COMMENT ON COLUMN "public"."nf_transform_history"."custom_prompt" IS '用户自定义提示词';
COMMENT ON COLUMN "public"."nf_transform_history"."processing_time" IS '处理时间（秒）';

-- 创建索引
CREATE INDEX IF NOT EXISTS "idx_transform_history_user_id" ON "public"."nf_transform_history" ("user_id");
CREATE INDEX IF NOT EXISTS "idx_transform_history_prediction_id" ON "public"."nf_transform_history" ("prediction_id");
CREATE INDEX IF NOT EXISTS "idx_transform_history_status" ON "public"."nf_transform_history" ("status");
CREATE INDEX IF NOT EXISTS "idx_transform_history_created_at" ON "public"."nf_transform_history" ("created_at");

-- 设置序列值
SELECT setval('"public"."nf_transform_history_id_seq"', 1, false);

-- 添加外键约束（如果用户表存在）
-- ALTER TABLE "public"."nf_transform_history" 
-- ADD CONSTRAINT "fk_transform_history_user_id" 
-- FOREIGN KEY ("user_id") REFERENCES "public"."nf_users" ("user_id") ON DELETE CASCADE;
