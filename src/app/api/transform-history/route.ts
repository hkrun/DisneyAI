import { NextRequest, NextResponse } from 'next/server';
import { sql, db } from '@/lib/postgres-client';
import { getToken } from 'next-auth/jwt';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1', 10);
    const limit = parseInt(searchParams.get('limit') || '10', 10);
    const statusFilter = searchParams.get('status'); // 'processing', 'completed', 'failed'
    const typeFilter = searchParams.get('type'); // 'image', 'video'

    const token = await getToken({ req: request, secret: process.env.NEXTAUTH_SECRET });

    if (!token || !token.userId) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    }

    const userId = token.userId as string;
    const offset = (page - 1) * limit;

    // Build WHERE conditions
    const conditions = [];
    const params = [];
    
    conditions.push('user_id = $1');
    params.push(userId);
    
    let paramIndex = 2;
    
    if (statusFilter && statusFilter !== 'all') {
      conditions.push(`status = $${paramIndex}`);
      params.push(statusFilter);
      paramIndex++;
    }
    
    if (typeFilter && typeFilter !== 'all') {
      conditions.push(`type = $${paramIndex}`);
      params.push(typeFilter);
      paramIndex++;
    }

    const whereClause = conditions.length > 0 ? `WHERE ${conditions.join(' AND ')}` : '';

    // Fetch total count
    const countQuery = `SELECT COUNT(*) FROM nf_transform_history ${whereClause}`;
    const { rows: countRows } = await db.query(countQuery, params);
    const total = parseInt(countRows[0].count, 10);
    const totalPages = Math.ceil(total / limit);

    // Fetch tasks
    const tasksQuery = `
      SELECT 
        id,
        user_id as "userId",
        type,
        style_id as "styleId",
        prediction_id as "predictionId",
        original_image_url as "originalImageUrl",
        result_url as "resultUrl",
        credits_used as "creditsUsed",
        status,
        error as "errorMessage",
        custom_prompt as "customPrompt",
        processing_time as "processingTime",
        created_at as "createdAt",
        updated_at as "updatedAt",
        task_id as "taskId",
        generated_image_url as "generatedImageUrl"
      FROM nf_transform_history
      ${whereClause}
      ORDER BY created_at DESC
      LIMIT $${paramIndex} OFFSET $${paramIndex + 1}
    `;
    
    const taskParams = [...params, limit, offset];
    const { rows: tasks } = await db.query(tasksQuery, taskParams);

    return NextResponse.json({
      success: true,
      data: {
        tasks,
        pagination: {
          total,
          page,
          limit,
          totalPages,
        },
      },
    });
  } catch (error) {
    console.error('Failed to fetch transform history:', error);
    return NextResponse.json({ success: false, error: 'Failed to fetch transform history' }, { status: 500 });
  }
}