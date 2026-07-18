const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);
const walletService = require('./wallet.service');
const appError = require('../utils/appError');
const statusText = require('../utils/statusText');

class StripeService {
    constructor() {}

    /**
     * إنشاء جلسة دفع لتعبئة المحفظة
     * @param {string} userId - معرّف المستخدم
     * @param {string} userEmail - بريد المستخدم لإرسال الفاتورة
     * @param {number} amount - المبلغ المراد شحنه (بالجنيه أو الدولار)
     */
    async createCheckoutSession(userId, userEmail, amount) {
        if (amount <= 0) {
            throw new appError("Amount must be greater than zero", 400, statusText.FAIL);
        }

        // Stripe يتعامل بالـ Cents (القرش)، لذلك نضرب المبلغ في 100
        const amountInCents = Math.round(amount * 100);

        const session = await stripe.checkout.sessions.create({
            payment_method_types: ['card'],
            customer_email: userEmail,
            line_items: [{
                price_data: {
                    currency: 'egp', // يمكنك تغييرها لـ usd حسب رغبتك
                    product_data: {
                        name: 'Top up Wallet Balance',
                        description: 'شحن رصيد المحفظة الرقمية للمنصة',
                    },
                    unit_amount: amountInCents,
                },
                quantity: 1,
            }],
            mode: 'payment',
            // روابط التوجيه بعد إتمام أو إلغاء الدفع في الفرونت آيند
            success_url: `${process.env.CLIENT_URL}/wallet?success=true`,
            cancel_url: `${process.env.CLIENT_URL}/wallet?canceled=true`,
            // نمرر الـ userId في الـ metadata لنتمكن من معرفة من صاحب الطلب في الـ Webhook
            metadata: {
                userId: userId.toString()
            }
        });

        return session.url; // نعيد الرابط ليقوم الـ Controller بتوجيه المستخدم إليه
    }

    /**
     * معالجة الـ Webhook القادم من Stripe لتأكيد الدفع الحقيقي
     */
    async handleWebhook(signature, rawBody) {
        let event;

        try {
            // التحقق من أن الإشارة قادمة فعلياً من Stripe ولم يتم تزويرها
            event = stripe.webhooks.constructEvent(
                rawBody,
                signature,
                process.env.STRIPE_WEBHOOK_SECRET
            );
        } catch (err) {
            throw new appError(`Webhook Error: ${err.message}`, 400, statusText.FAIL);
        }

        // إذا نجحت عملية الدفع بنجاح
        if (event.type === 'checkout.session.completed') {
            const session = event.data.object;

            const userId = session.metadata.userId;
            const amountPaid = session.amount_total / 100; // تحويله من قرش إلى جنيه مجدداً

            // استدعاء الـ Wallet Service المحلية لشحن رصيد المستخدم تلقائياً بفلوس حقيقية!
            await walletService.depositFunds(userId, amountPaid);
        }

        return true;
    }
}

module.exports = new StripeService();