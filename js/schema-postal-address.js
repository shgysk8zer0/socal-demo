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
}

customElements.define('schema-postal-address', SchemaPostalAddressElement);
