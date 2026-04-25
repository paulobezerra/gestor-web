import type { Ref } from 'vue'

export function maskCpf(value: string): string {
  const d = value.replace(/\D/g, '').slice(0, 11)
  return d
    .replace(/(\d{3})(\d)/, '$1.$2')
    .replace(/(\d{3})(\d)/, '$1.$2')
    .replace(/(\d{3})(\d{1,2})$/, '$1-$2')
}

export function maskCnpj(value: string): string {
  const d = value.replace(/\D/g, '').slice(0, 14)
  return d
    .replace(/(\d{2})(\d)/, '$1.$2')
    .replace(/(\d{3})(\d)/, '$1.$2')
    .replace(/(\d{3})(\d)/, '$1/$2')
    .replace(/(\d{4})(\d{1,2})$/, '$1-$2')
}

export function maskCep(value: string): string {
  const d = value.replace(/\D/g, '').slice(0, 8)
  return d.replace(/(\d{5})(\d{1,3})$/, '$1-$2')
}

export function maskTelefone(value: string): string {
  const d = value.replace(/\D/g, '').slice(0, 9)
  if (d.length <= 8) return d.replace(/(\d{4})(\d{1,4})$/, '$1-$2')
  return d.replace(/(\d{5})(\d{1,4})$/, '$1-$2')
}

export function stripMask(value: string): string {
  return (value ?? '').replace(/\D/g, '')
}

/** Retorna handler @input que aplica a máscara e sincroniza o field do vee-validate. */
export function maskHandler(field: Ref<string | undefined>, maskFn: (v: string) => string) {
  return (e: Event) => {
    const input = e.target as HTMLInputElement
    const masked = maskFn(input.value)
    input.value = masked
    field.value = masked
  }
}
