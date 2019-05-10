package fi.vm.sade.oppijanumerorekisteri.repositories;

import fi.vm.sade.oppijanumerorekisteri.models.HenkiloHuoltajaSuhde;

import java.time.LocalDate;
import java.util.List;

public interface HuoltajasuhdeRepository {

    List<HenkiloHuoltajaSuhde> changesBetween(LocalDate start, LocalDate end);

}
