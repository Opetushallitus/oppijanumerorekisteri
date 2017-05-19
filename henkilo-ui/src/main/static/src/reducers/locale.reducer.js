export const locale = (state = 'fi', action) => {

    switch (action.type) {
        case 'fi':
            return 'fi';
        case 'sv':
            return 'sv';
        case 'en':
            return 'en';
        default:
            return 'fi';
    }

};
