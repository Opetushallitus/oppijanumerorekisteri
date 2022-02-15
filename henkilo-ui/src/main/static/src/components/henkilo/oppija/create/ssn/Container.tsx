import React from 'react';
import { connect } from 'react-redux';
import type { RootState } from '../../../../../reducers';
import type { ExistenceCheckRequest, ExistenceCheckState } from '../../../../../reducers/existence.reducer';
import { doExistenceCheck, clearExistenceCheck } from '../../../../../actions/existence.actions';
import type { CreatePersonState } from '../../../../../reducers/create.reducer';
import { createPerson } from '../../../../../actions/create.actions';
import Button from '../../../../common/button/Button';
import Create from './Create';
import ExistenceCheck from './ExistenceCheck';

type OwnProps = {
    goBack: () => void;
};

type StateProps = {
    existence: ExistenceCheckState;
    person: CreatePersonState;
    translate: (key: string) => string;
};

type DispatchProps = {
    clearExistenceCheckForm: () => void;
    checkExistence: (payload: ExistenceCheckRequest) => void;
    createPerson: (payload: ExistenceCheckRequest) => void;
};

type Props = OwnProps & StateProps & DispatchProps;

export const Container: React.FC<Props> = ({
    goBack,
    translate,
    person,
    existence,
    checkExistence,
    clearExistenceCheckForm,
}) => {
    const [create, setCreate] = React.useState<boolean>(false);
    const [data, setData] = React.useState<ExistenceCheckRequest>();

    return (
        <div className="wrapper">
            <span className="oph-h2 oph-bold">{translate('OPPIJAN_LUONTI_OTSIKKO')}</span>
            <div className="oph-field">
                {create ? (
                    <Create
                        {...{
                            ...person,
                            payload: data,
                            translate,
                            createPerson,
                        }}
                    />
                ) : (
                    <ExistenceCheck
                        {...{
                            ...existence,
                            translate,
                            check: checkExistence,
                            clear: clearExistenceCheckForm,
                            cache: setData,
                            create: () => setCreate(true),
                        }}
                    />
                )}
                <Button action={goBack}>{translate('TAKAISIN_LINKKI')}</Button>
            </div>
        </div>
    );
};

const mapStateToProps = (state: RootState): StateProps => ({
    existence: { ...state.existenceCheck },
    person: { ...state.createPerson },
    translate: (key: string) => state.l10n.localisations[state.locale][key] || key,
});

const mapDispatchToProps = {
    clearExistenceCheckForm: clearExistenceCheck,
    checkExistence: doExistenceCheck,
    createPerson: createPerson,
};

export default connect<StateProps, DispatchProps, OwnProps, RootState>(mapStateToProps, mapDispatchToProps)(Container);
