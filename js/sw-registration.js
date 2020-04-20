/* ===========================================================
 * sw-registration.js
 * ===========================================================
 * Copyright 2016 @huxpro
 * Copyright 2020 @tautcony
 * Licensed under Apache 2.0
 * Register service worker.
 * ========================================================== */

// SW Version Upgrade Ref: <https://youtu.be/Gb9uI67tqV0>

function handleRegistration(registration) {
    console.log("Service Worker Registered. ", registration);
    /**
     * ServiceWorkerRegistration.onupdatefound
     * The service worker registration's installing worker changes.
     */
    registration.onupdatefound = (e) => {
        const installingWorker = registration.installing;
        // eslint-disable-next-line no-shadow
        installingWorker.onstatechange = (e) => {
            if (installingWorker.state !== "installed") {return;}
            if (navigator.serviceWorker.controller) {
                console.log("SW is updated");
            } else {
                console.log("A Visit without previous SW");
                console.log("App ready for offline use.");
            }
        };
    };
}

if(navigator.serviceWorker) {
    // For security reasons, a service worker can only control the pages
    // that are in the same directory level or below it. That's why we put sw.js at ROOT level.
    navigator.serviceWorker
        .register("/sw.js")
        .then((registration) => {
            handleRegistration(registration);
            setInterval(() => { registration.update(); }, 30 * 60 * 1000);
        })
        .catch((error) => {console.log("ServiceWorker registration failed: ", error);});

    // register message receiver
    // https://dbwriteups.wordpress.com/2015/11/16/service-workers-part-3-communication-between-sw-and-pages/
    navigator.serviceWorker.onmessage = (e) => {
        console.log("SW: SW Broadcasting:", event);
        const data = e.data;

        if(data.command === "UPDATE_FOUND"){
            console.log("UPDATE_FOUND_BY_SW", data);
            console.log("Content updated.");
            location.reload();
        }
    };
}
