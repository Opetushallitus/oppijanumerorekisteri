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
            idRunner: this.state.idRunner ?? 0 + 1,
        });
        return this.state.idRunner;
    }
}

const singleton = new PropertySingleton();

export default singleton;
