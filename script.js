// ==========================================
// 1. TEMEL ÖĞELERİ VE AYARLARI TANIMLAMA
// ==========================================

// HTML'deki öğeleri alıyoruz
const hediyeKutusu = document.getElementById('hediye-kutusu');
const baslangicEkrani = document.getElementById('baslangic-ekrani');
const kutlamaEkrani = document.getElementById('kutlama-ekrani');
const muzik = document.getElementById('arka-plan-muzigi');

// Havai fişek canvas ayarları
const canvas = document.getElementById('havai-fisekTuvasi');
const ctx = canvas.getContext('2d'); // 2D çizim ortamını al

// Canvas'ı tam ekran yap
canvas.width = window.innerWidth;
canvas.height = window.innerHeight;

// Havai fişek sistemi için değişkenler
let parcalar = [];
let havaiFisekler = [];
let animasyonDevamEdiyor = false;

// ==========================================
// 2. HAVAİ FİŞEK VE PARÇACIK SINIFLARI
// ==========================================

// Küçük bir patlama parçasını temsil eder
class Parca {
    constructor(x, y, renk) {
        this.x = x;
        this.y = y;
        this.renk = renk;
        // Rastgele hız ve yön
        this.hizX = Math.random() * 6 - 3;
        this.hizY = Math.random() * 6 - 3;
        this.yercekimi = 0.05; // Aşağı doğru çekim
        this.omur = 100; // Ne kadar süre ekranda kalacak
        this.alfa = 1; // Şeffaflık
    }

    guncelle() {
        this.hizY += this.yercekimi; // Yerçekimi uygula
        this.x += this.hizX;
        this.y += this.hizY;
        this.omur--; // Ömrü azalt
        // Sonlara doğru şeffaflaşarak kaybol
        if (this.omur < 20) {
            this.alfa -= 0.05;
        }
    }

    ciz() {
        ctx.globalAlpha = this.alfa; // Şeffaflığı ayarla
        ctx.beginPath();
        // Parçayı küçük bir daire olarak çiz
        ctx.arc(this.x, this.y, 2, 0, Math.PI * 2);
        ctx.fillStyle = this.renk;
        ctx.fill();
        ctx.globalAlpha = 1; // Şeffaflığı sıfırla
    }
}

// Yukarı fırlatılan tek bir havai fişeği temsil eder
class HavaiFisek {
    constructor() {
        this.x = Math.random() * canvas.width; // Rastgele yatay konum
        this.y = canvas.height; // Ekranın altından başla
        this.hizY = Math.random() * -10 - 10; // Yukarı doğru hızlı fırlat
        // Rastgele canlı bir renk seç
        const renkler = ['#ff0055', '#0099ff', '#00ff55', '#ffcc00', '#ff00cc', '#ffffff'];
        this.renk = renkler[Math.floor(Math.random() * renkler.length)];
        this.hedefY = Math.random() * (canvas.height * 0.5); // Ekranın üst yarısında bir yerde patlasın
        this.patladi = false;
    }

    guncelle() {
        this.y += this.hizY;
        // Hedefe ulaştıysa veya yavaşladıysa patla
        if (this.y <= this.hedefY || this.hizY >= -1) {
            this.patladi = true;
            this.patla();
        }
    }

    ciz() {
        if (!this.patladi) {
            ctx.beginPath();
            // Yukarı giden roketi çiz
            ctx.arc(this.x, this.y, 3, 0, Math.PI * 2);
            ctx.fillStyle = this.renk;
            ctx.fill();
        }
    }

    patla() {
        // Patlama noktasında çok sayıda parça oluştur
        for (let i = 0; i < 50; i++) {
            parcalar.push(new Parca(this.x, this.y, this.renk));
        }
    }
}

// ==========================================
// 3. ANİMASYON DÖNGÜSÜ (ANA MOTOR)
// ==========================================

function animasyonDongusu() {
    if (!animasyonDevamEdiyor) return;

    // Ekranı tamamen şeffaf olacak şekilde temizle ki alttaki pasta görünsün!
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Bazen yeni bir havai fişek fırlat
    if (Math.random() < 0.05) {
        havaiFisekler.push(new HavaiFisek());
    }

    // Havai fişekleri güncelle ve çiz
    havaiFisekler.forEach((fisek, index) => {
        fisek.guncelle();
        fisek.ciz();
        if (fisek.patladi) {
            havaiFisekler.splice(index, 1); // Patladıysa listeden çıkar
        }
    });

    // Parçacıkları güncelle ve çiz
    parcalar.forEach((parca, index) => {
        parca.guncelle();
        parca.ciz();
        if (parca.omur <= 0 || parca.alfa <= 0) {
            parcalar.splice(index, 1); // Ömrü bittiyse veya kaybolduysa çıkar
        }
    });

    // Bir sonraki kareyi iste
    requestAnimationFrame(animasyonDongusu);
}

// ==========================================
// 4. ETKİLEŞİM BAŞLATICI
// ==========================================

// Hediye kutusuna tıklanınca olacaklar
hediyeKutusu.addEventListener('click', function() {
    // 1. Başlangıç ekranını gizle
    baslangicEkrani.classList.add('gizli');
    
    // 2. Kutlama ekranını göster
    kutlamaEkrani.classList.remove('gizli');
    
    // 3. Şarkıyı başlat
    muzik.play();

    // 4. Havai Fişek Animasyonunu Başlat!
    animasyonDevamEdiyor = true;
    animasyonDongusu(); // İlk döngüyü tetikle
    
    // 5. İlk patlamayı hemen yap (Bekleme olmasın)
    havaiFisekler.push(new HavaiFisek());
    havaiFisekler.push(new HavaiFisek());
    havaiFisekler.push(new HavaiFisek());
});

// Pencere boyutu değişirse canvas'ı güncelle
window.addEventListener('resize', () => {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
});