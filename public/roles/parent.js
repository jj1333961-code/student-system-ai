// تحميل خاص بصفحة ولي الأمر فقط.
window.ThimarRoleAssets=window.ThimarRoleAssets||{};
window.ThimarRoleAssets.parent={loadedAt:Date.now(),prepare(){document.dispatchEvent(new CustomEvent('thimar:parent-ready'));}};
