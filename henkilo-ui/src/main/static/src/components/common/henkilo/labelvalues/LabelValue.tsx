import React from 'react';
import { connect } from 'react-redux';
import type { RootState } from '../../../../store';
import Field from '../../field/Field';
import { Localisations } from '../../../../types/localisation.type';

type OwnProps = {
    values: {
        value?: string;
        label?: string;
        inputValue?: string;
        disabled?: boolean;
        password?: boolean;
        isError?: boolean;
        date?: string | boolean;
        showOnlyOnWrite?: boolean;
        readOnly?: boolean;
        className?: string;
    };
    readOnly?: boolean;
    updateModelFieldAction?: (arg0: React.SyntheticEvent<HTMLInputElement>) => void;
    updateDateFieldAction?: (arg0: React.SyntheticEvent<HTMLInputElement>) => void;
    autofocus?: boolean;
    required?: boolean;
    hideLabel?: boolean;
};

type StateProps = {
    L: Localisations;
};

type Props = OwnProps & StateProps;

const LabelValue = ({
    values,
    readOnly,
    updateModelFieldAction,
    updateDateFieldAction,
    L,
    autofocus,
    required,
    hideLabel,
}: Props) =>
    !values.showOnlyOnWrite || !readOnly ? (
        <div id={values.label}>
            <div
                className="labelValue"
                style={{
                    display: 'grid',
                    gridTemplateColumns: readOnly ? '1fr 1fr' : '1fr',
                }}
            >
                {!hideLabel && values.label ? (
                    <span className="oph-bold">{L[values.label] + (required ? ' *' : '')}</span>
                ) : (
                    <span>&nbsp;</span>
                )}
                <Field
                    {...values}
                    autofocus={autofocus}
                    disabled={values.disabled}
                    changeAction={!values.date ? updateModelFieldAction : updateDateFieldAction}
                    readOnly={values.readOnly || readOnly}
                >
                    {values.value}
                </Field>
            </div>
        </div>
    ) : null;

const mapStateToProps = (state: RootState): StateProps => ({
    L: state.l10n.localisations[state.locale],
});

export default connect<StateProps, object, OwnProps, RootState>(mapStateToProps)(LabelValue);
