'use server';

import { sql } from '@/lib/postgres-client';
import { NamingTask } from '@/types/name-task';

export async function addNamingTask(data: NamingTask) {
    try {
      const { rowCount } = await sql`
        INSERT INTO nf_naming_tasks 
        (user_id, action, params, result, ip) 
        VALUES (
          ${data.userId},
          ${data.action},
          ${JSON.stringify(data.params)},
          ${JSON.stringify(data.result)},
          ${data.ip}
        )
      `;
      return rowCount;
    } catch(error) {
      console.error("add naming task error", error);
    }
    return 0;
  }