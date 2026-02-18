/**
 * Utilitários para formatação de datas no padrão brasileiro
 */

const MESES_EXTENSO = [
  "janeiro",
  "fevereiro",
  "março",
  "abril",
  "maio",
  "junho",
  "julho",
  "agosto",
  "setembro",
  "outubro",
  "novembro",
  "dezembro",
] as const;

const MESES_ABREVIADO = [
  "jan",
  "fev",
  "mar",
  "abr",
  "mai",
  "jun",
  "jul",
  "ago",
  "set",
  "out",
  "nov",
  "dez",
] as const;

/**
 * Formata mesAno (YYYY-MM) para formato legível em português
 * @param mesAno - String no formato "YYYY-MM" (ex: "2024-12")
 * @param formato - "extenso" (dezembro de 2024), "abreviado" (dez/2024), ou "compacto" (12/2024)
 * @returns String formatada
 * @example
 * formatarMesAno("2024-12", "extenso") // "dezembro de 2024"
 * formatarMesAno("2024-12", "abreviado") // "dez/2024"
 * formatarMesAno("2024-12", "compacto") // "12/2024"
 */
export function formatarMesAno(
  mesAno: string,
  formato: "extenso" | "abreviado" | "compacto" = "extenso",
): string {
  const partes = mesAno.split("-");
  const ano = partes[0];
  const mes = partes[1];

  if (!ano || !mes) {
    throw new Error(`Formato inválido: ${mesAno}. Esperado YYYY-MM.`);
  }

  const mesNumero = parseInt(mes, 10);

  if (mesNumero < 1 || mesNumero > 12) {
    throw new Error(`Mês inválido: ${mes}. Esperado valor entre 01 e 12.`);
  }

  const indiceMes = mesNumero - 1;

  switch (formato) {
    case "extenso":
      return `${MESES_EXTENSO[indiceMes]} de ${ano}`;
    case "abreviado":
      return `${MESES_ABREVIADO[indiceMes]}/${ano}`;
    case "compacto":
      return `${mes}/${ano}`;
    default:
      return `${MESES_EXTENSO[indiceMes]} de ${ano}`;
  }
}

/**
 * Formata data completa (YYYY-MM-DD) para formato brasileiro DD/MM/YYYY
 * @param dataISO - String no formato ISO "YYYY-MM-DD" (ex: "2024-12-31")
 * @returns String no formato "DD/MM/YYYY"
 * @example
 * formatBrazilianDate("2024-12-31") // "31/12/2024"
 */
export function formatBrazilianDate(dataISO: string): string {
  const partes = dataISO.split("-");
  const ano = partes[0];
  const mes = partes[1];
  const dia = partes[2];
  return `${dia}/${mes}/${ano}`;
}

/**
 * Formata timestamp ISO para formato legível brasileiro com hora
 * @param timestampISO - String ISO 8601 (ex: "2024-12-31T14:30:00Z")
 * @returns String no formato "DD/MM/YYYY às HH:MM"
 * @example
 * formatBrazilianTimestamp("2024-12-31T14:30:00Z") // "31/12/2024 às 14:30"
 */
export function formatBrazilianTimestamp(timestampISO: string): string {
  const data = new Date(timestampISO);

  const dia = String(data.getDate()).padStart(2, "0");
  const mes = String(data.getMonth() + 1).padStart(2, "0");
  const ano = data.getFullYear();
  const horas = String(data.getHours()).padStart(2, "0");
  const minutos = String(data.getMinutes()).padStart(2, "0");

  return `${dia}/${mes}/${ano} às ${horas}:${minutos}`;
}

/**
 * Converte formato brasileiro DD/MM/YYYY para ISO YYYY-MM-DD
 * @param dataBrasileira - String no formato "DD/MM/YYYY"
 * @returns String no formato ISO "YYYY-MM-DD"
 * @example
 * converterParaISO("31/12/2024") // "2024-12-31"
 */
export function converterParaISO(dataBrasileira: string): string {
  const partes = dataBrasileira.split("/");
  const dia = partes[0];
  const mes = partes[1];
  const ano = partes[2];
  return `${ano}-${mes}-${dia}`;
}

/**
 * Obtém o mês anterior ao mesAno fornecido
 * @param mesAno - String no formato "YYYY-MM"
 * @returns String no formato "YYYY-MM" do mês anterior
 * @example
 * obterMesAnterior("2024-01") // "2023-12"
 * obterMesAnterior("2024-12") // "2024-11"
 */
export function obterMesAnterior(mesAno: string): string {
  const partes = mesAno.split("-").map(Number);
  const ano = partes[0] ?? 0;
  const mes = partes[1] ?? 0;

  if (mes === 1) {
    // Janeiro -> Dezembro do ano anterior
    return `${ano - 1}-12`;
  }

  const mesAnterior = mes - 1;
  return `${ano}-${String(mesAnterior).padStart(2, "0")}`;
}

/**
 * Valida se uma string está no formato mesAno válido (YYYY-MM)
 * @param mesAno - String a ser validada
 * @returns true se válido, false caso contrário
 */
export function validarMesAno(mesAno: string): boolean {
  const regex = /^\d{4}-(0[1-9]|1[0-2])$/;
  return regex.test(mesAno);
}
