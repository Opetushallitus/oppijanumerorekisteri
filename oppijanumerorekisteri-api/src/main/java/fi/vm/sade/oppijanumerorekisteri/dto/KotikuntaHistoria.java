package fi.vm.sade.oppijanumerorekisteri.dto;

import java.sql.Date;
import java.time.LocalDate;

import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Getter
@Setter
@NoArgsConstructor
public class KotikuntaHistoria {
    private String oid;
    private String kotikunta;
    private LocalDate kuntaanMuuttopv;
    private LocalDate kunnastaPoisMuuttopv;

    public KotikuntaHistoria(String oid, String kotikunta, Date kuntaanMuuttopv, Date kunnastaPoisMuuttopv) {
        this.oid = oid;
        this.kotikunta = kotikunta;
        this.kuntaanMuuttopv = kuntaanMuuttopv != null ? kuntaanMuuttopv.toLocalDate() : null;
        this.kunnastaPoisMuuttopv = kunnastaPoisMuuttopv != null ? kunnastaPoisMuuttopv.toLocalDate() : null;
    }
}
