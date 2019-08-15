import {$, waitUntil} from 'https://cdn.kernvalley.us/js/std-js/functions.js';
import PaymentRequestShim from 'https://cdn.kernvalley.us/js/PaymentAPI/PaymentRequest.js';
import {getSlotContent, removeSlottedElements} from './slot-helpers.js';

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
				const terms = document.getElementById('instructions');
				const {adults, children} = Object.fromEntries(new FormData(event.target).entries());
				const displayItems = [{
					label: `Adults (${adults})`,
					amount: {
						currency: 'USD',
						value: parseInt(adults) * this.adultPrice
					}
				},{
					label: `Children (${children})`,
					amount: {
						currency: 'USD',
						value: parseInt(children) * this.childPrice
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

				terms.showModal();
				terms.scrollIntoView({block: 'start', behavior: 'smooth'});
				await waitUntil(terms, 'close');

				if (await paymentRequest.canMakePayment()) {
					try {
						const paymentResponse = await paymentRequest.show();
						paymentResponse.complete('success');
						$('#payment-dialog').remove();
						console.log(paymentResponse);
					} catch(err) {
						console.error(err);
						$('#payment-dialog').remove();
					} finally {
						$('#payment-dialog').remove();
					}
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
		removeSlottedElements('description', this.shadowRoot);
		this.append(el);
	}

	get adultPrice() {
		return parseFloat(getSlotContent('adultPrice', this.shadowRoot).replace(/[^\d.]/g, ''));
	}

	set adultPrice({value, currency = 'USD'}) {
		const el = document.createElement('span');
		el.slot = 'adultPrice';
		// el.setAttribute('itemprop', '');
		el.textContent = Intl.NumberFormat(navigator.language, {style: 'currency', currency}).format(value);
		removeSlottedElements('adultPrice', this.shadowRoot);
		this.append(el);
	}

	get childPrice() {
		return parseFloat(getSlotContent('childPrice', this.shadowRoot).replace(/[^\d.]/g, ''));
	}

	set childPrice({value, currency = 'USD'}) {
		const el = document.createElement('span');
		el.slot = 'childPrice';
		// el.setAttribute('itemprop', '');
		el.textContent = Intl.NumberFormat(navigator.language, {style: 'currency', currency}).format(value);
		removeSlottedElements('childPricer', this.shadowRoot);
		this.append(el);
	}

	set image({url, height, width}) {
		const img = new Image(width, height);
		img.decoding = 'async';
		img.src = url;
		img.setAttribute('itemprop', 'image');
		img.slot = 'image';
		removeSlottedElements('image', this.shadowRoot);
		this.append(img);
	}
}

customElements.define('rafting-trip', RaftingTripElement);
