/**
 * 测试Flux Kontext Pro API是否可用
 * 运行: node src/scripts/test-flux-kontext-pro.js
 */

const REPLICATE_API_TOKEN = process.env.REPLICATE_API_TOKEN;

if (!REPLICATE_API_TOKEN) {
  console.error('❌ 错误: 未找到 REPLICATE_API_TOKEN 环境变量');
  console.log('请在 .env.local 文件中设置:');
  console.log('REPLICATE_API_TOKEN=r8_your_token_here');
  process.exit(1);
}

async function testFluxKontextPro() {
  console.log('🔍 正在测试Flux Kontext Pro API...');
  console.log(`API Token: ${REPLICATE_API_TOKEN.substring(0, 10)}...`);
  
  try {
    // 首先检查账户信息
    console.log('\n1. 检查账户信息...');
    const accountResponse = await fetch('https://api.replicate.com/v1/account', {
      headers: {
        'Authorization': `Token ${REPLICATE_API_TOKEN}`,
        'Content-Type': 'application/json',
      },
    });

    if (accountResponse.ok) {
      const account = await accountResponse.json();
      console.log('✅ 账户连接成功');
      console.log(`📧 邮箱: ${account.email}`);
      console.log(`💰 余额: $${account.billing?.balance || '0.00'}`);
    } else {
      console.error('❌ 账户连接失败');
      return;
    }

    // 测试模型是否可用
    console.log('\n2. 检查模型可用性...');
    const modelResponse = await fetch('https://api.replicate.com/v1/models/black-forest-labs/flux-kontext-pro', {
      headers: {
        'Authorization': `Token ${REPLICATE_API_TOKEN}`,
      },
    });

    if (modelResponse.ok) {
      const model = await modelResponse.json();
      console.log('✅ Flux Kontext Pro模型可用');
      console.log(`📝 模型名称: ${model.name}`);
      console.log(`🏷️ 最新版本: ${model.latest_version?.id || 'N/A'}`);
    } else {
      console.error('❌ Flux Kontext Pro模型不可用');
      console.error(`状态码: ${modelResponse.status}`);
      const errorText = await modelResponse.text();
      console.error(`错误信息: ${errorText}`);
    }

    // 测试创建预测
    console.log('\n3. 测试创建预测...');
    const testImage = 'data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQABAAD/2wBDAAYEBQYFBAYGBQYHBwYIChAKCgkJChQODwwQFxQYGBcUFhYaHSUfGhsjHBYWICwgIyYnKSopGR8tMC0oMCUoKSj/2wBDAQcHBwoIChMKChMoGhYaKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCj/wAARCAABAAEDASIAAhEBAxEB/8QAFQABAQAAAAAAAAAAAAAAAAAAAAv/xAAUEAEAAAAAAAAAAAAAAAAAAAAA/8QAFQEBAQAAAAAAAAAAAAAAAAAAAAX/xAAUEQEAAAAAAAAAAAAAAAAAAAAA/9oADAMBAAIRAxEAPwCdABmX/9k=';

    const predictionResponse = await fetch('https://api.replicate.com/v1/predictions', {
      method: 'POST',
      headers: {
        'Authorization': `Token ${REPLICATE_API_TOKEN}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        version: 'black-forest-labs/flux-kontext-pro',
        input: {
          prompt: 'Disney animation style, colorful, magical',
          input_image: testImage, // 保持完整的data URL
          aspect_ratio: "match_input_image",
          output_format: "jpg",
          safety_tolerance: 2,
          prompt_upsampling: false,
        }
      })
    });

    console.log(`预测创建状态: ${predictionResponse.status}`);
    
    if (predictionResponse.ok) {
      const prediction = await predictionResponse.json();
      console.log('✅ 预测创建成功');
      console.log(`🆔 预测ID: ${prediction.id}`);
      console.log(`📊 状态: ${prediction.status}`);
      console.log(`⏱️ 创建时间: ${prediction.created_at}`);
      
      // 立即取消测试预测以避免费用
      try {
        const cancelResponse = await fetch(`https://api.replicate.com/v1/predictions/${prediction.id}/cancel`, {
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
      const errorText = await predictionResponse.text();
      console.error('❌ 预测创建失败');
      console.error(`错误信息: ${errorText}`);
    }
    
  } catch (error) {
    console.error('❌ 测试过程中发生错误:', error.message);
  }
  
  console.log('\n📝 测试完成！');
  console.log('如果所有测试都通过，说明Flux Kontext Pro API配置正确');
}

testFluxKontextPro();
