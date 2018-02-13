// @flow
import type {Locale} from "../../types/locale.type";
import React from 'react';
import type {Text} from "../../types/domain/kayttooikeus/text.types";
import {localizeTextGroup} from '../../utilities/localisation.util';

type Props = {
    texts: Array<Text>,
    locale: Locale
};

const LocalizedTextGroup = (props: Props) => {
    return <span>{localizeTextGroup(props.texts, props.locale)}</span>
};

export default LocalizedTextGroup;