import * as XLSX from "xlsx";
import type { Ativo, AtivoTipo, Regiao, WhatsappNumero } from "./types";
import { uid } from "./store";

const UF_TO_REGIAO: Record<string, Regiao> = {
  // R1
  AC: "R1", AM: "R1", AP: "R1", PA: "R1", RO: "R1", RR: "R1", TO: "R1", MA: "R1",
  // R2
  PI: "R2", CE: "R2", RN: "R2", PB: "R2",
  // R3 SP
  SP: "R3",
  // R4 RJ + ES + MG
  RJ: "R4", ES: "R4", MG: "R4",
  // R5 PE/AL/SE/BA
  PE: "R5", AL: "R5", SE: "R5", BA: "R5",
  // R6 Sul + MT/MS/GO + DF
  RS: "R6", SC: "R6", PR: "R6", MT: "R6", MS: "R6", GO: "R6", DF: "R6",
};

function norm(s: unknown): string {
  return String(s ?? "")
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .trim();
}

function findKey(row: Record<string, unknown>, candidates: string[]): unknown {
  const keys = Object.keys(row);
  for (const c of candidates) {
    const cn = norm(c);
    const k = keys.find((kk) => norm(kk) === cn || norm(kk).includes(cn));
    if (k && row[k] !== undefined && row[k] !== null && String(row[k]).trim() !== "") return row[k];
  }
  return undefined;
}

function detectRegiao(uf?: unknown, estado?: unknown): Regiao {
  const u = norm(uf).toUpperCase();
  if (u && UF_TO_REGIAO[u]) return UF_TO_REGIAO[u];
  const e = norm(estado);
  if (e.includes("brasilia") || e.includes("df")) return "R6";
  if (e.includes("recife") || e.includes("salvador")) return "R5";
  if (e.includes("rio") || e.includes("belo horizonte")) return "R4";
  if (e.includes("sao paulo")) return "R3";
  return "R6";
}

export interface SheetReport {
  sheet: string;
  detectedAs: "PABX_BSB" | "PABX_ESTADOS" | "APARELHOS_DISPONIVEIS" | "APARELHOS_ENVIADOS" | "APARELHOS_INVENTARIO" | "RAMAIS_DISPONIVEIS" | "SOFTPHONES" | "DESCONHECIDO";
  rowsTotal: number;
  ativos: Ativo[];
  whats: WhatsappNumero[];
  sample: Record<string, unknown>[];
}

function readRowsWithDetectedHeader(ws: XLSX.WorkSheet): Record<string, unknown>[] {
  // Some sheets have a label row before headers (e.g. Softphones (tipo 3)).
  // Strategy: read raw, find first row containing meaningful header tokens.
  const matrix = XLSX.utils.sheet_to_json<unknown[]>(ws, { header: 1, defval: null });
  let headerIdx = 0;
  for (let i = 0; i < Math.min(matrix.length, 5); i++) {
    const row = (matrix[i] ?? []).map((c) => norm(c));
    const score = row.filter((c) =>
      ["ramal", "login", "usuario", "mac", "modelo", "estado", "uf", "domínio", "dominio", "msisdn", "telefone", "numero"].some((tok) => c.includes(tok)),
    ).length;
    if (score >= 2) { headerIdx = i; break; }
  }
  const headers = (matrix[headerIdx] ?? []).map((h, i) => String(h ?? `col_${i}`));
  return matrix.slice(headerIdx + 1).map((row) => {
    const obj: Record<string, unknown> = {};
    headers.forEach((h, i) => { obj[h] = row?.[i] ?? null; });
    return obj;
  });
}

function classifySheet(name: string, headers: string[]): SheetReport["detectedAs"] {
  const n = norm(name);
  const hs = headers.map(norm).join(" ");
  if (n.includes("aparelhos enviados")) return "APARELHOS_ENVIADOS";
  if (n.includes("aparelhos disponiveis") || n.includes("aparelhos disponíveis")) return "APARELHOS_DISPONIVEIS";
  if (n === "aparelhos") return "APARELHOS_INVENTARIO";
  if (n.includes("softphone")) return "SOFTPHONES";
  if (n.includes("ramais") && n.includes("disponiveis")) return "RAMAIS_DISPONIVEIS";
  if (n === "bsb" || n.includes("brasilia")) return "PABX_BSB";
  if (n === "estados" || hs.includes("uf")) return "PABX_ESTADOS";
  return "DESCONHECIDO";
}

function makeAtivoFromPabx(row: Record<string, unknown>, sheet: string, tipo: AtivoTipo = "RAMAL_FISICO"): Ativo | null {
  const ramal = findKey(row, ["Ramal", "Label", "Identificador"]);
  if (!ramal) return null;
  const uf = findKey(row, ["UF"]);
  const estado = findKey(row, ["Estado"]);
  const regiao = detectRegiao(uf, estado);
  const mac = findKey(row, ["MAC Address", "Endereço MAC", "Endereco MAC", "MAC"]);
  const modelo = findKey(row, ["Modelo Aparelho", "Modelo"]);
  const login = findKey(row, ["Login"]);
  const usuario = findKey(row, ["Usuário", "Usuario"]);
  const setor = findKey(row, ["Setor"]);
  const dominio = findKey(row, ["Domínio", "Dominio"]);
  const ip = findKey(row, ["IP"]);
  const fabricante = findKey(row, ["Fabricante"]);
  const status = norm(findKey(row, ["Status"]));
  const tipoFinal: AtivoTipo = sheet.toLowerCase().includes("softphone") ? "SOFTPHONE" : tipo;
  return {
    id: uid("a_"),
    categoria: "PABX",
    identificador: String(ramal).trim(),
    tipo: tipoFinal,
    catWhats: null,
    regiao,
    unidade: estado ? String(estado).split("(")[0].trim() : (uf ? `${uf}` : "SEDE"),
    usuarioNome: usuario ? String(usuario) : undefined,
    usuarioLogin: login ? String(login) : undefined,
    setor: setor ? String(setor) : undefined,
    enderecoMac: mac ? String(mac).toUpperCase() : undefined,
    status: status.includes("inativ") ? "INATIVO" : status.includes("disponiv") ? "DISPONIVEL" : "ATIVO",
    statusMDM: "NA",
    statusTermo: usuario ? "ASSINADO" : "NA",
    dominio: dominio ? String(dominio) : undefined,
    ip: ip ? String(ip) : undefined,
    modeloAparelho: modelo ? String(modelo) : undefined,
    fabricante: fabricante ? String(fabricante) : undefined,
    permissaoChamada: String(findKey(row, ["Permissão de chamada", "Permissao de chamada"]) ?? "") || undefined,
    hotdesking: String(findKey(row, ["Hotdesking Status", "Hotdesking"]) ?? "") || undefined,
    origemImport: sheet,
    criadoEm: new Date().toISOString(),
  };
}

function makeAtivoFromAparelho(row: Record<string, unknown>, sheet: string): Ativo | null {
  const mac = findKey(row, ["MAC Address", "Endereço MAC", "Endereco MAC", "MAC"]);
  const label = findKey(row, ["Label"]);
  if (!mac && !label) return null;
  const modelo = findKey(row, ["Modelo"]);
  const estado = findKey(row, ["Estado", "Brasília", "Brasilia"]);
  const uf = findKey(row, ["Administrador", "UF"]);
  const regiao = detectRegiao(uf, estado);
  return {
    id: uid("a_"),
    categoria: "PABX",
    identificador: String(label ?? mac ?? "").trim(),
    tipo: "RAMAL_FISICO",
    catWhats: null,
    regiao,
    unidade: estado ? String(estado) : "Estoque",
    enderecoMac: mac ? String(mac).toUpperCase() : undefined,
    modeloAparelho: modelo ? String(modelo) : undefined,
    fabricante: String(findKey(row, ["Fabricante"]) ?? "Yealink"),
    status: "DISPONIVEL",
    statusMDM: "NA",
    statusTermo: "NA",
    origemImport: sheet,
    criadoEm: new Date().toISOString(),
  };
}

function makeWhatsFromRow(row: Record<string, unknown>, sheet: string): WhatsappNumero | null {
  const msisdn = findKey(row, ["MSISDN", "Telefone", "Número", "Numero", "Linha", "Celular"]);
  if (!msisdn) return null;
  const uf = findKey(row, ["UF", "Estado"]);
  return {
    id: uid("w_"),
    msisdn: String(msisdn).trim(),
    operadora: String(findKey(row, ["Operadora"]) ?? "") || undefined,
    plano: String(findKey(row, ["Plano"]) ?? "") || undefined,
    categoria: "MESSENGER_PESSOAL",
    responsavelNome: String(findKey(row, ["Usuário", "Usuario", "Responsável", "Responsavel"]) ?? "") || undefined,
    responsavelLogin: String(findKey(row, ["Login", "E-mail", "Email"]) ?? "") || undefined,
    setor: String(findKey(row, ["Setor"]) ?? "") || undefined,
    regiao: detectRegiao(uf),
    unidade: String(findKey(row, ["Unidade", "Estado"]) ?? "—"),
    statusMDM: "NAO_SINCRONIZADO",
    statusTermo: "PENDENTE",
    status: "ATIVO",
    criadoEm: new Date().toISOString(),
  };
}

export function parseWorkbook(buf: ArrayBuffer): SheetReport[] {
  const wb = XLSX.read(buf, { type: "array" });
  const reports: SheetReport[] = [];
  for (const sheet of wb.SheetNames) {
    const ws = wb.Sheets[sheet];
    const rows = readRowsWithDetectedHeader(ws);
    const headers = rows.length ? Object.keys(rows[0]) : [];
    const detectedAs = classifySheet(sheet, headers);
    const ativos: Ativo[] = [];
    const whats: WhatsappNumero[] = [];

    for (const row of rows) {
      // Skip rows where all values are null/empty
      if (Object.values(row).every((v) => v === null || String(v).trim() === "")) continue;
      switch (detectedAs) {
        case "PABX_BSB":
        case "PABX_ESTADOS":
        case "RAMAIS_DISPONIVEIS": {
          const a = makeAtivoFromPabx(row, sheet);
          if (a) ativos.push(a);
          break;
        }
        case "SOFTPHONES": {
          const a = makeAtivoFromPabx(row, sheet, "SOFTPHONE");
          if (a) ativos.push(a);
          break;
        }
        case "APARELHOS_INVENTARIO":
        case "APARELHOS_DISPONIVEIS":
        case "APARELHOS_ENVIADOS": {
          const a = makeAtivoFromAparelho(row, sheet);
          if (a) ativos.push(a);
          break;
        }
        default: {
          // Try whats heuristically
          const w = makeWhatsFromRow(row, sheet);
          if (w) whats.push(w);
        }
      }
    }

    reports.push({
      sheet,
      detectedAs,
      rowsTotal: rows.length,
      ativos,
      whats,
      sample: rows.slice(0, 3),
    });
  }
  return reports;
}
