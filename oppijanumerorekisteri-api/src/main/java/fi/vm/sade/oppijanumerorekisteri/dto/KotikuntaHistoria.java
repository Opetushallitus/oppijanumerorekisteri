package fi.vm.sade.oppijanumerorekisteri.dto;

import java.time.LocalDate;

import lombok.Getter;
import lombok.RequiredArgsConstructor;
import lombok.Setter;

@Getter
@Setter
@RequiredArgsConstructor
public class KotikuntaHistoria {
    private final String oid;
    private final String kotikunta;
    private final LocalDate kuntaanMuuttopv;
    private final LocalDate kunnastaPoisMuuttopv;
}
