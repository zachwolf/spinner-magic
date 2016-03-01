let classMap       = new WeakMap()
	, incrementMap   = new WeakMap()
	, incrementFnMap = new WeakMap()
	, valueMap       = new WeakMap()

class Interface {
	constructor () {
		this.reset()
	}

	config (obj) {
		if (obj.increment)   incrementMap.set(this, obj.increment)
		if (obj.incrementFn) incrementFnMap.set(this, obj.incrementFn)
	}

	reset () {
		valueMap.set(this, 0)
	}

	increment () {
		let fn    = incrementFnMap.get(this)
			, value = valueMap.get(this)
			, inc   = incrementMap.get(this)
			, result

		if (fn) {
			result = fn(value, inc)
		} else {
			result = value + inc
		}

		valueMap.set(this, result)

		return result
	}

	get value () {
		return valueMap.get(this)
	}

	set value (val) {
		console.warn('Directly setting value is not allowed, use `.increment()`')
	}
}

export default function (inst) {
	if (classMap.has(inst)) {
		return classMap.get(inst)
	}

	let face = new Interface()
	classMap.set(inst, face)
	return face
}