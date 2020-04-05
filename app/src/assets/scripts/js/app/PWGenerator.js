/**
 *
 *
 * @export
 * @class PWGenerator
 */
export default class PWGenerator {
	
	/**
	 * Creates an instance of PWGenerator.
	 * @param {Function} cb
	 * @memberof PWGenerator
	 */
	constructor(cb) {
		this._data = {
			letters: {
				lc: "abcdefghijklmnopqrstuvwxyz",
				uc: "ABCDEFGHIJKLMNOPQRSTUVWXYZ"
			},
			punctuation: "!@#$%&*_-+=",
			numbers: "0123456789"
		};
		this._length = 16;
		this._options = {
			letters: true,
			lcuc: true,
			punctuation: true,
			numbers: true
		};

		this.generate(cb);
	}
	
	/**
	 * Shuffle a string
	 *
	 * @param {string} str
	 * @returns
	 * @memberof PWGenerator
	 */
	_shuffle(str) {
		return str.split('').sort(() => {
			return 0.5 - Math.random();
		}).join('');
	}

	/**
	 * Disable a option
	 *
	 * @param {string} option
	 * @memberof PWGenerator
	 */
	disableOption(option) {
		this._options[option] = false;
	}
	
	/**
	 * Enable a option
	 *
	 * @param {string} option
	 * @memberof PWGenerator
	 */
	enableOption(option) {
		this._options[option] = true;
	}
	
	/**
	 * Set a length for the password
	 *
	 * @param {number} size
	 * @memberof PWGenerator
	 */
	setLength(size) {
		this._length = size;
	}

	/**
	 * Generate a password
	 *
	 * @param {Function} cb
	 * @memberof PWGenerator
	 */
	generate(cb) {
		let conjunct = "";

		if(this._options.letters) conjunct += this._data.letters.lc;
		if(this._options.letters && this._options.lcuc) conjunct += this._data.letters.uc;
		if(this._options.punctuation) conjunct += this._data.punctuation;
		if(this._options.numbers) conjunct += this._data.numbers;

		conjunct = this._shuffle(conjunct);

		let generated = "";

		for(let i = 0; i < this._length; i++) {
			let random = Math.floor(Math.random() * conjunct.length);

			generated += conjunct.substr(random, 1);
		}

		cb(generated);
	}

}