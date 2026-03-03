-- ----------------------------
-- 推广平台与点击统计表（utm_source 来源追踪）
-- ----------------------------

DROP SEQUENCE IF EXISTS "public"."nf_promotion_platforms_id_seq";
CREATE SEQUENCE "public"."nf_promotion_platforms_id_seq"
INCREMENT 1 MINVALUE 1 MAXVALUE 2147483647 START 1 CACHE 1;

DROP SEQUENCE IF EXISTS "public"."nf_promotion_clicks_id_seq";
CREATE SEQUENCE "public"."nf_promotion_clicks_id_seq"
INCREMENT 1 MINVALUE 1 MAXVALUE 9223372036854775807 START 1 CACHE 1;

DROP TABLE IF EXISTS "public"."nf_promotion_clicks";
DROP TABLE IF EXISTS "public"."nf_promotion_platforms";

CREATE TABLE "public"."nf_promotion_platforms" (
  "id" int4 NOT NULL DEFAULT nextval('nf_promotion_platforms_id_seq'::regclass),
  "platform_key" varchar(32) COLLATE "pg_catalog"."default" NOT NULL,
  "name" varchar(64) COLLATE "pg_catalog"."default",
  "utm_source_value" varchar(64) COLLATE "pg_catalog"."default" NOT NULL,
  "promotion_url" varchar(512) COLLATE "pg_catalog"."default",
  "is_active" bool DEFAULT true,
  "created_at" timestamptz(6) DEFAULT CURRENT_TIMESTAMP,
  "updated_at" timestamptz(6) DEFAULT CURRENT_TIMESTAMP
);
COMMENT ON COLUMN "public"."nf_promotion_platforms"."platform_key" IS '内部唯一标识';
COMMENT ON COLUMN "public"."nf_promotion_platforms"."name" IS '显示名称，如微信公众号、抖音';
COMMENT ON COLUMN "public"."nf_promotion_platforms"."utm_source_value" IS '链接中 utm_source= 的值，单独设置，如 weixin、douyin';
COMMENT ON COLUMN "public"."nf_promotion_platforms"."promotion_url" IS '该平台对应的完整推广链接';
COMMENT ON COLUMN "public"."nf_promotion_platforms"."is_active" IS '是否启用';
COMMENT ON TABLE "public"."nf_promotion_platforms" IS '推广平台表，每平台一条，对应 ?utm_source=xxx 的推广链接';

ALTER SEQUENCE "public"."nf_promotion_platforms_id_seq" OWNED BY "public"."nf_promotion_platforms"."id";
ALTER TABLE "public"."nf_promotion_platforms" ADD CONSTRAINT "nf_promotion_platforms_pkey" PRIMARY KEY ("id");
ALTER TABLE "public"."nf_promotion_platforms" ADD CONSTRAINT "nf_promotion_platforms_platform_key_key" UNIQUE ("platform_key");
ALTER TABLE "public"."nf_promotion_platforms" ADD CONSTRAINT "nf_promotion_platforms_utm_source_value_key" UNIQUE ("utm_source_value");

CREATE INDEX "idx_promotion_platforms_is_active" ON "public"."nf_promotion_platforms" USING btree ("is_active");
CREATE INDEX "idx_promotion_platforms_utm_source_value" ON "public"."nf_promotion_platforms" USING btree ("utm_source_value" COLLATE "pg_catalog"."default");

CREATE TABLE "public"."nf_promotion_clicks" (
  "id" int8 NOT NULL DEFAULT nextval('nf_promotion_clicks_id_seq'::regclass),
  "platform_id" int4 NOT NULL,
  "utm_source_value" varchar(64) COLLATE "pg_catalog"."default" NOT NULL,
  "ip" varchar(64) COLLATE "pg_catalog"."default",
  "country" varchar(64) COLLATE "pg_catalog"."default",
  "region" varchar(128) COLLATE "pg_catalog"."default",
  "city" varchar(128) COLLATE "pg_catalog"."default",
  "created_at" timestamptz(6) DEFAULT CURRENT_TIMESTAMP
);
COMMENT ON COLUMN "public"."nf_promotion_clicks"."platform_id" IS '来源平台 id';
COMMENT ON COLUMN "public"."nf_promotion_clicks"."utm_source_value" IS '冗余，方便按来源统计';
COMMENT ON COLUMN "public"."nf_promotion_clicks"."ip" IS '访问 IP，来自 x-forwarded-for 或 x-real-ip';
COMMENT ON COLUMN "public"."nf_promotion_clicks"."country" IS '国家（geoip-lite 解析）';
COMMENT ON COLUMN "public"."nf_promotion_clicks"."region" IS '省/州（geoip-lite 解析）';
COMMENT ON COLUMN "public"."nf_promotion_clicks"."city" IS '城市（geoip-lite 解析）';
COMMENT ON TABLE "public"."nf_promotion_clicks" IS '推广点击记录，带 utm_source 的落地记一条';

ALTER SEQUENCE "public"."nf_promotion_clicks_id_seq" OWNED BY "public"."nf_promotion_clicks"."id";
ALTER TABLE "public"."nf_promotion_clicks" ADD CONSTRAINT "nf_promotion_clicks_pkey" PRIMARY KEY ("id");
ALTER TABLE "public"."nf_promotion_clicks" ADD CONSTRAINT "nf_promotion_clicks_platform_id_fkey" FOREIGN KEY ("platform_id") REFERENCES "public"."nf_promotion_platforms" ("id");

CREATE INDEX "idx_promotion_clicks_platform_id" ON "public"."nf_promotion_clicks" USING btree ("platform_id");
CREATE INDEX "idx_promotion_clicks_utm_source_value" ON "public"."nf_promotion_clicks" USING btree ("utm_source_value" COLLATE "pg_catalog"."default");
CREATE INDEX "idx_promotion_clicks_created_at" ON "public"."nf_promotion_clicks" USING btree ("created_at");
CREATE INDEX "idx_promotion_clicks_country" ON "public"."nf_promotion_clicks" USING btree ("country");

SELECT setval('"public"."nf_promotion_platforms_id_seq"', 1, true);
SELECT setval('"public"."nf_promotion_clicks_id_seq"', 1, true);

