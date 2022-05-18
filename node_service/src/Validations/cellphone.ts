
export interface cellphone {
    DDI: string,
    DDD: string,
    number: string,
}

const cellphoneRegex = /^(\+55)?\s?(?<DDD>\(\d*\))\s*(?<number>(\d|\s|-)*)$/;

export function isCellphoneNumber(cellphone: string): boolean {
    return !!cellphone.match(cellphoneRegex);
}

export function splitCellphoneNumber(cellphone: string): cellphone {
    var match = cellphoneRegex.exec(cellphone);

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