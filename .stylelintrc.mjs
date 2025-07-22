export default {
  extends: ['stylelint-config-standard-scss', 'stylelint-config-prettier-scss'],
  rules: {
    'selector-class-pattern': '^[a-zA-Z0-1/-]+',
    'selector-id-pattern': '^[a-zA-Z0-1/-]+',
    'color-hex-length': 'long',
  },
  ignoreFiles: 'coverage/**',
};
