class PropertySingleton {
    constructor() {
        this.state = {
            externalPermissionService: '',
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
