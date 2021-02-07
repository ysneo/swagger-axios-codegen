const { codegen } = require('../dist/index.js');

const prettier = require('prettier');

/**
 * ! use custom format, fork from :
 * https://github.com/Manweill/swagger-axios-codegen
 * package is https://github.com/ysneo/swagger-axios-codegen.git
 */
codegen({
  serviceNameSuffix: '',
  useStaticMethod: true,
  methodNameMode: 'operationId',
  remoteUrl: 'http://139.196.225.242:9000/HJWebApi/v2/api-docs',
  openApi: '2',
  methodNameMode: 'path',
  outputDir: './test/service',
  fileName: 'Api.ts',
  useClassTransformer: false,
  format: s => {
    const options = {
      printWidth: 100,
      tabWidth: 2,
      singleQuote: true,
      allowParens: true,
      trailingComma: 'es5',
      endOfLine: 'auto',
      jsxBracketSameLine: true,
      arrowParens: 'avoid',
      parser: 'typescript',
    };

    // const hackString = s.replace(/Date;/g, 'string;').replace(/object;/g, 'any;');

    const result = prettier.format(s, options);

    return result;
  },
});
