import { NextResponse } from 'next/server';
import Stripe from 'stripe';
import { PROJECT_ID } from '@/config/config';
import { hasUsedFreeTrial } from '@/actions/user-order';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!,
    {
        stripeAccount: process.env.STRIPE_ACCOUNT_ID
    });

export async function POST(req: Request) {

    try {

        const { priceId, userId, type, customerEmail, locale, language } = await req.json();
        
        console.log('=== Stripe API 调试信息 ===');
        console.log('接收到的参数:', { priceId, userId, type, customerEmail, locale, language });
        
        if (!customerEmail) {
            console.error('customerEmail 参数为空');
            return NextResponse.json({ error: '用户邮箱不存在' }, { status: 400 });
        }
        
        // 语言映射表
        const localeMap: { [key: string]: string } = {
            'zh': 'zh',
            'en': 'en',
            'de': 'de',
            'es': 'es',
            'fr': 'fr',
            'ja': 'ja',
            'ko': 'ko'
        };

        // 获取Stripe支持的语言代码
        const stripeLocale = localeMap[locale] || 'en';

        // 根据语言设置自定义文本
        const customMessages: { [key: string]: string } = {
            'zh': '邮箱已自动填充并锁定，以确保支付与您的账户关联',
            'en': 'Email is automatically filled and locked to ensure payment is associated with your account',
            'de': 'E-Mail wird automatisch ausgefüllt und gesperrt, um sicherzustellen, dass die Zahlung mit Ihrem Konto verknüpft ist',
            'es': 'El correo electrónico se completa y bloquea automáticamente para garantizar que el pago esté asociado con su cuenta',
            'fr': 'L\'e-mail est automatiquement rempli et verrouillé pour garantir que le paiement est associé à votre compte',
            'ja': 'メールアドレスは自動的に入力され、ロックされ、お支払いがお客様のアカウントに関連付けられることを保証します',
            'ko': '이메일이 자동으로 채워지고 잠겨서 결제가 귀하의 계정과 연결되도록 보장합니다'
        };

        const param: Stripe.Checkout.SessionCreateParams = {
            ui_mode: 'embedded',
            locale: stripeLocale as Stripe.Checkout.SessionCreateParams.Locale,
            line_items: [
                {
                    price: priceId,
                    quantity: 1,
                },
            ],
            // redirect_on_completion: 'if_required',
            redirect_on_completion: 'never',
            automatic_tax: {enabled: true},
            customer_update: {
                address: 'auto' // 🔑 自动从结账表单中保存地址（用于税费计算）
            },
            client_reference_id: userId,
            // return_url:`${req.headers.get("origin")}/return?session_id={CHECKOUT_SESSION_ID}`,
            metadata: {
                userId: userId,
                priceId: priceId,
                projectId: PROJECT_ID
            },
            customer_email: customerEmail,
            custom_text: {
                submit: {
                    message: customMessages[locale] || customMessages['en'],
                },
            },
        }

        if(type === "1"){
            // 一次性付款
            param.mode = 'payment';
            param.payment_intent_data = {
                metadata: {
                    userId: userId,
                    priceId: priceId,
                    projectId: PROJECT_ID
                }
            };
        } else if(type === "3") {
            // 🆕 $1付费试用（立即支付$1，然后在webhook中创建3天试用订阅）
            console.log('🎁 处理$1付费试用请求');
            
            // 🚫 防重复检查
            const hasUsedTrial = await hasUsedFreeTrial();
            if (hasUsedTrial) {
                console.log('❌ 用户已使用过试用');
                return NextResponse.json({ 
                    error: '您已使用过试用，无法再次申请' 
                }, { status: 400 });
            }
            
            console.log('✅ 用户未使用过试用，创建$1付费试用支付');
            
            // 🔑 先创建或获取 Stripe 客户（关键！）
            let customer: Stripe.Customer;
            try {
                // 尝试查找已存在的客户
                const existingCustomers = await stripe.customers.list({
                    email: customerEmail,
                    limit: 1
                });
                
                if (existingCustomers.data.length > 0) {
                    customer = existingCustomers.data[0];
                    console.log('✅ 找到已存在的客户:', customer.id);
                } else {
                    // 创建新客户
                    customer = await stripe.customers.create({
                        email: customerEmail,
                        metadata: {
                            userId: userId,
                            projectId: PROJECT_ID
                        }
                    });
                    console.log('✅ 创建新客户:', customer.id);
                }
            } catch (error) {
                console.error('❌ 创建/获取客户失败:', error);
                return NextResponse.json({ error: '创建客户失败' }, { status: 500 });
            }
            
            // 🌍 多语言产品名称和描述
            const trialProductNames: { [key: string]: string } = {
                'zh': 'DisneyAi 3天体验激活',
                'en': 'DisneyAi 3-Day Trial Activation',
                'ja': 'DisneyAi 3日間体験アクティベーション',
                'ko': 'DisneyAi 3일 체험 활성화',
                'de': 'DisneyAi 3-Tage-Testaktivierung',
                'fr': 'DisneyAi Activation d\'essai de 3 jours',
                'es': 'DisneyAi Activación de prueba de 3 días'
            };
            
            const trialProductDescriptions: { [key: string]: string } = {
                'zh': '立即开始3天体验，之后自动转为月度订阅 $9.99/月',
                'en': 'Start 3-day trial now, then auto-renews to monthly subscription at $9.99/month',
                'ja': '今すぐ3日間の体験を開始、その後月額$9.99のサブスクリプションに自動更新',
                'ko': '지금 3일 체험 시작, 이후 월 $9.99 구독으로 자동 갱신',
                'de': 'Starten Sie jetzt die 3-tägige Testversion, die sich dann automatisch in ein monatliches Abonnement für $9,99/Monat verlängert',
                'fr': 'Commencez l\'essai de 3 jours maintenant, puis renouvellement automatique à l\'abonnement mensuel à $9,99/mois',
                'es': 'Comience la prueba de 3 días ahora, luego se renueva automáticamente a la suscripción mensual a $9.99/mes'
            };
            
            const productName = trialProductNames[locale] || trialProductNames['en'];
            const productDescription = trialProductDescriptions[locale] || trialProductDescriptions['en'];
            
            // 🎯 使用 payment 模式立即收取$1
            // 支付成功后在 webhook 中创建带3天试用期的订阅
            param.mode = 'payment';
            param.customer = customer.id; // 🔑 使用创建的客户ID（而不是customer_email）
            delete param.customer_email; // 删除customer_email，因为已经有customer了
            
            param.line_items = [
                {
                    price_data: {
                        currency: 'usd',
                        product_data: {
                            name: productName,
                            description: productDescription
                        },
                        unit_amount: 100, // $1.00 = 100美分
                    },
                    quantity: 1
                }
            ];
            param.payment_intent_data = {
                setup_future_usage: 'off_session', // 🔑 保存支付方式用于未来扣款
                metadata: {
                    userId: userId,
                    priceId: priceId, // 保存月度订阅的价格ID
                    projectId: PROJECT_ID,
                    isTrial: 'true', // 🏷️ 试用标识
                    trialActivation: 'true', // 标记这是试用激活付款
                    subscriptionPriceId: priceId, // 3天后要订阅的价格ID
                    language: language || locale || 'zh'
                }
            };
        } else {
            // 常规订阅
            param.mode = 'subscription';
            param.subscription_data = {
                metadata: {
                    userId: userId,
                    priceId: priceId,
                    projectId: PROJECT_ID
                }
            };
        }
        
        console.log('创建 Stripe 会话参数:', {
            customer_email: param.customer_email,
            mode: param.mode,
            locale: stripeLocale,
            userId: userId
        });
        
        const session = await stripe.checkout.sessions.create(param);
        
        console.log('Stripe 会话创建成功:', session.id);

        return NextResponse.json({ clientSecret: session.client_secret });
    } catch (error) {
        console.log("payment error", error)
        return NextResponse.json({ error: 'payment error' }, { status: 500 });
    }
}