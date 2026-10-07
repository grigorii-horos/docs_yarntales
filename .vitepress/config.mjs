import { defineConfig } from 'vitepress'

export default defineConfig({
  title: "Yarntales",
  
  themeConfig: {
    socialLinks: [
      { icon: 'github', link: 'https://github.com/grigorii-horos/yarntales' }
    ]
  },

  locales: {
    root: {
      label: 'Русский',
      lang: 'ru',
      description: "Инструкции к продуктам Yarntales",
      themeConfig: {
        nav: [
          { text: 'Главная', link: '/' },
          { text: 'Наши продукты', items: [
            { text: 'Волшебный ткацкий станок', link: '/products/loom/' },
            { text: 'Прялка', link: '/products/spinner/' }
          ]}
        ],
        sidebar: {
          '/products/': [
            {
              text: 'Волшебный ткацкий станок',
              collapsed: false,
              items: [
                { text: 'Обзор продукта', link: '/products/loom/' },
                { text: 'Инструкция по сборке', link: '/products/loom/assembly' },
                { text: 'Файлы и чертежи', link: '/products/loom/files' }
              ]
            },
            {
              text: 'Прялка',
              collapsed: false,
              items: [
                { text: 'Обзор продукта', link: '/products/spinner/' },
                { text: 'Руководство пользователя', link: '/products/spinner/manual' }
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
      description: "Yarntales Product Manuals",
      themeConfig: {
        nav: [
          { text: 'Home', link: '/en/' },
          { text: 'Our Products', items: [
            { text: 'Magic Loom', link: '/en/products/loom/' },
            { text: 'Thread Spinner', link: '/en/products/spinner/' }
          ]}
        ],
        sidebar: {
          '/en/products/': [
            {
              text: 'Magic Loom',
              collapsed: false,
              items: [
                { text: 'Product Overview', link: '/en/products/loom/' },
                { text: 'Assembly Instructions', link: '/en/products/loom/assembly' },
                { text: 'Files & Blueprints', link: '/en/products/loom/files' }
              ]
            },
            {
              text: 'Thread Spinner',
              collapsed: false,
              items: [
                { text: 'Product Overview', link: '/en/products/spinner/' },
                { text: 'User Manual', link: '/en/products/spinner/manual' }
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
      description: "Manuale pentru produsele Yarntales",
      themeConfig: {
        nav: [
          { text: 'Acasă', link: '/ro/' },
          { text: 'Produsele noastre', items: [
            { text: 'Război de țesut', link: '/ro/products/loom/' },
            { text: 'Roată de tors', link: '/ro/products/spinner/' }
          ]}
        ],
        sidebar: {
          '/ro/products/': [
            {
              text: 'Război de țesut magic',
              collapsed: false,
              items: [
                { text: 'Prezentare generală', link: '/ro/products/loom/' },
                { text: 'Instrucțiuni de asamblare', link: '/ro/products/loom/assembly' },
                { text: 'Fișiere și Schițe', link: '/ro/products/loom/files' }
              ]
            },
            {
              text: 'Roată de tors',
              collapsed: false,
              items: [
                { text: 'Prezentare generală', link: '/ro/products/spinner/' },
                { text: 'Manual de utilizare', link: '/ro/products/spinner/manual' }
              ]
            }
          ]
        }
      }
    }
  }
})
