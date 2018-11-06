// @flow
import React from 'react'
import {connect} from 'react-redux'
import LabelValue from "./LabelValue";
import type {Localisations} from "../../../../types/localisation.type";

type Props = {
    disabled: boolean,
    isError: boolean,
    L: Localisations,
    updateModelFieldAction: (any) => void,
}

const Salasana = (props: Props) => <div>
    <LabelValue {...props} values={{
        label: 'HENKILO_PASSWORD',
        value: '',
        inputValue: 'password',
        disabled: props.disabled,
        password: true,
        isError: props.isError,
    }} />
    <LabelValue {...props} values={{
        label: 'HENKILO_PASSWORDAGAIN',
        value: '',
        inputValue: 'passwordAgain',
        disabled: props.disabled,
        password: true,
        isError: props.isError,
    }} />
    <LabelValue {...props}
                readOnly={true}
                required={false}
                hideLabel={true}
                values={{
                    label: 'EMPTY_PLACEHOLDER',
                    value: props.L['REKISTEROIDY_PASSWORD_TEXT'],
                    className: 'oph-h6',
                }}
    />
</div>;

const mapStateToProps = (state) => ({
    L: state.l10n.localisations[state.locale],
});

export default connect(mapStateToProps, {})(Salasana);
