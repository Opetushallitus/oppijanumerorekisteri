import React from 'react'

class StaticUtils extends React.Component {
    static datePlusOneYear(date) {
        const result = new Date(date);
        result.setDate(result.getDate() + 365);
        return result;
    };

    static ddmmyyyyToDate(date) {
        const from = date.split(".");
        return new Date(from[2], from[1]-1, from[0]);
    };

    static updateFieldByDotAnnotation(obj, path, value) {
        let schema = obj;  // a moving reference to internal objects within obj
        const pList = path.split('.');
        const len = pList.length;
        for(let i = 0; i < len-1; i++) {
            let elem = pList[i];
            if( !schema[elem] ) {
                schema[elem] = {};
            }
            schema = schema[elem];
        }

        schema[pList[len-1]] = value;
    };

    static reduceListToObject = (a,b) => {
        a[Object.keys(b)[0]] = b[Object.keys(b)[0]];
        return a
    };

    static findOrCreateYhteystiedotRyhmaFlat(henkiloUpdate, ryhmakuvaus, yhteystietotyyppi, label) {
        let yhteystiedotRyhmaIndex = null;
        let yhteystietoIndex = null;
        let tyosahkopostiRyhma = henkiloUpdate.yhteystiedotRyhma
            .filter((yhteystiedotRyhma, idx) => {
                if(!yhteystiedotRyhmaIndex && yhteystiedotRyhma.ryhmaKuvaus === ryhmakuvaus) {
                    yhteystiedotRyhmaIndex = idx;
                    return true;
                }
                return false;
            })[0];
        let tyosahkoposti = tyosahkopostiRyhma
            ? tyosahkopostiRyhma.yhteystieto.filter((yhteystieto, idx) => {
                if(yhteystietoIndex === null && yhteystieto.yhteystietoTyyppi === yhteystietotyyppi) {
                    yhteystietoIndex = idx;
                    return true;
                }
                return false;
            })[0]
            : null;
        if(yhteystiedotRyhmaIndex === null) {
            yhteystiedotRyhmaIndex = henkiloUpdate.yhteystiedotRyhma.length;
            tyosahkopostiRyhma = {
                readOnly: false,
                ryhmaAlkuperaTieto: "alkupera2", // Virkailija
                ryhmaKuvaus: ryhmakuvaus,
                yhteystieto: []
            };
            henkiloUpdate.yhteystiedotRyhma.push(tyosahkopostiRyhma);
        }

        if(yhteystietoIndex === null) {
            yhteystietoIndex = henkiloUpdate.yhteystiedotRyhma[yhteystiedotRyhmaIndex].yhteystieto.length;
            tyosahkoposti = {yhteystietoTyyppi: yhteystietotyyppi, yhteystietoArvo: ''};
            henkiloUpdate.yhteystiedotRyhma[yhteystiedotRyhmaIndex].yhteystieto.push(tyosahkoposti);
        }
        return { label: label,
            value: tyosahkoposti && tyosahkoposti.yhteystietoArvo,
            inputValue: 'yhteystiedotRyhma.'+yhteystiedotRyhmaIndex+'.yhteystieto.'+yhteystietoIndex+'.yhteystietoArvo',
        };
    };

    static createPopupErrorMessage(notificationKey, henkilo, L) {
        const notification = henkilo.buttonNotifications[notificationKey];
        return {errorTopic: notification && L[notification.notL10nMessage],
            errorText: notification && L[notification.notL10nText]};
    };
}

export default StaticUtils;