export function chunkArray(myArray: Array<any>, chunkSize: number) {
  const results: Array<any> = []
  while (myArray.length) {
    results.push(myArray.splice(0, chunkSize))
  }
  return results
}
