// =========================================================
// El día en que el campo ardió - animaciones con GSAP
// =========================================================
gsap.registerPlugin(ScrollTrigger);

// ¿la persona pidió menos movimiento?
const sinMovimiento = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

// Pone un número en pantalla con su prefijo (+) y su sufijo (% o °C)
function escribirNumero(elemento, valor) {
    const decimales = Number(elemento.dataset.d) || 0;
    const prefijo = elemento.dataset.p || "";
    const sufijo = elemento.dataset.s || "";
    const texto = valor.toLocaleString("es-CO", {
        minimumFractionDigits: decimales,
        maximumFractionDigits: decimales
    });
    elemento.textContent = prefijo + texto + sufijo;
}

// Guardamos las escenas de la historia para saber qué audio toca
const escenas = [];


// =========================================================
// 1. ANIMACIONES (se crean primero para que los demás
//    ScrollTrigger calculen bien sus posiciones)
// =========================================================
if (sinMovimiento == false) {

    // ---- Portada: brasas que suben ----
    const contenedorBrasas = document.querySelector(".embers");
    for (let i = 0; i < 28; i++) {
        const brasa = document.createElement("span");
        brasa.className = "ember";
        brasa.style.left = gsap.utils.random(0, 100) + "%";
        contenedorBrasas.appendChild(brasa);

        gsap.to(brasa, {
            y: -window.innerHeight * gsap.utils.random(0.5, 1.1),
            x: gsap.utils.random(-60, 60),
            opacity: 0,
            scale: gsap.utils.random(0.4, 1.6),
            duration: gsap.utils.random(3, 7),
            delay: gsap.utils.random(0, 6),
            repeat: -1,
            ease: "power1.out"
        });
    }

    // ---- Portada: título, subtítulo y botón ----
    const lineaPortada = gsap.timeline({ defaults: { ease: "power3.out" } });
    lineaPortada.from(".hero h1", { opacity: 0, y: 40, scale: 0.92, filter: "blur(12px)", duration: 1.6 });
    lineaPortada.from(".hero .sub", { opacity: 0, y: 20, duration: 1 }, "-=0.6");
    lineaPortada.from(".hero .btn", { opacity: 0, scale: 0.6, duration: 0.8, ease: "back.out(2)" }, "-=0.4");

    gsap.to(".hero .btn", {
        boxShadow: "0 0 40px rgba(254,137,50,0.95)",
        repeat: -1,
        yoyo: true,
        duration: 1.2
    });

    // ---- Historia: el texto pasa como créditos de película ----
    const todasLasEscenas = document.querySelectorAll(".scene");

    todasLasEscenas.forEach(function (escena) {
        const lineas = gsap.utils.toArray(".line", escena);
        gsap.set(lineas, { autoAlpha: 0, yPercent: -50 });

        const lineaTiempo = gsap.timeline({
            scrollTrigger: {
                trigger: escena,
                start: "top top",
                end: function () { return "+=" + lineas.length * window.innerHeight * 0.75; },
                pin: true,
                scrub: 0.6,
                anticipatePin: 1,
                invalidateOnRefresh: true
            }
        });

        // cada párrafo sube, se queda un momento y luego se va
        lineas.forEach(function (linea) {
            lineaTiempo.fromTo(linea,
                { autoAlpha: 0, y: 100, filter: "blur(6px)" },
                { autoAlpha: 1, y: 0, filter: "blur(0px)", duration: 1, ease: "power1.out" }
            );
            lineaTiempo.to(linea,
                { autoAlpha: 0, y: -100, filter: "blur(6px)", duration: 1, ease: "power1.in" },
                "+=1.1"
            );
        });

        // el fondo se acerca poco a poco
        lineaTiempo.fromTo(escena.querySelector(".bg"),
            { scale: 1.15 },
            { scale: 1, duration: lineaTiempo.duration(), ease: "none" },
            0
        );

        escenas.push({ disparador: lineaTiempo.scrollTrigger, lineas: lineas });
    });

    // ---- Resto del contenido: aparece de a uno al hacer scroll ----
    const animaciones = {
        t: { y: 30, scale: 0.85, filter: "blur(10px)", duration: 1.2 },   // títulos
        l: { x: -80, duration: 0.9 },                                      // entra desde la izquierda
        r: { x: 80, duration: 0.9 },                                       // entra desde la derecha
        s: { y: 40, scale: 0.92, duration: 0.9 },                          // recuadros
        "": { y: 50, filter: "blur(4px)", duration: 1 }                    // párrafos
    };

    const elementos = gsap.utils.toArray("[data-r]");
    elementos.forEach(function (el) {
        const config = animaciones[el.dataset.r];
        gsap.from(el, {
            opacity: 0,
            x: config.x,
            y: config.y,
            scale: config.scale,
            filter: config.filter,
            duration: config.duration,
            ease: "power3.out",
            clearProps: "transform,filter",
            scrollTrigger: {
                trigger: el,
                start: "top 88%",
                toggleActions: "play none none reverse"
            }
        });
    });

    // ---- Cifras: los números parten en 0 y cuentan al llegar a ellos ----
    const numeros = document.querySelectorAll(".num[data-n]");
    numeros.forEach(function (num) {
        const meta = Number(num.dataset.n);
        const contador = { valor: 0 };
        escribirNumero(num, 0);

        gsap.to(contador, {
            valor: meta,
            duration: 2.2,
            ease: "power2.out",
            scrollTrigger: {
                trigger: num,
                start: "top 85%",
                once: true
            },
            onUpdate: function () {
                escribirNumero(num, contador.valor);
            }
        });
    });

    // ---- Acciones: las tarjetas pasan de derecha a izquierda ----
    const carrusel = document.querySelector("#acciones .carousel");
    const pista = carrusel.querySelector(".track");

    // hasta dónde se mueve la pista (para que se vean todas al final)
    function posicionFinal() {
        if (window.innerWidth >= pista.scrollWidth) {
            return (window.innerWidth - pista.scrollWidth) / 2;
        } else {
            return window.innerWidth - pista.scrollWidth - 16;
        }
    }

    gsap.fromTo(pista,
        { x: function () { return window.innerWidth; } },
        {
            x: posicionFinal,
            ease: "none",
            scrollTrigger: {
                trigger: carrusel,
                start: "top top",
                end: function () { return "+=" + (window.innerWidth - posicionFinal()); },
                pin: true,
                scrub: 0.6,
                invalidateOnRefresh: true
            }
        }
    );

} else {
    // Menos movimiento: todo visible y los números ya terminados
    document.documentElement.classList.add("rm");
    document.querySelectorAll(".num[data-n]").forEach(function (num) {
        escribirNumero(num, Number(num.dataset.n));
    });
}


// =========================================================
// 2. BARRA DE LLAMAS (solo se enciende la de la sección actual)
// =========================================================
const llamas = document.querySelectorAll(".flames li");

function encenderLlama(indice) {
    llamas.forEach(function (li, i) {
        const enlace = li.querySelector("a");
        if (i === indice) {
            li.classList.add("cur");
            enlace.setAttribute("aria-current", "true");
        } else {
            li.classList.remove("cur");
            enlace.removeAttribute("aria-current");
        }
    });

    if (indice >= 0 && sinMovimiento == false) {
        gsap.fromTo(llamas[indice], { scale: 0.7 }, { scale: 1, duration: 0.6, ease: "elastic.out(1,.4)" });
    }
}

const secciones = document.querySelectorAll("[data-sec]");
secciones.forEach(function (seccion, i) {
    ScrollTrigger.create({
        trigger: seccion,
        start: "top 55%",
        end: "bottom 55%",
        onToggle: function (self) {
            if (self.isActive) {
                encenderLlama(i);
            }
        }
    });
});

// en la portada ninguna llama está encendida
ScrollTrigger.create({
    trigger: "#inicio",
    start: "top top",
    end: "bottom 55%",
    onToggle: function (self) {
        if (self.isActive) {
            encenderLlama(-1);
        }
    }
});


// =========================================================
// 3. CRÉDITOS: la banda aparece al llegar al mensaje final
// =========================================================
const banda = document.querySelector(".band");

function revisarBanda(self) {
    if (self.progress > 0) {
        banda.classList.add("show");
    } else {
        banda.classList.remove("show");
    }
}

ScrollTrigger.create({
    trigger: "#creditos .final",
    start: "top 55%",
    end: "max",
    onUpdate: revisarBanda,
    onRefresh: revisarBanda
});


// =========================================================
// 4. AUDIO (archivos en la carpeta audio/)
// =========================================================
const sonidos = {};            // audios en bucle ya creados
let quiere = { bucles: ["principal"], una: "" };   // lo que debería sonar ahora
let audioActivo = false;       // los navegadores exigen un clic antes
let silenciado = false;
let ultimaClave = "";
let unaVezSonados = [];        // audios de una sola vez que ya sonaron

function obtenerSonido(nombre) {
    if (!sonidos[nombre]) {
        const a = new Audio("audio/" + nombre + ".mp3");
        a.loop = true;
        a.volume = 0;
        a.muted = silenciado;
        sonidos[nombre] = a;
    }
    return sonidos[nombre];
}

function bajarYPausar(a) {
    gsap.to(a, {
        volume: 0,
        duration: 1.2,
        overwrite: true,
        onComplete: function () { a.pause(); }
    });
}

function sincronizarAudio() {
    if (audioActivo == false) {
        return;
    }

    // apagar los que ya no deben sonar
    for (const nombre in sonidos) {
        const a = sonidos[nombre];
        if (quiere.bucles.includes(nombre) == false && a.paused == false) {
            bajarYPausar(a);
        }
    }

    // prender los que sí deben sonar
    quiere.bucles.forEach(function (nombre) {
        const a = obtenerSonido(nombre);
        if (a.paused) {
            a.play().catch(function () { });
            gsap.fromTo(a, { volume: 0 }, { volume: 0.7, duration: 1.5, overwrite: true });
        } else {
            gsap.to(a, { volume: 0.7, duration: 0.5, overwrite: true });
        }
    });

    // el audio de una sola vez
    unaVezSonados = unaVezSonados.filter(function (n) { return n === quiere.una; });
    if (quiere.una !== "" && unaVezSonados.includes(quiere.una) == false) {
        unaVezSonados.push(quiere.una);
        const unico = new Audio("audio/" + quiere.una + ".mp3");
        unico.volume = 0.8;
        unico.muted = silenciado;
        unico.play().catch(function () { });
    }
}

function activarAudio() {
    if (audioActivo == false) {
        audioActivo = true;
        sincronizarAudio();
    }
}
window.addEventListener("pointerdown", activarAudio, { once: true });
window.addEventListener("keydown", activarAudio, { once: true });

// Decide qué debe sonar según el párrafo que se está viendo
function revisarAudio() {
    let nuevo = { bucles: ["Fuego"], una: "" };

    for (let i = 0; i < escenas.length; i++) {
        const escena = escenas[i];
        if (escena.disparador.isActive) {
            let numero = Math.floor(escena.disparador.progress * escena.lineas.length);
            if (numero > escena.lineas.length - 1) {
                numero = escena.lineas.length - 1;
            }
            const datos = escena.lineas[numero].dataset;
            if (datos.loops) {
                nuevo = { bucles: datos.loops.split(" "), una: datos.once || "" };
            }
            break;
        }
    }

    const clave = nuevo.bucles.join() + "|" + nuevo.una;
    if (clave === ultimaClave) {
        return;
    }
    ultimaClave = clave;
    quiere = nuevo;
    sincronizarAudio();
}

ScrollTrigger.create({
    trigger: document.body,
    start: 0,
    end: "max",
    onUpdate: revisarAudio,
    onRefresh: revisarAudio
});

// botón de silenciar
const botonSonido = document.getElementById("snd");
botonSonido.addEventListener("click", function () {
    silenciado = !silenciado;
    for (const nombre in sonidos) {
        sonidos[nombre].muted = silenciado;
    }
    if (silenciado) {
        botonSonido.textContent = "🔇";
        botonSonido.setAttribute("aria-label", "Activar sonido");
    } else {
        botonSonido.textContent = "🔊";
        botonSonido.setAttribute("aria-label", "Silenciar sonido");
    }
    botonSonido.setAttribute("aria-pressed", silenciado);
});


// =========================================================
// 5. TARJETAS QUE GIRAN
// =========================================================
const tarjetas = document.querySelectorAll(".flip");
tarjetas.forEach(function (tarjeta) {
    function girar() {
        const abierta = tarjeta.classList.toggle("open");
        tarjeta.setAttribute("aria-expanded", abierta);
    }
    tarjeta.addEventListener("click", girar);
    tarjeta.addEventListener("keydown", function (e) {
        if (e.key === "Enter" || e.key === " ") {
            e.preventDefault();
            girar();
        }
    });
});


// =========================================================
// 6. BOTÓN COMENZAR
// =========================================================
document.getElementById("start").addEventListener("click", function (e) {
    e.preventDefault();
    activarAudio();
    const destino = document.getElementById("historia");
    if (sinMovimiento) {
        destino.scrollIntoView({ behavior: "auto" });
    } else {
        destino.scrollIntoView({ behavior: "smooth" });
    }
});

// cuando termina de cargar todo (fuentes, imágenes) se recalculan las posiciones
window.addEventListener("load", function () {
    ScrollTrigger.refresh();
});