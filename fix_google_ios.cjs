
const fs = require('node:fs')
const readline = require('node:readline')

const filePath = 'ios/App/App/Info.plist'

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
})

rl.question('Colle ton Client ID Google iOS : ', (answer) => {
  rl.close()

  const clientId = answer.trim()

  const match = /^([a-zA-Z0-9_-]+)\.apps\.googleusercontent\.com$/.exec(
    clientId
  )

  if (!match) {
    console.error('Client ID iOS invalide.')
    process.exitCode = 1
    return
  }

  const reversedId = `com.googleusercontent.apps.${match[1]}`

  let content = fs.readFileSync(filePath, 'utf8')
    .replace(/\r\n/g, '\n')

  if (!content.includes('<key>CFBundleURLTypes</key>')) {
    throw new Error('CFBundleURLTypes introuvable.')
  }

  if (!content.includes(reversedId)) {
    const marker =
      '    </array>\n\n    <key>LSRequiresIPhoneOS</key>'

    if (!content.includes(marker)) {
      throw new Error(
        "Impossible de trouver l'emplacement du schéma Google."
      )
    }

    const googleScheme = [
      '        <dict>',
      '            <key>CFBundleURLSchemes</key>',
      '            <array>',
      `                <string>${reversedId}</string>`,
      '            </array>',
      '        </dict>',
    ].join('\n')

    content = content.replace(
      marker,
      `${googleScheme}\n${marker}`
    )
  }

  const clientIdKey =
    '<key>GIDClientID</key>'

  if (content.includes(clientIdKey)) {
    content = content.replace(
      /<key>GIDClientID<\/key>\s*<string>[^<]*<\/string>/,
      `<key>GIDClientID</key>\n    <string>${clientId}</string>`
    )
  } else {
    content = content.replace(
      '<key>LSRequiresIPhoneOS</key>',
      `<key>GIDClientID</key>\n    <string>${clientId}</string>\n\n    <key>LSRequiresIPhoneOS</key>`
    )
  }

  fs.writeFileSync(filePath, content, 'utf8')

  console.log('Configuration Google iOS enregistrée.')
  console.log('Client ID :', clientId)
  console.log('Schéma URL :', reversedId)
  console.log('Configuration Apple conservée.')
})
