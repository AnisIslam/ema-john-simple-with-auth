import firebase from "firebase/app";
import "firebase/auth";
import firebaseConfig from './firebase.config'
import { useContext, useState } from 'react';
import { UserContext } from "../../App";
import { useHistory, useLocation } from "react-router";
if (!firebase.apps.length) {
  firebase.initializeApp(firebaseConfig);

}


function Login() {
  const [newUser, setNewUser] = useState(false);
  const [user, setUser] = useState({
    isSignedIn: false,
    name: '',
    email: '',
    password: '',
    photo: ''
  });

  const [loggedInUser, setLoggedInUser] = useContext(UserContext);
  const history = useHistory();
  const location = useLocation();
  let { from } = location.state || { from: { pathname: "/" } };

  var googleProvider = new firebase.auth.GoogleAuthProvider();
  var fbProvider = new firebase.auth.FacebookAuthProvider();
  var githubProvider = new firebase.auth.GithubAuthProvider();

  const handleGoogleSignIn = () => {
    firebase.auth()
      .signInWithPopup(googleProvider)
      .then((result) => {
        var credential = result.credential;

        var token = credential.accessToken;
        var user = result.user;
        console.log(user);
        setUser(user);
      }).catch((error) => {
        var errorCode = error.code;
        var errorMessage = error.message;
        var email = error.email;
        var credential = error.credential;
        console.log(errorCode, errorMessage);
      });

  }
  const handleFacebookSignIn = () => {
    firebase
      .auth()
      .signInWithPopup(fbProvider)
      .then((result) => {
        var credential = result.credential;
        var user = result.user;
        var accessToken = credential.accessToken;
        console.log('fb user', user);
        setUser(user)
      })
      .catch((error) => {
        var errorCode = error.code;
        var errorMessage = error.message;
        var email = error.email;
        var credential = error.credential;
        console.log(errorCode, errorMessage, email);
      });

  }

  const handleGithubSignIn = () => {
    firebase
      .auth()
      .signInWithPopup(githubProvider)
      .then((result) => {
        var credential = result.credential;

        var token = credential.accessToken;

        var user = result.user;
        setUser(user);
        console.log('github user', user);
      }).catch((error) => {
        var errorCode = error.code;
        var errorMessage = error.message;
        var email = error.email;
        var credential = error.credential;
        console.log('error', errorCode, errorMessage, email);
      });

  }


  const handleBlur = (e) => {
    let isFieldValid = true;
    if (e.target.name === 'email') {
      isFieldValid = /\S+@\S+\.\S+/.test(e.target.value);
    }
    if (e.target.name === 'password') {
      const isPasswordValid = e.target.value.length > 6;
      const passwordHasNumber = /\d{1}/.test(e.target.value);
      isFieldValid = isPasswordValid && passwordHasNumber;
    }
    if (isFieldValid) {
      const newUserInfo = { ...user };
      newUserInfo[e.target.name] = e.target.value;
      setUser(newUserInfo);
    }
  }
  const handleSubmit = (e) => {
    if (newUser && user.email && user.password) {
      firebase.auth().createUserWithEmailAndPassword(user.email, user.password)
        .then(res => {
          const newUserInfo = { ...user };
          newUserInfo.error = '';
          newUserInfo.success = true;
          setUser(newUserInfo);
          updateUserName(user.name);
          console.log(user);
        })
        .catch(error => {
          const newUserInfo = { ...user };
          newUserInfo.error = error.message;
          newUserInfo.success = false;
          setUser(newUserInfo);

        })
    }

    if (!newUser && user.email && user.password) {
      firebase.auth().createUserWithEmailAndPassword(user.email, user.password)
        .then(res => {
          const newUserInfo = { ...user };
          newUserInfo.error = '';
          newUserInfo.success = true;
          setUser(newUserInfo);
          setLoggedInUser(newUserInfo);
          console.log('sign in user info', res.user);
        })
        .catch(error => {
          const newUserInfo = { ...user };
          newUserInfo.error = error.message;
          newUserInfo.success = false;
          setUser(newUserInfo);

        })
    }
    // if(newUser && user.email && user.password){
    //   createUserWithEmailAndPassword(user.name, user.email, user.password)
    //   .then(res => {
    //     handleResponse(res, true);
    //   })
    // }

    if (!newUser && user.email && user.password) {
      firebase.auth().signInWithEmailAndPassword(user.email, user.password)
        .then(res => {
          const newUserInfo = { ...user };
          newUserInfo.error = '';
          newUserInfo.success = true;
          setUser(newUserInfo);
          setLoggedInUser(newUserInfo);
          console.log('sign in user info', res.user);
        })
        .catch(error => {
          const newUserInfo = { ...user };
          newUserInfo.error = error.message;
          newUserInfo.success = false;
          history.replace(from);
          setUser(newUserInfo);

        })
    }
    e.preventDefault();
  }
  const updateUserName = name => {
    const user = firebase.auth().currentUser;

    user.updateProfile({
      displayName: name
    }).then(function () {
      console.log('user name updated successfully')
    }).catch(function (error) {
      console.log(error)
    });
  }

  return (
    <div style={{ textAlign: 'center' }}>
      {/* { user.isSignedIn ? <button onClick={signOut}>Sign Out</button> :
          <button onClick={googleSignIn}>Sign In</button>
        }
        <br />
        <button onClick={fbSignIn}>Sign in using Facebook</button>
        {
          user.isSignedIn && <div>
            <p>Welcome, {user.name}!</p>
            <p>Your email: {user.email}</p>
            <img src={user.photo} alt="" />
          </div>
        } */}

      <button onClick={handleGoogleSignIn}>Sign in using Google</button>
      <h1>Our own Authentication</h1>
      <input type="checkbox" onChange={() => setNewUser(!newUser)} name="newUser" id="" />
      <label htmlFor="newUser">New User Sign up</label>
      <form onSubmit={handleSubmit}>
        {newUser && <input name="name" type="text" onBlur={handleBlur} placeholder="Your name" />}
        <br />
        <input type="text" name="email" onBlur={handleBlur} placeholder="Your Email address" required />
        <br />
        <input type="password" name="password" onBlur={handleBlur} placeholder="Your Password" required />
        <br />
        <input type="submit" value={newUser ? 'Sign up' : 'Sign in'} />
      </form>
      <p style={{ color: 'red' }}>{user.error}</p>
      { user.success && <p style={{ color: 'green' }}>User {newUser ? 'created' : 'Logged In'} successfully</p>}
    </div>

  );
  // <div style= {{textAlign:"center"}}>
  //   <button onClick={handleGoogleSignIn}>Sign in using Google</button>
  //   <br />
  //   <button onClick={handleFacebookSignIn}>Sign in using FAcebook</button>
  //   <br />

  //   <button onClick={handleGithubSignIn}>Sign in using Github</button>
  //   <br />
  //   <h3>Email: {user.email}</h3>
  //   <h3>User Name: {user.displayName}</h3>
  //   <img src={user.photoURL} alt="" />

  // </div>


}
export default Login;
