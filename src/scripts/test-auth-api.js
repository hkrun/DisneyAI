/**
 * 测试API认证是否正常工作
 * 运行: node src/scripts/test-auth-api.js
 */

const API_BASE_URL = process.env.NEXT_PUBLIC_CF_URL || 'http://localhost:3000';

async function testAuthAPI() {
  console.log('🔍 测试API认证...');
  console.log(`API Base URL: ${API_BASE_URL}`);
  
  try {
    // 测试未认证的请求
    console.log('\n1. 测试未认证的请求...');
    const response1 = await fetch(`${API_BASE_URL}/api/transform-image`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        image: 'test',
        styleId: 'snow-white'
      })
    });
    
    const result1 = await response1.json();
    console.log(`状态码: ${response1.status}`);
    console.log(`响应: ${JSON.stringify(result1, null, 2)}`);
    
    if (result1.error === '用户未登录') {
      console.log('✅ 认证保护正常工作');
    } else {
      console.log('❌ 认证保护可能有问题');
    }
    
  } catch (error) {
    console.error('❌ 测试失败:', error.message);
  }
  
  console.log('\n📝 说明:');
  console.log('- 如果看到"用户未登录"错误，说明认证保护正常工作');
  console.log('- 请确保已登录并刷新页面后重试');
  console.log('- 检查浏览器开发者工具中的Network标签页');
}

testAuthAPI();
