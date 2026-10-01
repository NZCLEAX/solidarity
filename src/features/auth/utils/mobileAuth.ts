import { Capacitor } from '@capacitor/core'

let initialized = false

export async function initializeMobileAuth() {
  if (!Capacitor.isNativePlatform()) {
    return
  }

  if (initialized) {
    return
  }

  initialized = true
}