package fi.vm.sade.oppijanumerorekisteri.models;

import java.time.LocalDateTime;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Id;
import jakarta.persistence.Table;

import lombok.AllArgsConstructor;
import lombok.EqualsAndHashCode;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Getter
@Setter
@Entity
@NoArgsConstructor
@AllArgsConstructor
@EqualsAndHashCode
@Table(name = "vtj_muutostieto_kirjausavain")
public class VtjMuutostietoKirjausavain {
    @Id
    @Column(nullable = false, unique = true)
    private Long id;

    @Column(nullable = false)
    private Long avain;

    @Column(name = "updated_at", nullable = false)
    private LocalDateTime updatedAt;
}
