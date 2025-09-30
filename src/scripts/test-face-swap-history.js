const { Pool } = require('pg');

// 数据库连接配置
const pool = new Pool({
  user: process.env.POSTGRES_USER || 'postgres',
  host: process.env.POSTGRES_HOST || 'localhost',
  database: process.env.POSTGRES_DATABASE || 'aivideo',
  password: process.env.POSTGRES_PASSWORD || 'password',
  port: process.env.POSTGRES_PORT || 5432,
});

async function testDisneyAiHistory() {
  try {
    console.log('🧪 测试换脸记录功能...');
    
    // 1. 检查自定义换脸记录表是否存在
    console.log('\n1. 检查自定义换脸记录表...');
    const customTableCheck = await pool.query(`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public' 
      AND table_name = 'nf_custom_face_swap_jobs'
    `);
    
    if (customTableCheck.rows.length > 0) {
      console.log('✅ 自定义换脸记录表存在');
      
      // 查询自定义换脸记录数量
      const customCount = await pool.query('SELECT COUNT(*) as count FROM nf_custom_face_swap_jobs');
      console.log(`   记录数量: ${customCount.rows[0].count}`);
    } else {
      console.log('❌ 自定义换脸记录表不存在');
    }
    
    // 2. 检查模板换脸记录表是否存在
    console.log('\n2. 检查模板换脸记录表...');
    const templateTableCheck = await pool.query(`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public' 
      AND table_name = 'nf_template_face_swap_jobs'
    `);
    
    if (templateTableCheck.rows.length > 0) {
      console.log('✅ 模板换脸记录表存在');
      
      // 查询模板换脸记录数量
      const templateCount = await pool.query('SELECT COUNT(*) as count FROM nf_template_face_swap_jobs');
      console.log(`   记录数量: ${templateCount.rows[0].count}`);
    } else {
      console.log('❌ 模板换脸记录表不存在');
      console.log('   请执行 src/sql/template_face_swap_tables.sql 来创建表');
    }
    
    // 3. 测试联合查询（模拟history API）
    console.log('\n3. 测试联合查询...');
    
    if (customTableCheck.rows.length > 0) {
      const testUserId = 'user_1756882231785_fjqll2qf3'; // 从终端日志中看到的用户ID
      
      let unionQuery = `
        (SELECT 
          id,
          job_id,
          'custom' as task_type,
          video_file_name as source_name,
          face_image_file_name as face_source,
          video_file_size,
          face_image_file_size,
          add_watermark,
          enhance,
          watermark_type,
          status,
          result_video_url,
          error_message,
          processing_time,
          created_at,
          updated_at,
          completed_at
        FROM nf_custom_face_swap_jobs 
        WHERE user_id = $1)
      `;
      
      if (templateTableCheck.rows.length > 0) {
        unionQuery += `
        UNION ALL
        (SELECT 
          id,
          job_id,
          'template' as task_type,
          template_name as source_name,
          face_image_url as face_source,
          null as video_file_size,
          null as face_image_file_size,
          add_watermark,
          enhance,
          watermark_type,
          status,
          result_video_url,
          error_message,
          processing_time,
          created_at,
          updated_at,
          completed_at
        FROM nf_template_face_swap_jobs 
        WHERE user_id = $1)
        `;
      }
      
      unionQuery += ' ORDER BY created_at DESC LIMIT 5';
      
      const result = await pool.query(unionQuery, [testUserId]);
      
      console.log(`✅ 联合查询成功，返回 ${result.rows.length} 条记录`);
      
      if (result.rows.length > 0) {
        console.log('\n最近的记录:');
        result.rows.forEach((row, index) => {
          console.log(`${index + 1}. [${row.task_type}] ${row.source_name} - ${row.status} (${row.created_at})`);
        });
      }
    } else {
      console.log('❌ 无法测试联合查询，自定义换脸表不存在');
    }
    
    console.log('\n🎉 测试完成！');
    
  } catch (error) {
    console.error('❌ 测试失败:', error.message);
  } finally {
    await pool.end();
  }
}

// 运行测试
testDisneyAiHistory();
