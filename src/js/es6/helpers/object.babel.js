export function get (obj, path, fallback) {
	return path.split('.').reduce( (prev, next) => {
		return prev && prev.hasOwnProperty(next) ? prev[next] : false
	}, obj) || fallback
}