import React from 'react';
import { connect } from 'react-redux';
import type { RootState } from '../../../../../store';
import type { ExistenceCheckRequest, ExistenceCheckState } from '../../../../../reducers/existence.reducer';
import { doExistenceCheck, clearExistenceCheck } from '../../../../../actions/existence.actions';
import type { CreatePersonState } from '../../../../../reducers/create.reducer';
import { createPerson } from '../../../../../actions/create.actions';
import CloseButton from '../../../../common/button/CloseButton';
import Create from './Create';
import DetailsForm from './DetailsForm';

type OwnProps = {
    goBack: () => void;
};

type StateProps = {
    existence: ExistenceCheckState;
    person: CreatePersonState;
    translate: (key: string) => string;
};

type DispatchProps = {
    clearExistenceCheck: () => void;
    doExistenceCheck: (payload: ExistenceCheckRequest) => void;
    createPerson: (payload: ExistenceCheckRequest) => void;
};

type Props = OwnProps & StateProps & DispatchProps;

export const OppijaCreateSsnContainer = ({
    goBack,
    translate,
    person,
    existence,
    doExistenceCheck,
    clearExistenceCheck,
    createPerson,
}: Props) => {
    const [create, setCreate] = React.useState<boolean>(false);
    const [data, setData] = React.useState<ExistenceCheckRequest>();

    return (
        <div className="wrapper">
            <span className="oph-h2 oph-bold">{translate('OPPIJAN_LUONTI_OTSIKKO')}</span>
            <span className="float-right">
                <CloseButton closeAction={goBack} />
            </span>
            <div className="oph-field">
                {create ? (
                    <Create
                        {...{
                            ...person,
                            payload: data,
                            translate,
                            createPerson,
                            reset: () => {
                                clearExistenceCheck();
                                setData(undefined);
                                setCreate(false);
                            },
                        }}
                    />
                ) : (
                    <DetailsForm
                        {...{
                            ...existence,
                            translate,
                            doExistenceCheck: doExistenceCheck,
                            clearExistenceCheck: clearExistenceCheck,
                            cache: setData,
                            create: () => setCreate(true),
                        }}
                    />
                )}
            </div>
        </div>
    );
};

const mapStateToProps = (state: RootState): StateProps => ({
    existence: state.existenceCheck,
    person: state.createPerson,
    translate: (key: string) => state.l10n.localisations[state.locale][key] || key,
});

const mapDispatchToProps = {
    clearExistenceCheck: clearExistenceCheck,
    doExistenceCheck: doExistenceCheck,
    createPerson: createPerson,
};

export default connect<StateProps, DispatchProps, OwnProps, RootState>(
    mapStateToProps,
    mapDispatchToProps
)(OppijaCreateSsnContainer);
