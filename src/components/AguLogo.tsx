import logo from "@/assets/agu-logo.png";

export function AguLogo({ size = 44, className = "" }: { size?: number; className?: string }) {
  return (
    <img
      src={logo}
      alt="Logotipo da Advocacia-Geral da União"
      width={size}
      height={size}
      className={`block shrink-0 rounded-xl shadow-sm ${className}`}
      style={{ width: size, height: size }}
    />
  );
}
