import React from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { IoCheckmarkCircle, IoInformationCircle, IoWarning, IoClose } from 'react-icons/io5'

interface StatusMessageProps {
  type: 'success' | 'info' | 'warning' | 'error'
  message: string
  details?: string
  onClose?: () => void
  autoClose?: boolean
  className?: string
}

export default function StatusMessage({
  type,
  message,
  details,
  onClose,
  autoClose = true,
  className = ''
}: StatusMessageProps) {
  const [isVisible, setIsVisible] = React.useState(true)

  React.useEffect(() => {
    if (autoClose) {
      const timer = setTimeout(() => {
        setIsVisible(false)
        onClose?.()
      }, 5000)
      return () => clearTimeout(timer)
    }
  }, [autoClose, onClose])

  const icons = {
    success: <IoCheckmarkCircle className="w-5 h-5 text-green-400" />,
    info: <IoInformationCircle className="w-5 h-5 text-blue-400" />,
    warning: <IoWarning className="w-5 h-5 text-yellow-400" />,
    error: <IoWarning className="w-5 h-5 text-red-400" />
  }

  const colors = {
    success: 'bg-green-500/10 border-green-500/20 text-green-300',
    info: 'bg-blue-500/10 border-blue-500/20 text-blue-300',
    warning: 'bg-yellow-500/10 border-yellow-500/20 text-yellow-300',
    error: 'bg-red-500/10 border-red-500/20 text-red-300'
  }

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -20 }}
          className={`rounded-lg border p-4 ${colors[type]} ${className}`}
        >
          <div className="flex items-start">
            <div className="flex-shrink-0">
              {icons[type]}
            </div>
            <div className="ml-3 flex-1">
              <p className="font-medium">{message}</p>
              {details && (
                <p className="mt-1 text-sm opacity-80">{details}</p>
              )}
            </div>
            {onClose && (
              <button
                onClick={() => {
                  setIsVisible(false)
                  onClose()
                }}
                className="ml-4 flex-shrink-0 opacity-50 hover:opacity-100 transition-opacity"
              >
                <IoClose className="w-5 h-5" />
              </button>
            )}
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  )
} 