import React, { SyntheticEvent } from 'react';
import ReactDatePicker from 'react-datepicker';
import { format, parseISO } from 'date-fns';

import type { Henkilo } from '../../../../types/domain/oppijanumerorekisteri/henkilo.types';
import { useLocalisations } from '../../../../selectors';

type OwnProps = {
    readOnly: boolean;
    henkiloUpdate: Henkilo;
    updateDateFieldAction: (event: SyntheticEvent<HTMLInputElement, Event>) => void;
};

const Syntymaaika = (props: OwnProps) => {
    const { L } = useLocalisations();
    return (
        <div id="HENKILO_SYNTYMAAIKA">
            <div
                className="labelValue"
                style={{
                    display: 'grid',
                    gridTemplateColumns: props.readOnly ? '1fr 1fr' : '1fr',
                }}
            >
                <span className="oph-bold">{L('HENKILO_SYNTYMAAIKA')}</span>
                {props.readOnly ? (
                    <span className="field">
                        {props.henkiloUpdate.syntymaaika ? format(props.henkiloUpdate.syntymaaika, 'd.M.yyyy') : ''}
                    </span>
                ) : (
                    <ReactDatePicker
                        className="oph-input"
                        onChange={(value) => {
                            props.updateDateFieldAction({
                                target: {
                                    value: value ? format(value, 'yyyy-MM-dd') : undefined,
                                    name: 'syntymaaika',
                                },
                            } as unknown as SyntheticEvent<HTMLInputElement, Event>);
                        }}
                        selected={
                            props.henkiloUpdate.syntymaaika ? parseISO(props.henkiloUpdate.syntymaaika) : undefined
                        }
                        showYearDropdown
                        showWeekNumbers
                        disabled={props.henkiloUpdate.yksiloityEidas || !!props.henkiloUpdate.hetu}
                        dateFormat={'d.M.yyyy'}
                    />
                )}
            </div>
        </div>
    );
};

export default Syntymaaika;
