import { firebaseConfig }
from "./firebase-config.js";

import {
    initializeApp
}
from
"https://www.gstatic.com/firebasejs/10.12.2/firebase-app.js";

import {
    getFirestore,
    collection,
    addDoc
}
from
"https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";

const app =
initializeApp(firebaseConfig);

const db =
getFirestore(app);

// =========================
// ELEMENTS
// =========================

const layananSelect =
document.getElementById("layanan");

const jumlahInput =
document.getElementById("jumlah");

const totalHargaText =
document.getElementById("totalHarga");

const orderForm =
document.getElementById("orderForm");


// =========================
// FORMAT RUPIAH
// =========================

function formatRupiah(angka){

    return new Intl.NumberFormat(
        "id-ID",
        {
            style:"currency",
            currency:"IDR",
            minimumFractionDigits:0
        }
    ).format(angka);

}


// =========================
// HITUNG TOTAL HARGA
// =========================

function hitungTotal(){

    const hargaLayanan =
    parseInt(
        layananSelect.value
    );

    const jumlahPasang =
    parseInt(
        jumlahInput.value
    ) || 1;

    const total =
    hargaLayanan *
    jumlahPasang;

    totalHargaText.textContent =
    formatRupiah(total);

}


// =========================
// EVENT LISTENER HARGA
// =========================

layananSelect.addEventListener(
    "change",
    hitungTotal
);

jumlahInput.addEventListener(
    "input",
    hitungTotal
);


// Jalankan saat halaman dibuka

hitungTotal();


// =========================
// GENERATE ORDER NUMBER
// =========================

function generateOrderNumber(){

    const tahun =
    new Date().getFullYear();

    const random =
    Math.floor(
        1000 +
        Math.random() * 9000
    );

    return `YACS-${tahun}-${random}`;

}


// =========================
// POPUP SUKSES
// =========================

function tampilkanPopup(orderNumber){

    const popup =
    document.createElement("div");

    popup.style.position = "fixed";
    popup.style.top = "0";
    popup.style.left = "0";
    popup.style.width = "100%";
    popup.style.height = "100%";
    popup.style.background =
    "rgba(0,0,0,0.5)";
    popup.style.display = "flex";
    popup.style.justifyContent =
    "center";
    popup.style.alignItems =
    "center";
    popup.style.zIndex = "9999";

    popup.innerHTML = `
    
    <div style="
        background: rgba(255,255,255,0.15);
        backdrop-filter: blur(20px);
        border-radius: 24px;
        padding: 40px;
        color: white;
        text-align: center;
        max-width: 400px;
        border:1px solid rgba(255,255,255,0.2);
    ">

        <h2>✅ Order Berhasil</h2>

        <br>

        <p>
        Nomor Order:
        </p>

        <h3>
        ${orderNumber}
        </h3>

        <br>

        <p>
        Kami akan segera menghubungi Anda.
        </p>

        <br>

        <button id="closePopup"
        style="
            padding:12px 24px;
            border:none;
            border-radius:12px;
            background:white;
            color:#ff5a00;
            cursor:pointer;
            font-weight:600;
        ">
            Tutup
        </button>

    </div>
    `;

    document.body.appendChild(
        popup
    );

    document
    .getElementById("closePopup")
    .addEventListener(
        "click",
        () => popup.remove()
    );

}


// =========================
// SUBMIT FORM
// =========================

orderForm.addEventListener(
"submit",
async function(e){

    e.preventDefault();

    const nama =
    document
    .getElementById("nama")
    .value.trim();

    const hp =
    document
    .getElementById("hp")
    .value.trim();

    const alamat =
    document
    .getElementById("alamat")
    .value.trim();

    const layananText =
    layananSelect.options[
        layananSelect.selectedIndex
    ].text;

    const harga =
    parseInt(
        layananSelect.value
    );

    const jumlah =
    parseInt(
        jumlahInput.value
    );

    const total =
    harga *
    jumlah;

    const orderNumber =
    generateOrderNumber();

    const dataOrder = {

        orderNumber,

        nama,

        hp,

        alamat,

        layanan:
        layananText,

        jumlah,

        total,

        status:
        "Menunggu",

        createdAt:
        new Date()

    };

    console.log(
        "DATA ORDER:",
        dataOrder
    );

    const submitButton =
    document.querySelector(
        ".submit-btn"
    );

    submitButton.disabled =
    true;

    submitButton.textContent =
    "Mengirim...";

   try{

    await addDoc(

        collection(
            db,
            "orders"
        ),

        dataOrder

    );

    tampilkanPopup(
        orderNumber
    );

        orderForm.reset();

        hitungTotal();

    }

    catch(error){

        console.error(error);

        alert(
            "Terjadi kesalahan."
        );

    }

    finally{

        submitButton.disabled =
        false;

        submitButton.textContent =
        "Kirim Order";

    }

});