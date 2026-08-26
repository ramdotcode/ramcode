// ============================================================
// TRACKING RAMCODE — isi dua ID di bawah ini, sisanya otomatis.
// META_PIXEL_ID : Meta Business Suite > Events Manager > Data Sources
//                 (contoh: "1234567890123456")
// GOOGLE_TAG_ID : Google Ads (AW-XXXXXXXXX) atau GA4 (G-XXXXXXXXXX)
// Kosongin ("") = tracking itu nggak aktif. Aman di-deploy kapan pun.
// ============================================================
const META_PIXEL_ID = "1730880171478989";
const GOOGLE_TAG_ID = "G-GB64YDL480";

// ---------- Meta Pixel ----------
if (META_PIXEL_ID) {
    !function(f,b,e,v,n,t,s){if(f.fbq)return;n=f.fbq=function(){n.callMethod?
    n.callMethod.apply(n,arguments):n.queue.push(arguments)};if(!f._fbq)f._fbq=n;
    n.push=n;n.loaded=!0;n.version='2.0';n.queue=[];t=b.createElement(e);t.async=!0;
    t.src=v;s=b.getElementsByTagName(e)[0];s.parentNode.insertBefore(t,s)}(window,
    document,'script','https://connect.facebook.net/en_US/fbevents.js');
    fbq('init', META_PIXEL_ID);
    fbq('track', 'PageView');
}

// ---------- Google tag (Ads / GA4) ----------
if (GOOGLE_TAG_ID) {
    var gs = document.createElement('script');
    gs.async = true;
    gs.src = 'https://www.googletagmanager.com/gtag/js?id=' + GOOGLE_TAG_ID;
    document.head.appendChild(gs);
    window.dataLayer = window.dataLayer || [];
    function gtag(){ dataLayer.push(arguments); }
    window.gtag = gtag;
    gtag('js', new Date());
    gtag('config', GOOGLE_TAG_ID);
}

// ---------- Konversi: klik tombol WhatsApp ----------
// Setiap klik link wa.me dihitung sebagai lead/contact di Meta & Google.
document.addEventListener('DOMContentLoaded', function () {
    document.querySelectorAll('a[href*="wa.me"]').forEach(function (a) {
        a.addEventListener('click', function () {
            if (window.fbq) fbq('track', 'Contact');
            if (window.gtag) gtag('event', 'klik_whatsapp', {
                event_category: 'lead',
                event_label: location.pathname
            });
        });
    });
});
