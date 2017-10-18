import React from 'react'

class StaticUtils extends React.Component {
    static ddmmyyyyToDate(date) {
        const from = date.split(".");
        return new Date(from[2], from[1]-1, from[0]);
    };

    // Example fieldpath: organisaatio.nimet.0.nimiValue
    static updateFieldByDotAnnotation(obj, event) {
        let value;
        let fieldpath;
        if (event === null) {
            return null;
        }
        if (event.optionsName) {
            value = event.value;
            fieldpath = event.optionsName;
        }
        else {
            value = event.target.value;
            fieldpath = event.target.name;
        }

        let schema = obj;  // a moving reference to internal objects within obj
        const pList = fieldpath.split('.');
        const len = pList.length;
        for(let i = 0; i < len-1; i++) {
            let elem = pList[i];
            if ( !schema[elem] ) {
                schema[elem] = {};
            }
            schema = schema[elem];
        }

        schema[pList[len-1]] = value;

        return obj;
    };

    static reduceListToObject = (a,b) => {
        a[Object.keys(b)[0]] = b[Object.keys(b)[0]];
        return a
    };

    static findOrCreateYhteystiedotRyhmaFlat(henkiloUpdate, ryhmakuvaus, yhteystietotyyppi, label) {
        let yhteystiedotRyhmaIndex = null;
        let yhteystietoIndex = null;
        let yhteystietoRyhma = henkiloUpdate.yhteystiedotRyhma
            .filter((yhteystiedotRyhma, idx) => {
                const yhteystietoByTyyppi = yhteystiedotRyhma.yhteystieto
                    .filter(yhteystieto => yhteystieto.yhteystietoTyyppi === yhteystietotyyppi)[0];
                if (yhteystiedotRyhmaIndex === null && yhteystiedotRyhma.ryhmaKuvaus === ryhmakuvaus
                    && yhteystietoByTyyppi && yhteystietoByTyyppi.yhteystietoArvo && yhteystietoByTyyppi.yhteystietoArvo !== '') {
                    yhteystiedotRyhmaIndex = idx;
                    return true;
                }
                return false;
            })[0];
        let yhteystieto = yhteystietoRyhma
            ? yhteystietoRyhma.yhteystieto.filter((yhteystieto, idx) => {
                if (yhteystietoIndex === null && yhteystieto.yhteystietoTyyppi === yhteystietotyyppi) {
                    yhteystietoIndex = idx;
                    return true;
                }
                return false;
            })[0]
            : null;
        if (yhteystiedotRyhmaIndex === null) {
            yhteystiedotRyhmaIndex = henkiloUpdate.yhteystiedotRyhma.length;
            yhteystietoRyhma = {
                readOnly: false,
                ryhmaAlkuperaTieto: "alkupera2", // Virkailija
                ryhmaKuvaus: ryhmakuvaus,
                yhteystieto: []
            };
            henkiloUpdate.yhteystiedotRyhma.push(yhteystietoRyhma);
        }

        if (yhteystietoIndex === null) {
            yhteystietoIndex = henkiloUpdate.yhteystiedotRyhma[yhteystiedotRyhmaIndex].yhteystieto.length;
            yhteystieto = {yhteystietoTyyppi: yhteystietotyyppi, yhteystietoArvo: ''};
            henkiloUpdate.yhteystiedotRyhma[yhteystiedotRyhmaIndex].yhteystieto.push(yhteystieto);
        }
        return { label: label,
            value: yhteystieto && yhteystieto.yhteystietoArvo,
            inputValue: 'yhteystiedotRyhma.'+yhteystiedotRyhmaIndex+'.yhteystieto.'+yhteystietoIndex+'.yhteystietoArvo',
        };
    };

    static hasHetuAndIsYksiloity(henkilo) {
        return !!henkilo.henkilo.hetu && henkilo.henkilo.yksiloityVTJ;
    };

    static flatArray(arr) {
        return arr && arr.length ? arr.reduce((type1, type2) => type1.concat(', ', type2)) : '';
    };

    static getOrganisaatiotyypitFlat(tyypit, L, uppercase) {
        return tyypit && tyypit.length
            ? '(' + tyypit
                .map(tyyppi => L[tyyppi.toUpperCase() + (uppercase ? '_ISO' : '')] || tyyppi)
                .reduce((type1, type2) => type1.concat(', ', type2)) + ')'
            : '';
    };

    static defaultOrganisaatio = (organisaatioOid, l10n) => ({
        oid: organisaatioOid,
        nimi: {
            fi: (l10n && l10n['fi'] && l10n['fi']['ORGANISAATIO_NIMI_EI_LOYDY']) || organisaatioOid,
            sv: (l10n && l10n['sv'] && l10n['sv']['ORGANISAATIO_NIMI_EI_LOYDY']) || organisaatioOid,
            en: (l10n && l10n['en'] && l10n['en']['ORGANISAATIO_NIMI_EI_LOYDY']) || organisaatioOid,
        },
        tyypit: [],
    });

    static getLocalisedText(texts, locale) {
        return texts.filter(text => text.lang.toLowerCase() === locale)[0].text;
    };

    static stringIsNotEmpty(entity) {
        return entity && entity !== '';
    }

    static getKayttooikeusKestoVuosissa(henkilo) {
        return henkilo.henkiloTyyppi === 'PALVELU' ? 10 : 1;
    }
}

export default StaticUtils;
