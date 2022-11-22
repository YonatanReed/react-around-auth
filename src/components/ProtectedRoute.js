import React from 'react';
import { Route, Redirect } from 'react-router-dom';

function ProtectedRoute ({ children, loggedIn, ...props }) {
  return (
    <Route {...props}>
      {true ? children : <Redirect to='/signin' />}
    </Route>
  );
};

export default ProtectedRoute;
