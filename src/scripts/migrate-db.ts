import { readFileSync } from 'fs'
import { join } from 'path'
import { db } from '@/lib/postgres-client'

/**
 * 数据库迁移脚本
 * 用于更新转换历史表以支持图片和视频转换
 */
async function migrateTransformHistory() {
  try {
    console.log('开始数据库迁移...')
    
    // 读取迁移SQL文件
    const sqlPath = join(process.cwd(), 'src', 'sql', 'migrate-transform-history.sql')
    const sqlContent = readFileSync(sqlPath, 'utf-8')
    
    // 分割SQL语句（以分号分隔）
    const statements = sqlContent
      .split(';')
      .map(stmt => stmt.trim())
      .filter(stmt => stmt.length > 0 && !stmt.startsWith('--'))
    
    console.log(`找到 ${statements.length} 个SQL语句`)
    
    // 逐个执行SQL语句
    for (let i = 0; i < statements.length; i++) {
      const statement = statements[i]
      if (statement.trim()) {
        console.log(`执行语句 ${i + 1}/${statements.length}: ${statement.substring(0, 50)}...`)
        await db.sql`${statement}`
      }
    }
    
    console.log('数据库迁移完成！')
    
    // 验证迁移结果
    console.log('验证迁移结果...')
    const result = await db.sql`
      SELECT 
        column_name, 
        data_type, 
        is_nullable, 
        column_default
      FROM information_schema.columns 
      WHERE table_name = 'nf_transform_history' 
      ORDER BY ordinal_position
    `
    
    console.log('表结构:')
    console.table(result)
    
  } catch (error) {
    console.error('数据库迁移失败:', error)
    process.exit(1)
  }
}

// 如果直接运行此脚本
if (require.main === module) {
  migrateTransformHistory()
    .then(() => process.exit(0))
    .catch((error) => {
      console.error('迁移失败:', error)
      process.exit(1)
    })
}

export { migrateTransformHistory }
