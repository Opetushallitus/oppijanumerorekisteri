export type Tuontidata = {
    tunniste: string;
    henkilo: {
        hetu: string;
        etunimet: string;
        kutsumanimi: string;
        sukunimi: string;
        kansalaisuus: { koodi: string }[];
    };
    henkiloOid: string;
    henkiloNimi: string;
    conflict: boolean;
};
