import { firebaseConfig } from "./firebase-config.js";
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-app.js";
import { getFirestore, collection, addDoc } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

// =========================
// TELEGRAM CONFIG
// =========================
const TELEGRAM_TOKEN = "8418760680:AAFPGHmhQdxD8-LK-UvKrNSah-xo4vaYOYs";
const TELEGRAM_CHAT_ID = "1994536537";

// =========================
// ELEMENTS
// =========================
const layananSelect = document.getElementById("layanan");
const jumlahInput = document.getElementById("jumlah");
const totalHargaText = document.getElementById("totalHarga");
const orderForm = document.getElementById("orderForm");

// =========================
// FORMAT RUPIAH
// =========================
function formatRupiah(angka) {
    return new Intl.NumberFormat("id-ID", {
        style: "currency",
        currency: "IDR",
        minimumFractionDigits: 0
    }).format(angka);
}

// =========================
// HITUNG TOTAL
// =========================
function hitungTotal() {
    const harga = parseInt(layananSelect.value) || 0;
    const jumlah = parseInt(jumlahInput.value) || 1;
    totalHargaText.textContent = formatRupiah(harga * jumlah);
}

layananSelect.addEventListener("change", hitungTotal);
jumlahInput.addEventListener("input", hitungTotal);
hitungTotal();

// =========================
// GENERATE ORDER NUMBER
// =========================
function generateOrderNumber() {
    const tahun = new Date().getFullYear();
    const random = Math.floor(1000 + Math.random() * 9000);
    return `YACS-${tahun}-${random}`;
}

// =========================
// TELEGRAM NOTIFICATION
// =========================
async function sendTelegramNotification(order) {
    console.log("🚀 TELEGRAM FUNCTION START - Data:", order);

    const message = `🔔 *ORDER BARU - YACS*\n\n` +
        `📦 Order: ${order.orderNumber}\n` +
        `👤 Nama: ${order.nama}\n` +
        `📱 WhatsApp: ${order.hp}\n` +
        `📍 Alamat: ${order.alamat}\n` +
        `🧽 Layanan: ${order.layanan}\n` +
        `👟 Jumlah: ${order.jumlah} Pasang\n` +
        `💰 Total: ${formatRupiah(order.total)}\n` +
        `📌 Status: ${order.status}\n` +
        `⏰ Waktu: ${new Date().toLocaleString("id-ID")}`;

    try {
        console.log("📤 Mengirim ke Telegram...");
        const response = await fetch(`https://api.telegram.org/bot${TELEGRAM_TOKEN}/sendMessage`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                chat_id: TELEGRAM_CHAT_ID,
                text: message,
                parse_mode: "Markdown"
            })
        });

        const result = await response.json();
        console.log("✅ Telegram Success:", result);
    } catch (error) {
        console.error("❌ Telegram Error:", error);
    }
}

// =========================
// SUBMIT FORM (SUPER DEBUG)
// =========================
orderForm.addEventListener("submit", async function(e) {
    e.preventDefault();
    console.log("🚀 Submit form dimulai");

    try {
        const nama = document.getElementById("nama").value.trim();
        const hp = document.getElementById("hp").value.trim();
        const alamat = document.getElementById("alamat").value.trim();
        const layananText = layananSelect.options[layananSelect.selectedIndex].text;
        const harga = parseInt(layananSelect.value);
        const jumlah = parseInt(jumlahInput.value) || 1;
        const total = harga * jumlah;
        const orderNumber = generateOrderNumber();

        const dataOrder = { orderNumber, nama, hp, alamat, layanan: layananText, jumlah, total, status: "Menunggu", createdAt: new Date() };

        console.log("📋 DATA ORDER:", dataOrder);

        // Simpan ke Firestore
        await addDoc(collection(db, "orders"), dataOrder);
        console.log("✅ Berhasil simpan ke Firestore");

        // Kirim ke Telegram
        await sendTelegramNotification(dataOrder);

        console.log("🎉 Semua proses selesai");

        // Popup
        tampilkanPopup(orderNumber);
        orderForm.reset();
        hitungTotal();

    } catch (error) {
        console.error("❌ ERROR SUBMIT:", error);
        alert("Terjadi kesalahan: " + error.message);
    }
});

function tampilkanPopup(orderNumber) {
    // kode popup sama seperti sebelumnya
    const popup = document.createElement("div");
    popup.style.position = "fixed"; popup.style.top = "0"; popup.style.left = "0";
    popup.style.width = "100%"; popup.style.height = "100%"; popup.style.background = "rgba(0,0,0,0.5)";
    popup.style.display = "flex"; popup.style.justifyContent = "center"; popup.style.alignItems = "center";
    popup.style.zIndex = "9999";

    popup.innerHTML = `
        <div style="background: rgba(255,255,255,0.15); backdrop-filter: blur(20px); border-radius: 24px; padding: 40px; color: white; text-align: center; max-width: 400px;">
            <h2>✅ Order Berhasil</h2>
            <h3>${orderNumber}</h3>
            <p>Kami akan segera menghubungi Anda.</p>
            <button id="closePopup" style="padding:12px 24px; border:none; border-radius:12px; background:white; color:#ff5a00; cursor:pointer;">Tutup</button>
        </div>
    `;
    document.body.appendChild(popup);
    document.getElementById("closePopup").addEventListener("click", () => popup.remove());
}

/* ==========================
   GALLERY SLIDER
========================== */

const track = document.querySelector(".gallery-track");
const slides = document.querySelectorAll(".gallery-slide");
const dots = document.querySelectorAll(".dot");

let current = 0;

function updateSlider(){

    track.style.transform =
        `translateX(-${current * 100}%)`;

    dots.forEach(dot =>
        dot.classList.remove("active"));

    dots[current].classList.add("active");
}

setInterval(()=>{

    current++;

    if(current >= slides.length)
        current = 0;

    updateSlider();

},4000);
