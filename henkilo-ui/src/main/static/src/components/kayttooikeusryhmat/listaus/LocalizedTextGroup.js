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
    const localizedText: ?Text = props.texts.find(text => text.lang.toUpperCase() === lang)
    const text = localizedText ? localizedText.text : ''
    return <span>{text}</span>
};

export default LocalizedTextGroup;