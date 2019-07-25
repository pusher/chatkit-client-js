export function showNotification({ notification, data }) {
  if (document.visibilityState !== "hidden") {
    return
  }

  const n = new Notification(notification.title || "", {
    body: notification.body || "",
    icon: notification.icon,
    data: Object.assign(data, {
      pusher: { deep_link: notification.deep_link },
    }),
  })

  n.onclick = e => {
    e.preventDefault()
    window.focus()
    e.target.close()
  }
}
