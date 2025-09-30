/**
 * 数据库迁移脚本：添加图像转换历史表
 * 运行此脚本以创建 nf_transform_history 表
 */

const fs = require('fs');
const path = require('path');
const { Pool } = require('pg');

// 从环境变量获取数据库连接信息
const connectionString = process.env.POSTGRES_URL;

if (!connectionString) {
  console.error('错误: 未找到 POSTGRES_URL 环境变量');
  process.exit(1);
}

async function runMigration() {
  const pool = new Pool({
    connectionString,
    ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false
  });

  try {
    console.log('开始执行数据库迁移...');
    
    // 读取SQL文件
    const sqlPath = path.join(__dirname, '../sql/add-transform-history-table.sql');
    const sqlContent = fs.readFileSync(sqlPath, 'utf8');
    
    // 执行SQL
    await pool.query(sqlContent);
    
    console.log('✅ 数据库迁移完成！');
    console.log('已创建 nf_transform_history 表');
    
    // 验证表是否创建成功
    const result = await pool.query(`
      SELECT table_name, column_name, data_type 
      FROM information_schema.columns 
      WHERE table_name = 'nf_transform_history'
      ORDER BY ordinal_position
    `);
    
    if (result.rows.length > 0) {
      console.log('\n📋 表结构验证:');
      result.rows.forEach(row => {
        console.log(`  - ${row.column_name}: ${row.data_type}`);
      });
    }
    
  } catch (error) {
    console.error('❌ 迁移失败:', error.message);
    process.exit(1);
  } finally {
    await pool.end();
  }
}

// 运行迁移
runMigration();
