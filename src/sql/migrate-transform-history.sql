-- 数据库迁移脚本：更新转换历史表以支持图片和视频转换
-- 执行前请备份数据库！

-- 1. 添加新字段
ALTER TABLE "public"."nf_transform_history" 
ADD COLUMN IF NOT EXISTS "type" varchar(20) DEFAULT 'image';

-- 2. 添加任务ID字段
ALTER TABLE "public"."nf_transform_history" 
ADD COLUMN IF NOT EXISTS "task_id" varchar(128);

-- 3. 添加生成的中间图片URL字段
ALTER TABLE "public"."nf_transform_history" 
ADD COLUMN IF NOT EXISTS "generated_image_url" text;

-- 4. 重命名error_message为error（如果存在）
DO $$ 
BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.columns 
               WHERE table_name = 'nf_transform_history' 
               AND column_name = 'error_message') THEN
        ALTER TABLE "public"."nf_transform_history" 
        RENAME COLUMN "error_message" TO "error";
    END IF;
END $$;

-- 5. 更新现有记录的type字段
UPDATE "public"."nf_transform_history" 
SET "type" = 'image' 
WHERE "type" IS NULL;

-- 6. 添加约束
ALTER TABLE "public"."nf_transform_history" 
ADD CONSTRAINT IF NOT EXISTS "chk_transform_type" 
CHECK ("type" IN ('image', 'video'));

-- 7. 创建新索引
CREATE INDEX IF NOT EXISTS "idx_transform_history_type" 
ON "public"."nf_transform_history" ("type");

CREATE INDEX IF NOT EXISTS "idx_transform_history_task_id" 
ON "public"."nf_transform_history" ("task_id");

-- 8. 更新表注释
COMMENT ON TABLE "public"."nf_transform_history" IS '图像和视频转换历史记录表';
COMMENT ON COLUMN "public"."nf_transform_history"."type" IS '转换类型: image(图片转换), video(视频转换)';
COMMENT ON COLUMN "public"."nf_transform_history"."task_id" IS '任务ID（视频转换使用）';
COMMENT ON COLUMN "public"."nf_transform_history"."generated_image_url" IS '生成的中间图片URL（视频转换使用）';
COMMENT ON COLUMN "public"."nf_transform_history"."error" IS '错误信息';

-- 9. 验证迁移结果
SELECT 
    column_name, 
    data_type, 
    is_nullable, 
    column_default
FROM information_schema.columns 
WHERE table_name = 'nf_transform_history' 
ORDER BY ordinal_position;
