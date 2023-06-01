package fi.vm.sade.oppijanumerorekisteri.repositories.impl;

import fi.vm.sade.oppijanumerorekisteri.dto.HenkiloDuplikaattiCriteria;
import org.junit.jupiter.api.Test;

import java.time.LocalDate;

import static org.assertj.core.api.Assertions.assertThat;

class HenkiloRepositoryImplTest {

    @Test
    void getNamesAndBirthDate() {
        HenkiloDuplikaattiCriteria criteria = new HenkiloDuplikaattiCriteria(null, null, null, LocalDate.of(2022, 03, 23));
        assertThat(HenkiloRepositoryImpl.getNamesAndBirthDate(criteria)).isEqualTo("2022-03-23");
    }
}
