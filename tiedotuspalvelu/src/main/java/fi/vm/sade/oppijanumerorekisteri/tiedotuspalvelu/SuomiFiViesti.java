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

@Entity
@Table(name = "suomifi_viesti")
@Builder(toBuilder = true)
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class SuomiFiViesti {

  @Id
  @GeneratedValue(strategy = GenerationType.AUTO)
  private UUID id;

  @Column(nullable = false)
  private UUID tiedoteId;

  @Column(nullable = false)
  private String henkilotunnus;

  @Column(nullable = false)
  private String name;

  @Column(nullable = false)
  private String streetAddress;

  @Column(nullable = false)
  private String zipCode;

  @Column(nullable = false)
  private String city;

  @Column(nullable = false)
  private String countryCode;

  @Column(nullable = false)
  private OffsetDateTime processedAt;

  @Column(nullable = false)
  private OffsetDateTime nextRetry;

  @Column(nullable = false)
  private int retryCount;

  @Column(nullable = false, updatable = false, insertable = false)
  private OffsetDateTime created;

  @Column(nullable = false, insertable = false)
  private OffsetDateTime updated;
}
