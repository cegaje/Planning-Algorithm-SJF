const FORM = document.querySelector('#form-input');


FORM.addEventListener('submit', function (e) {
    e.preventDefault();
    //OBTENGO LAS TABLAS
    let bodyTableProcesos = document.getElementById("table-procesos-body");
    let bodyTableGant = document.getElementById("table-gant-body");
    let bodyTableEsperaProm = document.getElementById("table-espera-promedio-body");
    let bodyTableRespuestaProm = document.getElementById("table-respuesta-promedio-body");

    //LIMPIO LAS TABLAS
    limpiarTablas(bodyTableProcesos,bodyTableGant,bodyTableEsperaProm,bodyTableRespuestaProm);

    //VARIABLES QUE AYUDARÁN A REALIZAR LAS OPERACIONES 
    let procesos = [];
    let rafagasCPU = [];
    let gant = [];

    //PINTO LAS TABLAS
    completarTablaProcesos(procesos, rafagasCPU, bodyTableProcesos);
    completarTablaGant(procesos, gant, bodyTableGant, rafagasCPU);
    completarTablaEsperaPromedio(gant, bodyTableEsperaProm, procesos);
    completarTablaRespuestaPromedio(gant, bodyTableRespuestaProm, procesos);

});

function limpiarTablas(tableProcesos, tableGant, tableEsperaProm, tableRespuestaProm) {
    tableProcesos.innerHTML = "";
    tableGant.innerHTML = "";
    tableEsperaProm.innerHTML = "";
    tableRespuestaProm.innerHTML = "";
}

function completarTablaProcesos(procesos, rafagasCPU, bodyTableProcesos) {
    let procesosText = document.getElementById("procesos").value;
    let procesosArray = procesosText.split("\n")

    procesosArray.forEach((proc) => {
        var procesoArray = proc.split(",");
        procesos.push({
            proceso :procesoArray[0],
            tiempoLlegada : Number(procesoArray[1]),
            rafagaCPU : Number(procesoArray[2])
        });

        bodyTableProcesos.innerHTML += `
        <tr>
            <th scope="col">${procesoArray[0]}</th>
            <th scope="col">${procesoArray[1]}</th>
            <th scope="col">${procesoArray[2]}</th>
        </tr>
        `;
        rafagasCPU.push(Number(procesoArray[2]))
    });

    rafagasCPU = rafagasCPU.sort(function(a, b){return a-b})
}

function completarTablaGant(procesos, gant, bodyTableGant, rafagasCPU) {
    //OBTENEMOS EL PROCESO QUE LLEGA PRIMERO
    let llegoPrimero = [procesos[0]];
    procesos.forEach((proc) => {
        if (!llegoPrimero.includes(proc)) {
            if (proc.tiempoLlegada <= llegoPrimero[0].tiempoLlegada) {
                if (proc.tiempoLlegada == llegoPrimero[0].tiempoLlegada) {
                    llegoPrimero.push(proc);
                }else {
                    llegoPrimero = [proc];
                }
            }
        }
    });    

    //VERIFICAMOS SI HAY PROCESOS QUE LLEGARON PRIMEROS Y JUNTOS
    if (llegoPrimero.length > 1) {
        let menorAux = llegoPrimero[0];
        for( let index in llegoPrimero) {
            if (llegoPrimero[index].rafagaCPU <= menorAux.rafagaCPU) {
                if( !gant.includes(llegoPrimero[index]) ) {
                    menorAux = llegoPrimero[index];
                }
            }
        }
        gant.push(menorAux)
    }else{
        gant.push(llegoPrimero[0]);
    }

    //ORDENAMOS LOS PROCESOS SEGUN SU TIEMPO DE EJECUCIÓN
    for( let index in procesos) {
        if (index != procesos.length-1) {
            let menorAux = [{proceso:"prueba",rafagaCPU : rafagasCPU[rafagasCPU.length - 1]}]
            
            for( let index2 in procesos) {
                if (!gant.includes(procesos[index2])) {
                    if (procesos[index2].rafagaCPU <= menorAux[0].rafagaCPU) {
                        if (procesos[index2].rafagaCPU == menorAux[0].rafagaCPU) {
                            menorAux.push(procesos[index2]);
                        }else {
                            menorAux = [procesos[index2]]
                        }
                    }
                }
            }

            if (menorAux[0].proceso == "prueba") {
                menorAux.splice(0,1)
            }

            if (menorAux.length > 1) {
                let menorAux2 = menorAux[0];
                for( let index in menorAux) {
                    if( !gant.includes(menorAux[index]) ) {
                        if (menorAux[index].tiempoLlegada <= menorAux2.tiempoLlegada) {
                            menorAux2 = menorAux[index];
                        }
                    }
                }
                gant.push(menorAux2)
            }else {
                gant.push(menorAux[0])
            }
            
        }
    }
    
    //PINTAMOS LA TABLA GANT CON LOS PROCESOS ORDENADOS
    var tiempoEjecucion = 0; 
    for( let index in gant) {
            
        bodyTableGant.innerHTML += `
        <tr>
            <th scope="col">${gant[index].proceso}</th>
            <th scope="col">${index==0? 0:tiempoEjecucion}</th>
        </tr>
        `;
        gant[index].tiempoEspera = tiempoEjecucion;
        tiempoEjecucion += gant[index].rafagaCPU

        if (index == gant.length-1) {
            bodyTableGant.innerHTML += `
            <tr>
                <th scope="col">-</th>
                <th scope="col">${index==0? 0:tiempoEjecucion}</th>
            </tr>
            `;
        }
    }
}

function completarTablaEsperaPromedio(gant, bodyTableEsperaProm, procesos) {
    let tiempoEsperaPromedio = 0;
    for( let index in gant) {
        bodyTableEsperaProm.innerHTML += `
        <tr>
            <th scope="col">${gant[index].proceso}</th>
            <th scope="col">${gant[index].tiempoEspera}</th>
            <th scope="col">${gant[index].tiempoLlegada}</th>
            <th scope="col">${gant[index].tiempoEspera-gant[index].tiempoLlegada}</th>
        </tr>
        `;
        tiempoEsperaPromedio += (gant[index].tiempoEspera-gant[index].tiempoLlegada);
    }
    bodyTableEsperaProm.innerHTML += `
        <tr>
            <th scope="col" colspan="3">Tiempo espera promedio</th>
            <th scope="col">${tiempoEsperaPromedio/procesos.length}</th>
        </tr>
        `;
}

function completarTablaRespuestaPromedio(gant, bodyTableRespuestaProm,procesos) {
    let tiempoRespuestaPromedio = 0;
    for( let index in gant) {
        bodyTableRespuestaProm.innerHTML += `
        <tr>
            <th scope="col">${gant[index].proceso}</th>
            <th scope="col">${gant[index].rafagaCPU}</th>
            <th scope="col">${gant[index].tiempoEspera}</th>
            <th scope="col">${gant[index].rafagaCPU+gant[index].tiempoEspera}</th>
        </tr>
        `;
        tiempoRespuestaPromedio += (gant[index].rafagaCPU+gant[index].tiempoEspera);
    }
    bodyTableRespuestaProm.innerHTML += `
        <tr>
            <th scope="col" colspan="3">Tiempo respuesta promedio</th>
            <th scope="col">${tiempoRespuestaPromedio/procesos.length}</th>
        </tr>
        `;
}