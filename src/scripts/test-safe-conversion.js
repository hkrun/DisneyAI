/**
 * 测试安全的图像转换
 * 运行: node src/scripts/test-safe-conversion.js
 */

const REPLICATE_API_TOKEN = process.env.REPLICATE_API_TOKEN;

if (!REPLICATE_API_TOKEN) {
  console.error('❌ 错误: 未找到 REPLICATE_API_TOKEN 环境变量');
  process.exit(1);
}

async function testSafeConversion() {
  console.log('🔍 测试安全的图像转换...');
  
  // 使用一个简单的测试图片（1x1像素的白色图片）
  const testImage = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNkYPhfDwAChwGA60e6kgAAAABJRU5ErkJggg==';
  
  // 使用更安全的提示词
  const safePrompt = 'Disney animation style, colorful cartoon character, family-friendly illustration, bright colors, magical atmosphere, hand-drawn art style';
  const safeNegativePrompt = 'realistic, photorealistic, dark themes, adult content, violence, scary, horror';
  
  try {
    const response = await fetch('https://api.replicate.com/v1/predictions', {
      method: 'POST',
      headers: {
        'Authorization': `Token ${REPLICATE_API_TOKEN}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        version: 'black-forest-labs/flux-kontext-pro',
        input: {
          prompt: safePrompt,
          input_image: testImage, // 保持完整的data URL
          aspect_ratio: "match_input_image",
          output_format: "jpg",
          safety_tolerance: 2,
          prompt_upsampling: false,
        }
      })
    });

    console.log(`API响应状态: ${response.status}`);
    
    if (response.ok) {
      const result = await response.json();
      console.log('✅ 转换请求成功创建');
      console.log(`🆔 预测ID: ${result.id}`);
      console.log(`📊 状态: ${result.status}`);
      
      // 立即取消测试预测以避免费用
      try {
        const cancelResponse = await fetch(`https://api.replicate.com/v1/predictions/${result.id}/cancel`, {
          method: 'POST',
          headers: {
            'Authorization': `Token ${REPLICATE_API_TOKEN}`,
          },
        });
        
        if (cancelResponse.ok) {
          console.log('✅ 测试预测已取消（避免费用）');
        }
      } catch (cancelError) {
        console.log('⚠️ 取消预测失败，但预测可能已自动完成');
      }
      
    } else {
      const errorText = await response.text();
      console.error('❌ 转换请求失败');
      console.error(`错误信息: ${errorText}`);
      
      // 检查是否是内容安全错误
      if (errorText.includes('sensitive') || errorText.includes('E005')) {
        console.log('\n💡 建议:');
        console.log('1. 尝试使用更简单的提示词');
        console.log('2. 降低guidance_scale和strength参数');
        console.log('3. 使用更中性的图片进行测试');
      }
    }
    
  } catch (error) {
    console.error('❌ 网络错误:', error.message);
  }
}

testSafeConversion();
