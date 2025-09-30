-- 更新转换历史表以支持图片和视频转换
-- 添加新字段并修改现有字段

-- 添加转换类型字段
ALTER TABLE "public"."nf_transform_history" 
ADD COLUMN IF NOT EXISTS "type" varchar(20) DEFAULT 'image' CHECK ("type" IN ('image', 'video'));

-- 添加任务ID字段（用于视频转换）
ALTER TABLE "public"."nf_transform_history" 
ADD COLUMN IF NOT EXISTS "task_id" varchar(128);

-- 添加生成的中间图片URL字段（用于视频转换）
ALTER TABLE "public"."nf_transform_history" 
ADD COLUMN IF NOT EXISTS "generated_image_url" text;

-- 重命名字段以保持一致性
-- 将 prediction_id 重命名为 prediction_id（保持不变，但添加注释说明）
-- 将 error_message 重命名为 error
ALTER TABLE "public"."nf_transform_history" 
RENAME COLUMN IF EXISTS "error_message" TO "error";

-- 更新表注释
COMMENT ON TABLE "public"."nf_transform_history" IS '图像和视频转换历史记录表';
COMMENT ON COLUMN "public"."nf_transform_history"."type" IS '转换类型: image(图片转换), video(视频转换)';
COMMENT ON COLUMN "public"."nf_transform_history"."task_id" IS '任务ID（视频转换使用）';
COMMENT ON COLUMN "public"."nf_transform_history"."generated_image_url" IS '生成的中间图片URL（视频转换使用）';
COMMENT ON COLUMN "public"."nf_transform_history"."prediction_id" IS 'Flux API预测ID（图片转换使用）或WAN I2V任务ID（视频转换使用）';
COMMENT ON COLUMN "public"."nf_transform_history"."error" IS '错误信息';

-- 创建新的索引
CREATE INDEX IF NOT EXISTS "idx_transform_history_type" ON "public"."nf_transform_history" ("type");
CREATE INDEX IF NOT EXISTS "idx_transform_history_task_id" ON "public"."nf_transform_history" ("task_id");

-- 更新现有记录的type字段（如果为空）
UPDATE "public"."nf_transform_history" 
SET "type" = 'image' 
WHERE "type" IS NULL;
