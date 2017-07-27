import React from 'react'
import {connect} from 'react-redux'
import PropTypes from 'prop-types'
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
};

const mapStateToProps = (state, ownProps) => ({
    L: state.l10n.localisations[state.locale],
}) ;

export default connect(mapStateToProps)(LabelValue);
