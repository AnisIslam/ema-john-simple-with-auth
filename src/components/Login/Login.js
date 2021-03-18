
import firebase from "firebase/app";
import "firebase/auth";
import firebaseConfig from './firebase.config';
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
    name: "",
    email: "",
    password: "",
    photo: "",
    error: "",
    success: ""
  });

  const [loggedInUser, setLoggedInUser] = useContext(UserContext); //set usercontext for checking login 

  const history = useHistory();
  const location = useLocation();
  let { from } = location.state || { from: { pathname: "/" } };

  const googleProvider = new firebase.auth.GoogleAuthProvider();
  const fbProvider = new firebase.auth.FacebookAuthProvider();

  //google signin functioanlities start
  const handleSignIn = () => {
    firebase.auth()
      .signInWithPopup(googleProvider)
      .then((result) => {
        var credential = result.credential;
        var token = credential.accessToken;
        var user = result.user;
        const { displayName, photoURL, email } = result.user;
        const signedInUser = {
          isSignedIn: true,
          name: displayName,
          email: email,
          photo: photoURL
        }
        setUser(signedInUser);
        console.log(user);
      }).catch((error) => {
        var errorCode = error.code;
        var errorMessage = error.message;
        var email = error.email;
        var credential = error.credential;
        console.log(errorMessage);
      });
  }
  //google signin functioanlities end

  //google signout functioanlities end
  const handleSignOut = () => {
    firebase.auth().signOut().then(() => {
      const signedOutUser = {
        isSignedIn: false,
        name: "",
        photo: "",
        email: ""
      }
      setUser(signedOutUser);
      console.log("sign out");
    }).catch((error) => {
    });

  }

  //email pass submit auth functioanlities start
  const handleSubmit = (event) => {

    console.log(user.email, user.password);
    if (newUser && user.email && user.password) {
      firebase.auth().createUserWithEmailAndPassword(user.email, user.password)
        .then((userCredential) => {
          // Signed in 
          //var user = userCredential.user;
          //console.log(user);

          const newUserInfo = { ...user };
          newUserInfo.error = "";
          newUserInfo.success = true;
          setUser(newUserInfo);
          updateUserName(newUserInfo.name);
        })
        .catch(error => {
          // var errorCode = error.code;
          // var errorMessage = error.message;
          const newUserInfo = { ...user };
          newUserInfo.error = error.message;
          newUserInfo.success = false;
          setUser(newUserInfo);
          console.log(user);
        });
    }
    if (!newUser && user.email && user.password) {

      firebase.auth().signInWithEmailAndPassword(user.email, user.password)
        .then((userCredential) => {
          // Signed in
          var user = userCredential.user;
          const newUserInfo = { ...user };
          newUserInfo.error = "";
          newUserInfo.success = true;
          setUser(newUserInfo);
          setLoggedInUser(newUserInfo);
          history.replace(from);
          console.log("sign in info", user);
        })
        .catch((error) => {
          const newUserInfo = { ...user };
          newUserInfo.error = error.message;
          newUserInfo.success = false;
          setUser(newUserInfo);
          console.log(error.message);
        });
    }
    event.preventDefault();
  }

  //End email and password login functionalities 

  // change after clicking email login button

  const handleChange = (event) => {
    let isFieldValid = true;
    if (event.target.name === "email") {
      isFieldValid = /\S+@\S+\.\S+/.test(event.target.value);
      //console.log(isFieldValid);
    }
    if (event.target.name === "password") {
      const isPasswordValid = event.target.value.length > 6;
      const passwordHasNumber = /\d{1}/.test(event.target.value);
      isFieldValid = isPasswordValid && passwordHasNumber;
    }
    if (isFieldValid) {
      const newUserInfo = { ...user };
      newUserInfo[event.target.name] = event.target.value;
      setUser(newUserInfo);
    }
  }

  const updateUserName = name => {
    const user = firebase.auth().currentUser;

    user.updateProfile({
      displayName: name
    }).then(function () {
      // Update successful.
      console.log("user name update successfully", name);
    }).catch(function (error) {
      // An error happened.
      console.log(error);
    });

  }

  // Handle facebook sign in functionalities

  const handleFBSignIn = () => {
    firebase
      .auth()
      .signInWithPopup(fbProvider)
      .then((result) => {
        /** @type {firebase.auth.OAuthCredential} */
        var credential = result.credential;

        // The signed-in user info.
        var user = result.user;
        console.log("fb user", user);
        // This gives you a Facebook Access Token. You can use it to access the Facebook API.
        var accessToken = credential.accessToken;

        // ...
      })
      .catch((error) => {
        // Handle Errors here.
        var errorCode = error.code;
        var errorMessage = error.message;
        // The email of the user's account used.
        var email = error.email;
        // The firebase.auth.AuthCredential type that was used.
        var credential = error.credential;

        // ...
      });
  }

  return (
    <div style = {{textAlign: "center"}}>
      {
        user.isSignedIn ? <button onClick={handleSignOut}>Sign out</button> :
          <button onClick={handleSignIn} className = "btn btn-primary">Sign In</button>
      }
      {
        user.isSignedIn &&
        <div>
          <p>Welcome, {user.name}</p>
          <p>Email: {user.email}</p>
          <img src={user.photo} alt="" />
        </div>

      }
      <br />
      <button onClick={handleFBSignIn}  className = "btn btn-info">Sign In by Facebook</button>

      {/* //login by us */}

      <h1>Our own Login</h1>
      <input type="checkbox" name="newUser" onChange={() => setNewUser(!newUser)} id="" />
      <label htmlFor="newUser">New User SignUp</label>
      <form onSubmit={handleSubmit}>
        {newUser && <input type="text" name="name" onBlur={handleChange} id="" />}
        <br />
        <input type="text" onBlur={handleChange} name="email" id="" placeholder="Email" required />
        <br />
        <input type="password" onBlur={handleChange} name="password" id="" placeholder="Password" required />
        <br />
        <input type="submit" value={newUser ? "Sign Up" : "Sign In"}  className = "btn btn-success"/>
      </form>
      {
        user.success && <p style={{ color: 'green' }}>User {newUser ? "Authentication" : "Login"} Success</p>
      }
      <p style={{ color: 'red' }}>{user.error}</p>
    </div>
  );
}

export default Login;
