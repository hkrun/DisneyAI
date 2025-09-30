// 简单的测试脚本来验证换脸记录API
const fetch = require('node-fetch');

async function testHistoryAPI() {
  try {
    console.log('🧪 测试换脸记录API...');
    
    // 测试API端点
    const response = await fetch('http://localhost:3000/api/disney-ai/history?page=1&limit=5', {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        // 注意：这里没有认证，所以会返回401，但可以测试API是否响应
      }
    });
    
    const result = await response.json();
    
    console.log('📊 API响应状态:', response.status);
    console.log('📋 API响应数据:', JSON.stringify(result, null, 2));
    
    if (response.status === 401) {
      console.log('✅ API正常工作 - 返回了预期的认证错误');
    } else if (response.status === 200) {
      console.log('✅ API正常工作 - 成功返回数据');
      console.log(`📈 返回了 ${result.data?.tasks?.length || 0} 条记录`);
    } else {
      console.log('❌ API可能有问题 - 状态码:', response.status);
    }
    
  } catch (error) {
    console.error('❌ 测试失败:', error.message);
  }
}

// 运行测试
testHistoryAPI();
