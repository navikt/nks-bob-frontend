import Markdown, { Components } from "react-markdown"
import remarkGfm from "remark-gfm"
import { PluggableList } from "unified"

interface AppMarkdownProps {
  children: string
  className?: string
  remarkPlugins?: PluggableList
  rehypePlugins?: PluggableList
  components?: Components
}

const defaultComponents: Components = {
  a: ({ ...props }) => (
    <a
      {...props}
      target='_blank'
      rel='noopener noreferrer'
      title='Åpne lenken i ny fane'
      className='underline'
    />
  ),
  h2: ({ ...props }) => (
    <h2
      {...props}
      className='mb-2 font-semibold'
    />
  ),
  h3: ({ ...props }) => (
    <h3
      {...props}
      className='mb-1 font-semibold'
    />
  ),
  h4: ({ ...props }) => (
    <h4
      {...props}
      className='mb-1 font-semibold'
    />
  ),
  p: ({ ...props }) => (
    <p
      {...props}
      className='not-last:mb-4'
    />
  ),
  li: ({ ...props }) => (
    <li
      {...props}
      className='not-only:mb-3'
    />
  ),
  ul: ({ ...props }) => (
    <ul
      {...props}
      className='ml-6 list-disc'
    />
  ),
  ol: ({ ...props }) => (
    <ol
      {...props}
      className='ml-6 list-decimal marker:font-medium'
    />
  ),
}

export const AppMarkdown = ({
  children,
  remarkPlugins = [],
  rehypePlugins = [],
  components = {},
}: AppMarkdownProps) => {
  return (
    <Markdown
      remarkPlugins={[remarkGfm, ...remarkPlugins]}
      rehypePlugins={rehypePlugins}
      components={{ ...defaultComponents, ...components }}
    >
      {children}
    </Markdown>
  )
}
