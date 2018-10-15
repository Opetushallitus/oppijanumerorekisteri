package fi.vm.sade.oppijanumerorekisteri.dto;

public enum YksilointiTila {

    /**
     * Henkilö on yksilöity (joko manuaaalisesti tai automaattisesti) tai passivoitu.
     */
    OK,
    /**
     * Henkilöllä on hetu, mutta yksilöinti on päätynyt virheeseen.
     */
    VIRHE,
    /**
     * Henkilöllä on hetu, mutta yksilöintiä ei ole vielä yritetty.
     */
    KESKEN,
    /**
     * Henkilöllä ei ole hetua.
     */
    HETU_PUUTTUU,

}
