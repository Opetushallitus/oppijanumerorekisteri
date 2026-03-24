import { HenkilonNimi } from './HenkilonNimi';

export type AnomusTyyppi = 'UUSI' | 'JATKO';

export type Anomus = {
    organisaatioOid: string;
    anottuPvm: string;
    anomusTilaTapahtumaPvm: string;
    anomusTyyppi: AnomusTyyppi;
    henkilo: HenkilonNimi;
    perustelut: string;
};
