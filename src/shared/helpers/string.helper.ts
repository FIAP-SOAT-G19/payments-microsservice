export const isValidString = (value: string | undefined | null): boolean => {
  return value !== '' && value !== undefined && value !== null
}
