
const cpfRegex = /^(?<cpf>\d\d\d.\d\d\d.\d\d\d-\d\d)$/;

export function isCPF(cpf: string): boolean {
    return !!cpf.match(cpfRegex);
}