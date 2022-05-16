
export function isCPF(cpf: string): boolean {
    return !! cpf.match(
      /.*$/
    );
}