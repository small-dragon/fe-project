export default  {
    showMessage (message = '出错了', duration = 2000) {
        let messageDiv = document.createElement("span")
        messageDiv.classList.add("PopMessage")
        // message.length > 20 && messageDiv.classList.add("small")
        messageDiv.innerHTML = `<div class="container">${message}</div>`
        document.body.appendChild(messageDiv)
        setTimeout(function () {
            messageDiv.classList.add("removeing")
            setTimeout(() => {
                messageDiv.parentNode && messageDiv.parentNode.removeChild(messageDiv)
            }, 500)
        }, duration)
    },
    clearMessages () {
        document.querySelectorAll('.PopMessage')::[].forEach(f => {
            f.parentNode.removeChild(f)
        })
    }
}