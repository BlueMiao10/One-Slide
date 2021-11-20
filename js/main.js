const $ = s => document.querySelector(s)
const $$ = s => document.querySelectorAll(s)

const isMain = str => (/^#{1,2}(?!#)/).test(str)
const isSub = str => (/^#{3}(?!#)/).test(str)

const convert = raw => {
  let arr = raw.split(/\n(?=\s*#{1,3}[^#])/).filter(s => s != "").map(s => s.trim())

  let html = ''
  for (let i = 0; i < arr.length; i++) {

    if (arr[i + 1] !== undefined) {
      if (isMain(arr[i]) && isMain(arr[i + 1])) {
        html += `
							<section data-markdown>
							  <textarea data-template>
									${arr[i]}
								</textarea>
							</section>
							`
      } else if (isMain(arr[i]) && isSub(arr[i + 1])) {
        html += `
							<section>
								<section data-markdown>
									<textarea data-template>
										${arr[i]}
									</textarea>
								</section>
							`
      } else if (isSub(arr[i]) && isSub(arr[i + 1])) {
        html += `
							<section data-markdown>
								<textarea data-template>
									${arr[i]}
								</textarea>
							</section>
							`
      } else if (isSub(arr[i]) && isMain(arr[i + 1])) {
        html += `
								<section data-markdown>
									<textarea data-template>
										${arr[i]}
									</textarea>
								</section>
							</section>
							`
      }

    } else {
      if (isMain(arr[i])) {
        html += `
							<section data-markdown>
								<textarea data-template>
									${arr[i]}
								</textarea>
							</section>
							`
      } else if (isSub(arr[i])) {
        html += `
								<section data-markdown>
									<textarea data-template>
										${arr[i]}
									</textarea>
								</section>
							</section>
							`
      }
    }

  }

  return html
}

//定于一个模块
//每定义一个模块就声明它的init()
const Menu = {
  init() {
    console.log('Menu.init...')
    this.$settingIcon = $('.control .icon-setting')
    this.$menu = $('.menu')
    this.$closeIcon = $('.menu .icon-close')
    this.$$tabs = $$('.menu .tab')
    this.$$contents = $$('.menu .content')

    this.bind()
  },

  bind() {
    //点击设置时，菜单出现
    this.$settingIcon.onclick = () => {
      this.$menu.classList.add('open')
      this.$$contents.forEach($node => $node.classList.add('active'))
    }

    //点击关闭时，菜单关闭
    this.$closeIcon.onclick = () => {
      this.$menu.classList.remove('open')
    }

    this.$$tabs.forEach($tab => $tab.onclick = () => {
      this.$$tabs.forEach($node => $node.classList.remove('active'))
      $tab.classList.add('active')
      let index = [...this.$$tabs].indexOf($tab)
      this.$$contents.forEach($node => $node.classList.remove('appear'))
      this.$$contents[index].classList.add('appear')
    })
  }
}

//
const Editor = {
  init() {
    console.log('Editor init...')
    this.$editInput = $('.menu .content .editor textarea')
    this.$saveBtn = $('.menu .content .editor .btn-save')
    this.markdown = localStorage.markdown || '# One Slide'
    this.$slideContainer = $('.slides')

    this.bind()
    this.start()
  },

  bind() {
    this.$saveBtn.onclick = () => {
      localStorage.markdown = this.$editInput.value
      location.reload()
    }
  },

  start() {
    this.$editInput.value = this.markdown
    this.$slideContainer.innerHTML = convert(this.markdown)
    Reveal.initialize({
      controls: true,
      progress: true,
      center: localStorage.align === 'left-top' ? false :
        localStorage.align === 'right-top' ? false :
          localStorage.align === 'top' ? false : true,
      hash: true,

      transition: localStorage.transition || 'none', // none/fade/slide/convex/concave/zoom

      // More info https://github.com/hakimel/reveal.js#dependencies
      dependencies: [
        { src: 'plugin/markdown/marked.js', condition: function () { return !!document.querySelector('[data-markdown]'); } },
        { src: 'plugin/markdown/markdown.js', condition: function () { return !!document.querySelector('[data-markdown]'); } },
        { src: 'plugin/highlight/highlight.js' },
        { src: 'plugin/search/search.js', async: true },
        { src: 'plugin/zoom-js/zoom.js', async: true },
        { src: 'plugin/notes/notes.js', async: true }
      ]
    })
  }
}

const Theme = {
  init() {
    this.$$figures = $$('.menu .themes figure')
    this.$$pSelects = $$(' .themes  p')
    this.$$switches = $$('.transition .switch')
    this.$$aligns = $$('.align-setting .switch')
    this.$reveal = $('.reveal')

    this.bind()
    this.loadTheme()
    this.loadTransition()
  },

  bind() {
    this.$$figures.forEach($figure => $figure.onclick = () => {
      this.$$figures.forEach($node => $node.classList.remove('select'))
      this.$$pSelects.forEach($node => $node.classList.remove('select'))
      $figure.classList.add('select')
      let index = [...this.$$figures].indexOf($figure)
      this.$$pSelects[index].classList.add('select')

      this.setTheme($figure.dataset.theme)
    })


    this.$$switches.forEach($switch => $switch.onclick = () => {
      console.log('111')
      this.$$switches.forEach($node => $node.classList.remove('effect'))
      $switch.classList.add('effect')

      this.setTransition($switch.dataset.transition)
    })


    this.$$aligns.forEach($align => $align.onclick = () => {
      this.$$aligns.forEach($node => $node.classList.remove('effect'))
      $align.classList.add('effect')

      this.setAlign($align.dataset.align)
    })
  },

  setTheme(theme) {
    localStorage.theme = theme
    location.reload()
  },

  loadTheme() {
    let theme = localStorage.theme || 'beige'
    let $link = document.createElement('link')
    $link.rel = 'stylesheet'
    $link.href = `css/theme/${theme}.css`
    document.querySelector('head').appendChild($link)

    this.$$figures.forEach($node => $node.classList.remove('select'))
    this.$$pSelects.forEach($node => $node.classList.remove('select'))
    Array.from(this.$$figures).find($figure => $figure.dataset.theme === theme).classList.add('select')
    let index = Array.from(this.$$figures).indexOf(Array.from(this.$$figures).find($figure => $figure.dataset.theme === theme))
    this.$$pSelects[index].classList.add('select')
  },

  setTransition(transition) {
    localStorage.transition = transition
    location.reload()
  },

  setAlign(align) {
    localStorage.align = align
    location.reload()
  },

  loadTransition() {
    let transition = localStorage.transition || 'slide'
    this.$$switches.forEach($node => $node.classList.remove('effect'))
    Array.from(this.$$switches).find($switch => $switch.dataset.transition === transition).classList.add('effect')


    let align = localStorage.align || 'center'
    this.$$aligns.forEach($node => $node.classList.remove('effect'))
    Array.from(this.$$aligns).find($align => $align.dataset.align === align).classList.add('effect')
    this.$reveal.classList.add(align)
  }
}

const Print = {
  init() {
    this.$download = $('.menu .detail .download')

    this.bind()
    this.start()
  },

  bind() {
    this.$download.addEventListener('click', () => {
      let $link = document.createElement('a')
      $link.setAttribute('target', '_blank')
      $link.setAttribute('href', location.href.replace(/#\/+/, '?print-pdf'))
      $link.click()
    })
  },

  start() {
    let link = document.createElement('link')
    link.rel = 'stylesheet'
    link.type = 'text/css'

    if (window.location.search.match(/print-pdf/gi)) {
      link.href = 'css/print/pdf.css'
      window.print()
    } else {
      link.href = 'css/print/paper.css'
    }
    document.head.appendChild(link)
  }

}

//代表你当前整个页面，全局的模块
//声明全局模块的init函数，对于传入的每个参数都执行他们的init()
const App = {
  init() {
    [...arguments].forEach(Module => Module.init())
  }
}

//调用init，页面就启动并且初始化了，把它当成你所有功能的一个总入口
App.init(Menu, Editor, Theme, Print)




