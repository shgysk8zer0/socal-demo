import './rafting-trip.js';

class OfferCatelogElement extends HTMLElement {
	async connectedCallback() {
		const resp = await fetch(new URL('trips.json', document.baseURI));
		await customElements.whenDefined('rafting-trip');
		const RaftingTripElement = customElements.get('rafting-trip');
		const trips = await resp.json();
		const els = trips.map(trip => {
			const el = new RaftingTripElement();
			el.name = trip.name;
			el.image = trip.image[2];
			el.description = trip.description;
			el.classList.add('card', 'shadow');
			return el;
		});
		this.append(...els);
	}
}

customElements.define('offer-catelog', OfferCatelogElement);
