// let fullLoading = document.querySelector(".full-loading");
export default function(url){
	return new Promise((resolve, reject) => {
		let script  = document.createElement('script');
		// fullLoading.style.display = 'flex';
		script.src = url;
		script.onload = () => {
			// fullLoading.style.display = 'none';
			resolve();
		};
		document.body.appendChild(script);
	})
}	