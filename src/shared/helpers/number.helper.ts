export const isValidNumber = (value: number): boolean => {
  return typeof value === 'number' && value >= 0
}
