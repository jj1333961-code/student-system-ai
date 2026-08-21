// تحميل خاص بصفحة المسؤول فقط.
window.ThimarRoleAssets=window.ThimarRoleAssets||{};
window.ThimarRoleAssets.admin={loadedAt:Date.now(),prepare(){document.dispatchEvent(new CustomEvent('thimar:admin-ready'));}};
