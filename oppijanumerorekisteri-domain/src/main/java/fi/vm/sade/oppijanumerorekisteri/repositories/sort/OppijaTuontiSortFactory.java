package fi.vm.sade.oppijanumerorekisteri.repositories.sort;

import fi.vm.sade.oppijanumerorekisteri.dto.OppijaTuontiSortKey;
import fi.vm.sade.oppijanumerorekisteri.repositories.Sort;

import static fi.vm.sade.oppijanumerorekisteri.repositories.sort.OppijaTuontiSort.Column.*;


public class OppijaTuontiSortFactory {

    public static OppijaTuontiSort getOppijaTuontiSort(Sort.Direction sortDirection, OppijaTuontiSortKey oppijaTuontiSortKey) {
        switch(oppijaTuontiSortKey) {
            case TIME:
                return new OppijaTuontiSort(sortDirection, CREATED, ID);
            case NAME:
                return new OppijaTuontiSort(sortDirection, SUKUNIMI, ETUNIMET, ID);
            default:
                throw new IllegalArgumentException(String.format("Tuntematon järjestysavain: %s", oppijaTuontiSortKey));
        }
    }

}
