
export interface telephone {
    DDI: string,
    DDD: string,
    number: string,
}

const telephoneRegex = /^(\+55)?\s?(?<DDD>\(\d*\))\s*(?<number>(\d|\s|-)*)$/;

export function isTelephoneNumber(telephone: string): boolean {
    return !!telephone.match(telephoneRegex);
}

export function splitTelephoneNumber(telephone: string): telephone {
    var match = telephoneRegex.exec(telephone);

    if (!match)
        return {
            DDI: "+55",
            DDD: "",
            number: "",
        };

    return {
        DDI: "+55",
        DDD: match.groups?.DDD || "",
        number: match.groups?.number || "",
    };
}