import { ExternalLinkIcon, FilesIcon, QuestionmarkCircleIcon } from "@navikt/aksel-icons"
import { Button, HStack, Popover, Tooltip } from "@navikt/ds-react"
import * as React from "react"
import { Components } from "react-markdown"
import { useInputFieldStore } from "../components/inputfield/InputField"
import { buildClipboardContent } from "./copyBobAnswerHandler"
import { Context } from "../types/Message"
import { buildTextFragmentLink } from "./buildTextFragmentLink"
import analytics from "./analytics"

type HoverProps = {
  itemRef: React.RefObject<HTMLElement | null>
  onMouseEnter: React.MouseEventHandler<HTMLElement>
  onMouseLeave: React.MouseEventHandler<HTMLElement>
}

const HoverWrapper = ({
  renderElement,
  context,
}: {
  renderElement: (hoverProps: HoverProps) => React.ReactNode
  context: Context
}) => {
  const ref = React.useRef<HTMLElement>(null)
  const [isOpen, setIsOpen] = React.useState(false)

  const openPopover = () => {
    setIsOpen(true)
  }

  const closePopover = () => {
    setIsOpen(false)
  }

  const timeoutOpened = React.useRef<ReturnType<typeof setTimeout>>(null)
  const timeoutClosed = React.useRef<ReturnType<typeof setTimeout>>(null)

  const clearTimeoutOpened = () => {
    if (timeoutOpened.current) {
      clearTimeout(timeoutOpened.current)
    }
  }

  const clearTimeoutClosed = () => {
    if (timeoutClosed.current) {
      clearTimeout(timeoutClosed.current)
    }
  }

  // Returns content of selection or of hovered element
  const getContent = () => {
    const selection = document.getSelection()
    if (selection && !selection?.isCollapsed && selection.rangeCount > 0) {
      const range = selection.getRangeAt(0)
      const fragment = range.cloneContents()
      return buildClipboardContent(fragment)
    }

    if (ref.current) {
      return buildClipboardContent(ref.current.cloneNode(true))
    }
  }

  const { setInputValue, inputValue, focusTextarea } = useInputFieldStore()
  const askBob = (text: string) => {
    const selectedText = "> " + text.replaceAll("\n", "\n> ")
    const newInput = `${selectedText}\n\n${inputValue}`
    setInputValue(newInput)
    focusTextarea()
    // TODO analytics
  }

  return (
    <>
      <Popover
        anchorEl={ref.current}
        open={isOpen}
        onClose={closePopover}
        placement='top-end'
        offset={0}
        onMouseEnter={() => {
          clearTimeoutClosed()
          openPopover()
        }}
        onMouseLeave={() => {
          clearTimeoutOpened()
          closePopover()
        }}
        className='peer'
      >
        <HStack
          gap='space-4'
          padding='space-4'
        >
          <Tooltip content='Spør Bob om dette avsnittet'>
            <Button
              variant='tertiary'
              size='small'
              icon={<QuestionmarkCircleIcon />}
              data-color='neutral'
              onClick={() => {
                const content = getContent()
                if (content) {
                  analytics.sporBob({ tittel: context.title, kilde: context.source }, content.text.length)
                  askBob(content.text)
                }
              }}
            />
          </Tooltip>
          <Tooltip content='Kopier'>
            <Button
              variant='tertiary'
              size='small'
              icon={<FilesIcon />}
              data-color='neutral'
              onClick={() => {
                const content = getContent()
                if (content) {
                  analytics.avsnittKopiert({ tittel: context.title, kilde: context.source }, content.text.length)
                  navigator.clipboard.write([
                    new ClipboardItem({
                      "text/plain": new Blob([content.text], { type: "text/plain" }),
                      "text/html": new Blob([content.html], { type: "text/html" }),
                    }),
                  ])
                }
              }}
            />
          </Tooltip>
          <Tooltip content='Vis i artikkelen'>
            <Button
              variant='tertiary'
              size='small'
              data-color='neutral'
              icon={<ExternalLinkIcon />}
              onClick={() => {
                const content = getContent()
                if (content) {
                  analytics.avsnittÅpnetLenke({ tittel: context.title, kilde: context.source }, content.text.length)
                  const link = buildTextFragmentLink(content.text, context)
                  window.open(link)
                }
              }}
            />
          </Tooltip>
        </HStack>
      </Popover>
      {renderElement({
        itemRef: ref,
        onMouseEnter: () => {
          clearTimeoutClosed()
          timeoutOpened.current = setTimeout(() => {
            openPopover()
          }, 300)
        },
        onMouseLeave: () => {
          clearTimeoutOpened()
          timeoutClosed.current = setTimeout(() => {
            closePopover()
          }, 300)
        },
      })}
    </>
  )
}

const cln = (className: string) => `hover:bg-ax-bg-sunken [.peer:hover+&]:bg-ax-bg-sunken ${className}`

export const hoverComponents: (context: Context) => Components = (context) => ({
  p: ({ ...props }) => (
    <HoverWrapper
      context={context}
      renderElement={({ itemRef, ...hoverProps }) => (
        <p
          {...props}
          ref={itemRef as React.Ref<HTMLParagraphElement>}
          {...hoverProps}
          className={cln("not-last:mb-4")}
        />
      )}
    />
  ),
  ul: ({ ...props }) => (
    <HoverWrapper
      context={context}
      renderElement={({ itemRef, ...hoverProps }) => (
        <ul
          {...props}
          ref={itemRef as React.Ref<HTMLUListElement>}
          {...hoverProps}
          className={cln("ml-4 list-disc")}
        />
      )}
    />
  ),
  ol: ({ ...props }) => (
    <HoverWrapper
      context={context}
      renderElement={({ itemRef, ...hoverProps }) => (
        <ol
          {...props}
          ref={itemRef as React.Ref<HTMLOListElement>}
          {...hoverProps}
          className={cln("ml-6 list-decimal marker:font-medium")}
        />
      )}
    />
  ),
})
