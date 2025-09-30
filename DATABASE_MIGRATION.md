# 数据库迁移指南

## 问题描述

当前数据库表 `nf_transform_history` 只支持图片转换记录，但项目现在需要支持图片转换和视频转换两种类型。

## 迁移内容

### 新增字段
- `type`: 转换类型 (`image` | `video`)
- `task_id`: 任务ID（视频转换使用）
- `generated_image_url`: 生成的中间图片URL（视频转换使用）

### 字段重命名
- `error_message` → `error`

### 新增索引
- `idx_transform_history_type`: 按转换类型查询
- `idx_transform_history_task_id`: 按任务ID查询

## 执行迁移

### 方法1：使用迁移脚本（推荐）

```bash
# 安装tsx（如果未安装）
npm install -g tsx

# 执行迁移
npm run migrate
```

### 方法2：手动执行SQL

1. 连接到数据库
2. 执行 `src/sql/migrate-transform-history.sql` 文件中的SQL语句

### 方法3：使用数据库管理工具

1. 打开数据库管理工具（如pgAdmin、DBeaver等）
2. 连接到数据库
3. 复制并执行 `src/sql/migrate-transform-history.sql` 中的内容

## 验证迁移

迁移完成后，可以执行以下查询验证：

```sql
-- 查看表结构
SELECT 
    column_name, 
    data_type, 
    is_nullable, 
    column_default
FROM information_schema.columns 
WHERE table_name = 'nf_transform_history' 
ORDER BY ordinal_position;

-- 查看现有记录
SELECT type, COUNT(*) as count 
FROM nf_transform_history 
GROUP BY type;
```

## 回滚（如果需要）

如果迁移出现问题，可以执行以下SQL回滚：

```sql
-- 删除新增的字段
ALTER TABLE "public"."nf_transform_history" DROP COLUMN IF EXISTS "type";
ALTER TABLE "public"."nf_transform_history" DROP COLUMN IF EXISTS "task_id";
ALTER TABLE "public"."nf_transform_history" DROP COLUMN IF EXISTS "generated_image_url";

-- 重命名回原来的字段名
ALTER TABLE "public"."nf_transform_history" RENAME COLUMN "error" TO "error_message";

-- 删除新增的索引
DROP INDEX IF EXISTS "idx_transform_history_type";
DROP INDEX IF EXISTS "idx_transform_history_task_id";
```

## 注意事项

1. **备份数据**：执行迁移前请务必备份数据库
2. **测试环境**：建议先在测试环境执行迁移
3. **停机时间**：迁移过程中可能需要短暂停机
4. **数据完整性**：迁移后请验证数据完整性

## 迁移后的表结构

```sql
CREATE TABLE "public"."nf_transform_history" (
  "id" int4 NOT NULL DEFAULT nextval('nf_transform_history_id_seq'::regclass),
  "user_id" varchar(32) NOT NULL,
  "type" varchar(20) DEFAULT 'image' CHECK ("type" IN ('image', 'video')),
  "style_id" varchar(64) NOT NULL,
  "prediction_id" varchar(128) NOT NULL,
  "task_id" varchar(128),
  "original_image_url" text,
  "generated_image_url" text,
  "result_url" text,
  "credits_used" int4 DEFAULT 1,
  "status" varchar(20) DEFAULT 'processing',
  "error" text,
  "custom_prompt" text,
  "processing_time" int4,
  "created_at" timestamp(6) DEFAULT CURRENT_TIMESTAMP,
  "updated_at" timestamp(6) DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "nf_transform_history_pkey" PRIMARY KEY ("id")
);
```
