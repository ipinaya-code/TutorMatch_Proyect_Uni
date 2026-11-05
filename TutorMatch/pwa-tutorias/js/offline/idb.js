// Persistencia local en IndexedDB (funciona sin conexión).
const open = () =>
  new Promise((res, rej) => {
    const q = indexedDB.open('tutormatch', 1)
    q.onupgradeneeded = () => q.result.createObjectStore('kv')
    q.onsuccess = () => res(q.result)
    q.onerror = () => rej(q.error)
  })

export const idbGet = async (k) => {
  const db = await open()
  return new Promise((res, rej) => {
    const r = db.transaction('kv').objectStore('kv').get(k)
    r.onsuccess = () => res(r.result)
    r.onerror = () => rej(r.error)
  })
}

export const idbSet = async (k, v) => {
  const db = await open()
  return new Promise((res, rej) => {
    const t = db.transaction('kv', 'readwrite')
    t.objectStore('kv').put(v, k)
    t.oncomplete = () => res()
    t.onerror = () => rej(t.error)
  })
}
