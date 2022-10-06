let body = document.body;
let tableBody = body.querySelector('tbody');
let tableTemplate = body.querySelector('#template').content;
let sortSelect = body.querySelector('.form-select');
let filterInput = body.querySelector('.form-control');
let modal = body.querySelector('.modal');
let closeButton = body.querySelector('.btn-close');
let loading = body.querySelector('.loading');
let currencyNav = body.querySelector('.currency-nav');
let currencyCounter = body.querySelector('.currency-counter');

async function getData(url) {
	try {
		loading.classList.remove('loading-on');
		let rawData = await fetch(url);
		let { status, data } = await rawData.json();

		if (status === 200) {
			loading.classList.add('loading-on');
		}

		window.localStorage.setItem('currencies', JSON.stringify(data));
		renderCurrencies(data);
	} catch (error) {
		loading.classList.add('loading-on');
		console.log(error);
		console.log('Internet uzildi');
	}
}
getData('https://pressa-exem.herokuapp.com/api-49');

let localCurrencies = window.localStorage.getItem('currencies');
let data = [];
if (localCurrencies) {
	data = JSON.parse(localCurrencies);
	for (let i = 0; i < data.length; i++) {
		data[i].num = i;
	}
	renderCurrencies(data);
}
console.log(data);

// Render function
function renderCurrencies(data) {
	tableBody.innerHTML = null;
	let fragment = document.createDocumentFragment();
	// creating elements
	data.forEach((element) => {
		let template = tableTemplate.cloneNode(true);
		template.querySelector('.currency-code').textContent = element.Code;
		template.querySelector('.currency-name').textContent = element.CcyNm_EN;
		template.querySelector('.currency-lcode').textContent = element.Ccy;
		template.querySelector('.currency-value').textContent =
			element.Rate + ' ' + "so'm";
		template.querySelector('.currency-update').textContent = element.Date;
		template.querySelector('.currency-badge').dataset.id = element.id;
		fragment.append(template);
	});

	tableBody.append(fragment);
}

let showPopUp = () => (modal.style.display = 'flex');
setTimeout(() => {
	if (localStorage.getItem('popUp') !== 'shown') {
		showPopUp();
	}
}, 10000);

closeButton.addEventListener('click', () => {
	modal.style.display = 'none';
	localStorage.setItem('popUp', 'shown');
});

// To prevent reloading page
form.addEventListener('submit', (evt) => {
	evt.preventDefault();
});

// Sort
sortSelect.addEventListener('change', (evt) => {
	let sortValue = evt.target.value;
	let sorted = [...data].sort((a, b) => {
		if (sortValue === 'high-low') {
			return Number(a.Rate) < Number(b.Rate)
				? 1
				: Number(a.Rate) > Number(b.Rate)
				? -1
				: 0;
		} else if (sortValue === 'low-high') {
			return Number(a.Rate) > Number(b.Rate)
				? 1
				: Number(a.Rate) < Number(b.Rate)
				? -1
				: 0;
		} else {
			return renderCurrencies(data);
		}
	});

	renderCurrencies(sorted);
});

// Filter
filterInput.addEventListener('input', (evt) => {
	evt.preventDefault();
	let filterValue = Number(evt.target.value);
	let filtered = [...data].filter(
		(element) => filterValue < Number(element.Rate),
	);
	renderCurrencies(filtered);
});

// Badge Counter
let badge = [];
tableBody.addEventListener('click', (evt) => {
	elStatus = evt.target.closest('.currency-badge');
	elStatus.classList.toggle('bg-change');

	if (elStatus.classList.contains('bg-change')) {
		// push id of elStatus
		badge.push(elStatus.dataset.id);
	} else if (!elStatus.classList.contains('bg-change')) {
		// removing elStatus
		let index = badge.indexOf(elStatus.dataset.id);
		badge.splice(index, 1);
	}
	currencyCounter.textContent = badge.length;
});
