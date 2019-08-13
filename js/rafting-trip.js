import {$} from 'https://cdn.kernvalley.us/js/std-js/functions.js';
import PaymentRequestShim from 'https://cdn.kernvalley.us/js/PaymentAPI/PaymentRequest.js';

if (! ('PaymentRequest' in window)) {
	window.PaymentRequest = PaymentRequestShim;
}

class RaftingTripElement extends HTMLElement {
	constructor() {
		super();
		this.attachShadow({mode: 'open'});
		fetch(new URL('/js/rafting-trip.html', document.baseURI)).then(async resp => {
			const parser = new DOMParser();
			const html = await resp.text();
			const doc = parser.parseFromString(html, 'text/html');
			$('form', doc).submit(async event => {
				event.preventDefault();
				const data = Object.fromEntries(new FormData(event.target).entries());
				console.log(data);
				const paymentRequest = new PaymentRequest([{
					supportedMethods: 'basic-card',
					data: {
						supportedNetworks: ['visa', 'mastercard','discover'],
						supportedTypes: ['credit', 'debit']
					}
				}], {
					total: {
						label: 'Total Cost',
						amount: {
							currency: 'USD',
							value: 468.75
						}
					},
					displayItems: [{
						label: 'Adults (3)',
						amount: {
							currency: 'USD',
							value: 255.00
						}
					},{
						label: 'Children (5)',
						amount: {
							currency: 'USD',
							value: 213.75
						}
					}],
				}, {
					requestPayerName: true,
					requestPayerEmail: true,
					requestPayerPhone: true,
				});

				if (await paymentRequest.canMakePayment()) {
					const paymentResponse = await paymentRequest.show();
					paymentResponse.complete('success');
					console.log(paymentResponse);
				}
			});
			this.shadowRoot.append(...doc.head.children, ...doc.body.children);
		});
	}

	set name(val) {
		const el = document.createElement('span');
		el.slot = 'name';
		el.textContent = val;
		this.append(el);
	}

	set description(val) {
		const el = document.createElement('blockquote');
		el.slot = 'description';
		el.textContent = val;
		this.append(el);
	}

	set image({url, height, width}) {
		const img = new Image(width, height);
		img.decoding = 'async';
		img.src = url;
		img.slot = 'image';
		this.append(img);
	}
}

customElements.define('rafting-trip', RaftingTripElement);
