module.exports = {
  extends: ['eslint:recommended', 'plugin:@typescript-eslint/recommended'],
  parser: '@typescript-eslint/parser',
  parserOptions: {
    ecmaVersion: 2020,
    sourceType: "module",
    project: "./tsconfig.json"
  },
  plugins: ['@typescript-eslint', "deprecation"],
  root: true,
  ignorePatterns: ["test/*", "src/@solace-labs/*", "dist/*", "node_modules/*"],
  rules: {
    "deprecation/deprecation": "warn"
  }

};