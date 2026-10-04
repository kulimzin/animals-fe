export default {
  input: '../animals-be/openapi.json',
  output: {
    path: 'src/shared/api/generated',
    postProcess: ['prettier'],
  },
  plugins: ['@hey-api/typescript'],
}
