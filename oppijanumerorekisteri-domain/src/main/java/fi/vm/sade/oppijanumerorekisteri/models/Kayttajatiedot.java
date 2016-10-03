package fi.vm.sade.oppijanumerorekisteri.models;

import lombok.Getter;
import lombok.Setter;

import javax.persistence.*;
import java.util.Date;

@Entity
@Getter @Setter
@Table(name = "kayttajatiedot")
public class Kayttajatiedot extends IdentifiableAndVersionedEntity {

    @OneToOne(optional = false, fetch = FetchType.LAZY)
    @JoinColumn(name = "henkiloid", nullable = false, unique = true)
    private Henkilo henkilo;

    /**
     * Username for Henkilo
     */
    @Column(name = "username", unique = true, nullable = false)
    private String username;

    /**
     * this is the permanent security token "salted hash", authtokens under
     * identification are used for temporary authentication
     *
     * Null token disables weak login
     */
    @Column(name = "password")
    private String password;

    /**
     * Salt used for securityToken
     */
    @Column(name = "salt")
    private String salt;

    /**
     * Can be used to invalidate password for being too old
     */
    @Column(name = "createdat")
    @Temporal(TemporalType.TIMESTAMP)
    private Date createdat;

    /**
     * Manually invalidated password
     */
    @Column(name = "invalidated")
    private Boolean invalidated = false;

    @Override
    public String toString() {
        return "Kayttajatiedot{" +
                "username='" + username + '\'' +
                ", invalidated=" + invalidated +
                ", createdat=" + createdat +
                '}';
    }
}
