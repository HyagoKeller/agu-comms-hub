// Motor IMR — funções puras para cálculo de indicadores contratuais
// Referência: TR item 7.1 (IAE, IAR, IST) — Contrato STFC 12/2026
import type { OrdemServico, Contrato } from "./types";

/** Diferença em dias corridos entre duas datas (ISO ou YYYY-MM-DD). */
export function diffDias(inicioISO: string, fimISO: string): number {
  const a = new Date(inicioISO).getTime();
  const b = new Date(fimISO).getTime();
  return Math.floor((b - a) / (1000 * 60 * 60 * 24));
}

/** Soma dias corridos a uma data ISO/YYYY-MM-DD, retornando YYYY-MM-DD. */
export function addDias(baseISO: string, dias: number): string {
  const d = new Date(baseISO);
  d.setDate(d.getDate() + dias);
  return d.toISOString().slice(0, 10);
}

/** IAE = TEC - TCE, em dias. Negativo/zero indica sem atraso. */
export function calcIAE(dataLimiteISO: string, dataConclusaoISO: string): number {
  return diffDias(dataLimiteISO, dataConclusaoISO);
}

/**
 * Glosa por IAE (TR 7.1):
 *   IAE ≤ 5:            0
 *   5 <  IAE ≤ 15:      0,25% ao dia sobre valor da OS
 *   IAE > 15:           1,00% ao dia sobre valor da OS
 */
export function calcGlosaIAE(iaeDias: number, valorOS: number): number {
  if (iaeDias <= 5) return 0;
  const pctDia = iaeDias <= 15 ? 0.0025 : 0.01;
  return +(valorOS * pctDia * iaeDias).toFixed(2);
}

export function faixaIAE(iaeDias: number): "OK" | "MODERADA" | "GRAVE" {
  if (iaeDias <= 5) return "OK";
  if (iaeDias <= 15) return "MODERADA";
  return "GRAVE";
}

/** Aplica IAE + glosa a uma OS concluída e devolve os campos atualizados. */
export function aplicaIAE(os: OrdemServico, dataConclusaoISO: string) {
  const iae = calcIAE(os.dataLimite, dataConclusaoISO);
  const glosa = calcGlosaIAE(iae, os.valorOS);
  return {
    dataConclusao: dataConclusaoISO,
    iaeDias: iae,
    glosaCalculada: glosa,
    glosaFinal: glosa,
  };
}

/** Datas de alerta a partir de um contrato — todas em YYYY-MM-DD. */
export function alertasContrato(c: Contrato, hojeISO = new Date().toISOString().slice(0, 10)) {
  const alertas: { tipo: "GARANTIA" | "ANIVERSARIO" | "REAJUSTE" | "ENCERRAMENTO"; texto: string; dias: number; severidade: "info" | "warning" | "danger" }[] = [];

  if (c.garantia) {
    const dias = diffDias(hojeISO, c.garantia.vigenciaFim);
    if (dias >= 0 && dias <= 90) {
      alertas.push({
        tipo: "GARANTIA",
        texto: `Garantia contratual vence em ${dias} dia(s) (${c.garantia.vigenciaFim}).`,
        dias,
        severidade: dias <= 30 ? "danger" : "warning",
      });
    } else if (dias < 0) {
      alertas.push({
        tipo: "GARANTIA",
        texto: `Garantia contratual vencida há ${-dias} dia(s).`,
        dias,
        severidade: "danger",
      });
    }
  }

  const diasEncerramento = diffDias(hojeISO, c.vigenciaFim);
  if (diasEncerramento >= 0 && diasEncerramento <= 60) {
    alertas.push({
      tipo: "ANIVERSARIO",
      texto: `Aniversário / encerramento contratual em ${diasEncerramento} dia(s) — janela de decisão sobre prorrogação.`,
      dias: diasEncerramento,
      severidade: diasEncerramento <= 30 ? "danger" : "warning",
    });
  }

  if (c.reajuste?.proximoElegivelEm) {
    const dias = diffDias(hojeISO, c.reajuste.proximoElegivelEm);
    if (dias <= 0) {
      alertas.push({
        tipo: "REAJUSTE",
        texto: `Contrato já elegível a reajuste (${c.reajuste.indice}).`,
        dias,
        severidade: "info",
      });
    } else if (dias <= 30) {
      alertas.push({
        tipo: "REAJUSTE",
        texto: `Reajuste elegível em ${dias} dia(s) (${c.reajuste.indice}).`,
        dias,
        severidade: "info",
      });
    }
  }
  return alertas;
}

export function brl(n: number): string {
  return new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(n);
}
