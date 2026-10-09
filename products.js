/* ====================================================
   اسکریپت اختصاصی صفحه محصولات — سایت یادگار
   ==================================================== */

document.addEventListener('DOMContentLoaded', function () {

    const searchInput = document.getElementById('searchInput');
    const tabs = document.querySelectorAll('.tab');
    const cards = document.querySelectorAll('.product-card');
    const noResults = document.getElementById('noResults');

    let currentCat = 'all';
    let currentSearch = '';

    // ---------- فیلتر و جستجو ----------
    function filterProducts() {
        let visibleCount = 0;

        cards.forEach(card => {
            const cat = card.dataset.cat;
            const name = (card.dataset.name || '').toLowerCase() + ' ' +
                         card.querySelector('h3').textContent.toLowerCase();

            const matchCat = currentCat === 'all' || cat === currentCat;
            const matchSearch = currentSearch === '' || name.includes(currentSearch);

            if (matchCat && matchSearch) {
                card.style.display = '';
                card.style.animation = 'none';
                // اجرای مجدد انیمیشن
                void card.offsetWidth;
                card.style.animation = 'cardIn .5s ease both';
                visibleCount++;
            } else {
                card.style.display = 'none';
            }
        });

        if (noResults) {
            noResults.style.display = visibleCount === 0 ? 'block' : 'none';
        }
    }

    // ---------- جستجو ----------
    if (searchInput) {
        searchInput.addEventListener('input', function (e) {
            currentSearch = e.target.value.trim().toLowerCase();
            filterProducts();
        });
    }

    // ---------- فیلتر دسته‌بندی ----------
    tabs.forEach(tab => {
        tab.addEventListener('click', function () {
            tabs.forEach(t => t.classList.remove('active'));
            this.classList.add('active');
            currentCat = this.dataset.cat;
            filterProducts();
        });
    });

    // ---------- دکمه علاقه‌مندی ----------
    document.querySelectorAll('.wishlist-btn').forEach(btn => {
        btn.addEventListener('click', function (e) {
            e.stopPropagation();
            this.classList.toggle('active');
            const active = this.classList.contains('active');
            this.textContent = active ? '❤️' : '🤍';

            const card = this.closest('.product-card');
            const name = card.querySelector('h3').textContent;

            if (typeof showToast === 'function') {
                showToast(active
                    ? '«' + name + '» به علاقه‌مندی‌ها اضافه شد ❤️'
                    : '«' + name + '» از علاقه‌مندی‌ها حذف شد');
            }
        });
    });

    // ---------- نمای سریع ----------
    document.querySelectorAll('.quick-view').forEach(btn => {
        btn.addEventListener('click', function (e) {
            e.stopPropagation();
            const card = this.closest('.product-card');
            const name = card.querySelector('h3').textContent;
            const desc = card.querySelector('.product-desc').textContent.trim();

            if (typeof showToast === 'function') {
                showToast('👁️ ' + name + ' — ' + desc.substring(0, 60) + '...');
            }
        });
    });

    // انیمیشن اولیه کارت‌ها
    filterProducts();
});