import {getSlotContent, removeSlottedElements, getSlotAttribute} from './slot-helpers.js';
class SchemaPostalAddressElement extends HTMLElement {
	constructor() {
		super();
		this.setAttribute('itemtype', 'https://schema.org/PostalAddress');
		this.setAttribute('itemscope', '');
		this.attachShadow({mode: 'open'});

		fetch('/js/schema-postal-address.html').then(async resp => {
			const parser = new DOMParser();
			const html = await resp.text();
			const doc = parser.parseFromString(html, 'text/html');
			this.shadowRoot.append(...doc.head.children, ...doc.body.children);
		});
	}

	toJSON() {
		const {streetAddress, postOfficeBoxNumber, addressLocality, addressRegion, postalCode, addressCountry} = this;
		return {
			'@context': 'https://schema.org',
			'@type': 'PostalAddress',
			streetAddress,
			postOfficeBoxNumber,
			addressLocality,
			addressRegion,
			postalCode,
			addressCountry,
		};
	}

	get streetAddress() {
		return getSlotContent('streetAddress', this.shadowRoot);
	}

	set streetAddress(val) {
		const el = document.createElement('span');
		el.textContent = val;
		el.slot = 'streetAddress';
		el.setAttribute('itemprop', 'streetAddress');
		removeSlottedElements('streetAddress', this.shadowRoot);
		this.append(el);
	}

	get postOfficeBoxNumber() {
		return getSlotContent('postOfficeBoxNumber', this.shadowRoot);
	}

	set postOfficeBoxNumber(val) {
		const el = document.createElement('span');
		el.textContent = val;
		el.slot = 'postOfficeBoxNumber';
		el.setAttribute('itemprop', 'postOfficeBoxNumber');
		removeSlottedElements('postOfficeBoxNumber', this.shadowRoot);
		this.append(el);
	}

	get addressLocality() {
		return getSlotContent('addressLocality', this.shadowRoot);
	}

	set addressLocality(val) {
		const el = document.createElement('span');
		el.textContent = val;
		el.slot = 'addressLocality';
		el.setAttribute('itemprop', 'addressLocality');
		removeSlottedElements('addressLocality', this.shadowRoot);
		this.append(el);
	}

	get addressRegion() {
		return getSlotContent('addressRegion', this.shadowRoot);
	}

	set addressRegion(val) {
		const el = document.createElement('span');
		el.textContent = val;
		el.slot = 'addressRegion';
		el.setAttribute('itemprop', 'addressRegion');
		removeSlottedElements('addressRegion', this.shadowRoot);
		this.append(el);
	}

	get postalCode() {
		return getSlotContent('postalCode', this.shadowRoot) || getSlotAttribute('postalCode', this.shadowRoot, 'content');
	}

	set postalCode(val) {
		const el = document.createElement('span');
		el.textContent = val;
		el.slot = 'postalCode';
		el.setAttribute('itemprop', 'postalCode');
		removeSlottedElements('postalCode', this.shadowRoot);
		this.append(el);
	}

	get addressCountry() {
		return getSlotAttribute('addressCountry', this.shadowRoot, 'content') || getSlotContent('addressCountry', this.shadowRoot);
	}

	set addressCountry(val) {
		const el = document.createElement('meta');
		el.content = val;
		el.slot = 'addressCountry';
		el.setAttribute('itemprop', 'addressCountry');
		removeSlottedElements('addressCountry', this.shadowRoot, 'content');
		this.append(el);
	}
}

customElements.define('schema-postal-address', SchemaPostalAddressElement);
