export function getSlot(name, shadow) {
	return shadow.querySelector(`slot[name=${name}]`);
}

export function getSlottedElements(name, shadow) {
	const slot = getSlot(name, shadow);
	return slot instanceof HTMLElement ? slot.assignedElements() : [];
}

export function removeSlottedElements(name, shadow) {
	getSlottedElements(name, shadow).forEach(el => el.remove());
}

export function getSlottedElement(name, shadow) {
	const els = getSlottedElements(name, shadow);
	return els.length === 0 ? null : els[0];
}

export function getSlotContent(name, shadow) {
	const el = getSlottedElement(name, shadow);
	return el instanceof HTMLElement ? el.textContent : null;
}

export function getSlotAttribute(name, shadow, attr = 'content') {
	const el = getSlottedElement(name, shadow);
	return el instanceof HTMLElement ? el.getAttribute(attr) : null;
}
