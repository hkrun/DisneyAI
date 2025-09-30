import { NextRequest, NextResponse } from 'next/server';
import { fluxClient } from '@/lib/flux-kontext-pro';
import { getStyleTemplate } from '@/lib/disney-prompts';
import { getCurrentUser } from '@/lib/auth';
import { sql } from '@/lib/postgres-client';
import { downloadAndUploadToOSS } from '@/lib/oss-upload-utility';

export interface TransformImageRequest {
  image: string; // Base64 encoded image
  styleId: string; // Disney style template ID
  userId?: string; // User ID for tracking
}

export interface TransformImageResponse {
  success: boolean;
  predictionId?: string;
  resultUrl?: string;
  error?: string;
  creditsUsed?: number;
}

// 检查用户积分
async function checkUserCredits(userId: string): Promise<{ hasCredits: boolean; credits: number }> {
  try {
    const { rows } = await sql`
      SELECT credits FROM nf_users 
      WHERE user_id = ${userId} AND status = '1'
    `;
    
    if (rows.length === 0) {
      return { hasCredits: false, credits: 0 };
    }
    
    const credits = rows[0].credits || 0;
    return { hasCredits: credits > 0, credits };
  } catch (error) {
    console.error('Error checking user credits:', error);
    return { hasCredits: false, credits: 0 };
  }
}

// 扣除用户积分
async function deductUserCredits(userId: string, creditsToDeduct: number = 1): Promise<boolean> {
  try {
    const { rows } = await sql`
      UPDATE nf_users 
      SET credits = credits - ${creditsToDeduct}
      WHERE user_id = ${userId} AND credits >= ${creditsToDeduct} AND status = '1'
      RETURNING credits
    `;
    
    return rows.length > 0;
  } catch (error) {
    console.error('Error deducting user credits:', error);
    return false;
  }
}

// 记录转换历史
async function recordTransformHistory(
  userId: string, 
  styleId: string, 
  predictionId: string, 
  creditsUsed: number
): Promise<void> {
  try {
    await sql`
      INSERT INTO nf_transform_history (
        user_id, type, style_id, prediction_id, credits_used, status, created_at
      ) VALUES (
        ${userId}, 'image', ${styleId}, ${predictionId}, ${creditsUsed}, 'processing', NOW()
      )
    `;
  } catch (error) {
    console.error('Error recording transform history:', error);
  }
}

// 更新转换历史状态
async function updateTransformHistory(
  predictionId: string, 
  status: 'completed' | 'failed', 
  resultUrl?: string
): Promise<void> {
  try {
    await sql`
      UPDATE nf_transform_history 
      SET status = ${status}, result_url = ${resultUrl || null}, updated_at = NOW()
      WHERE prediction_id = ${predictionId}
    `;
  } catch (error) {
    console.error('Error updating transform history:', error);
  }
}

export async function POST(request: NextRequest) {
  try {
    // 从请求头获取用户信息（由中间件设置）
    const userId = request.headers.get('x-user-id');
    const userEmail = request.headers.get('x-user-email');
    
    if (!userId) {
      return NextResponse.json(
        { success: false, error: '用户未登录' },
        { status: 401 }
      );
    }

    // 从数据库获取用户详细信息
    const { rows } = await sql`
      SELECT 
        id,
        user_id as "userId",
        email_address as email,
        username,
        first_name as "firstName",
        last_name as "lastName",
        credits,
        status,
        email_verified as "emailVerified"
      FROM nf_users 
      WHERE user_id = ${userId} AND status = '1'
    `;

    if (rows.length === 0) {
      return NextResponse.json(
        { success: false, error: '用户不存在或已被禁用' },
        { status: 401 }
      );
    }

    const user = rows[0];

    // 解析请求数据
    const body: TransformImageRequest = await request.json();
    const { image, styleId } = body;

    // 验证必需参数
    if (!image || !styleId) {
      return NextResponse.json(
        { success: false, error: '缺少必需参数：image 和 styleId' },
        { status: 400 }
      );
    }

    // 获取风格模板
    const styleTemplate = getStyleTemplate(styleId);
    if (!styleTemplate) {
      return NextResponse.json(
        { success: false, error: '无效的风格ID' },
        { status: 400 }
      );
    }

    // 检查用户积分
    const { hasCredits, credits } = await checkUserCredits(user.userId);
    if (!hasCredits) {
      return NextResponse.json(
        { success: false, error: '积分不足，请购买积分后再试' },
        { status: 402 }
      );
    }

    // 使用风格模板的提示词
    const finalPrompt = styleTemplate.prompt;

    // 调用Flux Kontext Pro API
    const fluxRequest = {
      image,
      prompt: finalPrompt,
    };

    const fluxResponse = await fluxClient.transformImage(fluxRequest);
    
    if (!fluxResponse.id) {
      return NextResponse.json(
        { success: false, error: 'API调用失败，未返回预测ID' },
        { status: 500 }
      );
    }

    // 扣除用户积分
    const creditsDeducted = await deductUserCredits(user.userId, 1);
    if (!creditsDeducted) {
      // 如果积分扣除失败，取消预测
      try {
        await fluxClient.cancelPrediction(fluxResponse.id);
      } catch (cancelError) {
        console.error('Failed to cancel prediction:', cancelError);
      }
      
      return NextResponse.json(
        { success: false, error: '积分扣除失败' },
        { status: 402 }
      );
    }

    // 记录转换历史
    await recordTransformHistory(user.userId, styleId, fluxResponse.id, 1);

    // 返回预测ID，前端可以轮询状态
    return NextResponse.json({
      success: true,
      predictionId: fluxResponse.id,
      creditsUsed: 1,
      message: '图像转换已开始，请稍候...'
    });

  } catch (error) {
    console.error('Transform image error:', error);
    console.error('Error details:', {
      message: error instanceof Error ? error.message : String(error),
      stack: error instanceof Error ? error.stack : undefined,
      name: error instanceof Error ? error.name : undefined
    });
    
    return NextResponse.json(
      { 
        success: false, 
        error: error instanceof Error ? error.message : '服务器内部错误' 
      },
      { status: 500 }
    );
  }
}

// 轮询转换状态的端点
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const predictionId = searchParams.get('predictionId');

    if (!predictionId) {
      return NextResponse.json(
        { success: false, error: '缺少predictionId参数' },
        { status: 400 }
      );
    }

    // 从请求头获取用户信息（由中间件设置）
    const userId = request.headers.get('x-user-id');
    
    if (!userId) {
      return NextResponse.json(
        { success: false, error: '用户未登录' },
        { status: 401 }
      );
    }

    // 轮询Flux API状态
    const fluxResponse = await fluxClient.pollPrediction(predictionId);

    if (fluxResponse.status === 'succeeded' && fluxResponse.output) {
      // 成功：优先将 Replicate 图片转存到 OSS，统一返回/入库 OSS URL
      const replicateUrl = fluxResponse.output;
      let finalUrl = replicateUrl;
      try {
        const upload = await downloadAndUploadToOSS(
          replicateUrl,
          `disney-style-${predictionId}.jpg`,
          'generated-images',
          'disney-style'
        );
        if (upload.success && upload.url) {
          finalUrl = upload.url;
        } else {
          console.error('转存到 OSS 失败，回退使用 Replicate URL:', upload.error);
        }
      } catch (e) {
        console.error('转存到 OSS 异常，回退使用 Replicate URL:', e);
      }

      // 更新转换历史为完成状态（写入最终 URL）
      await updateTransformHistory(predictionId, 'completed', finalUrl);

      return NextResponse.json({
        success: true,
        status: 'completed',
        resultUrl: finalUrl
      });
    } else if (fluxResponse.status === 'failed') {
      // 更新转换历史为失败状态
      await updateTransformHistory(predictionId, 'failed');
      
      return NextResponse.json({
        success: false,
        status: 'failed',
        error: fluxResponse.error || '转换失败'
      });
    } else {
      // 仍在处理中
      return NextResponse.json({
        success: true,
        status: 'processing',
        message: '转换进行中...'
      });
    }

  } catch (error) {
    console.error('Poll prediction error:', error);
    return NextResponse.json(
      { success: false, error: '服务器内部错误' },
      { status: 500 }
    );
  }
}
