// Ganti bahasa EN/ID untuk semua halaman.
// Bahasa Inggris (default) ditulis langsung di HTML, teks Indonesianya ada di i18n/*.js.
//   data-i18n="key"                     -> isi elemen (innerHTML) diganti teks Indonesia
//   data-i18n-attr="attr:key;attr:key"  -> atribut diganti (aria-label, alt, href WA, content meta)
// Nambah teks baru: tulis versi Inggris di HTML, lalu tambah key yang sama di dictionary halamannya.
// Script inline halaman (mis. proyek.html) baca bahasa dari <html lang> dan dengar event 'langchange'.
import common from './i18n/common.js'
import home from './i18n/index.js'
import layanan from './i18n/layanan.js'
import gallery from './i18n/gallery.js'
import proyek from './i18n/proyek.js'
import faq from './i18n/faq.js'

const ID = { ...common, ...home, ...layanan, ...gallery, ...proyek, ...faq }
const LANGS = ['en', 'id']
const STORAGE_KEY = 'lang'

// Versi Inggris asli tiap elemen, disimpan sebelum pertama kali diganti
const originals = new WeakMap()

function remember(el) {
    if (!originals.has(el)) originals.set(el, { html: undefined, attrs: {} })
    return originals.get(el)
}

function translate(key, english, lang) {
    if (lang !== 'id') return english
    if (key in ID) return ID[key]
    if (import.meta.env.DEV) console.warn(`[i18n] key "${key}" belum ada di i18n/*.js`)
    return english
}

function syncSwitch(lang) {
    document.documentElement.lang = lang
    document.querySelectorAll('[data-lang-switch]').forEach(btn => {
        btn.setAttribute('aria-pressed', String(btn.dataset.langSwitch === lang))
    })
}

function apply(lang) {
    document.querySelectorAll('[data-i18n]').forEach(el => {
        const saved = remember(el)
        if (saved.html === undefined) saved.html = el.innerHTML
        el.innerHTML = translate(el.dataset.i18n, saved.html, lang)
    })
    document.querySelectorAll('[data-i18n-attr]').forEach(el => {
        const saved = remember(el)
        el.dataset.i18nAttr.split(';').forEach(pair => {
            const [attr, key] = pair.split(':').map(s => s.trim())
            if (!attr || !key) return
            if (!(attr in saved.attrs)) saved.attrs[attr] = el.getAttribute(attr)
            const value = translate(key, saved.attrs[attr], lang)
            if (value === null) el.removeAttribute(attr)
            else el.setAttribute(attr, value)
        })
    })
    syncSwitch(lang)
}

function storedLang() {
    try {
        const lang = localStorage.getItem(STORAGE_KEY)
        return LANGS.includes(lang) ? lang : 'en'
    } catch {
        return 'en'
    }
}

let currentLang = storedLang()

export function getLang() {
    return currentLang
}

export function setLang(lang) {
    if (!LANGS.includes(lang) || lang === currentLang) return
    currentLang = lang
    try {
        localStorage.setItem(STORAGE_KEY, lang)
    } catch {
        // Storage diblokir (mode privat): tetap ganti, cuma nggak diingat
    }
    apply(lang)
    document.dispatchEvent(new CustomEvent('langchange', { detail: { lang } }))
}

// HTML sudah berbahasa Inggris, jadi DOM cuma disentuh kalau pengunjung pernah pilih ID
if (currentLang === 'en') syncSwitch('en')
else apply(currentLang)
document.documentElement.classList.remove('i18n-pending')

document.addEventListener('click', e => {
    const btn = e.target.closest('[data-lang-switch]')
    if (btn) setLang(btn.dataset.langSwitch)
})
