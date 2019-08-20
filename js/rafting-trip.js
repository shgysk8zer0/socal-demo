import {$} from 'https://cdn.kernvalley.us/js/std-js/functions.js';
import PaymentRequestShim from 'https://cdn.kernvalley.us/js/PaymentAPI/PaymentRequest.js';
import {getSlotContent, removeSlottedElements} from './slot-helpers.js';
import 'https://cdn.kernvalley.us/components/toast-message.js';
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
				const {adults, children, departureTime, date, identifier} = Object.fromEntries(new FormData(event.target).entries());
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

				await customElements.whenDefined('toast-message');
				await terms.show();
				await terms.closed;

				if (await paymentRequest.canMakePayment()) {
					try {
						const paymentResponse = await paymentRequest.show();
						paymentResponse.complete('success');
						$('#payment-dialog').remove();
						console.log(paymentResponse);
						await customElements.whenDefined('toast-message');
						const Toast = customElements.get('toast-message');
						const pre = document.createElement('pre');
						const code = document.createElement('code');
						const toast = new Toast();
						pre.slot = 'content';
						code.textContent = JSON.stringify({identifier, adults, children, departureTime, date, paymentResponse}, null, 4);
						pre.append(code);
						toast.append(pre);
						document.body.append(toast);
						await toast.show();
						await toast.closed;
						toast.remove();
					} catch(err) {
						console.error(err);
						$('#payment-dialog').remove();
						await customElements.whenDefined('toast-message');
						const Toast = customElements.get('toast-message');
						Toast.toast(err.message);
					} finally {
						$('#payment-dialog').remove();
					}
				}
			});
			this.shadowRoot.append(...doc.head.children, ...doc.body.children);
			this.dispatchEvent(new Event('ready'));
		});
	}

	get ready() {
		return new Promise(resolve => {
			if (this.shadowRoot !== null && this.shadowRoot.childElementCount !==0) {
				resolve();
			} else {
				this.addEventListener('ready', () => resolve(), {once: true});
			}
		});
	}

	set name(val) {
		const el = document.createElement('span');
		el.slot = 'name';
		el.setAttribute('itemprop', 'name');
		el.textContent = val;
		this.append(el);
	}

	set identifier(uuid) {
		this.id = uuid;
		this.shadowRoot.querySelector('[name="identifier"]').value = uuid;
	}

	set description(val) {
		const el = document.createElement('blockquote');
		el.slot = 'description';
		el.setAttribute('itemprop', 'description');
		el.textContent = val;
		removeSlottedElements('description', this.shadowRoot);
		this.append(el);
	}

	set departureTimes(times) {
		if (Array.isArray(times)) {
			const opts = times.map(time => {
				const opt = document.createElement('option');
				opt.value = time;
				opt.textContent = new Date(`2000-01-01T${time}`).toLocaleTimeString();
				return opt;
			});
			this.shadowRoot.querySelector('select[name="departureTime"]').append(...opts);
		} else {
			throw new Error('Expected an array of departure times');
		}
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
