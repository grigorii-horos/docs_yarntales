import { defineConfig } from 'vitepress'

export default defineConfig({
  title: "Yarntales",
  
  // Общие настройки
  themeConfig: {
    socialLinks: [
      { icon: 'github', link: 'https://github.com/grigorii-horos/yarntales' }
    ]
  },

  locales: {
    root: {
      label: 'Русский',
      lang: 'ru',
      description: "Инструкции по использованию",
      themeConfig: {
        nav: [
          { text: 'Главная', link: '/' },
          { text: 'Руководство', link: '/guide/' },
          { text: 'Файлы', link: '/files/' }
        ],
        sidebar: {
          '/': [
            {
              text: 'Введение',
              items: [
                { text: 'Начало работы', link: '/guide/' },
                { text: 'Установка', link: '/guide/installation' }
              ]
            },
            {
              text: 'Файлы и превью',
              items: [
                { text: 'Документы', link: '/files/' },
                { text: 'Изображения', link: '/files/images' }
              ]
            }
          ]
        }
      }
    },
    en: {
      label: 'English',
      lang: 'en',
      link: '/en/',
      description: "Usage instructions",
      themeConfig: {
        nav: [
          { text: 'Home', link: '/en/' },
          { text: 'Guide', link: '/en/guide/' },
          { text: 'Files', link: '/en/files/' }
        ],
        sidebar: {
          '/en/': [
            {
              text: 'Introduction',
              items: [
                { text: 'Getting Started', link: '/en/guide/' },
                { text: 'Installation', link: '/en/guide/installation' }
              ]
            },
            {
              text: 'Files and Previews',
              items: [
                { text: 'Documents', link: '/en/files/' },
                { text: 'Images', link: '/en/files/images' }
              ]
            }
          ]
        }
      }
    },
    ro: {
      label: 'Română',
      lang: 'ro',
      link: '/ro/',
      description: "Instrucțiuni de utilizare",
      themeConfig: {
        nav: [
          { text: 'Acasă', link: '/ro/' },
          { text: 'Ghid', link: '/ro/guide/' },
          { text: 'Fișiere', link: '/ro/files/' }
        ],
        sidebar: {
          '/ro/': [
            {
              text: 'Introducere',
              items: [
                { text: 'Noțiuni de bază', link: '/ro/guide/' },
                { text: 'Instalare', link: '/ro/guide/installation' }
              ]
            },
            {
              text: 'Fișiere și Previzualizări',
              items: [
                { text: 'Documente', link: '/ro/files/' },
                { text: 'Imagini', link: '/ro/files/images' }
              ]
            }
          ]
        }
      }
    }
  }
})
