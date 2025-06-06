import React from 'react';
import { connect } from 'react-redux';
import type { RootState } from '../../../../store';
import Columns from 'react-columns';
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
            <Columns
                columns={readOnly ? 2 : 1}
                className="labelValue"
                rootStyles={{ marginRight: '25%', marginBottom: '2%' }}
            >
                {!hideLabel && values.label ? (
                    <span style={{ marginRight: 40 }} className="oph-bold">
                        {L[values.label] + (required ? ' *' : '')}
                    </span>
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
            </Columns>
        </div>
    ) : null;

const mapStateToProps = (state: RootState): StateProps => ({
    L: state.l10n.localisations[state.locale],
});

export default connect<StateProps, object, OwnProps, RootState>(mapStateToProps)(LabelValue);
