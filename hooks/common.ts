import { useEffect, useRef, useState } from 'react'

export const useDebounce = <T>(value: T, timer = 500) => {
  const [state, setState] = useState(value)

  useEffect(() => {
    const tick = setTimeout(() => setState(value), timer)
    return () => clearTimeout(tick)
  }, [timer, value])

  return state
}

export const useLibrary = () => {
  const { current: compressorjs } = useRef(async function compressorjs() {
    return (await import('compressorjs')).default
  })

  const { current: slugify } = useRef(async function slugify() {
    return (await import('slugify')).default
  })

  const { current: sortablejs } = useRef(async function slugify() {
    return (await import('sortablejs')).default
  })

  return { compressorjs, slugify, sortablejs }
}

export const useObserver = () => {
  const [target, setRef] = useState<HTMLElement | null>(null)
  const [isIntersecting, setIsIntersecting] = useState(false)

  useEffect(() => {
    if (!target) {
      return
    }

    const observer = new IntersectionObserver((entries, obs) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          setIsIntersecting(true)
          obs.disconnect()
        }
      })
    })

    observer.observe(target)
    return () => observer.disconnect()
  }, [target])

  return { isIntersecting, setRef }
}

export const useMedia = () => {
  const { slugify: slugifyjs, compressorjs } = useLibrary()

  async function compress(file: File | Blob, quality: number) {
    const Compressor = await compressorjs()

    return new Promise<File | Blob>((resolve) => {
      new Compressor(file, {
        quality: quality / 10,
        checkOrientation: false,
        maxWidth: 3840,
        maxHeight: 2160,
        success: resolve,
      })
    })
  }

  async function upload(file: File) {
    const id = (Date.now() + Math.random()).toString().replace(/\./g, '')
    /**
     * The name with which the file has to be uploaded.
     * The file name can contain:
     * - Alphanumeric Characters: a-z , A-Z , 0-9
     * - Special Characters: . _ and -
     * Any other character including space will be replaced by _
     */
    const slugify = await slugifyjs()
    const fileName = slugify([id, file.name].join('_'), {
      replacement: '_',
      remove: /[`!@#$%^&*(—)+\=\[\]{};':"\\|,<>\/?~]/g,
    })

    let quality = 8
    let newFile: File | Blob = file

    if (file.type.includes('image')) {
      newFile = await compress(file, quality)

      while (quality > -1 && newFile.size > 1024 * 1024 * 0.4) {
        newFile = await compress(file, quality--)
      }
    }

    return { file: newFile, fileName, type: file.type }
  }

  return { upload }
}
