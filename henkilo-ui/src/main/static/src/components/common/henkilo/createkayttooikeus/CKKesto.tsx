import React from 'react';
import DatePicker from 'react-datepicker';
import moment from 'moment';
import PropertySingleton from '../../../../globals/PropertySingleton';
import { Localisations } from '../../../../types/localisation.type';

type CKKestoProps = {
    alkaaPvmAction: (arg0: moment.Moment) => void;
    alkaaInitValue: moment.Moment;
    paattyyPvmAction: (arg0: moment.Moment) => void;
    paattyyInitValue: moment.Moment;
    L: Localisations;
    vuosia: number | null;
};

const CKKesto = ({ alkaaPvmAction, alkaaInitValue, paattyyPvmAction, paattyyInitValue, L, vuosia }: CKKestoProps) => (
    <tr key="kayttooikeusKestoField">
        <td>
            <span className="oph-bold">{L['HENKILO_LISAA_KAYTTOOIKEUDET_KESTO']}</span>:
        </td>
        <td>
            <div className="kayttooikeus-input-container">
                <span className="oph-h5">{L['HENKILO_LISAA_KAYTTOOIKEUDET_ALKAA']}</span>
                <DatePicker
                    className="oph-input"
                    onChange={(date) => alkaaPvmAction(moment(date))}
                    selected={alkaaInitValue.toDate()}
                    showYearDropdown
                    showWeekNumbers
                    filterDate={(date) =>
                        vuosia !== null ? moment(date).isBefore(moment().add(vuosia, 'years')) : true
                    }
                    dateFormat={PropertySingleton.getState().PVM_DATEPICKER_FORMAATTI}
                />
            </div>
            <div className="kayttooikeus-input-container">
                <span className="oph-h5">{L['HENKILO_LISAA_KAYTTOOIKEUDET_PAATTYY']}</span>
                <DatePicker
                    className="oph-input"
                    onChange={(date) => paattyyPvmAction(moment(date))}
                    selected={paattyyInitValue.toDate()}
                    showYearDropdown
                    showWeekNumbers
                    filterDate={(date) =>
                        vuosia !== null ? moment(date).isBefore(moment().add(vuosia, 'years')) : true
                    }
                    dateFormat={PropertySingleton.getState().PVM_DATEPICKER_FORMAATTI}
                />
            </div>
        </td>
        <td />
    </tr>
);

export default CKKesto;
