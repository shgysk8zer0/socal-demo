import './rafting-trip.js';

class OfferCatelogElement extends HTMLElement {
	async connectedCallback() {
		const resp = await fetch(new URL('trips.json', document.baseURI));
		await customElements.whenDefined('rafting-trip');
		const RaftingTripElement = customElements.get('rafting-trip');
		const trips = await resp.json();
		const els = await Promise.all(trips.map(async trip => {
			const el = new RaftingTripElement();
			await el.ready;
			const adult = trip.offers.find(offer => offer.name.toLowerCase() === 'adult');
			const child = trip.offers.find(offer => offer.name.toLowerCase() === 'child');
			el.name = trip.name;
			el.image = trip.image;
			el.identifier = trip.identifier;
			el.description = trip.description;
			el.adultPrice = {value: adult.price, currency: adult.priceCurrency};
			el.childPrice = {value: child.price, currency: child.priceCurrency};
			el.departureTimes = trip.departureTime;
			return el;
		}));
		this.append(...els);
	}
}

customElements.define('offer-catelog', OfferCatelogElement);
