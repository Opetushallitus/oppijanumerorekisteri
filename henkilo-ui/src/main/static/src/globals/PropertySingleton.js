class PropertySingleton {
    constructor() {
        this.state = {
            externalPermissionService: '',
            rootOrganisaatioOid: '1.2.246.562.10.00000000001',
        };
    };

    setState(newState) {
        this.state = Object.assign({}, this.state, newState);
    };

    getState() {
        return Object.assign({}, this.state);
    };
}

export default new PropertySingleton();
