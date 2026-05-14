type Tone = "info" | "success" | "danger" | "warning" | "neutral";

const tones: Record<Tone, string> = {
  info: "bg-gov-blue-light text-gov-blue-dark border-gov-blue/30",
  success: "bg-[oklch(0.94_0.06_155)] text-gov-success border-gov-success/40",
  danger: "bg-[oklch(0.95_0.05_27)] text-gov-danger border-gov-danger/40",
  warning: "bg-[oklch(0.96_0.1_78)] text-[oklch(0.45_0.13_70)] border-gov-yellow",
  neutral: "bg-muted text-muted-foreground border-border",
};

export function GovTag({ children, tone = "info" }: { children: React.ReactNode; tone?: Tone }) {
  return (
    <span className={`inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold ${tones[tone]}`}>
      {children}
    </span>
  );
}

export function StatusBadge({ status }: { status: string }) {
  const map: Record<string, Tone> = {
    ATIVO: "success",
    DISPONIVEL: "info",
    MANUTENCAO: "warning",
    BLOQUEADO: "danger",
    INATIVO: "neutral",
    CONFORME: "success",
    NAO_SINCRONIZADO: "warning",
    VIOLACAO: "danger",
    NA: "neutral",
    ASSINADO: "success",
    PENDENTE: "warning",
  };
  const labels: Record<string, string> = {
    ATIVO: "Ativo",
    DISPONIVEL: "Disponível",
    MANUTENCAO: "Manutenção",
    BLOQUEADO: "Bloqueado",
    INATIVO: "Inativo",
    CONFORME: "Conforme",
    NAO_SINCRONIZADO: "Não sincronizado",
    VIOLACAO: "Violação",
    NA: "N/A",
    ASSINADO: "Assinado",
    PENDENTE: "Pendente",
  };
  return <GovTag tone={map[status] ?? "neutral"}>{labels[status] ?? status}</GovTag>;
}
