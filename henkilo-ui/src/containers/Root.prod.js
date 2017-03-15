import React, { PropTypes } from 'react'
import { Provider } from 'react-redux'
import routes from '../routes'
import { Router } from 'react-router'

const Root = ({ history }) => (
    <Router history={history} routes={routes} />
);

Root.propTypes = {
  history: PropTypes.object.isRequired
};
export default Root
