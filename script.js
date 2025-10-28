document.addEventListener('DOMContentLoaded', function() {

    // -----------------------------
    // 1. MÚSICA DE FONDO
    // -----------------------------
    const bgMusic = document.getElementById('bgMusicElement'); 
    const toggleMusicBtn = document.getElementById('toggleMusic');
    let userPausedMusic = false;

    if (bgMusic) {
        bgMusic.volume = 0.10;
        bgMusic.play().catch(() => {});
    }

    function updateMusicButtonIcon() {
        if (!toggleMusicBtn || !bgMusic) return;
        toggleMusicBtn.innerHTML = bgMusic.paused ? '🔇' : '🔊';
    }

    if (toggleMusicBtn && bgMusic) {
        toggleMusicBtn.addEventListener('click', () => {
            if (bgMusic.paused) {
                bgMusic.play().then(() => {
                    userPausedMusic = false;
                    updateMusicButtonIcon();
                }).catch(()=>{});
            } else {
                bgMusic.pause();
                userPausedMusic = true;
                updateMusicButtonIcon();
            }
        });
    }

    // -----------------------------
    // 2. NAVEGACIÓN ENTRE PANTALLAS
    // -----------------------------
    const screens = document.querySelectorAll('.screen');

    function showScreen(targetId) {
        console.log('Mostrando pantalla:', targetId);
        
        screens.forEach(s => s.classList.remove('active'));
        
        const targetScreen = document.getElementById(targetId);
        if (targetScreen) {
            targetScreen.classList.add('active');
            
            if (targetId === 'screen-video') {
                bgMusic.pause();
            } else if (!userPausedMusic && bgMusic.paused) {
                bgMusic.play().catch(()=>{});
            }

            if (targetId === 'screen-ruleta') {
                console.log('Inicializando ruleta...');
                setTimeout(() => {
                    const canvas = document.getElementById('ruleta');
                    if (canvas) {
                        console.log('Canvas encontrado:', canvas.offsetWidth, 'x', canvas.offsetHeight);
                        drawRouletteWheel();
                    } else {
                        console.error('Canvas no encontrado');
                    }
                }, 200);
            }
            
            if (targetId === 'screen-cuponera') {
                renderCupones();
            }
        } else {
            console.error('Pantalla no encontrada:', targetId);
        }
    }

    document.querySelectorAll('.nextScreen').forEach(btn => {
        btn.addEventListener('click', () => {
            const target = btn.getAttribute('data-target');
            console.log('Botón clickeado, target:', target);
            if (target) {
                showScreen(target);
            }
        });
    });

    showScreen('screen-bienvenida');

    // -----------------------------
    // 3. COLLAGE
    // -----------------------------
    const collages = [
        'img/Collage1.png', 'img/Collage3.png','img/foto1.png',
        'img/foto2.png','img/foto3.png','img/foto4.png',
        'img/foto5.png','img/foto6.png','img/foto7.png',
        'img/foto8.png','img/foto9.png','img/foto10.png',
        'img/foto11.png','img/foto12.png','img/foto13.png',
        'img/foto14.png','img/foto15.png','img/foto16.png',
        'img/foto17.png','img/foto18.png','img/foto19.png',
        'img/foto20.png',
    ]; 
    let currentIndex = 0;
    const collageContainer = document.getElementById('collageContainer');
    const collageText = document.getElementById('collageText');
    const prevCollageBtn = document.getElementById('prevCollage');
    const nextCollageBtn = document.getElementById('nextCollage');

    function showCollage(index) {
        if (!collageContainer) return;
        if (index < 0) index = collages.length - 1;
        if (index >= collages.length) index = 0;
        currentIndex = index;
        collageContainer.style.backgroundImage = `url('${collages[currentIndex]}')`;

        if (collageText) {
            collageText.classList.remove('show');
            setTimeout(() => collageText.classList.add('show'), 100);
        }
    }

    if (prevCollageBtn) prevCollageBtn.addEventListener('click', () => showCollage(currentIndex - 1));
    if (nextCollageBtn) nextCollageBtn.addEventListener('click', () => showCollage(currentIndex + 1));
    showCollage(0);

    // ===================================
    // 4. RULETA DEL AMOR
    // ===================================
// ----------------------
// Ajustes y utilidades
// ----------------------
const options = [
        '¡Oh no! ☹️', 
        'Café hecho por mí ☕️', 
        'Esta vez no fue 🍀', 
        'Postre compartido 🍰', 
        'Otra vez ⭐', 
        'Un beso slow 😘'
];

let startAngle = 0;
let arc = 2 * Math.PI / options.length; // más claro que la versión original

// canvas y contexto
const canvas = document.getElementById('ruleta');
const ctx = canvas ? canvas.getContext('2d') : null;

// Dibuja la ruleta, escala para devicePixelRatio y mantiene textos siempre legibles
function drawRouletteWheel() {
    if (!ctx || !canvas) return;

    // obtener tamaño real CSS del canvas
    const rect = canvas.getBoundingClientRect();
    const cssSize = Math.min(rect.width, rect.height);
    const DPR = window.devicePixelRatio || 1;

    // ajustar tamaño físico del canvas para evitar blur
    canvas.width = Math.round(cssSize * DPR);
    canvas.height = Math.round(cssSize * DPR);
    canvas.style.width = cssSize + 'px';
    canvas.style.height = cssSize + 'px';

    // resetear transform y escalar para DPR
    ctx.setTransform(1, 0, 0, 1, 0, 0); // limpia transformaciones previas
    ctx.scale(DPR, DPR);

    // usar coordenadas en CSS pixels desde aquí
    const size = cssSize;
    const centerX = size / 2;
    const centerY = size / 2;
    const outsideRadius = size/2 - 20;
    const insideRadius = 40;
    const textRadius = outsideRadius - 50;

    ctx.clearRect(0, 0, size, size);

    for (let i = 0; i < options.length; i++) {
        const angle = startAngle + i * arc;
        ctx.beginPath();
        ctx.fillStyle = (i % 2 === 0) ? "#fd7e9e" : "#f5cad6";
        ctx.moveTo(centerX, centerY);
        ctx.arc(centerX, centerY, outsideRadius, angle, angle + arc, false);
        ctx.arc(centerX, centerY, insideRadius, angle + arc, angle, true);
        ctx.closePath();
        ctx.fill();

        // borde blanco
        ctx.strokeStyle = "white";
        ctx.lineWidth = 2;
        ctx.stroke();

        // texto
        ctx.save();
        // posición sobre el radio
        const textAngle = angle + arc / 2;
        const tx = centerX + Math.cos(textAngle) * textRadius;
        const ty = centerY + Math.sin(textAngle) * textRadius;
        ctx.translate(tx, ty);

        // Rotar para que el texto sea legible (si está "abajo" giramos 180º)
        let rotation = textAngle + Math.PI/2;
        if (textAngle > Math.PI/2 && textAngle < 3*Math.PI/2) {
            rotation += Math.PI;
        }
        ctx.rotate(rotation);

        // Texto: tamaño relativo al canvas
        ctx.fillStyle = "#6C1E36";
        ctx.font = `bold ${Math.max(12, Math.floor(size/24))}px Arial`;
        ctx.textAlign = "center";
        ctx.textBaseline = "middle";

        // Aseguramos que el texto no sea demasiado largo: lo cortamos si hace falta
        const text = options[i];
        const maxWidth = outsideRadius - insideRadius - 10;
        // Si el texto es demasiado largo, lo envolvemos en varias líneas (simple)
        const words = text.split(' ');
        let line = '';
        const lines = [];
        for (let w of words) {
            const testLine = line ? line + ' ' + w : w;
            const metrics = ctx.measureText(testLine);
            if (metrics.width > maxWidth) {
                if (line) { lines.push(line); }
                line = w;
            } else {
                line = testLine;
            }
        }
        if (line) lines.push(line);

        // dibujar líneas centradas verticalmente
        const lineHeight = Math.floor(size/28);
        const startY = - (lines.length - 1) * lineHeight / 2;
        for (let k = 0; k < lines.length; k++) {
            ctx.fillText(lines[k], 0, startY + k * lineHeight);
        }

        ctx.restore();
    }

}

// ---------------------------------
// Animación del giro (más robusta)
// ---------------------------------
let animFrame = null;
let spinStartTime = 0;
let spinDuration = 0;
let startAngleAtSpin = 0;
let totalRotation = 0;

function easeOutCubic(t) {
    return 1 - Math.pow(1 - t, 3);
}

function animateSpin(timestamp) {
    if (!spinStartTime) spinStartTime = timestamp;
    const elapsed = timestamp - spinStartTime;
    const progress = Math.min(1, elapsed / spinDuration);
    const eased = easeOutCubic(progress);
    // rotación actual desde el inicio del giro
    const currentRotation = totalRotation * eased;
    startAngle = startAngleAtSpin + currentRotation;
    drawRouletteWheel();

    if (progress < 1) {
        animFrame = requestAnimationFrame(animateSpin);
    } else {
        cancelAnimationFrame(animFrame);
        spinStartTime = 0;
        animFrame = null;
        finishSpin();
    }
}

function startSpin() {
    if (animFrame) return; // ya girando
    // número de vueltas al azar (en radianes): entre 3 y 8 vueltas
    const vueltas = Math.random() * 5 + 3;
    totalRotation = vueltas * 2 * Math.PI + (Math.random() * 2 * Math.PI); // rotación total
    spinDuration = Math.random() * 1200 + 2200; // duración en ms
    startAngleAtSpin = startAngle;
    spinStartTime = 0;
    animFrame = requestAnimationFrame(animateSpin);
}

function finishSpin() {
    // determinar índice ganador con base en el puntero superior (90º)
    // normalizar a 0..2PI
    let normalized = startAngle % (2 * Math.PI);
    if (normalized < 0) normalized += 2 * Math.PI;
    // convertimos a grados y añadimos 90° para alinear con el puntero (si el puntero apunta a 90°)
    const degrees = (normalized * 180 / Math.PI + 90) % 360;
    const sectorDeg = 360 / options.length;
    // calculamos índice (invertir si tu ruleta gira en sentido horario/anti-horario)
    let index = Math.floor((360 - degrees) / sectorDeg) % options.length;
    if (index < 0) index += options.length;

    console.log('Ganador index:', index, 'texto:', options[index]);
    showPrizeNotification(options[index]);
}

// enlazar botón
const girarRuletaBtn = document.getElementById('girarRuleta');
if (girarRuletaBtn) {
    girarRuletaBtn.addEventListener('click', () => {
        startSpin();
    });
}

// dibujar inicialmente
drawRouletteWheel();

    // -----------------------------
    // 5. CUPONERA
    // -----------------------------
    const cuponesData = [
        { text: "Un beso 😘", file: "pdf/cupon_beso.pdf" },
        { text: "Una cita romántica 🌹", file: "pdf/cupon_cita.pdf" },
        { text: "Un masaje 💆‍♀️", file: "pdf/cupon_masaje.pdf" },
        { text: "Ver tu serie favorita juntos 📺", file: "pdf/cupon_serie.pdf" },
        { text: "Un abrazo largo 🤗", file: "pdf/cupon_abrazo.pdf" }
    ];

    const cuponContainer = document.getElementById('cupones');

    function renderCupones() {
        if (!cuponContainer) return;
        cuponContainer.innerHTML = '';
        cuponesData.forEach(item => { 
            const div = document.createElement('div');
            div.classList.add('cupon');
            div.textContent = item.text;
            div.addEventListener('click', () => {
                descargarPDF(item.file, item.text);
            });
            cuponContainer.appendChild(div);
        });
    }

    function descargarPDF(rutaArchivo, nombreCupon) {
        const enlace = document.createElement('a');
        enlace.href = rutaArchivo;
        enlace.download = `Cupon_${nombreCupon.replace(/[^a-z0-9]/gi, '_')}.pdf`;
        document.body.appendChild(enlace);
        enlace.click();
        document.body.removeChild(enlace);
    }
});