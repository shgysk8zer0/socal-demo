import {$} from 'https://cdn.kernvalley.us/js/std-js/functions.js';
import PaymentRequestShim from 'https://cdn.kernvalley.us/js/PaymentAPI/PaymentRequest.js';

if (! ('PaymentRequest' in window)) {
	window.PaymentRequest = PaymentRequestShim;
}

class RaftingTripElement extends HTMLElement {
	constructor() {
		super();
		this.setAttribute('itemtype', 'https://schema.org/Event');
		this.setAttribute('itemscope', '');
		this.attachShadow({mode: 'open'});
		fetch(new URL('/js/rafting-trip.html', document.baseURI)).then(async resp => {
			const parser = new DOMParser();
			const html = await resp.text();
			const doc = parser.parseFromString(html, 'text/html');

			$('form', doc).submit(async event => {
				event.preventDefault();
				const {adults, children} = Object.fromEntries(new FormData(event.target).entries());
				const displayItems = [{
					label: `Adults (${adults})`,
					amount: {
						currency: 'USD',
						value: parseInt(adults) * 85
					}
				},{
					label: `Children (${children})`,
					amount: {
						currency: 'USD',
						value: parseInt(children) * 45.5
					}
				}];
				const paymentRequest = new PaymentRequest([{
					supportedMethods: 'basic-card',
					data: {
						supportedNetworks: ['visa', 'mastercard','discover'],
						supportedTypes: ['credit', 'debit']
					}
				}], {
					displayItems,
					total: {
						label: 'Total Cost',
						amount: {
							currency: 'USD',
							value: displayItems.reduce((sum, item) => sum + item.amount.value, 0),
						}
					}
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
		el.setAttribute('itemprop', 'name');
		el.textContent = val;
		this.append(el);
	}

	set description(val) {
		const el = document.createElement('blockquote');
		el.slot = 'description';
		el.setAttribute('itemprop', 'description');
		el.textContent = val;
		this.append(el);
	}

	set image({url, height, width}) {
		const img = new Image(width, height);
		img.decoding = 'async';
		img.src = url;
		img.setAttribute('itemprop', 'image');
		img.slot = 'image';
		this.append(img);
	}
}

customElements.define('rafting-trip', RaftingTripElement);
