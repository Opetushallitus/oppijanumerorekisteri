// @flow
import type {Locale} from "../../../types/locale.type";
import * as R from 'ramda';
import React from 'react';
import type {Text} from "../../../types/domain/kayttooikeus/text.types";

type Props = {
    texts: Array<Text>,
    locale: Locale
};

const LocalizedTextGroup = (props: Props) => {
    if(R.isEmpty(props.texts) || props.texts === undefined || props.texts === null) {
        return null;
    }
    const lang = props.locale.toUpperCase();
    const localizedText: any = R.find(R.propEq('lang', lang))(props.texts);
    return <span>{localizedText.text}</span>
};

export default LocalizedTextGroup;