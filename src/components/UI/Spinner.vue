<template>
	<div class="spinner" :style="style">
		<div></div>
		<div></div>
		<div></div>
		<div></div>
		<div></div>
		<div></div>
		<div></div>
		<div></div>
		<div></div>
		<div></div>
		<div></div>
		<div></div>
	</div>
</template>

<script>
export default {
	props: [ 'color', 'height', 'width' ],
	computed: {
		style () {
			let color = this.color ? 'color: ' + this.color + ';' : ''
			let width = this.width ? 'width: ' + this.width + 'px;' : ''
			let height = this.height ? 'height: ' + this.height + 'px;' : ''
			return color + width + height
		}
	}
}
</script>

<style>
.spinner {
	width: 40px;
	height: 40px;
	position: relative;
}
.spinner > div {
	background-color: initial;
	width: 100%;
	height: 100%;
	position: absolute;
	left: 0;
	top: 0;
}
.spinner > div::before {
	content: '';
	display: block;
	margin: 0 auto;
	width: 15%;
	height: 15%;
	background-color: currentColor;
	border-radius: 100%;
	animation: sk-circleFadeDelay 1.2s infinite ease-in-out both;
}
.spinner > div:nth-child(2) { transform: rotate(30deg); }
.spinner > div:nth-child(3) { transform: rotate(60deg); }
.spinner > div:nth-child(4) { transform: rotate(90deg); }
.spinner > div:nth-child(5) { transform: rotate(120deg); }
.spinner > div:nth-child(6) { transform: rotate(150deg); }
.spinner > div:nth-child(7) { transform: rotate(180deg); }
.spinner > div:nth-child(8) { transform: rotate(210deg); }
.spinner > div:nth-child(9) { transform: rotate(240deg); }
.spinner > div:nth-child(10) { transform: rotate(270deg); }
.spinner > div:nth-child(11) { transform: rotate(300deg); }
.spinner > div:nth-child(12) { transform: rotate(330deg); }
.spinner > div:nth-child(2)::before { animation-delay: -1.1s; }
.spinner > div:nth-child(3)::before { animation-delay: -1s; }
.spinner > div:nth-child(4)::before { animation-delay: -0.9s; }
.spinner > div:nth-child(5)::before { animation-delay: -0.8s; }
.spinner > div:nth-child(6)::before { animation-delay: -0.7s; }
.spinner > div:nth-child(7)::before { animation-delay: -0.6s; }
.spinner > div:nth-child(8)::before { animation-delay: -0.5s; }
.spinner > div:nth-child(9)::before { animation-delay: -0.4s; }
.spinner > div:nth-child(10)::before { animation-delay: -0.3s; }
.spinner > div:nth-child(11)::before { animation-delay: -0.2s; }
.spinner > div:nth-child(12)::before { animation-delay: -0.1s; }
@keyframes sk-circleFadeDelay {
	0%, 39%, 100% { opacity: 0; }
	40% { opacity: 1; }
}
</style>
