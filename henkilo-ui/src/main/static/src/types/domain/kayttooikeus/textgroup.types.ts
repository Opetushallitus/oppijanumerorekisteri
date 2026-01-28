import { Text } from './text.types';

export type TextGroup = {
    id: number;
    texts: Array<Text>;
    fi?: string;
    sv?: string;
    en?: string;
};

export type TextGroupModify = {
    texts: Array<Text>;
};
