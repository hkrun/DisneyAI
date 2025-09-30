-- 创建缓存表
-- 用于存储API结果和临时数据

-- 创建序列
CREATE SEQUENCE IF NOT EXISTS "public"."nf_cache_id_seq" 
INCREMENT 1
MINVALUE  1
MAXVALUE 9223372036854775807
START 1
CACHE 1;

-- 创建缓存表
CREATE TABLE IF NOT EXISTS "public"."nf_cache" (
  "id" int4 NOT NULL DEFAULT nextval('nf_cache_id_seq'::regclass),
  "cache_key" varchar(255) COLLATE "pg_catalog"."default" NOT NULL,
  "cache_value" text COLLATE "pg_catalog"."default" NOT NULL,
  "expires_at" timestamp(6) NOT NULL,
  "created_at" timestamp(6) DEFAULT CURRENT_TIMESTAMP,
  "updated_at" timestamp(6) DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "nf_cache_pkey" PRIMARY KEY ("id"),
  CONSTRAINT "nf_cache_key_unique" UNIQUE ("cache_key")
);

-- 添加注释
COMMENT ON TABLE "public"."nf_cache" IS '系统缓存表';
COMMENT ON COLUMN "public"."nf_cache"."cache_key" IS '缓存键';
COMMENT ON COLUMN "public"."nf_cache"."cache_value" IS '缓存值（JSON格式）';
COMMENT ON COLUMN "public"."nf_cache"."expires_at" IS '过期时间';
COMMENT ON COLUMN "public"."nf_cache"."created_at" IS '创建时间';
COMMENT ON COLUMN "public"."nf_cache"."updated_at" IS '更新时间';

-- 创建索引
CREATE INDEX IF NOT EXISTS "idx_cache_key" ON "public"."nf_cache" ("cache_key");
CREATE INDEX IF NOT EXISTS "idx_cache_expires_at" ON "public"."nf_cache" ("expires_at");
CREATE INDEX IF NOT EXISTS "idx_cache_created_at" ON "public"."nf_cache" ("created_at");

-- 设置序列值
SELECT setval('"public"."nf_cache_id_seq"', 1, false);

-- 创建自动清理过期缓存的函数
CREATE OR REPLACE FUNCTION clean_expired_cache()
RETURNS void AS $$
BEGIN
  DELETE FROM "public"."nf_cache" WHERE expires_at <= NOW();
END;
$$ LANGUAGE plpgsql;

-- 创建定时清理过期缓存的触发器（可选）
-- 注意：这需要 pg_cron 扩展，如果没有安装可以忽略
-- CREATE OR REPLACE FUNCTION schedule_cache_cleanup()
-- RETURNS void AS $$
-- BEGIN
--   PERFORM cron.schedule('cache-cleanup', '0 */6 * * *', 'SELECT clean_expired_cache();');
-- END;
-- $$ LANGUAGE plpgsql;
