import { ValueTransformer } from 'typeorm';

export const bigintTransformer: ValueTransformer = {
  to: (value: bigint | string | number | null): string => {
    if (value === null || value === undefined) {
      return '0';
    }
    return value.toString();
  },
  from: (value: string | null): bigint => {
    if (value === null || value === undefined) {
      return BigInt(0);
    }
    return BigInt(value);
  },
};

export const bigintToNumberTransformer: ValueTransformer = {
  to: (value: number | null): string | null => {
    if (value === null || value === undefined) {
      return null;
    }
    return value.toString();
  },
  from: (value: string | null): number => {
    if (value === null || value === undefined) {
      return 0;
    }
    return parseInt(value, 10);
  },
};
