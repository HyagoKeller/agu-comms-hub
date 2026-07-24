// Motor IMR — funções puras para cálculo de indicadores contratuais
// Referência: TR item 7.1 (IAE, IAR, IST) — Contrato STFC 12/2026
import type { ChamadoTecnico, Contrato, OrdemServico, RelatorioIAR, SeveridadeChamado } from "./types";
import { SEVERIDADES } from "./types";

/** Diferença em dias corridos entre duas datas. */
export function diffDias(inicioISO: string, fimISO: string): number {
  const a = new Date(inicioISO).getTime();
  const b = new Date(fimISO).getTime();
  return Math.floor((b - a) / (1000 * 60 * 60 * 24));
}

/** Diferença em horas. */
export function diffHoras(inicioISO: string, fimISO: string): number {
  const a = new Date(inicioISO).getTime();
  const b = new Date(fimISO).getTime();
  return (b - a) / (1000 * 60 * 60);
}

/** Soma dias corridos a uma data. */
export function addDias(baseISO: string, dias: number): string {
  const d = new Date(baseISO);
  d.setDate(d.getDate() + dias);
  return d.toISOString().slice(0, 10);
}

/** Dias úteis entre duas datas (seg-sex, sem feriados). */
export function diffDiasUteis(inicioISO: string, fimISO: string): number {
  const start = new Date(inicioISO);
  const end = new Date(fimISO);
  if (end < start) return 0;
  let dias = 0;
  const cur = new Date(start);
  while (cur <= end) {
    const d = cur.getDay();
    if (d !== 0 && d !== 6) dias++;
    cur.setDate(cur.getDate() + 1);
  }
  return Math.max(0, dias - 1);
}

// =============== IAE ===============

export function calcIAE(dataLimiteISO: string, dataConclusaoISO: string): number {
  return diffDias(dataLimiteISO, dataConclusaoISO);
}

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

// =============== IST (chamados técnicos) ===============

export function severidadeDef(sev: SeveridadeChamado) {
  return SEVERIDADES.find((s) => s.value === sev)!;
}

/**
 * Avalia conformidade e glosa IST de um chamado solucionado.
 * Regra: se a solução respeitar o prazoSolucaoH, o chamado é conforme e glosa = 0.
 * Caso contrário, glosa = valorMensalOS × penalidadeHoraPct% × horas_excedentes.
 */
export function avaliaChamado(c: ChamadoTecnico) {
  if (!c.solucionadoEm) return { conforme: undefined, glosaIST: 0 };
  const def = severidadeDef(c.severidade);
  const horas = diffHoras(c.abertoEm, c.solucionadoEm);
  if (horas <= def.prazoSolucaoH) return { conforme: true, glosaIST: 0 };
  const excedente = horas - def.prazoSolucaoH;
  const glosa = +(c.valorMensalOS * (def.penalidadeHoraPct / 100) * excedente).toFixed(2);
  return { conforme: false, glosaIST: glosa };
}

/** Índice IST do período: conformes/total × 100. Meta = 100%. */
export function calcISTMensal(chamados: ChamadoTecnico[]): { total: number; conformes: number; pct: number } {
  const finalizados = chamados.filter((c) => c.status === "SOLUCIONADO");
  const total = finalizados.length;
  const conformes = finalizados.filter((c) => c.conforme).length;
  const pct = total === 0 ? 100 : +((conformes / total) * 100).toFixed(1);
  return { total, conformes, pct };
}

// =============== IAR (relatório semestral) ===============

/**
 * Regra IAR (TR): 2%/dia útil de atraso sobre valor mensal, teto 10%.
 * Após 5 dias úteis, sinaliza inexecução parcial.
 */
export function calcIAR(r: Pick<RelatorioIAR, "prazoEntrega" | "dataUpload" | "valorMensalReferencia">) {
  if (!r.dataUpload) return { diasUteisAtraso: 0, glosaIAR: 0, percentualGlosa: 0, inexecucao: false };
  const dataUploadISO = r.dataUpload.slice(0, 10);
  if (dataUploadISO <= r.prazoEntrega) return { diasUteisAtraso: 0, glosaIAR: 0, percentualGlosa: 0, inexecucao: false };
  const dias = diffDiasUteis(r.prazoEntrega, dataUploadISO);
  const pct = Math.min(10, dias * 2);
  const glosa = +(r.valorMensalReferencia * (pct / 100)).toFixed(2);
  return { diasUteisAtraso: dias, glosaIAR: glosa, percentualGlosa: pct, inexecucao: dias > 5 };
}

// =============== Alertas contratuais ===============

export function alertasContrato(c: Contrato, hojeISO = new Date().toISOString().slice(0, 10)) {
  const alertas: { tipo: "GARANTIA" | "ANIVERSARIO" | "REAJUSTE" | "ENCERRAMENTO"; texto: string; dias: number; severidade: "info" | "warning" | "danger" }[] = [];

  if (c.garantia) {
    const dias = diffDias(hojeISO, c.garantia.vigenciaFim);
    if (dias >= 0 && dias <= 90) {
      alertas.push({ tipo: "GARANTIA", texto: `Garantia contratual vence em ${dias} dia(s) (${c.garantia.vigenciaFim}).`, dias, severidade: dias <= 30 ? "danger" : "warning" });
    } else if (dias < 0) {
      alertas.push({ tipo: "GARANTIA", texto: `Garantia contratual vencida há ${-dias} dia(s).`, dias, severidade: "danger" });
    }
  }

  const diasEncerramento = diffDias(hojeISO, c.vigenciaFim);
  if (diasEncerramento >= 0 && diasEncerramento <= 60) {
    alertas.push({ tipo: "ANIVERSARIO", texto: `Aniversário / encerramento contratual em ${diasEncerramento} dia(s) — janela de decisão sobre prorrogação.`, dias: diasEncerramento, severidade: diasEncerramento <= 30 ? "danger" : "warning" });
  }

  if (c.reajuste?.proximoElegivelEm) {
    const dias = diffDias(hojeISO, c.reajuste.proximoElegivelEm);
    if (dias <= 0) alertas.push({ tipo: "REAJUSTE", texto: `Contrato já elegível a reajuste (${c.reajuste.indice}).`, dias, severidade: "info" });
    else if (dias <= 30) alertas.push({ tipo: "REAJUSTE", texto: `Reajuste elegível em ${dias} dia(s) (${c.reajuste.indice}).`, dias, severidade: "info" });
  }
  return alertas;
}

export function brl(n: number): string {
  return new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(n);
}
