import {ColorBalance} from "./ColorBalance/ColorBalance";
import {Sepia} from "./Sepia/Sepia";
import {BaseFilterConstructor} from "../struct/BaseFilter";

export const Filters: {
    name: string;
    constructor: BaseFilterConstructor;
}[] = [
    {
        name: "Filtre sépia",
        constructor: Sepia
    },
    {
        name: "Balance de couleurs",
        constructor: ColorBalance,
    },
];