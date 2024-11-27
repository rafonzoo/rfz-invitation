'use client'

import { useState } from 'react'
import { createPortal } from 'react-dom'

const PortalIframe: RFZ<TAG<'iframe'>> = (props) => {
  const [iframe, setIframe] = useState<HTMLIFrameElement | null>(null)
  const node = iframe?.contentWindow?.document.body

  return (
    <iframe {...props} ref={setIframe}>
      {iframe && node && createPortal(props.children, node)}
    </iframe>
  )
}

export default PortalIframe
