import { ExternalLinkIcon, FilesIcon, QuestionmarkCircleIcon } from "@navikt/aksel-icons"
import { Button, HStack, Popover, Tooltip } from "@navikt/ds-react"
import * as React from "react"
import { Components } from "react-markdown"
import { useInputFieldStore } from "../components/inputfield/InputField"
import { Context } from "../types/Message"
import analytics from "./analytics"
import { buildTextFragmentLink } from "./buildTextFragmentLink"
import { buildClipboardContent } from "./copyBobAnswerHandler"

type HoverProps = {
  itemRef: React.RefObject<HTMLElement | null>
  onMouseEnter: React.MouseEventHandler<HTMLElement>
  onMouseLeave: React.MouseEventHandler<HTMLElement>
}

const HoverWrapper = ({
  renderElement,
  context,
  features,
}: {
  renderElement: (hoverProps: HoverProps) => React.ReactNode
  context?: Context
  features: HoverFeature[]
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
  const askBob = () => {
    const content = getContent()
    if (!content) {
      return
    }

    const selectedText = "Jeg har et spørsmål om denne teksten: \n\n" + content.text + "\n\n" + "Spørsmål: "
    const newInput = `${selectedText}\n\n${inputValue}`
    setInputValue(newInput)
    focusTextarea()

    analytics.sporBob(context ? { tittel: context.title, kilde: context.source } : null, content.text.length)
  }

  const copyParagraph = () => {
    const content = getContent()
    if (!content) {
      return
    }

    navigator.clipboard.write([
      new ClipboardItem({
        "text/plain": new Blob([content.text], { type: "text/plain" }),
        "text/html": new Blob([content.html], { type: "text/html" }),
      }),
    ])

    analytics.avsnittKopiert(context ? { tittel: context.title, kilde: context.source } : null, content.text.length)
  }

  const openInArticle = () => {
    if (!context) {
      return
    }

    const content = getContent()
    if (!content) {
      return
    }

    analytics.avsnittÅpnetLenke({ tittel: context.title, kilde: context.source }, content.text.length)
    const link = buildTextFragmentLink(content.text, context)
    window.open(link, "_blank", "noopener")
  }

  return (
    <>
      <Popover
        anchorEl={ref.current}
        open={isOpen}
        onClose={closePopover}
        placement='top-end'
        offset={6}
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
          {features.includes("ask bob") && (
            <Tooltip content='Spør Bob om dette avsnittet'>
              <Button
                variant='tertiary'
                size='small'
                icon={<QuestionmarkCircleIcon />}
                data-color='neutral'
                onClick={askBob}
              />
            </Tooltip>
          )}
          {features.includes("copy") && (
            <Tooltip content='Kopier'>
              <Button
                variant='tertiary'
                size='small'
                icon={<FilesIcon />}
                data-color='neutral'
                onClick={copyParagraph}
              />
            </Tooltip>
          )}
          {features.includes("open in article") && (
            <Tooltip content='Vis i artikkelen'>
              <Button
                variant='tertiary'
                size='small'
                data-color='neutral'
                icon={<ExternalLinkIcon />}
                onClick={openInArticle}
              />
            </Tooltip>
          )}
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

const cln = (className: string) =>
  `hover:bg-ax-bg-neutral-soft dark:hover:bg-ax-bg-raised [.peer:hover+&]:bg-ax-bg-neutral-moderate [.peer:hover+&]:shadow-[0_0_0_6px_var(--ax-bg-neutral-moderate)] hover:shadow-[0_0_0_6px_var(--ax-bg-neutral-soft)] dark:hover:shadow-[0_0_0_6px_var(--ax-bg-raised)] rounded-sm ${className} [.peer:hover+&]:underline`

type HoverFeature = "ask bob" | "open in article" | "copy"

export const hoverComponents: (features: HoverFeature[], context?: Context) => Components = (features, context) => ({
  p: ({ ...props }) => (
    <HoverWrapper
      features={features}
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
    <ul
      {...props}
      className='ml-4 list-disc'
    />
  ),
  ol: ({ ...props }) => (
    <ol
      {...props}
      className='ml-6 list-decimal marker:font-medium'
    />
  ),
  li: ({ ...props }) => (
    <HoverWrapper
      features={features}
      context={context}
      renderElement={({ itemRef, ...hoverProps }) => (
        <li
          {...props}
          ref={itemRef as React.Ref<HTMLLIElement>}
          {...hoverProps}
          className={cln("mb-3")}
        />
      )}
    />
  ),
})
