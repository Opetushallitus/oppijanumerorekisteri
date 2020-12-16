import { TextGroup } from './textgroup.types';

export type Palvelu = {
    id: number;
    name: string;
    description: TextGroup;
    palveluTyyppi: string;
    kokoelma: Palvelu | null | undefined;
};
