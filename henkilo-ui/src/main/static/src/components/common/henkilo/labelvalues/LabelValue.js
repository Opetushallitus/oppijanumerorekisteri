import React from 'react'
import Columns from 'react-columns'
import Field from "../../field/Field";

const LabelValue = ({values, readOnly, updateModelFieldAction, updateDateFieldAction, L, autofocus}) => !values.showOnlyOnWrite || !readOnly
    ? <div id={values.label}>
        <Columns columns={2} className="labelValue" rootStyles={{marginRight: '25%'}}>
            <span className="oph-bold">{L[values.label]}</span>
            <Field {...values}
                   autofocus={autofocus}
                   changeAction={!values.date
                       ? updateModelFieldAction
                       : updateDateFieldAction}
                   readOnly={values.readOnly || readOnly}>
                {values.value}
            </Field>
        </Columns>
    </div>
    : null;

LabelValue.propTypes = {
    values: React.PropTypes.shape({
        readOnly: React.PropTypes.bool,
        value: React.PropTypes.string,
        label: React.PropTypes.string,
        showOnlyOnWrite: React.PropTypes.bool,
    }),
    readOnly: React.PropTypes.bool,
    updateModelFieldAction: React.PropTypes.func,
    updateDateFieldAction: React.PropTypes.func,
    autofocus: React.PropTypes.bool,
    L: React.PropTypes.object.isRequired,
};

export default LabelValue;