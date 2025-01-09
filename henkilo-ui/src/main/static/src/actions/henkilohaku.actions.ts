import { UPDATE_HENKILOHAKU_FILTERS } from './actiontypes';
import { HenkilohakuCriteria } from '../types/domain/kayttooikeus/HenkilohakuCriteria.types';

export const updateFilters = (filters: HenkilohakuCriteria & { ryhmaOid?: string }) => ({
    type: UPDATE_HENKILOHAKU_FILTERS,
    filters,
});
