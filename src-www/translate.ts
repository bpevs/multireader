const DEEPL_API_ENDPOINT = 'https://api-free.deepl.com/v2/translate'

export enum API {
  DEEPL = 0,
  AZURE,
}

async function translateDeepl(
  text: string[],
  target_lang: string,
): Promise<string[]> {
  console.log(text, target_lang)
  const response = await fetch(DEEPL_API_ENDPOINT, {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: `auth_key=${localStorage.getItem('api-key')}&text=${
      encodeURIComponent(text)
    }&target_lang=${localStorage.getItem('to-lang')}`,
  })

  const result = await response.json()
  return result.translations[0].text
}

export const _internals = { translateDeepl }

export const translate = (
  text: string,
  targetLanguage: string,
  api = API.DEEPL,
): Promise<string[]> => {
  if (api === API.DEEPL) return _internals.translateDeepl(text, targetLanguage)
  else throw new Error(`Does not support the transation api ${api}`)
}
