// 设置图片占位符
export default {
	name: 'img-src',
	callback (el, binding)  {
		return (el, binding) => {
			el.style.backgroundColor = 'rgba(255, 255, 255, .5)'
			const img = new Image()
			img.src = binding.value
			img.onload = () => {
				el.src = binding.value
				el.style.backgroundColor = ''
			}
		}
	}
}