package fi.vm.sade.oppijanumerorekisteri.models;

import java.time.LocalDate;

import javax.persistence.Column;
import javax.persistence.Entity;
import javax.persistence.Table;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Builder
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Entity
@Table(name = "kotikunta_historia")
public class KotikuntaHistoria extends IdentifiableAndVersionedEntity {
    @Column(name = "henkilo_id", nullable = false)
    private Long henkiloId;

    @Column(nullable = false)
    private String kotikunta;

    @Column(name = "kuntaan_muuttopv", nullable = false)
    private LocalDate kuntaanMuuttopv;

    @Column(name = "kunnasta_pois_muuttopv", nullable = true)
    private LocalDate kunnastaPoisMuuttopv;
}
