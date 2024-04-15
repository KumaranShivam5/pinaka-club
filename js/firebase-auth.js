        // Your web app's Firebase configuration
        // For Firebase JS SDK v7.20.0 and later, measurementId is optional
        const firebaseConfig = {
            apiKey: "AIzaSyDaDICXfy_gTSFdy0bcjwARN7kHzCcbevc",
            authDomain: "pinaka-b8df8.firebaseapp.com",
            projectId: "pinaka-b8df8",
            storageBucket: "pinaka-b8df8.appspot.com",
            messagingSenderId: "400999335359",
            appId: "1:400999335359:web:2b5226ce3a4cd64f324d0a",
            measurementId: "G-WN5KYC9W3B"
          };
        // Initialize Firebase
        firebase.initializeApp(firebaseConfig);
        firebase.analytics();

        // FirebaseUI config.
        var uiConfig = {
            callbacks: {
                signInSuccessWithAuthResult: function (authResult, redirectUrl) {
                    // User successfully signed in.
                    // Return type determines whether we continue the redirect automatically
                    // or whether we leave that to developer to handle.
                    console.log(authResult);
					console.log(authResult.user.phoneNumber);
					console.log(authResult.user.uid);
					myStorage2 = window.sessionStorage;
					myStorage2.setItem("contact", authResult.user.phoneNumber);
					myStorage2.setItem("uid", authResult.user.uid);
                    setCookie('user_id', authResult.user.uid, 30);
                    // setCookie('user_contact', authResult.user.phoneNumber, 30);
                    window.location.href = 'login.html'
                    return false;
                },
                uiShown: function () {
                    // The widget is rendered.
                    // Hide the loader.
                    // window.location.href = 'login.html'

                    // document.getElementById('loader').style.display = 'none';
                }
            },
            // Will use popup for IDP Providers sign-in flow instead of the default, redirect.
            signInFlow: 'popup',

            signInSuccessUrl: '#',
            signInOptions: [
                // Leave the lines as is for the providers you want to offer your users.
                firebase.auth.GoogleAuthProvider.PROVIDER_ID,
                //firebase.auth.FacebookAuthProvider.PROVIDER_ID,
                //firebase.auth.TwitterAuthProvider.PROVIDER_ID,
                //firebase.auth.GithubAuthProvider.PROVIDER_ID,
                // firebase.auth.EmailAuthProvider.PROVIDER_ID,
                //firebase.auth.PhoneAuthProvider.PROVIDER_ID,
                //firebaseui.auth.AnonymousAuthProvider.PROVIDER_ID
                {
                    provider: firebase.auth.PhoneAuthProvider.PROVIDER_ID,
                    defaultCountry: 'IN',
                    whitelistedCountries: ['IN', '+91'],
                    recaptchaParameters: {
                        type: 'image', // 'audio'
                        size: 'invisible', // 'invisible' or 'compact'
                        badge: 'inline' //' bottomright' or 'inline' applies to invisible.
                      },
                
                }

            ],
            // tosUrl and privacyPolicyUrl accept either url string or a callback
            // function.
            // Terms of service url/callback.
            tosUrl: '<your-tos-url>',
            // Privacy policy url/callback.
            privacyPolicyUrl: function () {
                window.location.assign('<your-privacy-policy-url>');
            }
        };

        // Initialize the FirebaseUI Widget using Firebase.
        var ui = new firebaseui.auth.AuthUI(firebase.auth());
        // The start method will wait until the DOM is loaded.
        ui.start('#firebaseui-auth-container', uiConfig);