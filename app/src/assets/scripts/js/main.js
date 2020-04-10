"use strict";

import PWGenerator from './app/PWGenerator';

document.addEventListener('DOMContentLoaded', function() {
	document.documentElement.innerHTML = document.documentElement.innerHTML.replace('{{ year }}', new Date().getFullYear());

	const resultEl = document.getElementById('pw-generated'),
		copyAlert = document.getElementById('copy-alert'),
		optLength = document.getElementById('pw-length'),
		optLettersEl = document.getElementById('pw-use-letters'),
		optLcUcEl = document.getElementById('pw-use-lucase'),
		optPunctuationEl = document.getElementById('pw-use-punctuation'),
		optNumbersEl = document.getElementById('pw-use-numbers'),
		optAdditionalsEl = document.getElementById('pw-additionals'),
		generateTrigger = document.getElementById('pw-generate');

	const pwg = new PWGenerator(result => {
		resultEl.value = result;
	});

	function updateResult() {
		pwg.generate(result => {
			resultEl.value = result;
		});
	}

	function checkLettersOnNoneChecked() {
		if(!optLettersEl.checked && !optPunctuationEl.checked && !optNumbersEl.checked) {
			optLettersEl.checked = true;
			optLettersEl.onchange();
		}
	}

	resultEl.addEventListener('dblclick', function() {
		this.select();
		this.setSelectionRange(0, 99999);

		document.execCommand('copy');

		copyAlert.classList.remove('d-none');

		setTimeout(() => {
			copyAlert.classList.add('d-none');
		}, 3000);
	});

	generateTrigger.onclick = function() {
		updateResult();
	};

	optLength.onchange = function() {
		if(parseInt(this.value) < 4) {
			this.value = 4;
			pwg.setLength(4);
		} else if(parseInt(this.value) > 64) {
			this.value = 64;
			pwg.setLength(64);
		} else {
			pwg.setLength(parseInt(this.value));
		}

		updateResult();
	};

	optLettersEl.onchange = function() {
		if(this.checked) {
			pwg.enableOption('letters');
			optLcUcEl.checked = true;
			optLcUcEl.disabled = false;
			optLcUcEl.onchange();
		} else {
			pwg.disableOption('letters');
			optLcUcEl.checked = false;
			optLcUcEl.disabled = true;
			optLcUcEl.onchange();
		}

		updateResult();
		checkLettersOnNoneChecked();
	};

	optLcUcEl.onchange = function() {
		if(this.checked) {
			pwg.enableOption('lcuc');
		} else {
			pwg.disableOption('lcuc');
		}

		updateResult();
	};

	optPunctuationEl.onchange = function() {
		if(this.checked) {
			pwg.enableOption('punctuation');
		} else {
			pwg.disableOption('punctuation');
		}

		updateResult();
		checkLettersOnNoneChecked();
	};

	optNumbersEl.onchange = function() {
		if(this.checked) {
			pwg.enableOption('numbers');
		} else {
			pwg.disableOption('numbers');
		}

		updateResult();
		checkLettersOnNoneChecked();
	};

	optAdditionalsEl.oninput = function() {
		pwg.setAdditionals(this.value);
		updateResult();
	}
});