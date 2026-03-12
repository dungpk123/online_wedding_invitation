const navToggle = document.querySelector('.nav-toggle');
const mainNav = document.querySelector('.main-nav');
const navLinks = document.querySelectorAll('.main-nav a');
const revealItems = document.querySelectorAll('.reveal');
const parallaxLayers = document.querySelectorAll('[data-parallax]');
const heroForeground = document.querySelector('[data-scroll-foreground]');
const infoStrip = document.querySelector('[data-scroll-panel]');
const heroSection = document.querySelector('.hero');
const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');

const setMenu = (open) => {
	if (!navToggle || !mainNav) {
		return;
	}

	navToggle.setAttribute('aria-expanded', String(open));
	mainNav.classList.toggle('is-open', open);
	document.body.classList.toggle('menu-open', open);
};

if (navToggle && mainNav) {
	navToggle.addEventListener('click', () => {
		const expanded = navToggle.getAttribute('aria-expanded') === 'true';
		setMenu(!expanded);
	});

	navLinks.forEach((link) => {
		link.addEventListener('click', () => setMenu(false));
	});
}

if (prefersReducedMotion.matches) {
	revealItems.forEach((item) => item.classList.add('is-visible'));
} else {
	const revealObserver = new IntersectionObserver((entries, observer) => {
		entries.forEach((entry) => {
			if (!entry.isIntersecting) {
				return;
			}

			entry.target.classList.add('is-visible');
			observer.unobserve(entry.target);
		});
	}, {
		threshold: 0.16,
		rootMargin: '0px 0px -12% 0px'
	});

	revealItems.forEach((item) => revealObserver.observe(item));
}

let ticking = false;

const updateParallax = () => {
	const viewportHeight = window.innerHeight;

	parallaxLayers.forEach((layer) => {
		const speed = Number(layer.dataset.speed || 0.006);
		const scale = Number(layer.dataset.scale || 1.12);
		const parent = layer.parentElement;

		if (!parent) {
			return;
		}

		const rect = parent.getBoundingClientRect();

		if (rect.bottom < -viewportHeight || rect.top > viewportHeight) {
			return;
		}

		const translateY = rect.top * speed;
		layer.style.transform = `translate3d(0, ${translateY}px, 0) scale(${scale})`;
	});

	if (heroForeground && heroSection) {
		const rect = heroSection.getBoundingClientRect();
		const speed = Number(heroForeground.dataset.scrollForeground || 0.56);

		if (rect.bottom > 0 && rect.top < viewportHeight) {
			const translateY = Math.max(rect.top * speed, -360);
			heroForeground.style.transform = `translate3d(0, ${translateY}px, 0)`;
		}
	}

	if (infoStrip && heroSection) {
		const heroRect = heroSection.getBoundingClientRect();
		const speed = Number(infoStrip.dataset.scrollPanel || 0.54);
		const heroScrolled = Math.max(0, -heroRect.top);
		const translateY = -Math.min(heroScrolled * speed, 260);
		infoStrip.style.transform = `translate3d(0, ${translateY}px, 0)`;
	}

	ticking = false;
};

const onScroll = () => {
	if (prefersReducedMotion.matches || ticking) {
		return;
	}

	ticking = true;
	window.requestAnimationFrame(updateParallax);
};

window.addEventListener('scroll', onScroll, { passive: true });
window.addEventListener('resize', onScroll);
window.addEventListener('load', onScroll);

prefersReducedMotion.addEventListener('change', () => {
	if (prefersReducedMotion.matches) {
		revealItems.forEach((item) => item.classList.add('is-visible'));
		parallaxLayers.forEach((layer) => {
			layer.style.transform = 'translate3d(0, 0, 0)';
		});
		if (heroForeground) {
			heroForeground.style.transform = 'translate3d(0, 0, 0)';
		}
		if (infoStrip) {
			infoStrip.style.transform = 'translate3d(0, 0, 0)';
		}
		return;
	}

	onScroll();
});
