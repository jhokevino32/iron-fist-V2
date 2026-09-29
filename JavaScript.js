Swal.fire({
    title: '¿Preparado para salvar el mundo? <br><br> <img src="IMG/planeta_tierra.png" width = "120px"><br>',
    html: 'IRON FIST, es un juego que mejorara tus reflejos a medida que pases de nivel, retandote cada vez mas a medida que avances y desbloqueando grandes logros al final de cada nivel, esperamos te diviertas y disfrutes de este gran juego   ',
    icon: 'success',
    confirmButtonText: 'ESTOY PREPARADO',
    width: '50%',
    height: '80%',
    timer: 100000,


    timerProgressbar: true,
    /*Funcion de cerrar la alerta*/
    allowOutsideClick: true,
    allowEscapeKey: false,
    allowEnterkey: false,
    stopKeydownPropagation: false,
});



Tiempo = 71 //VARIBLE DE INICIO TIEMPO
Puntaje = 0 //VARIABLE DE INICIO PUNTOS
var Restar_Tiempo, Reanudar_trayectoria, Reanudar_trayectoria2, Reanudar_trayectoria3, Pusae_offf
var tercerMeteoritoActivado = false
var Activo = 0
var Activo = 0

var Aviso_Juego_Temporizador

function Mostrar_Aviso_Juego(titulo, mensaje, esImpacto) {
    var aviso = document.getElementById("Impacto_Notificacion")
    var tablero = document.querySelector("#NIVEL_01 .Contenedor:not(.Cabezera)")
    document.getElementById("Impacto_Titulo").textContent = titulo
    document.getElementById("Impacto_Mensaje").textContent = mensaje
    aviso.classList.add("visible")
    aviso.setAttribute("aria-hidden", "false")

    if (esImpacto) {
        tablero.classList.remove("impacto")
        void tablero.offsetWidth
        tablero.classList.add("impacto")
    }

    clearTimeout(Aviso_Juego_Temporizador)
    Aviso_Juego_Temporizador = setTimeout(function () {
        aviso.classList.remove("visible")
        aviso.setAttribute("aria-hidden", "true")
        tablero.classList.remove("impacto")
    }, 3200)
}



//FUNCION DE NARRACIONES

Narracion = 1
document.getElementById("Contenedor_narracion").addEventListener('click', Iniciar_narracion)

function Iniciar_narracion() {
    if (Narracion == 1) {
        document.getElementById("narracion").play()
        document.getElementById("VOLUMEN").style.display = "none"
        document.getElementById("PAUSE").style.display = "table"
        Narracion = 2
    }
    else {
        document.getElementById("narracion").pause()
        document.getElementById("VOLUMEN").style.display = "table"
        document.getElementById("PAUSE").style.display = "none"
        Narracion = 1
    }
}




Graficos = 1 //Este es el medidor de graficos

//En esta funcion cambio de fondo al presionar el CHEKBOX, para graurar los graficos dentro del juego
function Graficos_fondo() {
    Contenedor_RQ = document.getElementById("Contenedor_RC")
    if (Graficos == 1) {
        document.getElementById("Recursos").style.marginLeft = "60%"
        document.getElementById("Fondo").style.background = "url(IMG/Fondo_Espacio2.jpg)"
        document.getElementById("Fondo").style.backgroundAttachment = "fixed"
        document.getElementById("Fondo").style.backgroundRepeat = "no-repeat"
        document.getElementById("Fondo").style.backgroundSize = "100% 120%"
        Graficos = 2
    }
    else {
        document.getElementById("Recursos").style.marginLeft = "0%"
        document.getElementById("Fondo").style.backgroundImage = "url(IMG/Fondo_Espacio.gif) "
        Graficos = 1
    }
}






//CONTENEDOR QUE CONTEIENE TOO EL JUEGO
//DE POR SI ESTA FUNCION NO SE EJECUTA HASTA QUE SE LA LLAMA, MAS ADELANTE LA LLAMAREMOS
//PARA QUE EL JUEGO INICIE UNA VEZ SE PRESIONE JUGAR
function JUEGO() {
    tercerMeteoritoActivado = false
    var posicionPuntero = null
    var tableroJuego = document.querySelector("#NIVEL_01 .Contenedor:not(.Cabezera)")
    var duracionTrayectoria = Math.max(2.4, tableroJuego.clientWidth / 375)
    var escalaTrayectoria = duracionTrayectoria / 2.4
    var intervaloTrayectoria = [2430, 2350, 2500]
    function actualizarIntervalosTrayectoria() {
        intervaloTrayectoria = [2430, 2350, 2500].map(function (intervalo) {
            return Math.round(intervalo * escalaTrayectoria)
        })
    }
    actualizarIntervalosTrayectoria()

    function alturaAleatoria(meteorito) {
        return Math.round(Math.random() * Math.max(0, tableroJuego.clientHeight - meteorito.offsetHeight))
    }

    function actualizarRitmoTrayectorias() {
        var duracionNueva = Math.max(2.4, tableroJuego.clientWidth / 375)
        if (Math.abs(duracionNueva - duracionTrayectoria) < 0.05) return

        duracionTrayectoria = duracionNueva
        escalaTrayectoria = duracionTrayectoria / 2.4
        actualizarIntervalosTrayectoria()
        var meteoritos = [document.getElementById("Meteiorito"), document.getElementById("Meteiorito2"), document.getElementById("Meteiorito3")]
        meteoritos.forEach(function (meteorito) {
            if (!meteorito.classList.contains("interceptado")) {
                meteorito.style.transition = duracionTrayectoria + "s"
            }
        })
        if (Activo === 2 || document.getElementById("GANASTE_PANTALLA").style.display === "flex") return

        clearInterval(Reanudar_trayectoria)
        clearInterval(Reanudar_trayectoria2)
        clearInterval(Reanudar_trayectoria3)
        Reanudar_trayectoria = setInterval(Metiorito_Direccion, intervaloTrayectoria[0])
        Reanudar_trayectoria2 = setInterval(Metiorito_Direccion2, intervaloTrayectoria[1])
        if (tercerMeteoritoActivado) {
            Reanudar_trayectoria3 = setInterval(Metiorito_Direccion3, intervaloTrayectoria[2])
        }
    }

    document.addEventListener("fullscreenchange", actualizarRitmoTrayectorias)
    window.addEventListener("resize", actualizarRitmoTrayectorias)

    tableroJuego.addEventListener("pointermove", function (event) {
        posicionPuntero = { x: event.clientX, y: event.clientY }
    })

    function Tiempo_Disminur() { //FUNCION QUE REDUCE EL TIEMPO Y RESETEAL EL RESULTADO UNA VEZ LLEGUE A 0
        Tiempo--;
        document.getElementById("Tiempo").innerHTML = Tiempo
        if (Tiempo == 0) {
            Tiempo = 71
            Puntaje = 0
            document.getElementById("Perdiste_sound").play()
            document.getElementById("Puntaje").innerHTML = "0&nbsp;/&nbsp;25"
            Mostrar_Aviso_Juego("TIEMPO AGOTADO", "La defensa se reinicia. Inténtalo de nuevo.", false)
        }
    }


    Restar_Tiempo = setInterval(Tiempo_Disminur, 1000)

    //AÑADIMOS LA FUNCION AUMENTAR PUNTOS AL PASAR EL CURSOR SOBRE LOS METIORITOS
    document.getElementById("Meteiorito").addEventListener('mouseover', Aumentar_Puntos)
    document.getElementById("Meteiorito2").addEventListener('mouseover', Aumentar_Puntos)
    document.getElementById("Meteiorito3").addEventListener('mouseover', Aumentar_Puntos)


    //FUNCION QUE UNICAMENTE AUMENTA PUNTOS Y RESETEA LAS VARIABLES AL LLEGAR A CIERTO LIMITE
    function Aumentar_Puntos(event) {
        var meteorito = event.currentTarget
        if (meteorito.classList.contains("interceptado")) return
        Puntaje++;
        document.getElementById("Puntaje").innerHTML = Puntaje + "&nbsp;/&nbsp;25"
        if (Puntaje >= 10 && !tercerMeteoritoActivado) {
            tercerMeteoritoActivado = true
            var meteoritoTres = document.getElementById("Meteiorito3")
            meteoritoTres.classList.add("interceptado")
            meteoritoTres.style.left = "-10%"
            meteoritoTres.style.top = "0px"
            meteoritoTres.style.display = "table"
            setTimeout(Metiorito_Direccion3, 700)
            Reanudar_trayectoria3 = setInterval(Metiorito_Direccion3, intervaloTrayectoria[2])
            Mostrar_Aviso_Juego("AMENAZA AUMENTADA", "Un tercer meteorito se dirige hacia la Tierra.", false)
        }
        if (Puntaje == 25) {
            Puntaje = 0
            Tiempo = 71


            document.getElementById("NEXT").addEventListener('click', Habilitar_Siguienten_LVL)
            function Habilitar_Siguienten_LVL() {
                document.getElementById("NIVEL_01").style.display = "none"
                document.getElementById("NIVEL_02").style.display = "block"
            }
            document.getElementById("Tiempo").innerHTML = 70
            document.getElementById("Puntaje").innerHTML = 0 + "&nbsp;/&nbsp;" + 25
            document.getElementById("Triunfo").play()
            document.getElementById("Fondo_Ciberpunk").pause()
            document.getElementById("Puntos_sound").pause()
            document.getElementById("Punto2").pause()
            document.getElementById("GANASTE_PANTALLA").style.display = "flex"

            function Ganaste_Pantalla() {

                clearInterval(Reanudar_trayectoria)
                clearInterval(Reanudar_trayectoria2)
                clearInterval(Reanudar_trayectoria3)
                clearInterval(Restar_Tiempo)

                document.getElementById("Meteiorito").style.left = "-70%"
                document.getElementById("Meteiorito").style.transition = "0s"

                document.getElementById("Meteiorito2").style.left = "-70%"
                document.getElementById("Meteiorito2").style.transition = "0s"
                document.getElementById("Meteiorito3").style.left = "-70%"
                document.getElementById("Meteiorito3").style.transition = "0s"
            }

            Desbloquear_Pantalla = setInterval(Ganaste_Pantalla, 1)

        }
    }



    //ESTA FUNCION DIRIGE AL PRIMER METIORITO 1 A LA TIERRA 
    function Metiorito_Direccion() {
        Distancia1 = 80
        Altura1 = alturaAleatoria(document.getElementById("Meteiorito"))

        document.getElementById("Meteiorito").classList.remove("interceptado")
        document.getElementById("Meteiorito").style.left = Distancia1 + "%"
        document.getElementById("Meteiorito").style.top = Altura1 + "px"
    }

    setTimeout(Metiorito_Direccion, 2000)//PRIMERO VA A SER EJECUTADO A LOS DOS PRIMEROS SEGUNDOS
    Reanudar_trayectoria = setInterval(Metiorito_Direccion, intervaloTrayectoria[0])


    //ESTA FUNCION DIRIGE AL PRIMER METIORITO 2 A LA TIERRA         
    function Metiorito_Direccion2() {
        Distancia2 = 80
        Altura2 = alturaAleatoria(document.getElementById("Meteiorito2"))

        document.getElementById("Meteiorito2").classList.remove("interceptado")
        document.getElementById("Meteiorito2").style.left = Distancia2 + "%"
        document.getElementById("Meteiorito2").style.top = Altura2 + "px"
    }

    setTimeout(Metiorito_Direccion2, 2600)//PRIMERO VA A SER EJECUTADO A LOS DOS PRIMEROS SEGUNDOS
    Reanudar_trayectoria2 = setInterval(Metiorito_Direccion2, intervaloTrayectoria[1])

    function Metiorito_Direccion3() {
        Distancia3 = 80
        Altura3 = alturaAleatoria(document.getElementById("Meteiorito3"))
        document.getElementById("Meteiorito3").classList.remove("interceptado")
        document.getElementById("Meteiorito3").style.left = Distancia3 + "%"
        document.getElementById("Meteiorito3").style.top = Altura3 + "px"
    }


    //AQUI ADJUNTAMOS LA ACCION DE LA FUNCION EXPULZAR AL PASAR SOBRE EL METIORITO
    document.getElementById("Meteiorito").addEventListener('mouseover', Explulsar)
    document.getElementById("Meteiorito2").addEventListener('mouseover', Explulsar2)
    document.getElementById("Meteiorito3").addEventListener('mouseover', Explulsar3)


    //ESTA ES LA FUNCION QUE EXPULSA AL METIRITO 1 DE MANERA ALEATORIA FUERA DEL MAPA
    function Explulsar() {
        var meteorito = document.getElementById("Meteiorito")
        if (meteorito.classList.contains("interceptado")) return
        meteorito.classList.add("interceptado")
        document.getElementById("Puntos_sound").play()
        Distancia = "-500"
        Altura = alturaAleatoria(document.getElementById("Meteiorito"))

        document.getElementById("Meteiorito").style.left = Distancia + "px"
        document.getElementById("Meteiorito").style.top = Altura + "px"
        document.getElementById("Meteiorito").style.transition = "1.8s"
    }


    //ESTA ES LA FUNCION QUE EXPULSA AL METIRITO 2 DE MANERA ALEATORIA FUERA DEL MAPA
    function Explulsar2() {
        var meteorito = document.getElementById("Meteiorito2")
        if (meteorito.classList.contains("interceptado")) return
        meteorito.classList.add("interceptado")
        document.getElementById("Punto2").play()
        Distancia = "-500"
        Altura = alturaAleatoria(document.getElementById("Meteiorito2"))

        document.getElementById("Meteiorito2").style.left = Distancia + "px"
        document.getElementById("Meteiorito2").style.top = Altura + "px"
        document.getElementById("Meteiorito2").style.transition = "1.8s"
    }

    function Explulsar3() {
        var meteorito = document.getElementById("Meteiorito3")
        if (meteorito.classList.contains("interceptado")) return
        meteorito.classList.add("interceptado")
        document.getElementById("Punto3").play()
        document.getElementById("Meteiorito3").style.left = "-500px"
        document.getElementById("Meteiorito3").style.top = alturaAleatoria(document.getElementById("Meteiorito3")) + "px"
        document.getElementById("Meteiorito3").style.transition = "1.8s"
    }





    //ESTA FUNCION SE ENCARGA DE ALERTARTE UNA VEZ EL METIORITO CRUZE LA LINEA CON UN PERDISTE
    //TAMBIEN RESETEA LOS VALORES Y LLEVA A LOS METIORITOS FUERA DEL MAPA DE MANERA INSTANTANEA
    function perdiste() {
        if (Activo !== 1) return
        var tierra = document.querySelector("#NIVEL_01 .Planeta")
        var meteoritos = [document.getElementById("Meteiorito"), document.getElementById("Meteiorito2")]
        if (tercerMeteoritoActivado) {
            meteoritos.push(document.getElementById("Meteiorito3"))
        }

        if (posicionPuntero) {
            meteoritos.forEach(function (meteorito) {
                var caja = meteorito.getBoundingClientRect()
                var punteroSobreMeteorito = posicionPuntero.x >= caja.left && posicionPuntero.x <= caja.right &&
                    posicionPuntero.y >= caja.top && posicionPuntero.y <= caja.bottom
                if (!meteorito.classList.contains("interceptado") && punteroSobreMeteorito) {
                    meteorito.dispatchEvent(new MouseEvent("mouseover", { bubbles: true }))
                }
            })
        }

        var tierraCaja = tierra.getBoundingClientRect()
        var impacto = meteoritos.some(function (meteorito) {
            return !meteorito.classList.contains("interceptado") &&
                meteorito.getBoundingClientRect().right >= tierraCaja.left
        })

        if (impacto) {

            document.getElementById("Perdiste_sound").play()
            Mostrar_Aviso_Juego("IMPACTO EN LA TIERRA", "Un meteorito alcanzó el planeta. La defensa se reinicia.", true)
            document.getElementById("Meteiorito").style.left = "-70%"
            document.getElementById("Meteiorito").style.transition = "0s"

            document.getElementById("Meteiorito2").style.left = "-70%"
            document.getElementById("Meteiorito2").style.transition = "0s"
            if (tercerMeteoritoActivado) {
                document.getElementById("Meteiorito3").style.left = "-70%"
                document.getElementById("Meteiorito3").style.transition = "0s"
            }

            Tiempo = 71
            Puntaje = 0
            document.getElementById("Tiempo").innerHTML = 70
            document.getElementById("Puntaje").innerHTML = "0&nbsp;/&nbsp;25"
        }

        else {
            meteoritos.forEach(function (meteorito) {
                if (!meteorito.classList.contains("interceptado")) {
                    meteorito.style.transition = duracionTrayectoria + "s"
                }
            })
        }
    }

    setInterval(perdiste, 1)//LE COLOCAMOS UNO PARA QUE SIEMPRE SE ESTE EJECUTANDO, DADO A 
    //QUE NO SABEMOS CUANDO EL METIORITO VA A SUPERAR EL LIMITE
}


//LE DECIMOS QUE AL PRECIONAR EL BOTON JUGAR EJECUTARA LA FUNCION PLAY     
document.getElementById("Play").addEventListener('click', PLAY)

// Permite ampliar únicamente el tablero y el HUD del nivel 1.
document.getElementById("Fullscreen").addEventListener('click', Alternar_Pantalla_Completa)

function Alternar_Pantalla_Completa() {
    var nivel = document.getElementById("Seccion_Juego")
    if (!document.fullscreenElement) {
        nivel.requestFullscreen().catch(function () { })
    } else {
        document.exitFullscreen().catch(function () { })
    }
}

document.addEventListener('fullscreenchange', function () {
    var boton = document.getElementById("Fullscreen")
    var activo = document.fullscreenElement
    boton.setAttribute('aria-label', activo ? 'Salir de pantalla completa' : 'Activar pantalla completa')
    boton.title = activo ? 'Salir de pantalla completa' : 'Pantalla completa'
    boton.innerHTML = activo ? '<i class="fas fa-compress" aria-hidden="true"></i><span class="sr-only">Salir de pantalla completa</span>' : '<i class="fas fa-expand" aria-hidden="true"></i><span class="sr-only">Pantalla completa</span>'
})

Conteo = 4 //ESTE ES EL CONTEO DE LA CUENTA REGRESIVA QUE SE DA DESPUEZ DE PRESINAR JUGAR

//ESTA FUNCION EJECUTA UN CONJUNTO DE ACCIONES AL PRESIONAR JUGAR
function PLAY() {
    document.getElementById("Fondo_Ciberpunk").play()
    //MUEVE EL TITULO FUERA DEL CONTENEDOR UNA VEZ DE CLICK A JUGAR
    document.getElementById("Texo").style.left = "-900px"
    //MUEVE AL BOTON PLAY TRANS PRESIONAR PRESIONAR AL MISMO BOTON
    document.getElementById("Contenedor_Mensaje_Star").style.left = "-100%"
    //ESTA FUNCION CONTIENE AL JUEGO COMO TAL
    function ARRACAR() {
        JUEGO()
    }
    //INVOCA AL JUEGO UNA VEZ PASEN 4 SEGUNDO - OSEA UNA VEZ TERMINE EL CONTADOR
    tiempo_de_arranque = setTimeout(ARRACAR, 4100)
    //ESTA FUNCION EJECUTA LA CUENTA REGRESIVA Y RETIRA LA PANTALLA START 
    function ESPERAR() {
        function Cuenta_rg() {
            Conteo--;
            document.getElementById("RGB").innerHTML = Conteo
            if (Conteo == -1) {
                document.getElementById("Contenedor_contador").style.display = "none"
                function Borrar() {
                    document.getElementById("Start").style.display = "none"

                    DETENER_JUEGO()
                }//HABILITA LA FUNCION DE PAUSE Y REANUDAR UNA VEZ CARGUE EL JUEGO
                setTimeout(Borrar, 500)
            }
        }
        setInterval(Cuenta_rg, 1000)
    }

    setTimeout(ESPERAR, 350)
}//SE EJECUTARA EN UN LAPSO DE 350, DESPUES DE PRESIONAR EL BOTON





//ESTA FUNCION CONTIENE EL REANUDE Y PAUSE DEL BOTON
function DETENER_JUEGO() {
    document.getElementById("Pause").addEventListener('click', PAUSE)
    var resumeButton = document.getElementById("Resume")
    if (resumeButton) {
        resumeButton.addEventListener('click', function () {
            if (Activo === 2) {
                PAUSE()
            }
        })
    }

    window.Continuar_Nivel1 = function () {
        if (Activo === 2) {
            PAUSE()
        }
    }

    Activo = 1

    function PAUSE() {
        var tableroJuego = document.querySelector("#NIVEL_01 .Contenedor:not(.Cabezera)")
        var duracionTrayectoriaLocal = Math.max(2.4, tableroJuego.clientWidth / 375)
        var intervaloTrayectoriaLocal = [2430, 2350, 2500].map(function (intervalo) {
            return Math.round(intervalo * (duracionTrayectoriaLocal / 2.4))
        })

        function alturaAleatoriaLocal(meteorito) {
            return Math.round(Math.random() * Math.max(0, tableroJuego.clientHeight - meteorito.offsetHeight))
        }

        if (Activo == 1) {
            document.getElementById("Fondo_Ciberpunk").pause()
            document.getElementById("Pausa_Pantalla").style.display = "flex"
            clearInterval(Restar_Tiempo)
            clearInterval(Reanudar_trayectoria)
            clearInterval(Reanudar_trayectoria2)
            clearInterval(Reanudar_trayectoria3)

            function Metiorito_detener() {
                var meteorito1 = document.getElementById("Meteiorito")
                var meteorito2 = document.getElementById("Meteiorito2")
                meteorito1.style.left = meteorito1.offsetLeft + "px"
                meteorito2.style.left = meteorito2.offsetLeft + "px"
                meteorito1.style.top = meteorito1.offsetTop + "px"
                meteorito2.style.top = meteorito2.offsetTop + "px"
                if (tercerMeteoritoActivado) {
                    var meteorito3 = document.getElementById("Meteiorito3")
                    meteorito3.style.left = meteorito3.offsetLeft + "px"
                    meteorito3.style.top = meteorito3.offsetTop + "px"
                }
            }

            Pusae_offf = setInterval(Metiorito_detener, 1)
            Activo = 2
            return
        }

        clearInterval(Pusae_offf)
        document.getElementById("Pausa_Pantalla").style.display = "none"
        document.getElementById("Fondo_Ciberpunk").play()

        if (typeof Distancia1 === "undefined") Distancia1 = 80
        if (typeof Altura1 === "undefined") Altura1 = alturaAleatoriaLocal(document.getElementById("Meteiorito"))
        if (typeof Distancia2 === "undefined") Distancia2 = 80
        if (typeof Altura2 === "undefined") Altura2 = alturaAleatoriaLocal(document.getElementById("Meteiorito2"))
        if (typeof Distancia3 === "undefined") Distancia3 = 80
        if (typeof Altura3 === "undefined") Altura3 = alturaAleatoriaLocal(document.getElementById("Meteiorito3"))

        clearInterval(Restar_Tiempo)
        function Tiempo_Disminur() {
            Tiempo--;
            document.getElementById("Tiempo").innerHTML = Tiempo
            if (Tiempo == 0) {
                Tiempo = 71
                Puntaje = 0
                document.getElementById("Perdiste_sound").play()
                document.getElementById("Puntaje").innerHTML = "0&nbsp;/&nbsp;25"
                Mostrar_Aviso_Juego("TIEMPO AGOTADO", "La defensa se reinicia. Inténtalo de nuevo.", false)
                document.getElementById("Meteiorito").style.left = "-70%"
                document.getElementById("Meteiorito").style.transition = "0s"
                document.getElementById("Meteiorito2").style.left = "-70%"
                document.getElementById("Meteiorito2").style.transition = "0s"
                if (tercerMeteoritoActivado) {
                    document.getElementById("Meteiorito3").style.left = "-70%"
                    document.getElementById("Meteiorito3").style.transition = "0s"
                }
            } else {
                document.getElementById("Meteiorito").style.transition = duracionTrayectoriaLocal + "s"
                document.getElementById("Meteiorito2").style.transition = duracionTrayectoriaLocal + "s"
                if (tercerMeteoritoActivado) {
                    document.getElementById("Meteiorito3").style.transition = duracionTrayectoriaLocal + "s"
                }
            }
        }
        Restar_Tiempo = setInterval(Tiempo_Disminur, 1000)

        document.getElementById("Meteiorito").classList.remove("interceptado")
        document.getElementById("Meteiorito2").classList.remove("interceptado")
        if (tercerMeteoritoActivado) {
            document.getElementById("Meteiorito3").classList.remove("interceptado")
        }

        document.getElementById("Meteiorito").style.left = Distancia1 + "%"
        document.getElementById("Meteiorito").style.top = Altura1 + "px"
        document.getElementById("Meteiorito").style.transition = duracionTrayectoriaLocal + "s"

        document.getElementById("Meteiorito2").style.left = Distancia2 + "%"
        document.getElementById("Meteiorito2").style.top = Altura2 + "px"
        document.getElementById("Meteiorito2").style.transition = duracionTrayectoriaLocal + "s"

        if (tercerMeteoritoActivado) {
            document.getElementById("Meteiorito3").style.left = Distancia3 + "%"
            document.getElementById("Meteiorito3").style.top = Altura3 + "px"
            document.getElementById("Meteiorito3").style.transition = duracionTrayectoriaLocal + "s"
        }

        clearInterval(Reanudar_trayectoria)
        clearInterval(Reanudar_trayectoria2)
        clearInterval(Reanudar_trayectoria3)
        Reanudar_trayectoria = setInterval(function () {
            Distancia1 = 80
            Altura1 = alturaAleatoriaLocal(document.getElementById("Meteiorito"))
            document.getElementById("Meteiorito").classList.remove("interceptado")
            document.getElementById("Meteiorito").style.left = Distancia1 + "%"
            document.getElementById("Meteiorito").style.top = Altura1 + "px"
        }, intervaloTrayectoriaLocal[0])

        Reanudar_trayectoria2 = setInterval(function () {
            Distancia2 = 80
            Altura2 = alturaAleatoriaLocal(document.getElementById("Meteiorito2"))
            document.getElementById("Meteiorito2").classList.remove("interceptado")
            document.getElementById("Meteiorito2").style.left = Distancia2 + "%"
            document.getElementById("Meteiorito2").style.top = Altura2 + "px"
        }, intervaloTrayectoriaLocal[1])

        if (tercerMeteoritoActivado) {
            Reanudar_trayectoria3 = setInterval(function () {
                Distancia3 = 80
                Altura3 = alturaAleatoriaLocal(document.getElementById("Meteiorito3"))
                document.getElementById("Meteiorito3").classList.remove("interceptado")
                document.getElementById("Meteiorito3").style.left = Distancia3 + "%"
                document.getElementById("Meteiorito3").style.top = Altura3 + "px"
            }, intervaloTrayectoriaLocal[2])
        }

        Activo = 1
    }
}





//TRANSICIONES ENTRE PAGINAS----------------------------------------------------------------------------------









//TRANSICIONES ENTRE PAGINAS----------------------------------------------------------------------------------



function Mover() {//TRANSICION DE LA PRIMERA SECCION A LA SEGUNDA
    var contenedor = document.getElementById("Seccion_01")
    contenedor.style.top = "-100%"
    contenedor.style.transition = "2s"
    function Desaparecer() {
        var contenedor = document.getElementById("Seccion_01")
        var Reglas = document.getElementById("Reglas")

        Reglas.style.top = "3%"
        Reglas.style.transition = "1s"
        contenedor.style.display = "none"


    }
    setTimeout(Desaparecer, 1090)

}


function Mover_2() {
    var Reglas_Sacar = document.getElementById("Reglas")


    Reglas_Sacar.style.top = "-100%"
    Reglas_Sacar.style.transition = "1.4s"



    function Desaparecer2() {
        var Reglas_Sacar = document.getElementById("Reglas")
        var contenedor_2 = document.getElementById("Seccion_2")
        var imagen = document.getElementById("Imagen")
        var mensaje = document.getElementById("Mensaje")
        var titulo = document.getElementById("Titulo_historia")

        Reglas_Sacar.style.display = "none"
        contenedor_2.style.top = "0%"

        imagen.style.left = "2%"
        imagen.style.transition = "2s"
        mensaje.style.right = "2%"
        mensaje.style.transition = "2s"
        titulo.style.left = "2%"
        titulo.style.transition = "1s"
    }
    setTimeout(Desaparecer2, 1260)



}


function Mover_3() {//TRANSICION DE LA SEGUNDA SECCION A LA TERCERA 

    var contenedor_2 = document.getElementById("Seccion_2")
    var Supremo = document.getElementById("Seccion_suprema")

    document.getElementById("narracion").pause()
    contenedor_2.style.top = "-100%"
    contenedor_2.style.transition = "1.4s"
    Supremo.style.height = "100vh" //El nivel 1 ocupa una sola pantalla sin espacio sobrante


    function Desaparaceer3() {
        var Seccion_Juego = document.getElementById("Seccion_Juego")
        var contenedor_2 = document.getElementById("Seccion_2")

        Seccion_Juego.style.left = "0%"
        contenedor_2.style.display = "none"

    }

    setTimeout(Desaparaceer3, 900)
}

//RELOJ


function Reloj_Tiempo() {
    var actualizar_Hora = function () {
        var Fecha = new Date(),
            Horas = Fecha.getHours(),
            ampm,
            Minutos = Fecha.getMinutes(),
            Segundos = Fecha.getSeconds(),
            diaSemana = Fecha.getDay(),
            dia = Fecha.getDate(),
            mes = Fecha.getMonth(),
            Año = Fecha.getFullYear();

        var pHoras = document.getElementById("Hora"),
            pAMPM = document.getElementById("AMPM"),
            pMinutos = document.getElementById("Minutos"),
            pSegundos = document.getElementById("Segundos"),
            pDia_Semana = document.getElementById("Dia_Semana"),
            pDia = document.getElementById("dia"),
            pMes = document.getElementById("mes"),
            pAño = document.getElementById("año");

        var semana = ['Domingo', 'Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado']
        pDia_Semana.textContent = semana[diaSemana];
        pDia.textContent = dia
        var Mes_Actual = ['Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio', 'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre']
        pMes.textContent = Mes_Actual[mes];
        pAño.textContent = Año

        if (Horas >= 12) {
            Horas = Horas - 12;
            ampm = 'PM';
        }
        else { ampm = 'AM'; }

        if (Horas == 0) {
            Horas = 12;
        }
        if (Horas < 10) {
            Horas = "0" + Horas
        }
        pHoras.textContent = Horas
        pAMPM.textContent = ampm
        if (Minutos < 10) {
            Minutos = "0" + Minutos
        }
        pMinutos.textContent = Minutos
        if (Segundos < 10) {
            Segundos = "0" + Segundos
        }
        pSegundos.textContent = Segundos
    };
    actualizar_Hora();
}


Reloj_Tiempo()

setInterval(Reloj_Tiempo, 1000)