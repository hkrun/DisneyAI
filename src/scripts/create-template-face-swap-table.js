const { Pool } = require('pg');
const fs = require('fs');
const path = require('path');

// 数据库连接配置
const pool = new Pool({
  user: process.env.POSTGRES_USER || 'postgres',
  host: process.env.POSTGRES_HOST || 'localhost',
  database: process.env.POSTGRES_DATABASE || 'aivideo',
  password: process.env.POSTGRES_PASSWORD || 'password',
  port: process.env.POSTGRES_PORT || 5432,
});

async function createTable() {
  try {
    console.log('开始创建模板换脸记录表...');
    
    // 读取SQL文件
    const sqlPath = path.join(__dirname, '../sql/template_face_swap_tables.sql');
    const sql = fs.readFileSync(sqlPath, 'utf8');
    
    // 执行SQL
    await pool.query(sql);
    
    console.log('✅ 模板换脸记录表创建成功！');
    
    // 验证表是否创建成功
    const result = await pool.query(`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public' 
      AND table_name = 'nf_template_face_swap_jobs'
    `);
    
    if (result.rows.length > 0) {
      console.log('✅ 表验证成功：nf_template_face_swap_jobs 已存在');
    } else {
      console.log('❌ 表验证失败：nf_template_face_swap_jobs 不存在');
    }
    
  } catch (error) {
    console.error('❌ 创建表失败:', error.message);
    
    // 如果是表已存在的错误，不算失败
    if (error.message.includes('already exists')) {
      console.log('ℹ️  表已存在，跳过创建');
    } else {
      process.exit(1);
    }
  } finally {
    await pool.end();
  }
}

// 运行脚本
createTable();
