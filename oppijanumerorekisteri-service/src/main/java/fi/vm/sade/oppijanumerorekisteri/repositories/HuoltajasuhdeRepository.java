package fi.vm.sade.oppijanumerorekisteri.repositories;

import fi.vm.sade.oppijanumerorekisteri.models.HenkiloHuoltajaSuhde;
import org.joda.time.DateTime;

import java.time.LocalDate;
import java.util.List;

public interface HuoltajasuhdeRepository {

    List<HenkiloHuoltajaSuhde> changesBetween(LocalDate start, LocalDate end);

    List<String> changesSince(DateTime modifiedSince, Integer amount, Integer offset);

    List<HenkiloHuoltajaSuhde> findCurrentHuoltajatByHenkilo(String oid);

}
