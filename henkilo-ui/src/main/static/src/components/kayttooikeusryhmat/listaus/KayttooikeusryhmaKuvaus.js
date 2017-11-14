// @flow

import * as R from 'ramda';
import React from 'react';

type Props = {
    kuvaus: any,
    locale: string
}

const KayttooikeusryhmaKuvaus = (props: Props): any => {
    if(!props.kuvaus) {
        return null;
    }
    const lang = props.locale.toUpperCase();
    const localizedText: any = R.find(R.propEq('lang', lang))();
    return <div>{localizedText.text}</div>
};

export default KayttooikeusryhmaKuvaus;