package fi.vm.sade.oppijanumerorekisteri.tiedotuspalvelu;

import fi.vm.sade.oppijanumerorekisteri.tiedotuspalvelu.suomifiviestit.KielitutkintotodistusPdf;
import fi.vm.sade.oppijanumerorekisteri.tiedotuspalvelu.suomifiviestit.SuomiFiViesti;
import jakarta.persistence.*;
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
  public static final String TYPE_KIELITUTKINTOTODISTUS = "KIELITUTKINTOTODISTUS";

  public static final String STATE_OPPIJAN_VALIDOINTI = "OPPIJAN_VALIDOINTI";
  public static final String STATE_SUOMIFI_VIESTIN_LÄHETYS = "SUOMIFI_VIESTIN_LÄHETYS";
  public static final String STATE_KIELITUTKINTOTODISTUKSEN_NOUTO =
      "KIELITUTKINTOTODISTUKSEN_NOUTO";
  public static final String STATE_SUOMIFI_VIESTIN_LÄHETYS_PAPERIPOSTIOPTIOLLA =
      "SUOMIFI_VIESTIN_LÄHETYS_PAPERIPOSTIOPTIOLLA";
  public static final String STATE_TIEDOTE_KÄSITELTY = "TIEDOTE_KÄSITELTY";

  @Id
  @GeneratedValue(strategy = GenerationType.AUTO)
  private UUID id;

  @Column(nullable = false)
  private String oppijanumero;

  @Column(nullable = true)
  private String todistusUrl;

  @Column(name = "todistusbucketname", nullable = true)
  private String todistusBucketName;

  @Column(name = "todistusobjectkey", nullable = true)
  private String todistusObjectKey;

  @Column(nullable = false, updatable = false, insertable = false)
  private OffsetDateTime created;

  @Column(nullable = false, insertable = false)
  private OffsetDateTime updated;

  @Column private OffsetDateTime processedAt;

  @Column private OffsetDateTime nextRetry;

  @Column(nullable = false)
  private int retryCount;

  @Column(nullable = false, unique = true)
  private String idempotencyKey;

  @Column(name = "tiedotetype_id", nullable = false)
  private String type;

  @Column(name = "tiedotestate_id", nullable = false)
  private String state;

  @Column private String opiskeluoikeusOid;

  @OneToOne(mappedBy = "tiedote", cascade = CascadeType.ALL, orphanRemoval = true)
  private KielitutkintotodistusPdf kielitutkintotodistusPdf;

  @OneToOne(
      mappedBy = "tiedote",
      cascade = CascadeType.ALL,
      orphanRemoval = true,
      fetch = FetchType.EAGER)
  private SuomiFiViesti viesti;
}
