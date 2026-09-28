/*
 * IRON FIST - Nivel 3
 * Versión mejorada de Ejecucion3.js
 *
 * Mantiene los mismos IDs del HTML original para evitar cambios innecesarios.
 * Principales mejoras:
 * - Control centralizado de estado del juego.
 * - Sin variables globales implícitas.
 * - Un solo listener por evento.
 * - Pause/Reanudar sin crear intervalos duplicados.
 * - Detección de derrota con requestAnimationFrame en lugar de un intervalo de 1 ms.
 * - Meta correcta de 4 meteoritos: el marcador muestra 0 / 4.
 * - Uso de mouseenter para evitar puntos duplicados.
 * - Corrección de opciones de SweetAlert.
 * - Reutilización de funciones para los 4 meteoritos.
 */

(() => {
    "use strict";

    const CONFIG = {
    TIEMPO_INICIAL: 51,
    PUNTOS_META: 40,
    LIMITE_DERROTA: 630,
    TRANSICION_METEORITO: "2.8s",
    TRANSICION_EXPULSION: "1.9s",
    TRANSICION_REANUDAR: "2.8s",
    DISTANCIA_SALIDA: "-500px",
    POSICION_INICIAL: "-70%",
    ALTURA_MAXIMA: 450,
    };

    // Configuración individual para conservar el ritmo del nivel original.
    const METEORITOS = [
        {
            id: "Meteoritolvl3",
            sonido: "Puntos_sound",
            inicio: 2200,
            intervalo: 2950
        },
        {
            id: "Meteorito2lvl3",
            sonido: "Punto2",
            inicio: 2660,
            intervalo: 2750
        },
        {
            id: "Meteorito3lvl3",
            sonido: "Punto3",
            inicio: 2900,
            intervalo: 2550
        },
        {
            id: "Meteorito4lvl3",
            sonido: "Punto4",
            inicio: 3100,
            intervalo: 2150
        },
    ];

    let Tiempolvl3 = CONFIG.TIEMPO_INICIAL;
    let Puntajelvl3 = 0;
    let Conteolvl3 = 3;

    // Estados:
    // inicio | cuenta | jugando | pausado | ganado | perdido
    let estadoJuego = "inicio";
    let Activolvl3 = 1;

    let intervaloTiempo = null;
    let intervaloCuenta = null;
    let frameDerrota = null;

    let timeoutArranque = null;
    let timeoutContactos = null;
    let timeoutCreditos = null;

    const intervalosMeteoritos = new Map();
    const timeoutsMeteoritos = new Map();

    const $ = (id) => document.getElementById(id);

    const elementos = {};

    // =========================================================
    // CARGAR ELEMENTOS DEL HTML
    // =========================================================

    function cargarElementos() {

        const ids = [
            "Tiempolvl3",
            "Puntajelvl3",
            "Playlvl3",
            "Textolvl3",
            "Dificultadlvl3",

            "Fondo_Ciberpunk",
            "Triunfo",
            "Musica_Final",
            "Perdiste_sound",

            "Pantalla_Ovnislvl3",
            "Pantalla_Nodrizalvl3",
            "Pantalla_Ovnis2lvl3",

            "Pantalla_creditoslvl3",
            "Creditoslvl3",
            "Proximolvl3",

            "Contenedor_contadorlvl3",
            "RGBlvl3",
            "Startlvl3",

            "Pauselvl3",
            "Pausa_Pantallalvl3",
        ];

        METEORITOS.forEach(({ id, sonido }) => {
            ids.push(id);
            ids.push(sonido);
        });

        ids.forEach((id) => {
            elementos[id] = $(id);
        });

        const faltantes = ids.filter((id) => !elementos[id]);

        if (faltantes.length > 0) {
            console.warn(
                "IRON FIST: faltan elementos en el HTML:",
                faltantes
            );
        }
    }

    // =========================================================
    // ACTUALIZAR INTERFAZ
    // =========================================================

    function actualizarMarcador() {

        if (elementos.Puntajelvl3) {
            elementos.Puntajelvl3.textContent =
                `${Puntajelvl3} / ${CONFIG.PUNTOS_META}`;
        }
    }

    function actualizarTiempo() {

        if (elementos.Tiempolvl3) {
            elementos.Tiempolvl3.textContent = Tiempolvl3;
        }
    }

    // =========================================================
    // AUDIO
    // =========================================================

    function reproducirAudio(id, reiniciar = false) {

        const audio = elementos[id];

        if (!audio) {
            return;
        }

        if (reiniciar) {
            audio.currentTime = 0;
        }

        const promesa = audio.play();

        if (promesa && typeof promesa.catch === "function") {

            promesa.catch(() => {
                // El navegador puede bloquear el audio.
            });
        }
    }

    function detenerAudio(id, reiniciar = false) {

        const audio = elementos[id];

        if (!audio) {
            return;
        }

        audio.pause();

        if (reiniciar) {
            audio.currentTime = 0;
        }
    }

    // =========================================================
    // LIMPIEZA DE INTERVALOS Y TIMEOUTS
    // =========================================================

    function limpiarIntervalo(ref) {

        if (ref !== null) {
            clearInterval(ref);
        }
    }

    function limpiarTimeout(ref) {

        if (ref !== null) {
            clearTimeout(ref);
        }
    }

    // =========================================================
    // DETENER MOVIMIENTO DE METEORITOS
    // =========================================================

    function limpiarMovimientoMeteoritos() {

        intervalosMeteoritos.forEach((intervalo) => {
            clearInterval(intervalo);
        });

        intervalosMeteoritos.clear();

        timeoutsMeteoritos.forEach((timeout) => {
            clearTimeout(timeout);
        });

        timeoutsMeteoritos.clear();
    }

    // =========================================================
    // COMPROBADOR DE DERROTA
    // =========================================================

    function detenerComprobadorDerrota() {

        if (frameDerrota !== null) {

            cancelAnimationFrame(frameDerrota);

            frameDerrota = null;
        }
    }

    function iniciarComprobadorDerrota() {

        detenerComprobadorDerrota();

        const comprobar = () => {

            if (estadoJuego !== "jugando") {

                frameDerrota = null;
                return;
            }

            const meteoritoHaLlegado = METEORITOS.some(({ id }) => {

                return (
                    elementos[id] &&
                    elementos[id].offsetLeft >
                    CONFIG.LIMITE_DERROTA
                );

            });

            if (meteoritoHaLlegado) {

                perderNivel("meteorito");

                frameDerrota = null;

                return;
            }

            frameDerrota = requestAnimationFrame(comprobar);
        };

        frameDerrota = requestAnimationFrame(comprobar);
    }

    // =========================================================
    // POSICIONES ALEATORIAS
    // =========================================================

    function alturaAleatoria() {

        return Math.round(
            Math.random() * CONFIG.ALTURA_MAXIMA
        );
    }

    // =========================================================
    // MOVER METEORITO
    // =========================================================

    function moverMeteorito(meteorito) {

        const elemento = elementos[meteorito.id];

        if (!elemento) {
            return;
        }

        if (estadoJuego !== "jugando") {
            return;
        }

        elemento.style.left = "80%";

        elemento.style.top =
            `${alturaAleatoria()}px`;

        elemento.style.transition =
            CONFIG.TRANSICION_METEORITO;
    }

    // =========================================================
    // PROGRAMAR METEORITOS
    // =========================================================

    function programarMeteorito(meteorito) {

        const elemento = elementos[meteorito.id];

        if (!elemento) {
            return;
        }

        // Evita temporizadores duplicados.
        if (intervalosMeteoritos.has(meteorito.id)) {

            clearInterval(
                intervalosMeteoritos.get(meteorito.id)
            );

            intervalosMeteoritos.delete(meteorito.id);
        }

        if (timeoutsMeteoritos.has(meteorito.id)) {

            clearTimeout(
                timeoutsMeteoritos.get(meteorito.id)
            );

            timeoutsMeteoritos.delete(meteorito.id);
        }

        // Primer movimiento
        const timeout = setTimeout(() => {

            timeoutsMeteoritos.delete(meteorito.id);

            if (estadoJuego === "jugando") {
                moverMeteorito(meteorito);
            }

        }, meteorito.inicio);

        // Movimientos siguientes
        const intervalo = setInterval(() => {

            if (estadoJuego === "jugando") {
                moverMeteorito(meteorito);
            }

        }, meteorito.intervalo);

        timeoutsMeteoritos.set(
            meteorito.id,
            timeout
        );

        intervalosMeteoritos.set(
            meteorito.id,
            intervalo
        );
    }

    function iniciarMovimientoMeteoritos() {

        limpiarMovimientoMeteoritos();

        METEORITOS.forEach(
            programarMeteorito
        );
    }

    // =========================================================
    // CONGELAR METEORITO
    // =========================================================

    function congelarMeteorito(id) {

        const meteorito = elementos[id];

        if (!meteorito) {
            return;
        }

        const leftActual =
            meteorito.offsetLeft;

        const topActual =
            meteorito.offsetTop;

        meteorito.style.transition = "none";

        meteorito.style.left =
            `${leftActual}px`;

        meteorito.style.top =
            `${topActual}px`;
    }

    function congelarTodosLosMeteoritos() {

        METEORITOS.forEach(({ id }) => {

            congelarMeteorito(id);

        });
    }

    // =========================================================
    // OCULTAR METEORITOS
    // =========================================================

    function ocultarMeteoritos() {

        METEORITOS.forEach(({ id }) => {

            const meteorito = elementos[id];

            if (!meteorito) {
                return;
            }

            meteorito.style.transition = "0s";

            meteorito.style.left =
                CONFIG.POSICION_INICIAL;
        });
    }

    // =========================================================
    // EXPULSAR METEORITO
    // =========================================================

    function expulsarMeteorito(id, sonidoId) {

        if (estadoJuego !== "jugando") {
            return;
        }

        const meteorito = elementos[id];

        if (!meteorito) {
            return;
        }

        reproducirAudio(
            sonidoId,
            true
        );

        meteorito.style.left =
            CONFIG.DISTANCIA_SALIDA;

        meteorito.style.top =
            `${Math.round(Math.random() * 600)}px`;

        meteorito.style.transition =
            CONFIG.TRANSICION_EXPULSION;
    }

    // =========================================================
    // TEMPORIZADOR
    // =========================================================

    function restarTiempo() {

        if (estadoJuego !== "jugando") {
            return;
        }

        Tiempolvl3 =
            Math.max(
                0,
                Tiempolvl3 - 1
            );

        actualizarTiempo();

        if (Tiempolvl3 === 0) {

            perderNivel("tiempo");
        }
    }

    function iniciarTemporizador() {

        limpiarIntervalo(
            intervaloTiempo
        );

        intervaloTiempo =
            setInterval(
                restarTiempo,
                1000
            );
    }

    function detenerTemporizador() {

        limpiarIntervalo(
            intervaloTiempo
        );

        intervaloTiempo = null;
    }

    // =========================================================
    // REINICIAR DATOS
    // =========================================================

    function resetearDatos() {

        Tiempolvl3 =
            CONFIG.TIEMPO_INICIAL;

        Puntajelvl3 = 0;

        actualizarTiempo();

        actualizarMarcador();
    }

    // =========================================================
    // LIMPIAR TODOS LOS TEMPORIZADORES
    // =========================================================

    function limpiarTodosLosTemporizadores() {

        detenerTemporizador();

        limpiarIntervalo(
            intervaloCuenta
        );

        intervaloCuenta = null;

        limpiarTimeout(
            timeoutArranque
        );

        timeoutArranque = null;

        limpiarTimeout(
            timeoutContactos
        );

        timeoutContactos = null;

        limpiarTimeout(
            timeoutCreditos
        );

        timeoutCreditos = null;

        limpiarMovimientoMeteoritos();

        detenerComprobadorDerrota();
    }

    // =========================================================
    // PERDER NIVEL
    // =========================================================

    function perderNivel(motivo = "meteorito") {

        if (estadoJuego !== "jugando") {
            return;
        }

        estadoJuego = "perdido";

        Activolvl3 = 2;

        limpiarTodosLosTemporizadores();

        ocultarMeteoritos();

        detenerAudio(
            "Fondo_Ciberpunk"
        );

        reproducirAudio(
            "Perdiste_sound",
            true
        );

        const mensaje =
            motivo === "tiempo"
                ? "Se acabó el tiempo. Los meteoritos alcanzaron la Tierra."
                : "Un meteorito cruzó la línea de defensa. Los meteoritos destruyeron gran parte del continente.";

        mostrarResultadoDerrota(mensaje);
    }

    // =========================================================
    // MOSTRAR DERROTA
    // =========================================================

    function mostrarResultadoDerrota(mensaje) {

        if (typeof Swal !== "undefined") {

            Swal.fire({

                title: "Perdiste",

                text: mensaje,

                icon: "error",

                confirmButtonText:
                    "Reintentar",

                allowOutsideClick: false,

                allowEscapeKey: false

            }).then((resultado) => {

                if (resultado.isConfirmed) {

                    iniciarCuentaRegresiva(
                        true
                    );
                }

            });

        } else {

            alert(mensaje);

            iniciarCuentaRegresiva(true);
        }
    }

    // =========================================================
    // SUMAR PUNTOS
    // =========================================================

    function sumarPunto() {

        if (estadoJuego !== "jugando") {
            return;
        }

        Puntajelvl3 += 1;

        actualizarMarcador();

        // Se necesitan 4 meteoritos.
        if (
            Puntajelvl3 >=
            CONFIG.PUNTOS_META
        ) {

            ganarNivel();
        }
    }

    // =========================================================
    // GANAR NIVEL
    // =========================================================

    function ganarNivel() {

        if (estadoJuego !== "jugando") {
            return;
        }

        estadoJuego = "ganado";

        Activolvl3 = 2;

        limpiarTodosLosTemporizadores();

        detenerAudio(
            "Fondo_Ciberpunk"
        );

        ocultarMeteoritos();

        reproducirAudio(
            "Triunfo",
            true
        );

        reproducirAudio(
            "Musica_Final",
            true
        );

        // OVNI 1
        if (
            elementos.Pantalla_Ovnislvl3
        ) {

            elementos
                .Pantalla_Ovnislvl3
                .style
                .left = "7%";

            elementos
                .Pantalla_Ovnislvl3
                .style
                .transition = "6s";
        }

        // Nave nodriza
        if (
            elementos.Pantalla_Nodrizalvl3
        ) {

            elementos
                .Pantalla_Nodrizalvl3
                .style
                .left = "10%";

            elementos
                .Pantalla_Nodrizalvl3
                .style
                .transition = "5s";
        }

        // OVNI 2
        if (
            elementos.Pantalla_Ovnis2lvl3
        ) {

            elementos
                .Pantalla_Ovnis2lvl3
                .style
                .left = "7%";

            elementos
                .Pantalla_Ovnis2lvl3
                .style
                .transition = "6s";
        }

        timeoutCreditos =
            setTimeout(
                mostrarCreditos,
                5000
            );

        timeoutContactos =
            setTimeout(
                mostrarContactos,
                15000
            );
    }

    // =========================================================
    // CRÉDITOS
    // =========================================================

    function mostrarCreditos() {

        if (
            elementos.Pantalla_creditoslvl3
        ) {

            elementos
                .Pantalla_creditoslvl3
                .style
                .background = "black";
        }

        if (
            elementos.Creditoslvl3
        ) {

            elementos
                .Creditoslvl3
                .style
                .top = "-15%";

            elementos
                .Creditoslvl3
                .style
                .transition = "10s";
        }

        if (
            elementos.Proximolvl3
        ) {

            elementos
                .Proximolvl3
                .style
                .bottom = "-34%";

            elementos
                .Proximolvl3
                .style
                .transition = "15s";
        }
    }

    // =========================================================
    // CONTACTOS / SWEETALERT
    // =========================================================

    function mostrarContactos() {

        if (typeof Swal === "undefined") {
            return;
        }

        Swal.fire({

            title:
                'Felicitaciones por parte del <br>Grupo Omega<br><br>' +
                '<img src="IMG/Logo_Omega.png" width="120" alt="Logo Grupo Omega">',

            html:
                '<b>' +
                'Sabíamos que lo lograrías. Nos salvaste de la destrucción, ' +
                'pero ahora nos espera otra lucha. Esperamos volver a verte ' +
                'jugando IRON FIST 2 en el futuro.' +
                '<br><br>' +
                'CONTACTOS:' +
                '<br><br>' +
                '71727432@certus.edu.pe' +
                '<br><br>' +
                '71663265@certus.edu.pe' +
                '<br><br>' +
                '70845813@certus.edu.pe' +
                '</b>',

            icon: "success",

            confirmButtonText:
                "De acuerdo",

            width: "50%",

            timer: 100000,

            timerProgressBar: true,

            allowOutsideClick: true,

            allowEscapeKey: false,

            allowEnterKey: false,

            stopKeydownPropagation: false
        });
    }

    // =========================================================
    // REINICIAR METEORITOS
    // =========================================================

    function reiniciarMeteoritosVisualmente() {

        ocultarMeteoritos();

        METEORITOS.forEach(
            ({ id }) => {

                const meteorito =
                    elementos[id];

                if (!meteorito) {
                    return;
                }

                meteorito.style.top =
                    `${alturaAleatoria()}px`;
            }
        );
    }

    // =========================================================
    // INICIAR JUEGO
    // =========================================================

    function iniciarJuego() {

        resetearDatos();

        reiniciarMeteoritosVisualmente();

        estadoJuego =
            "jugando";

        Activolvl3 = 1;

        reproducirAudio(
            "Fondo_Ciberpunk"
        );

        iniciarTemporizador();

        iniciarMovimientoMeteoritos();

        iniciarComprobadorDerrota();
    }

    // =========================================================
    // CUENTA REGRESIVA
    // =========================================================

    function iniciarCuentaRegresiva(
        esReintento = false
    ) {

        limpiarIntervalo(
            intervaloCuenta
        );

        intervaloCuenta = null;

        limpiarTimeout(
            timeoutArranque
        );

        timeoutArranque = null;

        resetearDatos();

        reiniciarMeteoritosVisualmente();

        detenerComprobadorDerrota();

        limpiarMovimientoMeteoritos();

        detenerTemporizador();

        estadoJuego =
            "cuenta";

        Activolvl3 = 2;

        Conteolvl3 = 3;

        if (
            elementos.Contenedor_contadorlvl3
        ) {

            elementos
                .Contenedor_contadorlvl3
                .style
                .display = "table";
        }

        if (elementos.RGBlvl3) {

            elementos.RGBlvl3.textContent =
                Conteolvl3;
        }

        if (
            !esReintento &&
            elementos.Startlvl3
        ) {

            elementos
                .Startlvl3
                .style
                .display = "table";
        }

        // El audio se inicia mediante la interacción
        // del usuario para evitar bloqueos del navegador.
        if (!esReintento) {

            reproducirAudio(
                "Fondo_Ciberpunk"
            );
        }

        intervaloCuenta =
            setInterval(() => {

                Conteolvl3 -= 1;

                if (elementos.RGBlvl3) {

                    elementos.RGBlvl3.textContent =
                        Conteolvl3 > 0
                            ? Conteolvl3
                            : "GO";
                }

                if (
                    Conteolvl3 <= 0
                ) {

                    limpiarIntervalo(
                        intervaloCuenta
                    );

                    intervaloCuenta =
                        null;

                    if (
                        elementos.Contenedor_contadorlvl3
                    ) {

                        elementos
                            .Contenedor_contadorlvl3
                            .style
                            .display = "none";
                    }

                    timeoutArranque =
                        setTimeout(() => {

                            timeoutArranque =
                                null;

                            if (
                                elementos.Startlvl3
                            ) {

                                elementos
                                    .Startlvl3
                                    .style
                                    .display = "none";
                            }

                            iniciarJuego();

                        }, 500);
                }

            }, 1000);
    }

    // =========================================================
    // BOTÓN PLAY
    // =========================================================

    function PLAYlvl3() {

        // Solo se puede iniciar desde la pantalla inicial
        // o después de perder.
        if (
            estadoJuego !== "inicio" &&
            estadoJuego !== "perdido"
        ) {
            return;
        }

        // Ocultar título
        if (elementos.Textolvl3) {
            elementos.Textolvl3.style.left = "-900px";
        }

        // Ocultar botón
        if (elementos.Playlvl3) {

            elementos.Playlvl3.style.left =
                "-900px";

            elementos.Playlvl3.style.pointerEvents =
                "none";
        }

        // Ocultar dificultad
        if (elementos.Dificultadlvl3) {
            elementos.Dificultadlvl3.style.left =
                "-900px";
        }

        // =====================================================
        // MOSTRAR CUENTA REGRESIVA
        // =====================================================

        if (elementos.Contenedor_contadorlvl3) {
            elementos.Contenedor_contadorlvl3.style.display =
                "table";
        }

        Conteolvl3 = 3;

        if (elementos.RGBlvl3) {
            elementos.RGBlvl3.textContent =
                Conteolvl3;
        }

        iniciarCuentaRegresiva(false);
}

    // =========================================================
    // PAUSAR
    // =========================================================

    function pausarJuego() {

        if (estadoJuego !== "jugando") {
            return;
        }

        estadoJuego = "pausado";

        Activolvl3 = 2;

        detenerTemporizador();

        limpiarMovimientoMeteoritos();

        detenerComprobadorDerrota();

        congelarTodosLosMeteoritos();

        detenerAudio(
            "Fondo_Ciberpunk"
        );

        if (
            elementos.Pausa_Pantallalvl3
        ) {

            elementos
                .Pausa_Pantallalvl3
                .style
                .display = "table";
        }
    }

    // =========================================================
    // REANUDAR
    // =========================================================

    function reanudarJuego() {

        if (estadoJuego !== "pausado") {
            return;
        }

        estadoJuego = "jugando";

        Activolvl3 = 1;

        if (
            elementos.Pausa_Pantallalvl3
        ) {

            elementos
                .Pausa_Pantallalvl3
                .style
                .display = "none";
        }

        reproducirAudio(
            "Fondo_Ciberpunk"
        );

        iniciarTemporizador();

        METEORITOS.forEach(
            ({ id }) => {

                const meteorito =
                    elementos[id];

                if (!meteorito) {
                    return;
                }

                meteorito.style.transition =
                    CONFIG.TRANSICION_REANUDAR;

                meteorito.style.left =
                    "80%";
            }
        );

        METEORITOS.forEach(
            (meteorito) => {

                const intervalo =
                    setInterval(() => {

                        if (
                            estadoJuego ===
                            "jugando"
                        ) {

                            moverMeteorito(
                                meteorito
                            );
                        }

                    }, meteorito.intervalo);

                intervalosMeteoritos.set(
                    meteorito.id,
                    intervalo
                );
            }
        );

        iniciarComprobadorDerrota();
    }

    // =========================================================
    // FUNCIÓN DE COMPATIBILIDAD
    // =========================================================

    function DETENER_JUEGOlvl3() {

        // Mantiene el mismo nombre
        // utilizado en el código original.
        Activolvl3 = 1;
    }

    // =========================================================
    // BOTÓN PAUSA / REANUDAR
    // =========================================================

    function PAUSElvl3() {

        if (estadoJuego === "jugando") {

            pausarJuego();

        } else if (
            estadoJuego === "pausado"
        ) {

            reanudarJuego();
        }
    }

    // =========================================================
    // EVENTOS
    // =========================================================

    function prepararEventos() {

        // PLAY
        if (elementos.Playlvl3) {

            elementos.Playlvl3.addEventListener(
                "click",
                PLAYlvl3
            );
        }

        // PAUSA
        if (elementos.Pauselvl3) {

            elementos.Pauselvl3.addEventListener(
                "click",
                PAUSElvl3
            );
        }

        // METEORITOS
        METEORITOS.forEach(
            ({ id, sonido }) => {

                const meteorito =
                    elementos[id];

                if (!meteorito) {
                    return;
                }

                // mouseenter evita múltiples activaciones.
                meteorito.addEventListener(
                    "mouseenter",
                    () => {

                        if (
                            estadoJuego !==
                            "jugando"
                        ) {

                            return;
                        }

                        expulsarMeteorito(
                            id,
                            sonido
                        );

                        sumarPunto();
                    }
                );
            }
        );

        // ATAJOS DE TECLADO
        document.addEventListener(
            "keydown",
            (evento) => {

                if (
                    evento.key.toLowerCase() ===
                    "p" ||
                    evento.code === "Space"
                ) {

                    if (
                        estadoJuego ===
                            "jugando" ||
                        estadoJuego ===
                            "pausado"
                    ) {

                        evento.preventDefault();

                        PAUSElvl3();
                    }
                }
            }
        );
    }

    // =========================================================
    // INICIALIZACIÓN
    // =========================================================

    function inicializar() {

        cargarElementos();

        // Valores iniciales
        Tiempolvl3 = CONFIG.TIEMPO_INICIAL;
        Puntajelvl3 = 0;
        Conteolvl3 = 3;

        actualizarTiempo();
        actualizarMarcador();

        // =====================================================
        // PANTALLA INICIAL
        // =====================================================

        // IMPORTANTE:
        // La cuenta regresiva debe estar OCULTA
        // hasta que se presione JUGAR.
        if (elementos.Contenedor_contadorlvl3) {
            elementos.Contenedor_contadorlvl3.style.display = "none";
        }

        // Mostrar pantalla Start
        if (elementos.Startlvl3) {
            elementos.Startlvl3.style.display = "table";
        }

        // Mostrar y activar botón JUGAR
        if (elementos.Playlvl3) {
            elementos.Playlvl3.disabled = false;
            elementos.Playlvl3.style.pointerEvents = "auto";
        }

        // Mostrar título
        if (elementos.Textolvl3) {
            elementos.Textolvl3.style.left = "0px";
        }

        // Mostrar dificultad
        if (elementos.Dificultadlvl3) {
            elementos.Dificultadlvl3.style.left = "0px";
        }

        // =====================================================
        // CUENTA REGRESIVA
        // =====================================================

        if (elementos.RGBlvl3) {
            elementos.RGBlvl3.textContent = Conteolvl3;
        }

        // =====================================================
        // PANTALLA DE PAUSA
        // =====================================================

        if (elementos.Pausa_Pantallalvl3) {
            elementos.Pausa_Pantallalvl3.style.display = "none";
        }

        // =====================================================
        // METEORITOS
        // =====================================================

        ocultarMeteoritos();

        // =====================================================
        // EVENTOS
        // =====================================================

        prepararEventos();

        // =====================================================
        // VARIABLES GLOBALES
        // =====================================================

        window.JUEGOlvl3 = iniciarJuego;

        window.PLAYlvl3 = PLAYlvl3;

        window.DETENER_JUEGOlvl3 =
            DETENER_JUEGOlvl3;

        window.PAUSElvl3 =
            PAUSElvl3;
    }

    // =========================================================
    // ESPERAR A QUE CARGUE EL DOM
    // =========================================================

    if (
        document.readyState ===
        "loading"
    ) {

        document.addEventListener(
            "DOMContentLoaded",
            inicializar,
            { once: true }
        );

    } else {

        inicializar();
    }

})();