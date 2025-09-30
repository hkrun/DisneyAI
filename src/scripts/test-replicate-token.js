/**
 * 测试 Replicate API Token 是否有效
 * 运行: node src/scripts/test-replicate-token.js
 */

const REPLICATE_API_TOKEN = process.env.REPLICATE_API_TOKEN;

if (!REPLICATE_API_TOKEN) {
  console.error('❌ 错误: 未找到 REPLICATE_API_TOKEN 环境变量');
  console.log('请在 .env.local 文件中设置:');
  console.log('REPLICATE_API_TOKEN=r8_your_token_here');
  process.exit(1);
}

async function testReplicateToken() {
  try {
    console.log('🔍 正在测试 Replicate API Token...');
    
    const response = await fetch('https://api.replicate.com/v1/account', {
      headers: {
        'Authorization': `Token ${REPLICATE_API_TOKEN}`,
        'Content-Type': 'application/json',
      },
    });

    if (response.ok) {
      const account = await response.json();
      console.log('✅ Token 有效！');
      console.log(`📧 账号邮箱: ${account.email}`);
      console.log(`👤 用户名: ${account.username}`);
      console.log(`💰 余额: $${account.billing?.balance || '0.00'}`);
    } else {
      console.error('❌ Token 无效或已过期');
      console.error(`状态码: ${response.status}`);
      const error = await response.text();
      console.error(`错误信息: ${error}`);
    }
  } catch (error) {
    console.error('❌ 网络错误:', error.message);
  }
}

testReplicateToken();
