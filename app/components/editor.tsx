'use client'

import { Editor as TinyMCEEditor } from '@tinymce/tinymce-react'
import { useTheme } from 'next-themes'

interface EditorProps {
  value: string
  onChange: (content: string) => void
  placeholder?: string
  className?: string
  readOnly?: boolean
  height?: number
  toolbar?: string[]
}

export function Editor({
  value,
  onChange,
  placeholder,
  className = '',
  readOnly = false,
  height = 300,
  toolbar = [
    'undo redo | blocks | bold italic underline | alignleft aligncenter alignright alignjustify | bullist numlist outdent indent | removeformat'
  ]
}: EditorProps) {
  const { theme } = useTheme()

  return (
    <div className={className}>
      <TinyMCEEditor
        apiKey="mjjyehwq9a0xz6bjfi4nujhra01x9ffgzaeekiwxd84ce1v1"
        value={value}
        onEditorChange={onChange}
        init={{
          height,
          menubar: false,
          plugins: [
            'advlist', 'autolink', 'lists', 'link', 'charmap', 'preview',
            'anchor', 'searchreplace', 'visualblocks', 'code', 'fullscreen',
            'insertdatetime', 'table', 'help', 'wordcount'
          ],
          toolbar,
          skin: theme === 'dark' ? 'oxide-dark' : 'oxide',
          content_css: theme === 'dark' ? 'dark' : 'default',
          content_style: `
            body {
              font-family: Helvetica, Arial, sans-serif;
              font-size: 14px;
              background-color: ${theme === 'dark' ? '#1a1a1a' : '#ffffff'};
              color: ${theme === 'dark' ? '#ffffff' : '#000000'};
            }
            .mce-content-body {
              background-color: ${theme === 'dark' ? '#1a1a1a' : '#ffffff'};
              color: ${theme === 'dark' ? '#ffffff' : '#000000'};
            }
          `,
          branding: false,
          promotion: false,
          readonly: readOnly,
          placeholder,
          setup: (editor) => {
            editor.on('init', () => {
              editor.getContainer().style.transition = 'border-color 0.2s ease-in-out'
            })
          }
        }}
      />
    </div>
  )
} 