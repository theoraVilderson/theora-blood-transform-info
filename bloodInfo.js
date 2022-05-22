/*
-O can send for any types

+o can send for Every Positive Types

every Type can send and get from their type

in send mode 
 +A => (+A)(+AB) ||  -A => (-A)(-AB)(+A)(+AB)
if it's positive all occurrence that is positive !
but if it's negative all occurrence are allowed!
from Each TypeOf Blood Char => -B => +B +AB -B -AB

in receive mode 
+AB can get from anyone

Every type can get from -o 
positive =>self and it's negative contains! 
	Ever Positive can get FROM +O 
negative => every -((^\w{1}) | (A|B)) letter and contains negative Type

+A = 
send = +A +AB
Receive = +A -A +O -O

-A =
send = +A -A +AB -AB
Receive = -A -O

+AB = 
send = +AB
Receive = *

-AB = 
send = +AB -AB
Receive =-A -AB -B -O 

B+ = 
send = +B +AB
Receive =+B -B +O -O

-B = 
send = +B -B -AB +AB
Receive = -B -O

+O =
send = +O +A +B +AB
Receive = +o -O
-o =
send = *
Receive = -O


 */

class BloodInfo {
	constructor() {
		this.init();
	}
	init() {
		this.shortcutSigns = ["*", "*+", "*-"];
		this.errorMsg = {
			INVALID_BLOOD_TYPE:
				"{} blood type is invalid use " +
				this.bloodTypes +
				" || use " +
				this.shortcutSigns,
			INVALID_BLOOD_TYPE_SHORTCUT:
				"{} blood type shortcut is invalid use " + this.shortcutSigns,
		};
	}
	get bloodTypes() {
		return ["A", "B", "AB", "O"].reduce((lastRes, type) => {
			lastRes.push(...["+" + type, "-" + type]);
			return lastRes;
		}, []);
	}
	get positiveBloodTypes() {
		return this.bloodTypes.filter((e) => e[0] === "+");
	}
	get nagtiveBloodTypes() {
		return this.bloodTypes.filter((e) => e[0] === "-");
	}

	instance(bloodType) {
		// wont checking input
		// because it will be automatically on first shot

		const ignoreMethods = [
			"constructor",
			"instance",
			"init",
			"askingQuestion",
		];
		// getting valid methods
		const allMethods = Object.getOwnPropertyNames(
			this.constructor.prototype
		)
			.filter(
				(e) =>
					!ignoreMethods.includes(e) &&
					typeof this[e] == "function" &&
					this[e].length
			)
			.reduce((lastRes, e) => {
				lastRes[e] = this[e].bind(this, bloodType);
				return lastRes;
			}, {});

		// for create instance from special Blood Type
		const lastRes = {
			currentBloodType: bloodType,
			constructor: this,
			...allMethods,
		};

		return this.#success(lastRes);
	}

	allBloodsTypeCanBeReceiveAction(bloodType) {
		// validate input
		const { error: normalizeBloodTypeError, data } =
			this.normalizeBloodType(bloodType);
		bloodType = data;
		if (normalizeBloodTypeError)
			return this.#error(normalizeBloodTypeError);

		const lastRes = [];

		// +AB will take from anyone

		if (bloodType === "+AB") return this.#success([`*`]);
		// every one can receive from their bloodType
		lastRes.push(bloodType);

		// -o can send to any one ! and any one can receive it
		if (bloodType !== "-O") lastRes.push("-O");

		const { data: isPositive } = this.isPositiveBlood(bloodType);

		if (isPositive) {
			const { data: invertBloodType } = this.invertBloodType(bloodType);

			//  every positive bloodType can get from it's negative types
			if (bloodType !== "+O") {
				lastRes.push(invertBloodType);

				// +o can send to any one that is positive type ! and any one can receive it
				lastRes.push("+O");
			}

			return this.#success(lastRes);
		}
		// -1 because of the their sign (-/+)
		const isMultiLetters = bloodType.length - 1 >= 2;

		// +A => A
		// -A => A
		const bloodTypeWithNoSign = bloodType.replace(/\-|\+/gi, "");

		// if isMultiLetters
		//  -AB =< -A -B -AB
		// if !isMultiLetters
		// -A =< -A
		const regStr = !isMultiLetters
			? `^\-(${bloodTypeWithNoSign})$`
			: `^\-(${[...bloodTypeWithNoSign].join("|")})`;
		const theReg = new RegExp(regStr, "i");

		const allValidNegtiveBloodTypes = this.nagtiveBloodTypes.filter(
			(cbt) => {
				return !lastRes.includes(cbt) && theReg.test(cbt);
			}
		);

		lastRes.push(...allValidNegtiveBloodTypes);

		return this.#success(lastRes);
	}
	allBloodsTypeCanBeReceive(bloodTypes) {
		const { error: bloodTypesError, data: bloodTypesData } =
			this.getNormalizedBloodTypes(bloodTypes);
		if (bloodTypesError) {
			return this.#error(bloodTypesError);
		}
		bloodTypes = bloodTypesData;
		const lastRes = [];
		for (const bloodType of bloodTypes) {
			let { error: receiverError, data: receivers } =
				this.allBloodsTypeCanBeReceiveAction(bloodType);

			receivers = [
				...new Set(
					receivers
						.map((e) => {
							return this.signToBloodType(e).data ?? e;
						})
						.flat(Number.MAX_SAFE_INTEGER)
				),
			];

			// checking for any error
			if (receiverError) return this.#error(receiverError, bloodType);

			lastRes.push(receivers);
		}
		// sending the data
		return this.#success(lastRes);
	}

	invertBloodType(bloodType) {
		// check the input
		const { error: normalizeBloodTypeError, data } =
			this.normalizeBloodType(bloodType);
		bloodType = data;
		if (normalizeBloodTypeError)
			return this.#error(normalizeBloodTypeError);

		// invert if it's + to - and - to +
		const { data: isPositive } = this.isPositiveBlood(bloodType);
		return this.#success((isPositive ? "-" : "+") + bloodType.slice(1));
	}
	normalizeBloodType(bloodType) {
		const error = this.#error(this.errorMsg.INVALID_BLOOD_TYPE, bloodType);
		// check for the bloodType is empty or invalid type then
		if (typeof bloodType != "string" || !bloodType.trim()) return error;
		bloodType = bloodType.trim().toUpperCase();
		// check if sign is passed or not
		// if not use the default "+"
		bloodType = (!!bloodType.match(/^(\-|\+)/) ? "" : "+") + bloodType;

		// checking for existence
		if (!this.bloodTypes.includes(bloodType)) return error;

		return this.#success(bloodType);
	}
	isBloodTypeValid(bloodType) {
		const { error, data } = this.normalizeBloodType(bloodType);
		// if there is data it means there is valid data!

		return !!data;
	}
	isPositiveBlood(bloodType = "") {
		// check for validity and recognition for sign
		const { error: normalizeBloodTypeError, data } =
			this.normalizeBloodType(bloodType);
		return this.#success(!normalizeBloodTypeError && data[0] == "+");
	}
	allBloodsTypeCanBeDonateAction(bloodType) {
		// validate input
		const { error: normalizeBloodTypeError, data } =
			this.normalizeBloodType(bloodType);
		bloodType = data;
		if (normalizeBloodTypeError)
			return this.#error(normalizeBloodTypeError);

		const lastRes = [];
		// if -O it means it can be send to anyone
		if (bloodType === "-O") return { data: [`*`] };
		// if +O it means it can be send to all Positive Type
		if (bloodType === "+O") return { data: this.positiveBloodTypes };
		// every type can send to their bloodType
		lastRes.push(bloodType);

		const { data: isPositive } = this.isPositiveBlood(bloodType);

		const bloodTypeWidthNoSign = bloodType.replace(/\-|\+/gi, "");

		// if isPositive
		// +A => +A +AB
		// if !isPositive
		// -A => +A -A +AB -AB
		const regStr =
			"^" + (isPositive ? "\\+" : "") + `(.*${bloodTypeWidthNoSign})`;
		const theReg = new RegExp(regStr, "i");
		const allValidSenders = this.bloodTypes.filter((cbt) => {
			return !lastRes.includes(cbt) && theReg.test(cbt);
		});
		lastRes.push(...allValidSenders);
		return this.#success(lastRes);
	}
	allBloodsTypeCanBeDonate(bloodTypes) {
		const { error: bloodTypesError, data: bloodTypesData } =
			this.getNormalizedBloodTypes(bloodTypes);
		if (bloodTypesError) {
			return this.#error(bloodTypesError);
		}
		bloodTypes = bloodTypesData;
		const lastRes = [];
		for (const bloodType of bloodTypes) {
			let { error: senderError, data: senders } =
				this.allBloodsTypeCanBeDonateAction(bloodType);
			// checking for any error
			if (senderError) return this.#error(senderError, bloodType);

			senders = [
				...new Set(
					senders
						.map((e) => {
							return this.signToBloodType(e).data ?? e;
						})
						.flat(Number.MAX_SAFE_INTEGER)
				),
			];

			lastRes.push(senders);
		}
		// sending the data
		return this.#success(lastRes);
	}
	// get senders and receivers
	bloodTransformationInfo(bloodTypes) {
		const { error: bloodTypesError, data: bloodTypesData } =
			this.getNormalizedBloodTypes(bloodTypes);
		if (bloodTypesError) {
			return this.#error(bloodTypesError);
		}
		bloodTypes = bloodTypesData;
		const lastRes = [];
		for (const bloodType of bloodTypes) {
			const { error: senderError, data: senders } =
				this.allBloodsTypeCanBeDonate(bloodType);
			const { error: receiverError, data: receivers } =
				this.allBloodsTypeCanBeReceive(bloodType);
			// checking for any error
			if (senderError || receiverError)
				return this.#error(senderError || receiverError, bloodType);
			const res = {
				bloodType,
				allBloodsTypeCanBeDonate: senders,
				allBloodsTypeCanBeReceive: receivers,
			};
			lastRes.push(res);
		}
		// sending the data
		return this.#success(lastRes);
	}
	#error(error, ...vars) {
		if (typeof error === "string") {
			for (const theVar of vars) {
				error = error.replace("{}", theVar);
			}
			error = error.replace(/\{\}/gi, "");
		}

		return { error };
	}
	#success(data) {
		return { data };
	}
	normalizeShotcutSign(bloodTypeSign) {
		const error = this.#error(
			this.errorMsg.INVALID_BLOOD_TYPE_SHORTCUT,
			bloodTypeSign
		);
		// check for the bloodTypeSign is empty or invalid type then
		if (typeof bloodTypeSign != "string" || !bloodTypeSign.trim())
			return error;
		bloodTypeSign = bloodTypeSign.trim();
		// checking for existence
		if (!this.shortcutSigns.includes(bloodTypeSign)) return error;

		return this.#success(bloodTypeSign);
	}
	isContainsShortcutSign(bloodTypeSign) {
		const { error, data } = this.normalizeShotcutSign(bloodTypeSign);

		return this.#success(!!data);
	}

	getNormalizedBloodTypes(bloodType) {
		const arrayBloodTypeDynamic = Array.isArray(bloodType)
			? bloodType
			: typeof bloodType === "string" && bloodType.split(",").length >= 2
			? bloodType.split(",")
			: bloodType;
		const isArrayBloodTypeDynamicValid =
			Array.isArray(arrayBloodTypeDynamic) &&
			arrayBloodTypeDynamic.find((e) => {
				const { error: errorInvalidBloodType } =
					this.isBloodTypeValid(e);
				const { error: errorInvalidBloodSign } =
					this.isContainsShortcutSign(e);
				return !errorInvalidBloodType && !errorInvalidBloodSign;
			});
		if (Array.isArray(arrayBloodTypeDynamic)) {
			if (!isArrayBloodTypeDynamicValid) {
				return this.#error(
					this.errorMsg.INVALID_BLOOD_TYPE,
					isArrayBloodTypeDynamicValid
				);
			}
			let lastRes = [];
			if (!arrayBloodTypeDynamic.length)
				return this.#error(
					this.errorMsg.INVALID_BLOOD_TYPE,
					`"${bloodType}"`
				);

			for (const currentBloodType of arrayBloodTypeDynamic) {
				const isArrayOrSplit =
					Array.isArray(currentBloodType) ||
					(typeof currentBloodType === "string" &&
						currentBloodType.includes(","));

				let { data: bloodType, error: bloodTypeError } = isArrayOrSplit
					? this.getNormalizedBloodTypes(currentBloodType)
					: this.normalizeBloodType(currentBloodType);
				let { data: bloodSign, error: bloodSignError } = isArrayOrSplit
					? this.getNormalizedBloodTypes(currentBloodType)
					: this.signToBloodType(currentBloodType);
				const res = bloodType || bloodSign;
				if (!res) {
					return this.#error(
						bloodTypeError || bloodSignError,
						currentBloodType
					);
				}
				if (Array.isArray(res)) {
					lastRes.push(...res);
					continue;
				}
				lastRes.push(res);
			}
			// remove double values
			lastRes = [...new Set(lastRes)];
			return this.#success(lastRes);
		}
		const { error: shortcutSignsError, data: bloodTypeSignNormalized } =
			this.signToBloodType(bloodType);
		const { error: bloodTypeError, data: bloodTypeNormalized } =
			this.normalizeBloodType(bloodType);

		if (shortcutSignsError && bloodTypeError)
			return this.#error(bloodTypeError, bloodType);
		const lastData = bloodTypeSignNormalized ?? bloodTypeNormalized;
		const bindData = Array.isArray(lastData) ? lastData : [lastData];

		return this.#success(bindData);
	}
	signToBloodType(bloodTypeSign) {
		const { error, data } = this.normalizeShotcutSign(bloodTypeSign);
		if (error) return this.#error(error);
		bloodTypeSign = data;

		const lastRes = [];

		switch (bloodTypeSign) {
			case "*":
				lastRes.push(...this.bloodTypes);

				break;

			case "*+":
				lastRes.push(...this.positiveBloodTypes);

				break;

			case "*-":
				lastRes.push(...this.nagtiveBloodTypes);

				break;
		}

		return this.#success(lastRes);
	}
	askingQuestion(questionMethod, infoMethod, ...args) {
		// check if the bloodTypeA is Sign
		let [bloodTypeA, bloodTypeB] = args;
		const { error: bloodTypeAError, data: bloodTypeAData } =
			this.getNormalizedBloodTypes(bloodTypeA);

		if (bloodTypeAError) {
			return this.#error(bloodTypeAError);
		}
		bloodTypeA = bloodTypeAData;
		bloodTypeA =
			bloodTypeAData.length - 1 ? bloodTypeAData : bloodTypeAData.pop();

		const { error: bloodTypeBError, data: bloodTypeBData } =
			this.getNormalizedBloodTypes(bloodTypeB);
		if (bloodTypeBError) {
			return this.#error(bloodTypeBError);
		}
		bloodTypeB = bloodTypeBData;
		bloodTypeB =
			bloodTypeBData.length - 1 ? bloodTypeBData : bloodTypeBData.pop();

		const arrayAction = (bloodTypes, questionMethod) => {
			for (const bloodType of bloodTypes) {
				let { error, data } = questionMethod(bloodType);
				if (error) {
					return this.#error(error, bloodType);
				}
				if (!data) return this.#success(false);
			}
			return this.#success(true);
		};

		if (Array.isArray(bloodTypeA)) {
			return arrayAction(bloodTypeA, (currentBloodType) => {
				return questionMethod(currentBloodType, bloodTypeB);
			});
		}

		if (Array.isArray(bloodTypeB)) {
			return arrayAction(bloodTypeB, (currentBloodType) => {
				return questionMethod(bloodTypeA, currentBloodType);
			});
		}

		// getting senders info
		let { error: senderError, data: senders } = infoMethod(bloodTypeA);

		if (senderError) {
			return this.#error(senderError, bloodTypeA);
		}

		return this.#success(senders.includes(bloodTypeB));
	}
	canDonate(...args) {
		// check if the bloodTypeA is Sign

		return this.askingQuestion(
			this.canDonate.bind(this),
			(...args) => {
				let res = this.allBloodsTypeCanBeDonate(...args);
				if (res.data) {
					res.data = res.data[0];
				}
				return res;
			},
			...args
		);
	}
	canReceive(...args) {
		return this.askingQuestion(
			this.canReceive.bind(this),
			(...args) => {
				let res = this.allBloodsTypeCanBeReceive(...args);
				if (res.data) {
					res.data = res.data[0];
				}
				return res;
			},
			...args
		);
	}
}
export default BloodInfo;
