import { NextResponse, NextRequest } from 'next/server'
import { i18nConfig } from "@/i18n-config";
import { getToken } from "next-auth/jwt";

// 受保护的API路由
const protectedApiRoutes = [
  '/api/user',
  '/api/subscription',
  '/api/airwallex',
  '/api/stripe',
  '/api/upload',
  '/api/transform-image',
  '/api/transform-video',
  '/api/naming-task',
  '/api/transform-history',
  // 已移除换脸相关API，删除保护项以避免无效匹配
];

// 管理员专用路由
const adminRoutes = [
  '/dashboard'
];

// 公开路由（不需要认证）
const publicRoutes = [
  '/api/auth/register-user', // 自定义注册端点
  '/api/auth', // NextAuth所有路由
  '/api/test-qwen', // Qwen VL-Max 测试API
  '/',
  '/about',
  '/contact',
  '/legal',
  '/test-qwen', // Qwen VL-Max 测试页面
  '/manifest.json', // PWA 清单文件
  '/sw.js', // Service Worker
];

function isProtectedApiRoute(pathname: string): boolean {
  return protectedApiRoutes.some(route => pathname.startsWith(route));
}

function isAdminRoute(pathname: string): boolean {
  return adminRoutes.some(route => pathname.includes(route));
}

function isPublicRoute(pathname: string): boolean {
  return publicRoutes.some(route => {
    if (route === '/') return pathname === '/' || pathname.match(/^\/[a-z]{2}$/);
    return pathname.includes(route);
  });
}

export async function middleware(request: NextRequest) {
  const pathname = request.nextUrl.pathname;

  // 强制放行 NextAuth 的所有路由，避免被任何重写/鉴权拦截返回 HTML
  if (pathname.startsWith('/api/auth')) {
    return NextResponse.next();
  }
  
  // 跳过API路由的国际化处理
  if (pathname.startsWith('/api/')) {
    // 如果是受保护的API路由，检查认证
    if (isProtectedApiRoute(pathname)) {
      try {
        // 获取 NextAuth session token
        const token = await getToken({
          req: request,
          secret: process.env.NEXTAUTH_SECRET,
        });
      
        if (!token?.userId) {
          return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        // 将 NextAuth 用户信息添加到请求头中
        const requestHeaders = new Headers(request.headers);
        requestHeaders.set('x-user-id', token.userId as string);
        requestHeaders.set('x-user-email', token.email as string);

        return NextResponse.next({
          request: {
            headers: requestHeaders,
          },
        });
      } catch (error) {
        console.error('Auth error:', error);
        return NextResponse.json({ error: 'Authentication failed' }, { status: 401 });
      }
    }
    
    return NextResponse.next();
  }

  // 处理国际化路由（仅针对非API路由）
  const pathnameHasLocale = i18nConfig.locales.some(
    (locale) => pathname.startsWith(`/${locale}/`) || pathname === `/${locale}`
  );

  // 管理员路由检查
  if (isAdminRoute(pathname)) {
    try {
      // 检查 NextAuth token
      const token = await getToken({
        req: request,
        secret: process.env.NEXTAUTH_SECRET,
      });

      if (!token?.userId || token.userId !== process.env.APP_ROLE_ADMIN) {
        const redirectUrl = new URL('/', request.url);
        return NextResponse.redirect(redirectUrl);
      }
    } catch (error) {
      const redirectUrl = new URL('/', request.url);
      return NextResponse.redirect(redirectUrl);
    }
  }

  // 静态文件（图片、视频等）直接放行，不进行国际化处理
  const staticFilePattern = /\.(mp4|webm|mov|avi|flv|wmv|jpg|jpeg|png|gif|svg|webp|ico|pdf|zip|css|js|woff|woff2|ttf|eot|txt|manifest\.json|sw\.js)$/i;
  if (staticFilePattern.test(pathname)) {
    // 如果静态文件路径包含语言前缀（如 /en/sp1.mp4），重写为根路径（/sp1.mp4）
    const localeMatch = pathname.match(/^\/([a-z]{2})\/(.+)$/);
    if (localeMatch && i18nConfig.locales.includes(localeMatch[1] as any)) {
      const url = request.nextUrl.clone();
      url.pathname = `/${localeMatch[2]}`;
      return NextResponse.rewrite(url);
    }
    return NextResponse.next();
  }

  // 处理国际化重定向（仅针对页面路由）
  if (!pathnameHasLocale) {
    // PWA 静态文件和 ads.txt 直接放行，不重定向
    if (pathname === '/manifest.json' || pathname === '/sw.js' || pathname === '/ads.txt') {
      return NextResponse.next();
    }
    // 其他路径（包括 /）都需要重定向到带语言前缀的路径
    const redirectUrl = request.nextUrl.clone()
    const normalizedPath = pathname === '/' ? '' : pathname
    redirectUrl.pathname = `/${i18nConfig.defaultLocale}${normalizedPath}`
    return NextResponse.redirect(redirectUrl, 308)
  }

  return NextResponse.next();
}

 export const config = {
  matcher: [
    // Skip Next.js internals and static files (except those with locale prefix that need rewriting)
    '/((?!_next|sitemap.xml|favicon.ico|robots.txt|ads.txt|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest|assets)).*)',
    // Always run for API routes
    '/(api|trpc)(.*)',
  ],
}

