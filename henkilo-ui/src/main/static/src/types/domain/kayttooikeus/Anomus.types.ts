import { AnomusTyyppi } from './AnomusTyyppi.types';
import { HenkilonNimi } from './HenkilonNimi';

export type Anomus = {
    organisaatioOid: string;
    anottuPvm: string;
    anomusTilaTapahtumaPvm: string;
    anomusTyyppi: AnomusTyyppi;
    henkilo: HenkilonNimi;
    perustelut: string;
};
