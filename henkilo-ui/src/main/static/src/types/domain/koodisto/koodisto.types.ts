export type Koodisto = Array<Koodi>;

export type Koodi = {
    koodiArvo: string;
    koodiUri: string;
    metadata: Array<KoodiMetadata>;
};

export type KoodiMetadata = {
    kieli: string;
    lyhytNimi: string;
    nimi: string;
};
