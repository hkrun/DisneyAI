export interface DisneyStyleTemplate {
  id: string;
  name: string;
  description: string;
  prompt: string;
  category: 'classic' | 'pixar' | 'modern';
  image: string;
}

export const DISNEY_STYLE_TEMPLATES: DisneyStyleTemplate[] = [
  // 经典动画系列
  {
    id: 'snow-white',
    name: '《白雪公主》现代电影风',
    description: '现代迪士尼电影风格',
    prompt: 'Make it into a classic hand-drawn 2D fairy tale animation style, with soft colors, rounded character shapes, and a warm, nostalgic storybook feeling',
    category: 'classic',
    image: '/1.jpg'
  },
  {
    id: 'cinderella',
    name: '《灰姑娘》手绘经典风',
    description: '优雅的迪士尼公主风格',
    prompt: "Create a hand-drawn 2D fairy tale princess animation style from the 1930s to 1950s, with elegant vintage character design, expressive almond-shaped eyes, soft skin tones and a gentle color palette. Keep the original facial features while blending in classic storybook aesthetics. The scene should be a castle, magical forest or grand ballroom, with watercolor-like backgrounds and subtle textures that evoke the golden age of animated fairy tales.",
    category: 'classic',
    image: '/2.jpg'
  },
  {
    id: 'bambi',
    name: '《小鹿斑比》经典风',
    description: '自然森林风格',
    prompt: 'Classic hand-drawn 2D forest fairy tale style: vivid saturated colors, soft rounded character outlines, warm storytelling lighting, peaceful woodland atmosphere.',
    category: 'classic',
    image: '/3.jpeg'
  },
  {
    id: 'mulan',
    name: '《花木兰》美式东方风',
    description: '迪士尼还原古代中国场景',
    prompt: 'Hand-drawn and 3D blended animation style, ancient Chinese setting, traditional Chinese architecture (wooden houses, ancestral halls), oriental character design (long black hair, petal-shaped lips), warm earthy tones with bright accents, historical fairy tale atmosphere, family-friendly illustration',
    category: 'classic',
    image: '/4.png'
  },
  

  // 皮克斯3D系列
  {
    id: 'toy-story',
    name: '《玩具总动员》3D风',
    description: '皮克斯3D动画风格，玩具质感',
    prompt: '3D cartoon animation style with toy-like characters, plastic materials, bright colors, clean studio lighting, childhood nostalgia, playful atmosphere, detailed 3D rendering',
    category: 'pixar',
    image: '/5.jpg'
  },
  {
    id: 'frozen',
    name: '《冰雪奇缘》冰雪风',
    description: '冰雪魔法风格，蓝色和白色主调',
    prompt: '3D winter fantasy animation style, ice and snow magic, crystalline textures, cool blue and white tones, ice castle scenery, magical sparkles, detailed snow effects',
    category: 'modern',
    image: '/6.jpg'
  },
  {
    id: 'zootopia',
    name: '《疯狂动物城》3D 写实卡通风 ',
    description: ' 迪士尼 3D 写实卡通风格，动物毛发皮肤质感细腻',
    prompt: '3D realistic cartoon style, anthropomorphic animal characters with detailed fur texture and expressive faces, a vibrant fantasy-modern city, exaggerated cartoon movements, soft lighting, detailed urban environments, family-friendly mood',
    category: 'modern',
    image: '/7.jpeg'
  },
  {
    id: 'finding-nemo',
    name: '《海底总动员》海洋风',
    description: '海底世界风格，蓝色和珊瑚色调',
    prompt: '3D underwater ocean animation style, colorful coral reef environment, diverse marine life, flowing water effects, tropical fish colors, deep ocean lighting, immersive underwater world',
    category: 'pixar',
    image: '/8.jpeg'
  },
  
  {id: "wreck-it-ralph",
    name: "《无敌破坏王》游戏像素与 3D 结合风",
    description: "迪士尼像素风与 3D 融合风格，复古游戏场景用像素（简洁鲜艳）",
    prompt: "A hybrid style combining retro pixel art and 3D cartoon rendering: pixelated game levels, bright and saturated blocky textures, simple geometric shapes, 3D characters with exaggerated proportions and detailed facial expressions, glowing arcade lights, and a nostalgic video game world full of energy and movement",
    category: "pixar",
    image: "/9.jpeg"
  },

  // 现代动画系列
  {id: 'the-lion-king',
    name: '《狮子王》CGI 写实风',
    description: '迪士尼 CGI 动画风格，以非洲草原为背景',
    prompt: 'CGI realistic animation style, African savanna landscape, vivid bright colors, lifelike animal fur and skin textures, detailed grasslands and trees, dramatic cinematic lighting, epic fairy tale scene, high-definition natural atmosphere',
    category: 'modern',
    image: '/10.jpeg'
  },
  
];

/**
 * 根据ID获取风格模板
 */
export function getStyleTemplate(id: string): DisneyStyleTemplate | undefined {
  return DISNEY_STYLE_TEMPLATES.find(template => template.id === id);
}

/**
 * 根据ID和语言获取本地化的风格模板
 */
export function getLocalizedStyleTemplate(id: string, lang: string = 'zh'): DisneyStyleTemplate | undefined {
  const template = DISNEY_STYLE_TEMPLATES.find(template => template.id === id);
  if (!template) return undefined;

  // 动态导入对应的语言文件
  let localizedData;
  try {
    if (lang === 'zh') {
      localizedData = require('@/locales/zh/styles.json');
    } else if (lang === 'en') {
      localizedData = require('@/locales/en/styles.json');
    } else if (lang === 'es') {
      localizedData = require('@/locales/es/styles.json');
    } else if (lang === 'fr') {
      localizedData = require('@/locales/fr/styles.json');
    } else if (lang === 'de') {
      localizedData = require('@/locales/de/styles.json');
    } else if (lang === 'ja') {
      localizedData = require('@/locales/ja/styles.json');
    } else if (lang === 'ko') {
      localizedData = require('@/locales/ko/styles.json');
    } else {
      localizedData = require('@/locales/en/styles.json'); // 默认英文
    }
  } catch (error) {
    console.warn(`Failed to load localized styles for ${lang}, falling back to English`);
    localizedData = require('@/locales/en/styles.json');
  }

  const localizedStyle = localizedData[id];
  if (localizedStyle) {
    return {
      ...template,
      name: localizedStyle.name,
      description: localizedStyle.description
    };
  }

  return template; // 如果找不到本地化版本，返回原始模板
}

/**
 * 根据分类获取风格模板
 */
export function getStyleTemplatesByCategory(category: DisneyStyleTemplate['category']): DisneyStyleTemplate[] {
  return DISNEY_STYLE_TEMPLATES.filter(template => template.category === category);
}

/**
 * 获取所有分类
 */
export function getCategories(): Array<{ key: DisneyStyleTemplate['category'], name: string }> {
  return [
    { key: 'classic', name: '经典动画系列' },
    { key: 'pixar', name: '皮克斯3D系列' },
    { key: 'modern', name: '现代动画系列' }
  ];
}

