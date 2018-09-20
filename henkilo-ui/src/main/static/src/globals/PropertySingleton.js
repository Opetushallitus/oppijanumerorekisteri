// @flow
type State = {
    idRunner?: number,
    minimunPasswordLength?: number,
    specialCharacterRegex?: RegExp,
    numberRegex?: RegExp,
    characterRegex?: RegExp,
    [string]: string,
}

class PropertySingleton {
    state: State;
    constructor() {
        this.state = {
            externalPermissionService: '',
            rootOrganisaatioOid: '1.2.246.562.10.00000000001',
            idRunner: 0,
            KOTIOSOITE: 'yhteystietotyyppi1',
            TYOOSOITE: 'yhteystietotyyppi2',
            YHTEYSTIETO_ALKUPERA_VIRKAILIJA_UI: 'alkupera2',
            SAHKOPOSTI: 'YHTEYSTIETO_SAHKOPOSTI',
            specialCharacterRegex: /[!@#$%^&*()~`\-=_+[\]{}|:";',.\\/<>?]/,
            numberRegex: /\d/,
            characterRegex: /[a-zA-Z]/,
            minimunPasswordLength: 8,
            PVM_FORMAATTI: 'D.M.YYYY',
            PVM_DBFORMAATTI: 'YYYY-MM-DD',
            PVM_DATE_TIME_FORMAATTI: 'D.M.YYYY H:mm',
        };
    }

    setState(newState: State) {
        this.state = {...this.state, ...newState};
    }

    getState() {
        return Object.assign({}, this.state);
    }

    getNewId() {
        this.state = Object.assign({}, this.state, {idRunner: this.state.idRunner + 1});
        return this.state.idRunner;
    }
}

export default new PropertySingleton();
