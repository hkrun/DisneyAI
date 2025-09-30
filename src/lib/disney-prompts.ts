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
    prompt: 'Make it into a classic Disney hand drawn style animated film',
    category: 'classic',
    image: 'https://scmh-shanghai.oss-cn-shanghai.aliyuncs.com/dsn/images/tmplhscrdh9.jpg'
  },
  {
    id: 'cinderella',
    name: '《灰姑娘》手绘经典风',
    description: '优雅的迪士尼公主风格',
    prompt: "Create a Disney princess version animation in classic hand drawn Disney style from the 1930s to 1950s, reminiscent of movies such as Snow White and the Seven Dwarfs, Cinderella, and Sleeping Beauty. This character should retain Zeng Daya's facial features, including her striking skeletal structure, expressive almond shaped eyes, plump lips, and radiant skin tone, while seamlessly integrating retro Disney aesthetics. Maintaining the elegance and simplicity of early Disney princesses. The color palette should be slightly soft but harmonious, using traditional Celtic shadows and hand drawn textures to create a truly golden age Disney feel. The scene should be a castle, magical forest, or grand ballroom from a storybook, evoking the nostalgic charm of classic Disney movies. The background should have hand drawn, watercolor like textures to ensure that it gives a feeling of a vintage Disney movie scene.",
    category: 'classic',
    image: 'https://scmh-shanghai.oss-cn-shanghai.aliyuncs.com/dsn/images/573dc94d2b66d6c05b151aad618f145b.jpg'
  },
  {
    id: 'bambi',
    name: '《小鹿斑比》经典风',
    description: '自然森林风格',
    prompt: 'Classic Disney style: Hand-drawn 2D, vivid saturated colors, soft rounded character outlines, warm fairy-tale lighting.',
    category: 'classic',
    image: 'https://scmh-shanghai.oss-cn-shanghai.aliyuncs.com/dsn/images/85c100280e033d687accbd0bcd95c2fd.jpeg'
  },
  {
    id: 'mulan',
    name: '《花木兰》美式东方风',
    description: '迪士尼还原古代中国场景',
    prompt: 'Disney animation style, blend of hand-drawn and 3D elements, ancient Chinese setting, traditional Chinese architecture (wooden houses, ancestral halls), oriental character design (long black hair, petal-shaped lips), warm earthy tones with bright accents, historical fairy tale vibe, family-friendly illustration',
    category: 'classic',
    image: 'https://scmh-shanghai.oss-cn-shanghai.aliyuncs.com/dsn/images/941ahqx9bnrma0csemc80gj5ww.png'
  },
  

  // 皮克斯3D系列
  {
    id: 'toy-story',
    name: '《玩具总动员》3D风',
    description: '皮克斯3D动画风格，玩具质感',
    prompt: 'Pixar Toy Story style, 3D animation, toy-like texture, plastic material, bright colors, clean lighting, childhood nostalgia, playful atmosphere, detailed 3D rendering',
    category: 'pixar',
    image: 'https://scmh-shanghai.oss-cn-shanghai.aliyuncs.com/dsn/images/f085f2e48f37c1dc5c238c5ffde136af.jpg'
  },
  {
    id: 'frozen',
    name: '《冰雪奇缘》冰雪风',
    description: '冰雪魔法风格，蓝色和白色主调',
    prompt: 'Disney Frozen style, ice and snow magic, crystalline textures, cool blue and white tones, winter wonderland, ice castle aesthetic, magical sparkles, detailed snow effects',
    category: 'modern',
    image: 'https://scmh-shanghai.oss-cn-shanghai.aliyuncs.com/dsn/images/tmpc46is7bu.jpg'
  },
  {
    id: 'zootopia',
    name: '《疯狂动物城》3D 写实卡通风 ',
    description: ' 迪士尼 3D 写实卡通风格，动物毛发皮肤质感细腻',
    prompt: 'Disney animation style, 3D realistic cartoon illustration, anthropomorphic animal characters (detailed fur texture, expressive faces), Zootopia cityscape (mix of fantasy and realism), vibrant color palette, exaggerated cartoon movements, soft lighting, detailed urban environments, family-friendly art',
    category: 'modern',
    image: 'https://scmh-shanghai.oss-cn-shanghai.aliyuncs.com/dsn/images/6244b887612cf8c60d581dc9a8ceff51.jpeg'
  },
  {
    id: 'finding-nemo',
    name: '《海底总动员》海洋风',
    description: '海底世界风格，蓝色和珊瑚色调',
    prompt: 'Pixar Finding Nemo style, underwater ocean animation, coral reef colors, marine life aesthetic, flowing water effects, tropical fish colors, ocean depth lighting, 3D underwater world',
    category: 'pixar',
    image: 'https://scmh-shanghai.oss-cn-shanghai.aliyuncs.com/dsn/images/61c3c68198b2ab11a191df0e79504585.jpeg'
  },
  
  {id: "wreck-it-ralph",
    name: "《无敌破坏王》游戏像素与 3D 结合风",
    description: "迪士尼像素风与 3D 融合风格，复古游戏场景用像素（简洁鲜艳）",
    prompt: "Disney animation style, blend of pixel art and 3D illustration, retro video game world (pixelated scenes, blocky character shapes, bright pixel colors), 3D character details (Ralph's fur, clothing texture), real-world scenes (3D realistic), nostalgic game vibe, vibrant color palette, family-friendly art",
    category: "pixar",
    image: "https://scmh-shanghai.oss-cn-shanghai.aliyuncs.com/dsn/images/eb624b85a3427bdf60fc9b60211932d5.jpeg"
  },

  // 现代动画系列
  {id: 'the-lion-king',
    name: '《狮子王》CGI 写实风',
    description: '迪士尼 CGI 动画风格，以非洲草原为背景',
    prompt: 'Disney animation style, CGI realistic illustration, African savanna landscape, vivid bright colors, lifelike animal fur texture, detailed grasslands and trees, dramatic lighting, epic fairy tale scene, high-definition details, natural atmosphere',
    category: 'modern',
    image: 'https://scmh-shanghai.oss-cn-shanghai.aliyuncs.com/dsn/images/377c38a66f28a1a1d18df2d341056526.jpeg'
  },
  
];

/**
 * 根据ID获取风格模板
 */
export function getStyleTemplate(id: string): DisneyStyleTemplate | undefined {
  return DISNEY_STYLE_TEMPLATES.find(template => template.id === id);
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

