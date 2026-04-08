package fi.vm.sade.oppijanumerorekisteri.tiedotuspalvelu.suomifiviestit;

import fi.vm.sade.oppijanumerorekisteri.tiedotuspalvelu.Tiedote;
import jakarta.persistence.*;
import java.time.OffsetDateTime;
import java.util.UUID;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Entity
@Table(name = "kielitutkintotodistuspdf")
@Builder(toBuilder = true)
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class KielitutkintotodistusPdf {

  @Id
  @GeneratedValue(strategy = GenerationType.AUTO)
  private UUID id;

  @OneToOne(optional = false)
  @JoinColumn(name = "tiedote_id", nullable = false)
  private Tiedote tiedote;

  @Column(name = "content", nullable = false)
  private byte[] content;

  @Column(name = "created", nullable = false, updatable = false, insertable = false)
  private OffsetDateTime created;

  @Column(name = "updated", nullable = false, insertable = false)
  private OffsetDateTime updated;
}
