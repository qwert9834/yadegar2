/* ====================================================
   اسکریپت اختصاصی صفحه سفارش — سایت یادگار
   ==================================================== */

document.addEventListener('DOMContentLoaded', function () {

    // ---------- کدهای تخفیف معتبر ----------
    const COUPONS = {
        'YADEGAR20': { type: 'percent', value: 20, label: '۲۰٪ تخفیف' },
        'WELCOME10': { type: 'percent', value: 10, label: '۱۰٪ تخفیف' },
        'OFF50000':  { type: 'fixed',   value: 50, label: '۵۰ تومان تخفیف' }
    };

    let appliedCoupon = null;

    // ---------- به‌روزرسانی قیمت‌ها در خلاصه سفارش ----------
    function updateTotals() {
        const cart = JSON.parse(localStorage.getItem('yadegar_cart') || '[]');
        const subtotal = cart.reduce((s, i) => s + i.price * i.qty, 0);

        let discount = 0;
        if (appliedCoupon) {
            if (appliedCoupon.type === 'percent') {
                discount = Math.round(subtotal * appliedCoupon.value / 100);
            } else {
                discount = appliedCoupon.value;
            }
        }

        const total = Math.max(0, subtotal - discount);

        const subtotalEl = document.getElementById('subtotal');
        const discountEl = document.getElementById('discount');
        const totalEl = document.getElementById('cartTotal');

        if (subtotalEl) subtotalEl.textContent = formatPrice(subtotal) + ' تومان';
        if (discountEl) discountEl.textContent = formatPrice(discount) + ' تومان';
        if (totalEl) totalEl.textContent = formatPrice(total) + ' تومان';
    }

    // ---------- اعمال کد تخفیف ----------
    const applyBtn = document.getElementById('applyCoupon');
    const couponMsg = document.getElementById('couponMsg');

    if (applyBtn) {
        applyBtn.addEventListener('click', function () {
            const input = document.getElementById('couponInput');
            const code = input.value.trim().toUpperCase();

            if (!code) {
                couponMsg.textContent = '⚠️ کد تخفیف را وارد کنید';
                couponMsg.className = 'error';
                return;
            }

            if (COUPONS[code]) {
                appliedCoupon = COUPONS[code];
                couponMsg.textContent = '✅ کد تخفیف اعمال شد: ' + appliedCoupon.label;
                couponMsg.className = 'success';
                input.disabled = true;
                applyBtn.disabled = true;
                applyBtn.textContent = 'اعمال شد';
                updateTotals();
                if (typeof showToast === 'function') {
                    showToast('🎉 کد تخفیف با موفقیت اعمال شد');
                }
            } else {
                couponMsg.textContent = '❌ کد تخفیف نامعتبر است';
                couponMsg.className = 'error';
                appliedCoupon = null;
                updateTotals();
            }
        });
    }

    // ---------- فعال‌سازی بصری روش پرداخت ----------
    const paymentOptions = document.querySelectorAll('.payment-option');
    paymentOptions.forEach(opt => {
        const radio = opt.querySelector('input[type="radio"]');
        opt.addEventListener('click', function () {
            paymentOptions.forEach(o => o.classList.remove('active'));
            this.classList.add('active');
        });
        if (radio && radio.checked) opt.classList.add('active');
    });

    // ---------- بازنویسی نمایش سبد (نسخه زیباتر) ----------
    const originalRender = window.renderCart;
    window.renderCart = function () {
        const container = document.getElementById('cartItems');
        if (!container) return;

        const cart = JSON.parse(localStorage.getItem('yadegar_cart') || '[]');
        const submitBtn = document.getElementById('submitBtn');

        if (cart.length === 0) {
            container.innerHTML = '<p class="empty-cart">سبد خرید شما خالی است<br><small>از صفحه محصولات، کالا اضافه کنید</small></p>';
            if (submitBtn) submitBtn.disabled = true;
            updateTotals();
            return;
        }

        let html = '';
        cart.forEach(item => {
            html +=
                '<div class="cart-item">' +
                    '<div class="cart-item-info">' +
                        '<strong>' + item.name + '</strong>' +
                        '<span>' + formatPrice(item.price) + ' تومان × ' + toPersian(item.qty) + '</span>' +
                    '</div>' +
                    '<div class="qty-controls">' +
                        '<button class="qty-btn" data-action="inc" data-id="' + item.id + '">+</button>' +
                        '<span class="qty-val">' + toPersian(item.qty) + '</span>' +
                        '<button class="qty-btn" data-action="dec" data-id="' + item.id + '">−</button>' +
                    '</div>' +
                    '<button class="remove-btn" data-action="remove" data-id="' + item.id + '" title="حذف">✕</button>' +
                '</div>';
        });
        container.innerHTML = html;

        if (submitBtn) submitBtn.disabled = false;
        updateTotals();
    };

    // اجرای مجدد پس از بارگذاری
    if (typeof window.renderCart === 'function') {
        window.renderCart();
    }

    // ---------- اعتبارسنجی و ارسال فرم ----------
    const form = document.getElementById('orderForm');
    if (form) {
        form.addEventListener('submit', function (e) {
            e.preventDefault();

            const cart = JSON.parse(localStorage.getItem('yadegar_cart') || '[]');
            if (cart.length === 0) {
                if (typeof showToast === 'function') showToast('سبد خرید شما خالی است ❌');
                return;
            }

            // اعتبارسنجی شماره تماس
            const phone = document.getElementById('phone').value.trim();
            const phoneRegex = /^[0-9۰-۹]{10,11}$/;
            if (!phoneRegex.test(phone.replace(/\s/g, ''))) {
                if (typeof showToast === 'function') showToast('شماره تماس معتبر نیست ❌');
                return;
            }

            const name = document.getElementById('fullname').value.trim();
            const finalTotal = document.getElementById('cartTotal').textContent;

            // ثبت موفق
            if (typeof showToast === 'function') {
                showToast('🎉 سفارش شما با موفقیت ثبت شد، ' + name + ' عزیز');
            }

            setTimeout(function () {
                alert(
                    '✅ سفارش شما با موفقیت ثبت شد!\n\n' +
                    '👤 نام: ' + name + '\n' +
                    '💰 مبلغ: ' + finalTotal + '\n' +
                    '📞 همکاران ما به‌زودی با شما تماس خواهند گرفت.\n\n' +
                    'با تشکر از خرید شما از فروشگاه یادگار 🌹'
                );
                localStorage.removeItem('yadegar_cart');
                if (typeof updateCartCount === 'function') updateCartCount();
                window.renderCart();
                form.reset();
                appliedCoupon = null;

                const cm = document.getElementById('couponMsg');
                if (cm) { cm.textContent = ''; cm.className = ''; }
                const ci = document.getElementById('couponInput');
                if (ci) ci.disabled = false;
                const ab = document.getElementById('applyCoupon');
                if (ab) { ab.disabled = false; ab.textContent = 'اعمال'; }
            }, 500);
        });
    }
});