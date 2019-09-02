# RNRBnb (Ionic 4 & Angular 7)

RNRBnb is an Ionic 4 application that uses Angular 7 in the front. It is built to allow users to add locations and other users to Book places. This application uses firebase to authenticate users and to store all data flowing to and from the application. RNRBnb uses capacitor for mobile compilation. 

# Run

In order to run this application please provide a firebase key in the environment variables:

```typescript
export const environment = {
  production: false,
  fireBaseUrl: "https://ionic-rnrbnb.firebaseio.com/",
  firebaseWepKey: "ADD KEY HERE"
};
```

Spin up a development Server:

```bash
    ionic serve
```
Build application:

```bash
    ionic build
```

This application uses Capacitor to compile to Android or IOS, please see link on how to compile the application to the platform of your choice.

[Capacitor](https://capacitor.ionicframework.com/docs/)