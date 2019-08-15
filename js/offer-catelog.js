import './rafting-trip.js';

class OfferCatelogElement extends HTMLElement {
	async connectedCallback() {
		const resp = await fetch(new URL('trips.json', document.baseURI));
		await customElements.whenDefined('rafting-trip');
		const RaftingTripElement = customElements.get('rafting-trip');
		const trips = await resp.json();
		const els = trips.map(trip => {
			const el = new RaftingTripElement();
			const adult = trip.offers.find(offer => offer.name.toLowerCase() === 'adult');
			const child = trip.offers.find(offer => offer.name.toLowerCase() === 'child');
			el.name = trip.name;
			el.image = trip.image[2];
			el.description = trip.description;
			el.adultPrice = {value: adult.price, currency: adult.priceCurrency};
			el.childPrice = {value: child.price, currency: child.priceCurrency};
			return el;
		});
		this.append(...els);
	}
}

customElements.define('offer-catelog', OfferCatelogElement);
