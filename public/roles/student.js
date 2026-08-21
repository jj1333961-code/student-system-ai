// تحميل خاص بصفحة الطالب فقط. يوضع هنا أي تهيئة ثقيلة خاصة بالطالب.
window.ThimarRoleAssets=window.ThimarRoleAssets||{};
window.ThimarRoleAssets.student={loadedAt:Date.now(),prepare(){document.dispatchEvent(new CustomEvent('thimar:student-ready'));}};
