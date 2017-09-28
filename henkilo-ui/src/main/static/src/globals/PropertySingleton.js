class PropertySingleton {
    constructor() {
        this.state = {
            externalPermissionService: '',
            rootOrganisaatioOid: '1.2.246.562.10.00000000001',
            idRunner: 0,
            TYOOSOITE: 'yhteystietotyyppi2',
            SAHKOPOSTI: 'YHTEYSTIETO_SAHKOPOSTI',
            KAYTTOOIKEUS_SULJETTU: 'SULJETTU',
            specialCharacterRegex: /[!@#$%^&*()~`\-=_+[\]{}|:";',.\\/<>?]/,
            minimunPasswordLength: 8,
        };
    }

    setState(newState) {
        this.state = Object.assign({}, this.state, newState);
    }

    getState() {
        return Object.assign({}, this.state);
    }

    getNewId() {
        this.state = Object.assign({}, this.state, {idRunner: this.state.idRunner+1});
        return this.state.idRunner;
    }
}

export default new PropertySingleton();
