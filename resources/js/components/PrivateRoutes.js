import React from 'react';
import { Route, Redirect } from 'react-router-dom';
import Store from '../store';

export const AuthRoute = ({ component: Component, ...rest }) => {
  const { auth } = Store.getState().common;
  return (
    <Route
      {...rest}
      render={props => (auth
        ? <Component {...props} />
        : <Redirect to={{ pathname: '/login', state: { from: props.location } }} />)}
    />
  );
};

export const AuthenticatedRoute = ({ component: Component, ...rest }) => {
  const { auth } = Store.getState().common;
  return (
    <Route
      {...rest}
      render={props => (auth && auth.user.is_super == 1
        ? <Redirect to={{ pathname: '/admin/home', state: { from: props.location } }} />
        : <Component {...props} />)}
    />
  );
};

export const SuperAdminRoute = ({ component: Component, ...rest }) => {
  const { auth } = Store.getState().common;
  return (
    <Route
      {...rest}
      render={props => (auth.user.is_super == 1
        ? <Component {...props} />
        : <Redirect to={{ pathname: '/', state: { from: props.location } }} />)}
    />
  );
}