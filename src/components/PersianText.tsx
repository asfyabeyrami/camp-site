export function toPersianDigits(str: string | number): string {
  if (typeof str === "number") str = str.toString();
  const enDigits = "0123456789";
  const faDigits = "۰۱۲۳۴۵۶۷۸۹";
  return str.replace(/[0-9]/g, (w) => faDigits[enDigits.indexOf(w)]);
}
