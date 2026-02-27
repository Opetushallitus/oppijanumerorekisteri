package fi.vm.sade.oppijanumerorekisteri.tiedotuspalvelu;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import java.time.OffsetDateTime;
import java.util.UUID;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import org.hibernate.annotations.JdbcTypeCode;
import org.hibernate.type.SqlTypes;

@Entity
@Table(name = "suomifi_viestit_event")
@Builder
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class SuomiFiViestitEvent {

  @Id
  @GeneratedValue(strategy = GenerationType.AUTO)
  private UUID id;

  @Column(nullable = false)
  private OffsetDateTime eventTime;

  @Column(nullable = false)
  private String eventType;

  @Column(nullable = false)
  private String messageId;

  @JdbcTypeCode(SqlTypes.JSON)
  @Column(nullable = false, columnDefinition = "jsonb")
  private String metadata;

  @Column(nullable = false, updatable = false, insertable = false)
  private OffsetDateTime created;
}
