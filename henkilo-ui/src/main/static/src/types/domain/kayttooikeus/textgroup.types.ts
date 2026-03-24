export type TextGroup = {
    id: number;
    texts: Text[];
};

export type TextGroupModify = {
    texts: Text[];
};

export type Text = {
    text: string;
    lang: 'FI' | 'SV' | 'EN';
};
