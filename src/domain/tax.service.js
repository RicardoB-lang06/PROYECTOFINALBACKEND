function calcularImpuestosRESICO(ingresos, deducciones) {
    let totalIngresosBrutos = 0;
    let ivaCobrado = 0;
    let ivaAcreditable = 0;

    ingresos.forEach(ing => {
        const monto = Number(ing.monto_mxn);
        totalIngresosBrutos += monto;

        if (ing.moneda === 'MXN') {
            ivaCobrado += monto * 0.16;
        }
    });

    deducciones.forEach(ded => {

        const baseGasto = Number(ded.monto_mxn);
        ivaAcreditable += baseGasto * 0.16;
    });

    let porcentajeISR = 0;
    if (totalIngresosBrutos <= 25000) {
        porcentajeISR = 0.01;
    } else if (totalIngresosBrutos <= 50000) {
        porcentajeISR = 0.011;
    } else if (totalIngresosBrutos <= 83333.33) {
        porcentajeISR = 0.015;
    } else if (totalIngresosBrutos <= 208333.33) {
        porcentajeISR = 0.02;
    } else {
        porcentajeISR = 0.025;
    }

    const isrAPagar = totalIngresosBrutos * porcentajeISR;

    let ivaAPagar = ivaCobrado - ivaAcreditable;
    
    let saldoAFavorIva = 0;
    if (ivaAPagar < 0) {
        saldoAFavorIva = Math.abs(ivaAPagar);
        ivaAPagar = 0;
    }

    return {
        ok: true,
        data: {
            resumen_ingresos: {
                total_bruto_mxn: Number(totalIngresosBrutos.toFixed(2)),
            },
            resumen_deducciones: {
                total_gastos_mxn: Number((ivaAcreditable / 0.16).toFixed(2)),
            },
            calculo_isr: {
                tasa_aplicada: `${(porcentajeISR * 100).toFixed(2)}%`,
                isr_a_pagar: Number(isrAPagar.toFixed(2))
            },
            calculo_iva: {
                iva_trasladado_cobrado: Number(ivaCobrado.toFixed(2)),
                iva_acreditable_pagado: Number(ivaAcreditable.toFixed(2)),
                iva_a_pagar: Number(ivaAPagar.toFixed(2)),
                saldo_a_favor_iva: Number(saldoAFavorIva.toFixed(2))
            },
            total_impuestos_a_pagar: Number((isrAPagar + ivaAPagar).toFixed(2))
        }
    };
}

module.exports = { calcularImpuestosRESICO };