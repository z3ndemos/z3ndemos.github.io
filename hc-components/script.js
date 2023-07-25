window.addEventListener('load', function () {
  const acc = document.getElementsByClassName('accordion')

  for (let i = 0; i < acc.length; i++) {
    acc[i].addEventListener('click', function () {
      const panel = this.nextElementSibling
      this.classList.toggle('active')

      if (panel.style.maxHeight) {
        panel.style.maxHeight = null
      } else {
        panel.style.maxHeight = panel.scrollHeight + 'px'
      }
    })
  }
})
