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
@Table(name = "tiedote")
@Builder(toBuilder = true)
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class Tiedote {

  @Id
  @GeneratedValue(strategy = GenerationType.AUTO)
  private UUID id;

  @Column(nullable = false)
  private String oppijanumero;

  @Column(name = "otsikko_fi", nullable = false)
  private String titleFi;

  @Column(name = "otsikko_sv", nullable = false)
  private String titleSv;

  @Column(name = "otsikko_en", nullable = false)
  private String titleEn;

  @Column(name = "viesti_fi", nullable = false)
  private String messageFi;

  @Column(name = "viesti_sv", nullable = false)
  private String messageSv;

  @Column(name = "viesti_en", nullable = false)
  private String messageEn;

  @Column(nullable = false, updatable = false, insertable = false)
  private OffsetDateTime created;

  @Column(nullable = false, insertable = false)
  private OffsetDateTime updated;

  @Column private OffsetDateTime processedAt;

  @Column private OffsetDateTime nextRetry;

  @Column(nullable = false)
  private int retryCount;
}
