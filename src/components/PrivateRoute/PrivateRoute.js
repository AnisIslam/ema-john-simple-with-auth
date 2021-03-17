import React, { useContext } from 'react';
import { Redirect, Route } from 'react-router';
import { UserContext } from '../../App';

const PrivateRoute = () => {
    return (
        function PrivateRoute({ children, ...rest }) {
            const [loggedInUser, setLoggedInUser] = useContext(UserContext);
            console.log(loggedInUser.email);

            return (
                <Route
                    {...rest}
                    render={({ location }) =>
                        loggedInUser.email ? (
                            children
                        ) : (
                            <Redirect
                                to={{
                                    pathname: "/shop",
                                    state: { from: location }
                                }}
                            />
                        )
                    }
                />
            );
        }

    );
};

export default PrivateRoute;