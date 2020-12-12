import { FIREBASE_CONFIG } from './constants'

const notificationIcon = require('../static/notificationIcon.png').default

importScripts('https://www.gstatic.com/firebasejs/7.23.0/firebase-app.js')
importScripts('https://www.gstatic.com/firebasejs/7.23.0/firebase-messaging.js')

firebase.initializeApp(FIREBASE_CONFIG)

const messaging = firebase.messaging()

messaging.onBackgroundMessage(function (payload) {
  const notification = payload.notification
  if (!notification) {
    return
  }

  return self.registration.showNotification(notification.title, {
    body: notification.body,
    icon: notificationIcon,
  })
})

self.onnotificationclick = function (ev) {
  ev.notification.close()

  // via https://developer.mozilla.org/en-US/docs/Web/API/ServiceWorkerGlobalScope/onnotificationclick
  ev.waitUntil(
    clients
      .matchAll({
        type: 'window',
      })
      .then((clientList) => {
        for (const client of clientList) {
          if (client.url === '/' && 'focus' in client) {
            return client.focus()
          }
        }
        if (clients.openWindow) {
          return clients.openWindow('/')
        }
      }),
  )
}
