package fi.vm.sade.oppijanumerorekisteri.tiedotuspalvelu;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Entity
@Table(name = "suomifi_viestit_events_cursor")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class SuomiFiViestitEventsCursor {

  @Id private Boolean id = true;

  @Column(nullable = false)
  private String continuationToken;
}
