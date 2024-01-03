const JavaScriptObfuscator = require('javascript-obfuscator')
const fs = require('fs')

const buildDir = './dist'

const getJSFilesList = (dir) => new Promise((resolve) => {
  const paths = getJsFilePaths(dir)

  resolve(Promise.all(paths.map(path => new Promise(resolveInner => {
    fs.readFile(path, (err, data) => {
      return resolveInner({ path, content: data.toString() })
    })
  }))))
})

const getJsFilePaths = (dir) => {
  const files = fs.readdirSync(dir)

  let jsFilePath = []
  for (let i = 0 ; i < files.length ; i++) {
    const file = files[i]
    const fullFilePath = dir + '/' + file
    if (file.endsWith('.js')) {
      jsFilePath.push(fullFilePath)
    } else {
      const stats = fs.statSync(fullFilePath)
      if (stats.isDirectory()) {
        jsFilePath = jsFilePath.concat(getJsFilePaths(fullFilePath))
      }
    }
  }

  return jsFilePath
}


getJSFilesList(buildDir).then(list => {
	console.log(`[obfuscator] start`)
	Promise.all(list.map(it => new Promise(resolve => {
		const obfuscationResult = JavaScriptObfuscator.obfuscate(it.content, {
			/** 这些都是配置 */
			compact: false,
			controlFlowFlattening: true,
			controlFlowFlatteningThreshold: 1,
			numbersToExpressions: true,
			simplify: true,
			stringArrayShuffle: true,
			splitStrings: true,
			stringArrayThreshold: 1
		})
		fs.writeFile(it.path, obfuscationResult.getObfuscatedCode(), () => {
			console.log(`[obfuscator] file done ${it.path}`)
			resolve(1)
		})
	}))).then(() => {
		console.log(`[obfuscator] finished`)
	})
})