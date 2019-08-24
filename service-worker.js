'use strict';

const config = {
	version: location.hostname === 'localhost' ? new Date().toISOString() : '1.0.0-a2',
	stale: [
		/* Root document */
		'/',

		/* Other HTML */
		'https://cdn.kernvalley.us/components/toast-message.html',
		'https://cdn.kernvalley.us/components/login-form/login-form.html',
		'https://cdn.kernvalley.us/components/registration-form/registration-form.html',
		'/js/rafting-trip.html',
		'/js/schema-postal-address.html',

		/* JS, `customElements`, etc. */
		'/js/index.js',
		'/js/slot-helpers.js',
		'/js/offer-catelog.js',
		'/js/rafting-trip.js',
		'/js/schema-postal-address.js',
		'https://cdn.kernvalley.us/components/share-button.js',
		'https://cdn.kernvalley.us/js/std-js/share-config.js',
		'https://cdn.kernvalley.us/components/current-year.js',
		'https://cdn.kernvalley.us/js/std-js/deprefixer.js',
		'https://cdn.kernvalley.us/js/std-js/shims.js',
		'https://cdn.kernvalley.us/js/std-js/md5.js',
		'https://cdn.kernvalley.us/js/std-js/Notification.js',
		'https://cdn.kernvalley.us/js/std-js/webShareApi.js',
		'https://cdn.kernvalley.us/js/std-js/esQuery.js',
		'https://cdn.kernvalley.us/js/std-js/functions.js',
		'https://cdn.kernvalley.us/components/login-button.js',
		'https://cdn.kernvalley.us/components/logout-button.js',
		'https://cdn.kernvalley.us/components/register-button.js',
		'https://cdn.kernvalley.us/components/gravatar-img.js',
		'https://cdn.kernvalley.us/components/toast-message.js',
		'https://cdn.kernvalley.us/js/std-js/asyncDialog.js',
		'https://cdn.kernvalley.us/js/User.js',
		'https://cdn.kernvalley.us/components/login-form/login-form.js',
		'https://cdn.kernvalley.us/components/registration-form/registration-form.js',
		'https://cdn.kernvalley.us/js/PaymentAPI/PaymentRequest.js',
		'https://cdn.kernvalley.us/js/PaymentAPI/PaymentRequestUpdateEvent.js',
		'https://cdn.kernvalley.us/js/PaymentAPI/PaymentAddress.js',
		'https://cdn.kernvalley.us/js/PaymentAPI/PaymentResponse.js',
		'https://cdn.kernvalley.us/js/PaymentAPI/BasicCardResponse.js',
		'https://cdn.kernvalley.us/js/PaymentAPI/BillingAddress.js',
		'https://cdn.kernvalley.us/components/payment-form/payment-form.js',

		/* CSS */
		'/css/index.css',
		'/css/vars.css',
		'/css/layout.css',
		'/css/header.css',
		'/css/nav.css',
		'/css/main.css',
		'/css/sidebar.css',
		'/css/footer.css',
		'https://cdn.kernvalley.us/css/core-css/rem.css',
		'https://cdn.kernvalley.us/css/core-css/viewport.css',
		'https://cdn.kernvalley.us/css/core-css/element.css',
		'https://cdn.kernvalley.us/css/core-css/class-rules.css',
		'https://cdn.kernvalley.us/css/core-css/utility.css',
		'https://cdn.kernvalley.us/css/core-css/fonts.css',
		'https://cdn.kernvalley.us/css/core-css/animations.css',
		'https://cdn.kernvalley.us/css/normalize/normalize.css',
		'https://cdn.kernvalley.us/css/animate.css/animate.css',

		/* Images & Icons */
		'/img/icons.svg',
		'/img/apple-touch-icon.png',
		'/img/icon-192.png',
		'/img/favicon.svg',
		'https://cdn.kernvalley.us/img/adwaita-icons/actions/mail-send.svg',
		'https://cdn.kernvalley.us/img/octicons/file-media.svg',

		/* Social Icons for Web Share API shim */
		'https://cdn.kernvalley.us/img/octicons/mail.svg',
		'https://cdn.kernvalley.us/img/logos/facebook.svg',
		'https://cdn.kernvalley.us/img/logos/twitter.svg',
		'https://cdn.kernvalley.us/img/logos/google-plus.svg',
		'https://cdn.kernvalley.us/img/logos/linkedin.svg',
		'https://cdn.kernvalley.us/img/logos/reddit.svg',
		'https://cdn.kernvalley.us/img/logos/gmail.svg',
		'https://cdn.kernvalley.us/img/logos/instagram.svg',

		/* Fonts */
		'https://cdn.kernvalley.us/fonts/roboto.woff2',
		'https://cdn.kernvalley.us/fonts/Libertine.woff',

		/* Other */
		'/trips.json',
	].map(path => new URL(path, location.origin).href),
	fresh: [
	].map(path => new URL(path, location.origin).href),
	allowed: [],
};

self.addEventListener('install', async () => {
	try {
		for (const key of await caches.keys()) {
			await caches.delete(key);
		}

		const cache = await caches.open(config.version);
		await cache.addAll(config.stale);
	} catch (err) {
		console.error(err);
	}

	skipWaiting();
});

self.addEventListener('activate', event => {
	event.waitUntil(async function() {
		clients.claim();
	}());
});

self.addEventListener('fetch', event => {
	switch(event.request.method) {
	case 'GET':
		if (Array.isArray(config.stale) && config.stale.includes(event.request.url)) {
			event.respondWith((async () => {
				const cached = await caches.match(event.request);
				if (cached instanceof Response) {
					return cached;
				} else {
					return await fetch(event.request);
				}
			})());
		} else if (Array.isArray(config.fresh) && config.fresh.includes(event.request.url)) {
			event.respondWith((async () => {
				if (navigator.onLine) {
					const resp = await fetch(event.request);
					const cache = await caches.open(config.version);
					cache.add(resp.clone());
					return resp;
				} else {
					return await caches.match(event.request);
				}
			})());
		} else if (Array.isArray(config.allowed) && config.allowed.some(host => new URL(event.request.url).host === host)) {
			event.respondWith((async () => {
				const resp = await caches.match(event.request);
				if (resp instanceof Response) {
					return resp;
				} else if (navigator.onLine) {
					const resp = await fetch(event.request);
					const cache = await caches.open(config.version);
					cache.add(resp.clone());
					return resp;
				} else {
					return await fetch(event.request);
				}
			})());
		}
	}
});
