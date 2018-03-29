// @flow
import React from 'react';
import {connect} from 'react-redux';
import PropTypes from 'prop-types';
import Columns from 'react-columns';
import Field from "../../field/Field";
import type {L} from "../../../../types/localisation.type";

type Props = {
    values: {
        value: string,
        label: string,
        inputValue: string,
        disabled: boolean,
        password: boolean,
        isError: boolean,
        date: string,
    },
    readOnly: boolean,
    updateModelFieldAction: (SyntheticInputEvent<HTMLInputElement>) => void,
    updateDateFieldAction: (SyntheticInputEvent<HTMLInputElement>) => void,
    L: L,
    autofocus: boolean,
    required: boolean,
    hideLabel: boolean,
}

const LabelValue = ({values, readOnly, updateModelFieldAction, updateDateFieldAction, L, autofocus, required, hideLabel}: Props) => !values.showOnlyOnWrite || !readOnly
    ? <div id={values.label}>
        <Columns columns={2} className="labelValue" rootStyles={{marginRight: '25%'}}>
            {!hideLabel ? <span className="oph-bold">{L[values.label] + (required ? ' *' : '')}</span> : <span>&nbsp;</span>}
            <Field {...values}
                   autofocus={autofocus}
                   disabled={values.disabled}
                   changeAction={!values.date
                       ? updateModelFieldAction
                       : updateDateFieldAction}
                   readOnly={values.readOnly || readOnly}
            >
                {values.value}
            </Field>
        </Columns>
    </div>
    : null;

LabelValue.propTypes = {
    values: PropTypes.shape({
        readOnly: PropTypes.bool,
        value: PropTypes.oneOfType([PropTypes.string, PropTypes.object]),
        label: PropTypes.string,
        showOnlyOnWrite: PropTypes.bool,
    }),
    readOnly: PropTypes.bool,
    updateModelFieldAction: PropTypes.func,
    updateDateFieldAction: PropTypes.func,
    autofocus: PropTypes.bool,
    hideLabel: PropTypes.bool,
    disabled: PropTypes.bool
};

const mapStateToProps = (state) => ({
    L: state.l10n.localisations[state.locale],
}) ;

export default connect(mapStateToProps, {})(LabelValue);
