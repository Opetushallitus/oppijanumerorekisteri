# Integraatiot

```mermaid


flowchart LR
    subgraph Toimijat
        Virkailija
    end
    subgraph Ulkoiset palvelut
        ulkoiset_jarjestelmat_1[Ulkoinen järjestlelmä 1]
        ulkoiset_jarjestelmat_2[Ulkoinen järjestlelmä 2]
        ulkoiset_jarjestelmat_n[Ulkoinen järjestlelmä n]
        VTJ-muutosrajapinta
        VTJKysely-rajapinta
    end
    subgraph OPH Järjestelmät
        Oppijanumerorekisteri
        Liityntäpalvelin
        Otuva
        muut_jarjestelmat_1[OPH järjestlelmä 1]
        muut_jarjestelmat_2[OPH järjestlelmä 2]
        muut_jarjestelmat_n[OPH järjestlelmä n]
        Viestinvälityspalvelu
    end
    Virkailija --> Oppijanumerorekisteri 
    Oppijanumerorekisteri <--> Otuva
    Oppijanumerorekisteri --> Viestinvälityspalvelu
    Oppijanumerorekisteri --> Liityntäpalvelin
    Liityntäpalvelin --> VTJ-muutosrajapinta
    Oppijanumerorekisteri --> VTJKysely-rajapinta
    muut_jarjestelmat_1 --> Oppijanumerorekisteri
    muut_jarjestelmat_2 --> Oppijanumerorekisteri
    muut_jarjestelmat_n --> Oppijanumerorekisteri
    ulkoiset_jarjestelmat_1 --> Oppijanumerorekisteri
    ulkoiset_jarjestelmat_2 --> Oppijanumerorekisteri
    ulkoiset_jarjestelmat_n --> Oppijanumerorekisteri
```