#!/usr/bin/env node
import Hidive from './hidive';

(async () => {
	const hidive = new Hidive();
	await hidive.cli();
})();
