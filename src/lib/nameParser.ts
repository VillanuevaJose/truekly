/**
 * Utilidades de parseo y formato de nombres para el flujo de registro.
 */

export interface ParsedNombres {
  primerNombre: string;
  segundoNombre: string;
  apellidoPaterno: string;
  apellidoMaterno: string;
}

export interface ReniecRawData {
  nombres?: string;
  apellidoPaterno?: string;
  apellidoMaterno?: string;
  nombreCompleto?: string;
}

/**
 * Convierte un texto a Capitalizado (Title Case) preservando espacios y tildes.
 * Ej: "LADI JOSE" -> "Ladi Jose", "DE LA CRUZ" -> "De La Cruz"
 */
export function toTitleCase(str: string): string {
  if (!str) return "";
  return str
    .toLowerCase()
    .split(/\s+/)
    .filter(Boolean)
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");
}

// Partículas compuestas de 2 palabras (ej. "de la", "de los", "van der", "san martin", "santa maria")
const PARTICULAS_DOBLE_PALABRA = new Set([
  "de la",
  "de las",
  "de los",
  "van der",
  "van den",
  "san martin",
  "santa maria",
  "santa cruz",
]);

// Partículas simples de 1 palabra
const PARTICULAS_UNA_PALABRA = new Set([
  "de",
  "del",
  "san",
  "santa",
  "santo",
  "van",
  "von",
  "da",
  "di",
  "dos",
  "du",
  "le",
  "la",
  "mc",
  "mac",
]);

/**
 * Extrae un apellido desde el final de una lista de palabras, considerando partículas compuestas.
 */
function extractSurnameFromEnd(words: string[]): { surname: string; remaining: string[] } {
  if (words.length === 0) return { surname: "", remaining: [] };
  if (words.length === 1) return { surname: words[0], remaining: [] };

  // 1. Revisar si hay partícula de 2 palabras antes del apellido (ej: ["DE", "LA", "CRUZ"])
  if (words.length >= 3) {
    const twoPrefix = `${words[words.length - 3]} ${words[words.length - 2]}`.toLowerCase();
    if (PARTICULAS_DOBLE_PALABRA.has(twoPrefix)) {
      const surname = words.slice(words.length - 3).join(" ");
      return { surname, remaining: words.slice(0, words.length - 3) };
    }
  }

  // 2. Revisar si hay partícula de 1 palabra antes del apellido (ej: ["DEL", "RIO"], ["SAN", "MARTIN"])
  if (words.length >= 2) {
    const onePrefix = words[words.length - 2].toLowerCase();
    if (PARTICULAS_UNA_PALABRA.has(onePrefix)) {
      const surname = words.slice(words.length - 2).join(" ");
      return { surname, remaining: words.slice(0, words.length - 2) };
    }
  }

  // 3. Palabra simple como apellido
  const surname = words[words.length - 1];
  return { surname, remaining: words.slice(0, -1) };
}

/**
 * Parsea la respuesta de RENIEC / Decolecta y extrae los nombres en formato Capitalizado.
 */
export function parseReniecNombres(data: ReniecRawData): ParsedNombres {
  const rawPaterno = (data.apellidoPaterno || "").trim();
  const rawMaterno = (data.apellidoMaterno || "").trim();
  const rawNombres = (data.nombres || "").trim();

  // Caso 1: La API ya devolvió apellidos y nombres separados
  if (rawPaterno || rawMaterno || rawNombres) {
    const nombresTokens = rawNombres.split(/\s+/).filter(Boolean);
    const primerNombre = nombresTokens[0] || "";
    const segundoNombre = nombresTokens.slice(1).join(" ") || "";

    return {
      primerNombre: toTitleCase(primerNombre),
      segundoNombre: toTitleCase(segundoNombre),
      apellidoPaterno: toTitleCase(rawPaterno),
      apellidoMaterno: toTitleCase(rawMaterno),
    };
  }

  // Caso 2: Solo viene un string completo (nombreCompleto)
  const full = (data.nombreCompleto || "").trim();
  if (!full) {
    return {
      primerNombre: "",
      segundoNombre: "",
      apellidoPaterno: "",
      apellidoMaterno: "",
    };
  }

  const tokens = full.split(/\s+/).filter(Boolean);

  if (tokens.length === 1) {
    return {
      primerNombre: toTitleCase(tokens[0]),
      segundoNombre: "",
      apellidoPaterno: "",
      apellidoMaterno: "",
    };
  }

  if (tokens.length === 2) {
    return {
      primerNombre: toTitleCase(tokens[0]),
      segundoNombre: "",
      apellidoPaterno: toTitleCase(tokens[1]),
      apellidoMaterno: "",
    };
  }

  if (tokens.length === 3) {
    const lastTwoPrefix = `${tokens[1]} ${tokens[2]}`.toLowerCase();
    const midPrefix = tokens[1].toLowerCase();

    // Si las dos últimas palabras son un apellido compuesto (ej: "ANA DEL RIO", "ANA SAN MARTIN")
    if (PARTICULAS_DOBLE_PALABRA.has(lastTwoPrefix) || PARTICULAS_UNA_PALABRA.has(midPrefix)) {
      return {
        primerNombre: toTitleCase(tokens[0]),
        segundoNombre: "",
        apellidoPaterno: toTitleCase(`${tokens[1]} ${tokens[2]}`),
        apellidoMaterno: "",
      };
    }

    // Estructura habitual de 3 palabras: Nombre ApellidoPaterno ApellidoMaterno (ej: "JUAN PEREZ GOMEZ")
    return {
      primerNombre: toTitleCase(tokens[0]),
      segundoNombre: "",
      apellidoPaterno: toTitleCase(tokens[1]),
      apellidoMaterno: toTitleCase(tokens[2]),
    };
  }

  // Para 4 o más palabras:
  // Extraer apellido materno del final
  const maternoResult = extractSurnameFromEnd(tokens);
  const apellidoMaterno = maternoResult.surname;

  // Extraer apellido paterno del resto
  const paternoResult = extractSurnameFromEnd(maternoResult.remaining);
  const apellidoPaterno = paternoResult.surname;

  // El remanente son los nombres (primer nombre + segundo nombre)
  const nombresTokens = paternoResult.remaining;
  const primerNombre = nombresTokens[0] || "";
  const segundoNombre = nombresTokens.slice(1).join(" ") || "";

  return {
    primerNombre: toTitleCase(primerNombre),
    segundoNombre: toTitleCase(segundoNombre),
    apellidoPaterno: toTitleCase(apellidoPaterno),
    apellidoMaterno: toTitleCase(apellidoMaterno),
  };
}
