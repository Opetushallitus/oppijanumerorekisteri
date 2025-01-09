type State = {
    idRunner?: number;
    minimunPasswordLength?: number;
    specialCharacterRegex?: RegExp;
    numberRegex?: RegExp;
    characterRegex?: RegExp;
    opintopolkuCallerId?: string;

    KOTIOSOITE?: string;
    YHTEYSTIETO_ALKUPERA_VTJ?: string;
    YHTEYSTIETO_ALKUPERA_VIRKAILIJA_UI?: string;
    rootOrganisaatioOid: string;

    PVM_MOMENT_FORMAATTI: string;
    PVM_DATEPICKER_FORMAATTI: string;
    PVM_DBFORMAATTI: string;
    PVM_DATE_TIME_FORMAATTI: string;
};

class PropertySingleton {
    state: State;
    constructor() {
        this.state = {
            rootOrganisaatioOid: '1.2.246.562.10.00000000001',
            opintopolkuCallerId: '1.2.246.562.10.00000000001.henkilo-ui',
            idRunner: 0,
            KOTIOSOITE: 'yhteystietotyyppi1',
            YHTEYSTIETO_ALKUPERA_VTJ: 'alkupera1',
            YHTEYSTIETO_ALKUPERA_VIRKAILIJA_UI: 'alkupera2',
            specialCharacterRegex: /[!@#$%^&*()~`\-=_+[\]{}|:";',.\\/<>?]/,
            numberRegex: /\d/,
            characterRegex: /[a-zA-Z]/,
            minimunPasswordLength: 8,
            PVM_MOMENT_FORMAATTI: 'D.M.YYYY',
            PVM_DATEPICKER_FORMAATTI: 'd.M.yyyy',
            PVM_DBFORMAATTI: 'YYYY-MM-DD',
            PVM_DATE_TIME_FORMAATTI: 'D.M.YYYY H:mm',
        };
    }

    setState(newState: Partial<State>) {
        this.state = { ...this.state, ...newState };
    }

    getState() {
        return Object.assign({}, this.state);
    }

    getNewId() {
        this.state = Object.assign({}, this.state, {
            idRunner: this.state.idRunner + 1,
        });
        return this.state.idRunner;
    }
}

const singleton = new PropertySingleton();

export default singleton;
