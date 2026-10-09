/* =====================================================
   اسکریپت مشترک سایت لوازم خانگی یادگار
   ===================================================== */

// ---------- تبدیل اعداد انگلیسی به فارسی ----------
function toPersian(input) {
    return String(input).replace(/\d/g, d => '۰۱۲۳۴۵۶۷۸۹'[d]);
}

// ---------- قالب‌بندی قیمت با جداکننده ----------
function formatPrice(num) {
    return toPersian(num.toLocaleString('en-US'));
}

// ---------- خواندن سبد خرید از حافظه ----------
function getCart() {
    try {
        return JSON.parse(localStorage.getItem('yadegar_cart')) || [];
    } catch (e) {
        return [];
    }
}

// ---------- ذخیره سبد خرید ----------
function saveCart(cart) {
    localStorage.setItem('yadegar_cart', JSON.stringify(cart));
    updateCartCount();
}

// ---------- به‌روزرسانی شمارنده هدر ----------
function updateCartCount() {
    const cart = getCart();
    const count = cart.reduce((s, i) => s + i.qty, 0);
    document.querySelectorAll('.cart-count').forEach(el => {
        el.textContent = toPersian(count);
    });
}

// ---------- افزودن محصول به سبد ----------
function addToCart(id, name, price) {
    const cart = getCart();
    const found = cart.find(i => i.id === id);
    if (found) {
        found.qty += 1;
    } else {
        cart.push({ id, name, price: Number(price), qty: 1 });
    }
    saveCart(cart);
    showToast(`«${name}» به سبد خرید اضافه شد ✅`);
}

// ---------- حذف محصول از سبد ----------
function removeFromCart(id) {
    const cart = getCart().filter(i => i.id !== id);
    saveCart(cart);
    renderCart();
}

// ---------- تغییر تعداد محصول ----------
function changeQty(id, delta) {
    const cart = getCart();
    const item = cart.find(i => i.id === id);
    if (!item) return;
    item.qty += delta;
    if (item.qty <= 0) {
        removeFromCart(id);
        return;
    }
    saveCart(cart);
    renderCart();
}

// ---------- نمایش پیام شناور ----------
function showToast(msg) {
    let toast = document.getElementById('toast');
    if (!toast) {
        toast = document.createElement('div');
        toast.id = 'toast';
        toast.className = 'toast';
        document.body.appendChild(toast);
    }
    toast.textContent = msg;
    toast.classList.add('show');
    clearTimeout(toast._timer);
    toast._timer = setTimeout(() => toast.classList.remove('show'), 2600);
}

// ---------- رندر سبد خرید در صفحه سفارش ----------
function renderCart() {
    const container = document.getElementById('cartItems');
    if (!container) return;

    const cart = getCart();
    const totalEl = document.getElementById('cartTotal');
    const submitBtn = document.getElementById('submitBtn');

    if (cart.length === 0) {
        container.innerHTML =
            '<p class="empty-cart">سبد خرید شما خالی است. از صفحه محصولات، کالا اضافه کنید.</p>';
        if (totalEl) totalEl.textContent = '۰ تومان';
        if (submitBtn) submitBtn.disabled = true;
        return;
    }

    let total = 0;
    container.innerHTML = cart.map(item => {
        total += item.price * item.qty;
        return `
            <div class="cart-item">
                <div class="cart-item-info">
                    <strong>${item.name}</strong>
                    <span>${formatPrice(item.price)} تومان × ${toPersian(item.qty)}</span>
                </div>
                <div class="qty-controls">
                    <button class="qty-btn" data-action="inc" data-id="${item.id}">+</button>
                    <span class="qty-val">${toPersian(item.qty)}</span>
                    <button class="qty-btn" data-action="dec" data-id="${item.id}">−</button>
                </div>
                <button class="remove-btn" data-action="remove" data-id="${item.id}">حذف</button>
            </div>
        `;
    }).join('');

    if (totalEl) totalEl.textContent = formatPrice(total) + ' تومان';
    if (submitBtn) submitBtn.disabled = false;
}

// ---------- راه‌اندازی ----------
document.addEventListener('DOMContentLoaded', () => {

    updateCartCount();
    renderCart();

    // دکمه‌های افزودن به سبد
    document.querySelectorAll('.add-to-cart').forEach(btn => {
        btn.addEventListener('click', () => {
            const { id, name, price } = btn.dataset;
            addToCart(id, name, price);
        });
    });

    // کنترل‌های سبد
    const cartContainer = document.getElementById('cartItems');
    if (cartContainer) {
        cartContainer.addEventListener('click', e => {
            const target = e.target.closest('button');
            if (!target) return;
            const { action, id } = target.dataset;
            if (action === 'inc') changeQty(id, 1);
            else if (action === 'dec') changeQty(id, -1);
            else if (action === 'remove') removeFromCart(id);
        });
    }

    // ارسال فرم سفارش
    const form = document.getElementById('orderForm');
    if (form) {
        form.addEventListener('submit', e => {
            e.preventDefault();
            const cart = getCart();
            if (cart.length === 0) {
                showToast('سبد خرید خالی است ❌');
                return;
            }
            const name = document.getElementById('fullname').value.trim();
            showToast(`سفارش شما با موفقیت ثبت شد، ${name} عزیز 🌹`);
            localStorage.removeItem('yadegar_cart');
            updateCartCount();
            renderCart();
            form.reset();
        });
    }
});