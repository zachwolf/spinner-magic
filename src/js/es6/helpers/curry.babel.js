export default function (fn, ...alwaysArgs) {
  return (...sometimesArgs) => {
    return fn(...alwaysArgs, ...sometimesArgs)
  }
}