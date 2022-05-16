
export function isTelephoneNumber(telephone: string): boolean {
    return !! telephone.match(
      /.*$/
    );
}