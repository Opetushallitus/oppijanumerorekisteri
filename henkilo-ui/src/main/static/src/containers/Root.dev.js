import React, { PropTypes } from 'react'
import routes from '../routes'
import DevTools from './DevTools'
import { Router } from 'react-router'

const Root = ({ history }) => (
    <div>
        <Router history={history} routes={routes} />
        <DevTools  />
    </div>
);

Root.propTypes = {
  history: PropTypes.object.isRequired
};

export default Root
