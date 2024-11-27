import { useEffect, useState } from 'react'

type UseGSAPOption = {
  enable?: boolean
  plugins?: ('ScrollTrigger' | 'Draggable')[]
}

export const useGSAP = (option?: UseGSAPOption) => {
  const { enable = true, plugins = [] } = { ...option }
  const [gsap, setGsap] = useState<GSAP | null>(null)
  const [draggable, setDraggable] = useState<typeof Draggable | null>(null)
  const [scrollTrig, setTrigger] = useState<typeof ScrollTrigger | null>(null)

  useEffect(() => {
    if (!enable) return

    const unloadGsap = async () => {
      return (await import('gsap')).default
    }

    const PLUGINS = {
      ScrollTrigger: async (instance: typeof globalThis.gsap) => {
        const _scrollTrigger = (await import('gsap/ScrollTrigger')).default

        instance.registerPlugin(_scrollTrigger)

        setGsap(instance)
        setTrigger(() => _scrollTrigger)
      },
      Draggable: async (instance: typeof globalThis.gsap) => {
        const _draggable = (await import('gsap/Draggable')).default

        instance.registerPlugin(_draggable)

        setGsap(instance)
        setDraggable(() => _draggable)
      },
    }

    unloadGsap().then((instance) => {
      // The instance require to registered the plugin first before it executed.
      // You need manually setGsap instance per plugin you might use and update the instance.
      if (!plugins?.length) return setGsap(instance)

      plugins.forEach(
        (plugin) => plugin in PLUGINS && PLUGINS[plugin](instance)
      )
    })
  }, [enable, plugins])

  return { gsap, scrollTrigger: scrollTrig, draggable }
}

export const useAos = (option?: Aos.AosOptions & { enable?: boolean }) => {
  const [aos, setAos] = useState<Aos.Aos | null>(null)
  const isEnabled = option?.enable ?? true
  const config = {
    'data-aos': 'fade-up',
    'data-aos-anchor-placement': 'bottom-bottom',
  }

  useEffect(() => {
    async function initializeAos() {
      const instance = await import('aos')

      instance.default.init({ duration: 600, ...option })
      setAos(instance)
    }

    isEnabled && initializeAos()
  }, [isEnabled, option])

  return { aos, config: !isEnabled ? {} : config }
}
