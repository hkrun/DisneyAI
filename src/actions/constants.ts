// 为当前请求的语言创建一个存储变量
let currentRequestLanguage = '';

/**
 * 设置当前请求的语言
 * 在路由处理程序中调用此函数
 */
export function setCurrentLanguage(lang: string) {
  if(lang === 'zh') {
    currentRequestLanguage = "中文";
  }
  else if(lang === 'en') {
    currentRequestLanguage = "英文";
  }
  else if(lang === 'ja') {
    currentRequestLanguage = "日语";
  }
  else if(lang === 'ko') {
    currentRequestLanguage = "韩语";
  }
  else if(lang === 'fr') {
    currentRequestLanguage = "法语";
  }
  else if(lang === 'de') {
    currentRequestLanguage = "德语";
  }
  else if(lang === 'es') {
    currentRequestLanguage = "西班牙语";
  }
  else {
    // 默认使用中文
    currentRequestLanguage = "中文";
  }
}

/**
 * 获取当前语言
 * @returns 当前设置的语言
 */
export function getCurrentLanguage(): string {
  // 如果没有设置语言，默认返回中文
  return currentRequestLanguage || "中文";
}

/**
 * 根据语言代码获取对应的语言名称
 * @param langCode 语言代码，如'zh'、'en'、'ja'
 * @returns 语言名称，如'中文'、'英文'、'日语'
 */
export function getLanguageNameByCode(langCode: string): string {
  switch(langCode) {
    case 'zh': return "中文";
    case 'en': return "English";
    case 'ja': return "日本語";
    case 'ko': return "한국어";
    case 'fr': return "Français";
    case 'de': return "Deutsch";
    case 'es': return "Español";
    default: return "English";
  }
}

// 通义千问 VL-Max 用于从迪士尼风格图片生成视频提示词的系统指令

/**
 * 生成通义千问 VL-Max 图片分析指令（可多语言）
 * 结合用户提供的规则，专用于“基于已转为迪士尼风格图片 → 生成图生视频提示词”。
 */
export function buildQwenVlmInstruction(langCode: string = 'zh'): string {
  const targetLanguage = getLanguageNameByCode(langCode)
  return (
    `仔细观察给定的迪士尼动画风格人物图像，基于图中人物的实际姿势与状态，` +
    `推断并生成用于通义万相图生视频（wan2.5-i2v-preview）的提示词，仅输出提示词本身。\n\n` +
    `要求：\n` +
    `- 人物：必须来自图片中的真实人物，并添加外貌特征形容词（如：美丽的少女、活泼的男孩等）。\n` +
    `- 场景：必须是图片中真实存在的场景，并添加场景特征形容词（如：温馨的客厅、宁静的公园等）。\n` +
    `- 动作：依据人物当前姿态推断合理的动态动作。\n` +
    `- 逻辑约束：坐姿可描述起身/转身/挥手等；站姿可描述行走/转身/弯腰等。\n` +
    `- 禁止使用静态词（如：坐着、站着、抱着、躺着、静止、不动）。\n` +
    `- 必须使用动态动词（如：行走、奔跑、跳跃、挥手、转身、弯腰、伸展、起身等）。\n` +
    `- 长度建议不超过40个字；格式：形容词+人物 在 形容词+场景 中 做某个动态动作。\n\n` +
    `示例：\n` +
    `- 单人：美丽的少女在美丽的花园里缓缓向前行走\n` +
    `- 多人：活泼的男孩在温馨的客厅里追逐嬉戏，优雅的母亲在一旁微笑观看\n` +
    `- 群体：一群年轻人在宁静的公园里散步聊天\n\n` +
    `请务必使用${targetLanguage}输出结果，不要使用其他语言。`
  )
}