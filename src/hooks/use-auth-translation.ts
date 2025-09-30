'use client'

import { useEffect, useState } from 'react'
import { type Locale } from '@/i18n-config'

export interface AuthI18n {
  auth: {
    login: Record<string, string>
    register: Record<string, string>
    errors: Record<string, string>
    success: Record<string, string>
  }
}

export function useAuthTranslation(lang: Locale) {
  const [translations, setTranslations] = useState<AuthI18n | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const DEFAULT_AUTH: AuthI18n = {
      auth: {
        login: {
          title: '登录',
          googleButton: '使用 Google 登录',
          orDivider: '或',
          emailLabel: '邮箱',
          emailPlaceholder: '输入邮箱',
          passwordLabel: '密码',
          passwordPlaceholder: '输入密码',
          loginButton: '登录',
          registerLink: '还没有账号？',
          registerButton: '注册',
          forgotPassword: '忘记密码'
        },
        register: {
          title: '注册',
          googleButton: '使用 Google 注册',
          orDivider: '或',
          emailLabel: '邮箱',
          emailPlaceholder: '输入邮箱',
          passwordLabel: '密码',
          passwordPlaceholder: '设置密码',
          firstNameLabel: '名',
          firstNamePlaceholder: '输入名',
          lastNameLabel: '姓',
          lastNamePlaceholder: '输入姓',
          registerButton: '注册',
          loginLink: '已有账号？',
          loginButton: '登录'
        },
        errors: {
          emailRequired: '邮箱必填',
          emailInvalid: '邮箱格式不正确',
          passwordRequired: '密码必填',
          passwordLength: '密码长度过短',
          firstNameRequired: '名必填',
          lastNameRequired: '姓必填',
          loginFailed: '登录失败',
          registerFailed: '注册失败',
          googleLoginFailed: 'Google 登录失败',
          networkError: '网络异常，请稍后重试',
          userNotFound: '用户不存在',
          invalidCredentials: '账号或密码不正确',
          accountDisabled: '账户已禁用'
        },
        success: { welcomeBack: '欢迎回来！', welcomeNew: '欢迎加入！' }
      }
    }

    const load = async () => {
      try {
        setLoading(true)
        setError(null)
        const mod = await import(`@/locales/${lang}/auth.json`)
        const data = (mod.default as any)
        const shaped: AuthI18n | null = data?.auth
          ? { auth: data.auth }
          : (data?.login && data?.register ? { auth: data as any } : null)
        setTranslations(shaped || DEFAULT_AUTH)
      } catch (e) {
        try {
          const fallback = await import('@/locales/zh/auth.json')
          const data = (fallback.default as any)
          const shaped: AuthI18n | null = data?.auth
            ? { auth: data.auth }
            : (data?.login && data?.register ? { auth: data as any } : null)
          setTranslations(shaped || DEFAULT_AUTH)
        } catch (err) {
          // 最终兜底内置中文
          setTranslations(DEFAULT_AUTH)
        }
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [lang])

  return { translations, loading, error }
}


