/**
 * Utilidades de privacidad y protección de datos personales (Ley N° 29733 / Principio de Minimización)
 */

/**
 * Enmascara nombres legales estilo Yape en Perú:
 * Muestra nombres de pila legibles y oculta apellidos preservando solo las iniciales.
 * Ej: "Ladi Jose Villanueva Colonia" -> "Ladi Jose Vi*** Co***"
 */
export function maskNameYape(
  fullName: string,
  firstName?: string,
  secondName?: string,
  paternalSurname?: string,
  maternalSurname?: string
): string {
  if (firstName && paternalSurname) {
    const s1 = secondName ? ` ${secondName}` : "";
    const p1 =
      paternalSurname.length > 2
        ? `${paternalSurname.slice(0, 2)}***`
        : `${paternalSurname}*`;
    const m1 = maternalSurname
      ? maternalSurname.length > 2
        ? ` ${maternalSurname.slice(0, 2)}***`
        : ` ${maternalSurname}*`
      : "";
    return `${firstName}${s1} ${p1}${m1}`.trim();
  }

  const parts = fullName.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return "Usuario";
  if (parts.length === 1) return parts[0];
  if (parts.length === 2) {
    const p = parts[1].length > 2 ? `${parts[1].slice(0, 2)}***` : `${parts[1]}*`;
    return `${parts[0]} ${p}`;
  }
  if (parts.length >= 3) {
    const nombres = parts.slice(0, parts.length - 2).join(" ");
    const apP = parts[parts.length - 2];
    const apM = parts[parts.length - 1];
    const pP = apP.length > 2 ? `${apP.slice(0, 2)}***` : `${apP}*`;
    const pM = apM.length > 2 ? `${apM.slice(0, 2)}***` : `${apM}*`;
    return `${nombres} ${pP} ${pM}`;
  }
  return fullName;
}

/**
 * Censura la dirección de correo electrónico para evitar scraping y perfilado.
 * Ej: "erickarturo@gmail.com" -> "er••••••o@gmail.com"
 */
export function maskEmailAddress(email: string): string {
  if (!email || !email.includes("@")) return "•••••••@••••.com";
  const [local, domain] = email.split("@");
  if (local.length <= 2) return `${local[0]}*@${domain}`;
  const first = local.slice(0, 2);
  const last = local.slice(-1);
  const dots = "•".repeat(Math.min(6, Math.max(3, local.length - 3)));
  return `${first}${dots}${last}@${domain}`;
}
