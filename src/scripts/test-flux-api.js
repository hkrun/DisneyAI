/**
 * 测试Flux Kontext Pro API配置
 * 运行: node src/scripts/test-flux-api.js
 */

const REPLICATE_API_TOKEN = process.env.REPLICATE_API_TOKEN;

if (!REPLICATE_API_TOKEN) {
  console.error('❌ 错误: 未找到 REPLICATE_API_TOKEN 环境变量');
  process.exit(1);
}

async function testFluxAPI() {
  console.log('🔍 正在测试Flux Kontext Pro API...');
  
  try {
    // 测试API连接
    const response = await fetch('https://api.replicate.com/v1/predictions', {
      method: 'POST',
      headers: {
        'Authorization': `Token ${REPLICATE_API_TOKEN}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        version: 'black-forest-labs/flux-kontext-pro:latest',
        input: {
          image: 'data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQABAAD/2wBDAAYEBQYFBAYGBQYHBwYIChAKCgkJChQODwwQFxQYGBcUFhYaHSUfGhsjHBYWICwgIyYnKSopGR8tMC0oMCUoKSj/2wBDAQcHBwoIChMKChMoGhYaKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCj/wAARCAABAAEDASIAAhEBAxEB/8QAFQABAQAAAAAAAAAAAAAAAAAAAAv/xAAUEAEAAAAAAAAAAAAAAAAAAAAA/8QAFQEBAQAAAAAAAAAAAAAAAAAAAAX/xAAUEQEAAAAAAAAAAAAAAAAAAAAA/9oADAMBAAIRAxEAPwCdABmX/9k=', // 最小测试图片
          prompt: 'Disney animation style, colorful, magical',
          negative_prompt: 'blurry, low quality',
          guidance_scale: 7.5,
          num_inference_steps: 10,
          strength: 0.8,
        }
      })
    });

    console.log('API Response Status:', response.status);
    console.log('API Response Headers:', Object.fromEntries(response.headers.entries()));

    if (response.ok) {
      const result = await response.json();
      console.log('✅ API调用成功！');
      console.log('Response:', JSON.stringify(result, null, 2));
    } else {
      const errorText = await response.text();
      console.error('❌ API调用失败');
      console.error('Status:', response.status);
      console.error('Error:', errorText);
    }
    
  } catch (error) {
    console.error('❌ 网络错误:', error.message);
  }
}

testFluxAPI();
