import { describe, expect, it } from 'vitest'
import { getPreferredLanguage } from './i18n'

describe('getPreferredLanguage', () => {
  it.each([
    [['ru'], 'ru'],
    [['ru-RU'], 'ru'],
    [['en-US', 'ru-RU'], 'ru'],
    [['RU_ru'], 'ru'],
    [['en-US'], 'en'],
    [['de-DE', 'fr-FR'], 'en'],
    [[], 'en'],
  ] as const)('returns %s for %s', (deviceLanguages, expectedLanguage) => {
    expect(getPreferredLanguage(deviceLanguages)).toBe(expectedLanguage)
  })
})
