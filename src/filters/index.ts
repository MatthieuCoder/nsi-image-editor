import { ColorBalanceFilter } from './ColorBalance/ColorBalance'
import { SepiaFilter } from './Sepia/Sepia'
import { BaseFilterConstructor } from '../struct/BaseFilter'
import { BlackAndWhiteFilter } from './BlackAndWhite/BlackAndWhite'

export type Filter = {
    name: string;
    constructor: BaseFilterConstructor;
};

export const Filters: Filter[] = [
  SepiaFilter,
  ColorBalanceFilter,
  BlackAndWhiteFilter
]
